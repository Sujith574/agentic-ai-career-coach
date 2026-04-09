import os

from dotenv import load_dotenv
from flask import Flask, jsonify
from flask_cors import CORS
from pymongo import MongoClient

from routes.chat import chat_bp
from routes.resume import resume_bp
from routes.tasks import tasks_bp

load_dotenv()


def create_app() -> Flask:
    app = Flask(__name__)
    CORS(app)

    app.db = None
    mongo_uri = os.getenv("MONGODB_URI", "")
    mongo_db_name = os.getenv("MONGODB_DB", "agentic_ai_career_coach")

    if mongo_uri:
        try:
            mongo_client = MongoClient(mongo_uri, serverSelectionTimeoutMS=3000)
            mongo_client.admin.command("ping")
            app.db = mongo_client[mongo_db_name]
            app.logger.info("Connected to MongoDB")
        except Exception as error:
            app.logger.warning(f"MongoDB unavailable, continuing without DB: {error}")

    app.register_blueprint(resume_bp)
    app.register_blueprint(tasks_bp)
    app.register_blueprint(chat_bp)

    @app.route("/health", methods=["GET"])
    def health():
        return jsonify({"status": "ok", "service": "Agentic AI Career Coach API"}), 200

    @app.route("/", methods=["GET"])
    def root():
        return (
            jsonify(
                {
                    "service": "Agentic AI Career Coach API",
                    "status": "running",
                    "endpoints": {
                        "health": "/health",
                        "upload_resume": "POST /upload-resume",
                        "generate_tasks": "POST /generate-tasks",
                        "chat": "POST /chat",
                        "mock_interview": "GET /mock-interview",
                        "agent_timeline": "GET /agent-timeline",
                    },
                }
            ),
            200,
        )

    return app


if __name__ == "__main__":
    application = create_app()
    port = int(os.getenv("PORT", "5000"))
    application.run(host="0.0.0.0", port=port, debug=True)
