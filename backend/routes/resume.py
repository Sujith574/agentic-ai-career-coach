from datetime import datetime

from flask import Blueprint, current_app, jsonify, request

from services.ai_service import DEMO_RESUME_JSON, AIService
from services.parser import extract_resume_text

resume_bp = Blueprint("resume", __name__)


@resume_bp.route("/upload-resume", methods=["POST"])
def upload_resume():
    ai_service = AIService()
    uploaded_file = request.files.get("resume")

    if not uploaded_file:
        analysis = dict(DEMO_RESUME_JSON)
        analysis["source"] = "demo_fallback"
        return jsonify(analysis), 200

    try:
        resume_text = extract_resume_text(uploaded_file)
        analysis = ai_service.analyze_resume(resume_text)
        analysis["source"] = "upload"
    except Exception:
        analysis = dict(DEMO_RESUME_JSON)
        analysis["source"] = "demo_fallback"

    try:
        if current_app.db is not None:
            current_app.db.resume_analyses.insert_one(
                {
                    "analysis": analysis,
                    "created_at": datetime.utcnow(),
                }
            )
    except Exception:
        # Keep API reliable even if DB write fails.
        pass

    return jsonify(analysis), 200
