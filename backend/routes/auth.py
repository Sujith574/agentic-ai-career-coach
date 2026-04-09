from datetime import datetime

from flask import Blueprint, current_app, jsonify, request

from services.auth_service import AuthService

auth_bp = Blueprint("auth", __name__)
auth_service = AuthService()


@auth_bp.route("/auth/request-otp", methods=["POST"])
def request_otp():
    payload = request.get_json(silent=True) or {}
    email = payload.get("email", "")
    role = payload.get("role", "student")
    result = auth_service.request_otp(email=email, role=role)

    status = 200 if result.get("ok") else 400
    return jsonify(result), status


@auth_bp.route("/auth/verify-otp", methods=["POST"])
def verify_otp():
    payload = request.get_json(silent=True) or {}
    email = payload.get("email", "")
    otp = payload.get("otp", "")

    result = auth_service.verify_otp(email=email, otp=otp)
    if result.get("ok"):
        try:
            if current_app.db is not None:
                current_app.db.user_sessions.insert_one(
                    {
                        "email": result["session"]["email"],
                        "role": result["session"]["role"],
                        "token": result["session"]["token"],
                        "created_at": datetime.utcnow(),
                    }
                )
        except Exception:
            pass

    status = 200 if result.get("ok") else 400
    return jsonify(result), status
