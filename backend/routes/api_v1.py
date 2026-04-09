from __future__ import annotations

import json
from datetime import datetime, timezone
from functools import wraps

from flask import Blueprint, Response, current_app, g, jsonify, request
import stripe

from services.ai_service import AIService, DEMO_RESUME_JSON
from services.enterprise_service import EnterpriseService
from services.logic_engine import generate_rule_based_tasks
from services.parser import extract_resume_text
from services.security import require_roles, validate_required_fields

api_v1_bp = Blueprint("api_v1", __name__, url_prefix="/api/v1")


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def auth_required(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        token = current_app.auth_v2.extract_bearer_token(request.headers)
        payload = current_app.auth_v2.verify_access_token(token)
        if not payload:
            return jsonify({"error": "Unauthorized"}), 401
        g.user_id = payload.get("sub")
        g.org_id = payload.get("org_id")
        g.role = payload.get("role")
        return func(*args, **kwargs)

    return wrapper


@api_v1_bp.route("/auth/register", methods=["POST"])
def register():
    payload = request.get_json(silent=True) or {}
    ok, msg = validate_required_fields(payload, ["email", "password", "name"])
    if not ok:
        return jsonify({"ok": False, "message": msg}), 400
    result = current_app.auth_v2.register(
        email=payload["email"],
        password=payload["password"],
        name=payload["name"],
        org_name=payload.get("org_name"),
    )
    status = 200 if result.get("ok") else 400
    return jsonify(result), status


@api_v1_bp.route("/auth/login", methods=["POST"])
def login():
    payload = request.get_json(silent=True) or {}
    ok, msg = validate_required_fields(payload, ["email", "password"])
    if not ok:
        return jsonify({"ok": False, "message": msg}), 400
    result = current_app.auth_v2.login(
        email=payload["email"], password=payload["password"], org_id=payload.get("org_id")
    )
    status = 200 if result.get("ok") else 400
    return jsonify(result), status


@api_v1_bp.route("/auth/refresh", methods=["POST"])
def refresh():
    payload = request.get_json(silent=True) or {}
    ok, msg = validate_required_fields(payload, ["refresh_token"])
    if not ok:
        return jsonify({"ok": False, "message": msg}), 400
    result = current_app.auth_v2.refresh(refresh_token=payload["refresh_token"])
    status = 200 if result.get("ok") else 401
    return jsonify(result), status


@api_v1_bp.route("/auth/logout", methods=["POST"])
def logout():
    payload = request.get_json(silent=True) or {}
    token = payload.get("refresh_token", "")
    return jsonify(current_app.auth_v2.logout(refresh_token=token)), 200


@api_v1_bp.route("/resume/upload", methods=["POST"])
@auth_required
def upload_resume():
    can, reason = current_app.billing.assert_within_limit(g.org_id, "resume_analyses_per_month")
    if not can:
        return jsonify({"error": reason}), 402
    file_obj = request.files.get("resume")
    ai_service = AIService()
    try:
        resume_text = extract_resume_text(file_obj) if file_obj else DEMO_RESUME_JSON["resume_text"]
        analysis = ai_service.analyze_resume(resume_text)
    except Exception:
        analysis = dict(DEMO_RESUME_JSON)
    current_app.store.create_resume_analysis(g.org_id, g.user_id, analysis)
    current_app.store.increment_usage(g.org_id, "resume_analyses_per_month")
    current_app.store.add_timeline_event(g.org_id, g.user_id, "analyze", "Resume analyzed", {"source": "api_v1"})
    return jsonify({"analysis": analysis}), 200


@api_v1_bp.route("/tasks/generate", methods=["POST"])
@auth_required
def generate_tasks():
    payload = request.get_json(silent=True) or {}
    analysis = payload.get("analysis", DEMO_RESUME_JSON)
    tasks = generate_rule_based_tasks(analysis)
    for task in tasks:
        current_app.store.create_task(
            g.org_id, g.user_id, task["title"], task.get("priority", "Medium"), task.get("status", "Pending")
        )
        current_app.store.add_timeline_event(
            g.org_id, g.user_id, "decide", f"Created task: {task['title']}", {"priority": task.get("priority")}
        )
    pending = [task for task in tasks if task.get("status") == "Pending"]
    if pending:
        current_app.store.add_alert(g.org_id, g.user_id, f"You have {len(pending)} pending tasks", "warning")
        current_app.store.add_timeline_event(
            g.org_id, g.user_id, "act", f"Raised alert for {len(pending)} pending tasks", {}
        )
    return jsonify({"tasks": tasks}), 200


@api_v1_bp.route("/chat", methods=["POST"])
@auth_required
def chat():
    payload = request.get_json(silent=True) or {}
    message = payload.get("message", "").strip()
    context = payload.get("context", {})
    if not message:
        return jsonify({"reply": "Please send a message."}), 200
    reply = AIService().mentor_chat(message, context)
    current_app.store._insert(
        "chat_messages",
        {"org_id": g.org_id, "user_id": g.user_id, "message": message, "reply": reply, "timestamp": _now()},
    )
    return jsonify({"reply": reply}), 200


@api_v1_bp.route("/mock-interview", methods=["GET"])
@auth_required
def mock_interview():
    can, reason = current_app.billing.assert_within_limit(g.org_id, "mock_interviews_per_month")
    if not can:
        return jsonify({"error": reason}), 402
    profile_raw = request.args.get("profile", "{}")
    try:
        profile = json.loads(profile_raw)
    except Exception:
        profile = {}
    questions = AIService().mock_interview_questions(profile)
    current_app.store.increment_usage(g.org_id, "mock_interviews_per_month")
    current_app.store._insert(
        "interview_sessions",
        {"org_id": g.org_id, "user_id": g.user_id, "questions": questions, "timestamp": _now()},
    )
    return jsonify(questions), 200


@api_v1_bp.route("/timeline", methods=["GET"])
@auth_required
def timeline():
    events = current_app.store.list_timeline(g.org_id, g.user_id)
    return jsonify({"events": events[:100]}), 200


@api_v1_bp.route("/alerts", methods=["GET"])
@auth_required
def alerts():
    items = current_app.store.list_alerts(g.org_id, g.user_id)
    return jsonify({"alerts": sorted(items, key=lambda row: row["created_at"], reverse=True)}), 200


@api_v1_bp.route("/billing/subscription", methods=["GET"])
@auth_required
def get_subscription():
    subscription = current_app.billing.ensure_subscription(g.org_id)
    limits = current_app.billing.limits_for_org(g.org_id)
    usage = current_app.store.list_usage(g.org_id)
    return jsonify({"subscription": subscription, "limits": limits, "usage": usage}), 200


@api_v1_bp.route("/billing/upgrade", methods=["POST"])
@auth_required
@require_roles({"org_owner", "admin"})
def upgrade_subscription():
    payload = request.get_json(silent=True) or {}
    plan = payload.get("plan", "free")
    try:
        subscription = current_app.billing.update_plan(g.org_id, plan)
    except ValueError as error:
        return jsonify({"error": str(error)}), 400
    current_app.store.log_audit(org_id=g.org_id, user_id=g.user_id, action="billing_plan_changed", meta={"plan": plan})
    return jsonify({"subscription": subscription}), 200


@api_v1_bp.route("/billing/webhook/stripe", methods=["POST"])
def stripe_webhook():
    raw_payload = request.get_data(as_text=True)
    signature = request.headers.get("Stripe-Signature", "")
    secret = current_app.settings.stripe_webhook_secret
    if not secret:
        return jsonify({"error": "Stripe webhook secret not configured"}), 500
    try:
        event = stripe.Webhook.construct_event(
            payload=raw_payload,
            sig_header=signature,
            secret=secret,
        )
    except Exception:
        return jsonify({"error": "Invalid Stripe signature"}), 400

    payload = event.get("data", {}).get("object", {}) or {}
    org_id = (
        payload.get("metadata", {}).get("org_id")
        or payload.get("client_reference_id")
        or "default"
    )
    event_type = event.get("type", "unknown")
    if event_type in {"customer.subscription.updated", "customer.subscription.created"}:
        plan = payload.get("metadata", {}).get("plan", "pro")
        current_app.billing.update_plan(org_id, plan)
    if event_type == "customer.subscription.deleted":
        current_app.billing.update_plan(org_id, "free")
    current_app.store._insert("billing_events", {"org_id": org_id, "event": event})
    return jsonify({"received": True}), 200


@api_v1_bp.route("/admin/tenants", methods=["GET"])
@auth_required
@require_roles({"org_owner", "admin"})
def admin_tenants():
    orgs = current_app.store._find("organizations")
    return jsonify({"tenants": orgs}), 200


@api_v1_bp.route("/admin/users", methods=["GET"])
@auth_required
@require_roles({"org_owner", "admin"})
def admin_users():
    org_memberships = current_app.store._find("memberships", {"org_id": g.org_id})
    user_ids = {row["user_id"] for row in org_memberships}
    users = [row for row in current_app.store._find("users") if row["id"] in user_ids]
    return jsonify({"users": users, "memberships": org_memberships}), 200


@api_v1_bp.route("/admin/jobs", methods=["GET"])
@auth_required
@require_roles({"org_owner", "admin"})
def admin_jobs():
    jobs = current_app.store._find("job_runs", {"org_id": g.org_id})
    dead = current_app.store._find("dead_letter_jobs", {"org_id": g.org_id})
    return jsonify({"jobs": jobs, "dead_letter_jobs": dead}), 200


@api_v1_bp.route("/admin/replay-job", methods=["POST"])
@auth_required
@require_roles({"org_owner", "admin"})
def replay_job():
    payload = request.get_json(silent=True) or {}
    job_type = payload.get("job_type", "unknown")
    job_payload = payload.get("payload", {})
    job = current_app.queue.submit(
        org_id=g.org_id,
        user_id=g.user_id,
        job_type=f"replay:{job_type}",
        payload=job_payload,
        handler_name=payload.get("handler_name", "echo"),
    )
    return jsonify({"job": job}), 202


@api_v1_bp.route("/enterprise/sso/metadata", methods=["GET"])
@auth_required
@require_roles({"org_owner", "admin"})
def enterprise_sso_metadata():
    if not current_app.settings.enable_enterprise:
        return jsonify({"error": "Enterprise features disabled"}), 403
    service = EnterpriseService(current_app.store)
    return jsonify(service.get_sso_metadata(g.org_id)), 200


@api_v1_bp.route("/enterprise/scim/users", methods=["POST"])
@auth_required
@require_roles({"org_owner", "admin"})
def enterprise_scim_users():
    if not current_app.settings.enable_enterprise:
        return jsonify({"error": "Enterprise features disabled"}), 403
    payload = request.get_json(silent=True) or {}
    ok, msg = validate_required_fields(payload, ["email", "name"])
    if not ok:
        return jsonify({"error": msg}), 400
    service = EnterpriseService(current_app.store)
    result = service.scim_provision_user(
        g.org_id, payload["email"], payload["name"], payload.get("role", "student")
    )
    return jsonify(result), 200


@api_v1_bp.route("/enterprise/export", methods=["GET"])
@auth_required
@require_roles({"org_owner", "admin"})
def enterprise_export():
    if not current_app.settings.enable_enterprise:
        return jsonify({"error": "Enterprise features disabled"}), 403
    service = EnterpriseService(current_app.store)
    csv_data = service.export_org_data_csv(g.org_id)
    return Response(
        csv_data,
        mimetype="text/csv",
        headers={"Content-Disposition": f"attachment; filename=org_export_{g.org_id}.csv"},
    )


@api_v1_bp.route("/enterprise/audit-logs", methods=["GET"])
@auth_required
@require_roles({"org_owner", "admin"})
def enterprise_audit_logs():
    logs = current_app.store._find("audit_logs", {"org_id": g.org_id})
    return jsonify({"audit_logs": sorted(logs, key=lambda row: row["created_at"], reverse=True)}), 200

