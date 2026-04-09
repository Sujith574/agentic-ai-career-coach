from flask import Blueprint, current_app, jsonify, request

admin_bp = Blueprint("admin", __name__, url_prefix="/admin")


@admin_bp.route("/students", methods=["GET"])
def list_students():
    return jsonify({"students": current_app.saas_demo.list_students()}), 200


@admin_bp.route("/insights", methods=["GET"])
def insights():
    return jsonify(current_app.saas_demo.insights()), 200


@admin_bp.route("/student/<student_id>", methods=["GET"])
def student_detail(student_id: str):
    student = current_app.saas_demo.get_student(student_id)
    if not student:
        return jsonify({"error": "Student not found"}), 404
    return jsonify(student), 200


@admin_bp.route("/sync-current-student", methods=["POST"])
def sync_current_student():
    payload = request.get_json(silent=True) or {}
    analysis = payload.get("analysis", {})
    tasks = payload.get("tasks", [])
    current_app.saas_demo.update_current_student(analysis, tasks)
    return jsonify({"ok": True}), 200

