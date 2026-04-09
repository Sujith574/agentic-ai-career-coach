import os

from dotenv import load_dotenv
from flask import Flask, jsonify
from flask_cors import CORS
from pymongo import MongoClient

from routes.api_v1 import api_v1_bp
from routes.admin import admin_bp
from routes.auth import auth_bp
from routes.chat import chat_bp
from routes.resume import resume_bp
from routes.tasks import tasks_bp
from services.auth_v2_service import AuthV2Service
from services.billing_service import BillingService
from services.config import load_settings
from services.observability import setup_observability
from services.platform_store import PlatformStore
from services.queue_service import QueueService
from services.security import setup_request_guardrails
from services.saas_demo_service import SaaSDemoService
import stripe

load_dotenv()


def create_app() -> Flask:
    settings = load_settings()
    app = Flask(__name__)
    CORS(app, resources={r"/*": {"origins": settings.cors_origins.split(",") if settings.cors_origins else "*"}})
    app.settings = settings
    app.config["MAX_CONTENT_LENGTH"] = settings.max_upload_size_mb * 1024 * 1024

    app.db = None
    mongo_uri = settings.mongo_uri
    mongo_db_name = settings.mongo_db_name

    if mongo_uri:
        try:
            mongo_client = MongoClient(mongo_uri, serverSelectionTimeoutMS=3000)
            mongo_client.admin.command("ping")
            app.db = mongo_client[mongo_db_name]
            app.logger.info("Connected to MongoDB")
        except Exception as error:
            app.logger.warning(f"MongoDB unavailable, continuing without DB: {error}")

    app.store = PlatformStore(app.db, postgres_dsn=settings.postgres_dsn)
    default_org = app.store.ensure_default_org()
    app.store.ensure_default_owner(default_org["id"])
    app.auth_v2 = AuthV2Service(app.store, settings.jwt_secret)
    app.billing = BillingService(app.store)
    app.queue = QueueService(app.store, redis_url=settings.redis_url, queue_name=settings.queue_name)
    app.saas_demo = SaaSDemoService()
    if settings.stripe_api_key:
        stripe.api_key = settings.stripe_api_key

    setup_request_guardrails(app, per_minute=settings.rate_limit_per_minute)
    setup_observability(app)

    app.register_blueprint(resume_bp)
    app.register_blueprint(tasks_bp)
    app.register_blueprint(chat_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(api_v1_bp)

    @app.route("/health", methods=["GET"])
    def health():
        return (
            jsonify(
                {
                    "status": "ok",
                    "service": "Agentic AI Career Coach API",
                    "version": "2.0",
                    "env": settings.env,
                }
            ),
            200,
        )

    @app.route("/ready", methods=["GET"])
    def ready():
        return jsonify({"ready": True, "db_connected": app.db is not None}), 200

    @app.route("/metrics", methods=["GET"])
    def metrics():
        return jsonify(app.metrics.snapshot()), 200

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
                        "api_v1": "/api/v1/*",
                    },
                }
            ),
            200,
        )

    @app.errorhandler(413)
    def file_too_large(_error):
        return jsonify({"error": "Uploaded file too large. Reduce file size and retry."}), 413

    return app


if __name__ == "__main__":
    application = create_app()
    application.run(
        host="0.0.0.0",
        port=application.settings.port,
        debug=application.settings.env != "production",
    )
