from datetime import datetime

from flask import Blueprint, current_app, jsonify, request

from services.logic_engine import generate_rule_based_tasks

tasks_bp = Blueprint("tasks", __name__)


@tasks_bp.route("/generate-tasks", methods=["POST"])
def generate_tasks():
    payload = request.get_json(silent=True) or {}
    resume_data = payload.get("resume", payload)
    tasks = generate_rule_based_tasks(resume_data)

    try:
        if current_app.db is not None:
            current_app.db.generated_tasks.insert_one(
                {
                    "resume": resume_data,
                    "tasks": tasks,
                    "created_at": datetime.utcnow(),
                }
            )
    except Exception:
        pass

    return jsonify(tasks), 200
