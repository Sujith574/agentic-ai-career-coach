from datetime import datetime
import json

from flask import Blueprint, current_app, jsonify, request

from services.ai_service import AIService

chat_bp = Blueprint("chat", __name__)


@chat_bp.route("/chat", methods=["POST"])
def chat():
    payload = request.get_json(silent=True) or {}
    message = payload.get("message", "").strip()
    context = payload.get("context", {})

    if not message:
        return jsonify({"reply": "Please ask a question so I can guide you."}), 200

    ai_service = AIService()
    reply = ai_service.mentor_chat(message, context)

    try:
        if current_app.db is not None:
            current_app.db.chat_messages.insert_one(
                {
                    "message": message,
                    "context": context,
                    "reply": reply,
                    "created_at": datetime.utcnow(),
                }
            )
    except Exception:
        pass

    return jsonify({"reply": reply}), 200


@chat_bp.route("/mock-interview", methods=["GET"])
def mock_interview():
    context = request.get_json(silent=True) or request.args.to_dict()
    profile_raw = context.get("profile")
    if isinstance(profile_raw, str):
        try:
            context = json.loads(profile_raw)
        except Exception:
            context = {}
    ai_service = AIService()
    questions = ai_service.mock_interview_questions(context)
    return jsonify(questions), 200
