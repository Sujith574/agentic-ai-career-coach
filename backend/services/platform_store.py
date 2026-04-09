from __future__ import annotations

import threading
import uuid
from datetime import datetime, timezone
from typing import Any


def _utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


class PlatformStore:
    """
    A lightweight persistence abstraction with MongoDB support and
    in-memory fallback to keep demo and staging resilient.
    """

    def __init__(self, mongo_db=None) -> None:
        self.mongo_db = mongo_db
        self._lock = threading.Lock()
        self._memory: dict[str, list[dict[str, Any]]] = {
            "organizations": [],
            "users": [],
            "memberships": [],
            "sessions": [],
            "resumes": [],
            "resume_analyses": [],
            "tasks": [],
            "alerts": [],
            "timeline_events": [],
            "chat_threads": [],
            "chat_messages": [],
            "interview_sessions": [],
            "subscriptions": [],
            "usage_counters": [],
            "audit_logs": [],
            "job_runs": [],
            "dead_letter_jobs": [],
        }

    def _insert(self, collection: str, data: dict[str, Any]) -> dict[str, Any]:
        row = {"id": str(uuid.uuid4()), "created_at": _utc_now(), **data}
        if self.mongo_db is not None:
            try:
                self.mongo_db[collection].insert_one(row)
                return row
            except Exception:
                pass

        with self._lock:
            self._memory.setdefault(collection, []).append(row)
        return row

    def _find(self, collection: str, filters: dict[str, Any] | None = None) -> list[dict[str, Any]]:
        filters = filters or {}
        if self.mongo_db is not None:
            try:
                return list(self.mongo_db[collection].find(filters, {"_id": 0}))
            except Exception:
                pass
        with self._lock:
            rows = self._memory.get(collection, [])
            return [row for row in rows if all(row.get(k) == v for k, v in filters.items())]

    def log_audit(
        self, *, org_id: str, user_id: str | None, action: str, meta: dict[str, Any] | None = None
    ) -> dict[str, Any]:
        return self._insert(
            "audit_logs",
            {"org_id": org_id, "user_id": user_id, "action": action, "meta": meta or {}},
        )

    def ensure_default_org(self) -> dict[str, Any]:
        orgs = self._find("organizations", {"slug": "default"})
        if orgs:
            return orgs[0]
        return self._insert("organizations", {"name": "Default Organization", "slug": "default"})

    def ensure_default_owner(self, org_id: str) -> dict[str, Any]:
        users = self._find("users", {"email": "owner@agentic.local"})
        if users:
            return users[0]
        user = self._insert(
            "users",
            {"email": "owner@agentic.local", "name": "Org Owner", "password_hash": "demo-owner"},
        )
        self._insert("memberships", {"org_id": org_id, "user_id": user["id"], "role": "org_owner"})
        return user

    def create_user(self, email: str, name: str, password_hash: str) -> dict[str, Any]:
        return self._insert(
            "users",
            {"email": email.strip().lower(), "name": name, "password_hash": password_hash},
        )

    def get_user_by_email(self, email: str) -> dict[str, Any] | None:
        users = self._find("users", {"email": email.strip().lower()})
        return users[0] if users else None

    def add_membership(self, org_id: str, user_id: str, role: str) -> dict[str, Any]:
        return self._insert("memberships", {"org_id": org_id, "user_id": user_id, "role": role})

    def get_membership(self, org_id: str, user_id: str) -> dict[str, Any] | None:
        memberships = self._find("memberships", {"org_id": org_id, "user_id": user_id})
        return memberships[0] if memberships else None

    def create_session(self, user_id: str, org_id: str, refresh_token: str) -> dict[str, Any]:
        return self._insert(
            "sessions", {"user_id": user_id, "org_id": org_id, "refresh_token": refresh_token}
        )

    def revoke_session(self, refresh_token: str) -> None:
        if self.mongo_db is not None:
            try:
                self.mongo_db["sessions"].delete_many({"refresh_token": refresh_token})
                return
            except Exception:
                pass
        with self._lock:
            self._memory["sessions"] = [
                row for row in self._memory["sessions"] if row.get("refresh_token") != refresh_token
            ]

    def create_resume_analysis(self, org_id: str, user_id: str, analysis: dict[str, Any]) -> dict[str, Any]:
        return self._insert(
            "resume_analyses", {"org_id": org_id, "user_id": user_id, "analysis": analysis}
        )

    def create_task(self, org_id: str, user_id: str, title: str, priority: str, status: str) -> dict[str, Any]:
        return self._insert(
            "tasks",
            {"org_id": org_id, "user_id": user_id, "title": title, "priority": priority, "status": status},
        )

    def list_tasks(self, org_id: str, user_id: str) -> list[dict[str, Any]]:
        return self._find("tasks", {"org_id": org_id, "user_id": user_id})

    def add_alert(self, org_id: str, user_id: str, message: str, level: str = "info") -> dict[str, Any]:
        return self._insert("alerts", {"org_id": org_id, "user_id": user_id, "message": message, "level": level})

    def list_alerts(self, org_id: str, user_id: str) -> list[dict[str, Any]]:
        return self._find("alerts", {"org_id": org_id, "user_id": user_id})

    def add_timeline_event(
        self, org_id: str, user_id: str, stage: str, message: str, meta: dict[str, Any] | None = None
    ) -> dict[str, Any]:
        return self._insert(
            "timeline_events",
            {"org_id": org_id, "user_id": user_id, "stage": stage, "message": message, "meta": meta or {}},
        )

    def list_timeline(self, org_id: str, user_id: str) -> list[dict[str, Any]]:
        rows = self._find("timeline_events", {"org_id": org_id, "user_id": user_id})
        return sorted(rows, key=lambda item: item.get("created_at", ""), reverse=True)

    def create_subscription(self, org_id: str, plan: str, status: str) -> dict[str, Any]:
        return self._insert("subscriptions", {"org_id": org_id, "plan": plan, "status": status})

    def get_subscription(self, org_id: str) -> dict[str, Any] | None:
        rows = self._find("subscriptions", {"org_id": org_id})
        return rows[-1] if rows else None

    def increment_usage(self, org_id: str, metric: str, amount: int = 1) -> dict[str, Any]:
        if self.mongo_db is not None:
            try:
                self.mongo_db["usage_counters"].update_one(
                    {"org_id": org_id, "metric": metric},
                    {"$inc": {"value": amount}, "$set": {"updated_at": _utc_now()}},
                    upsert=True,
                )
                rows = list(
                    self.mongo_db["usage_counters"].find({"org_id": org_id, "metric": metric}, {"_id": 0})
                )
                return rows[0] if rows else {"org_id": org_id, "metric": metric, "value": amount}
            except Exception:
                pass

        with self._lock:
            rows = self._memory["usage_counters"]
            for row in rows:
                if row.get("org_id") == org_id and row.get("metric") == metric:
                    row["value"] = int(row.get("value", 0)) + amount
                    row["updated_at"] = _utc_now()
                    return row
            new_row = {"id": str(uuid.uuid4()), "org_id": org_id, "metric": metric, "value": amount}
            rows.append(new_row)
            return new_row

    def list_usage(self, org_id: str) -> list[dict[str, Any]]:
        return self._find("usage_counters", {"org_id": org_id})

