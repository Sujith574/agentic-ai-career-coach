from __future__ import annotations

import threading
import uuid
from datetime import datetime, timezone
from typing import Any
import json

from psycopg.rows import dict_row
from psycopg_pool import ConnectionPool


def _utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def json_dumps(value: dict[str, Any]) -> str:
    return json.dumps(value, separators=(",", ":"), default=str)


class PlatformStore:
    """
    A lightweight persistence abstraction with MongoDB support and
    in-memory fallback to keep demo and staging resilient.
    """

    def __init__(self, mongo_db=None, postgres_dsn: str = "") -> None:
        self.mongo_db = mongo_db
        self.postgres_pool: ConnectionPool | None = None
        if postgres_dsn:
            try:
                self.postgres_pool = ConnectionPool(conninfo=postgres_dsn, open=True)
                self._ensure_postgres_tables()
            except Exception:
                self.postgres_pool = None
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
            "billing_events": [],
        }

    def _ensure_postgres_tables(self) -> None:
        if self.postgres_pool is None:
            return
        with self.postgres_pool.connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    CREATE TABLE IF NOT EXISTS saas_documents (
                        id TEXT PRIMARY KEY,
                        collection TEXT NOT NULL,
                        created_at TIMESTAMPTZ NOT NULL,
                        payload JSONB NOT NULL
                    );
                    CREATE INDEX IF NOT EXISTS idx_saas_documents_collection
                    ON saas_documents (collection);
                    """
                )
            conn.commit()

    def _postgres_insert(self, collection: str, row: dict[str, Any]) -> bool:
        if self.postgres_pool is None:
            return False
        try:
            with self.postgres_pool.connection() as conn:
                with conn.cursor() as cur:
                    cur.execute(
                        """
                        INSERT INTO saas_documents (id, collection, created_at, payload)
                        VALUES (%s, %s, %s, %s::jsonb)
                        ON CONFLICT (id) DO NOTHING
                        """,
                        (row["id"], collection, row["created_at"], json_dumps(row)),
                    )
                conn.commit()
            return True
        except Exception:
            return False

    def _postgres_find(self, collection: str, filters: dict[str, Any]) -> list[dict[str, Any]] | None:
        if self.postgres_pool is None:
            return None
        try:
            clauses = []
            params: list[Any] = [collection]
            idx = 2
            for key, value in filters.items():
                clauses.append(f"payload ->> %s = %s")
                params.append(key)
                params.append(str(value))
                idx += 2
            where_extra = f" AND {' AND '.join(clauses)}" if clauses else ""
            query = (
                "SELECT payload FROM saas_documents WHERE collection = %s"
                + where_extra
                + " ORDER BY created_at ASC"
            )
            with self.postgres_pool.connection() as conn:
                with conn.cursor(row_factory=dict_row) as cur:
                    cur.execute(query, tuple(params))
                    rows = cur.fetchall()
            return [dict(row["payload"]) for row in rows]
        except Exception:
            return None

    def _postgres_update(self, collection: str, row_id: str, updated_row: dict[str, Any]) -> bool:
        if self.postgres_pool is None:
            return False
        try:
            with self.postgres_pool.connection() as conn:
                with conn.cursor() as cur:
                    cur.execute(
                        """
                        UPDATE saas_documents
                        SET payload = %s::jsonb
                        WHERE collection = %s AND id = %s
                        """,
                        (json_dumps(updated_row), collection, row_id),
                    )
                conn.commit()
            return True
        except Exception:
            return False

    def _insert(self, collection: str, data: dict[str, Any]) -> dict[str, Any]:
        row = {"id": str(uuid.uuid4()), "created_at": _utc_now(), **data}
        if self._postgres_insert(collection, row):
            return row
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
        pg_rows = self._postgres_find(collection, filters)
        if pg_rows is not None:
            return pg_rows
        if self.mongo_db is not None:
            try:
                return list(self.mongo_db[collection].find(filters, {"_id": 0}))
            except Exception:
                pass
        with self._lock:
            rows = self._memory.get(collection, [])
            return [row for row in rows if all(row.get(k) == v for k, v in filters.items())]

    def _update_by_id(self, collection: str, row_id: str, updates: dict[str, Any]) -> dict[str, Any] | None:
        rows = self._find(collection, {"id": row_id})
        if not rows:
            return None
        row = {**rows[0], **updates}
        if self._postgres_update(collection, row_id, row):
            return row
        if self.mongo_db is not None:
            try:
                self.mongo_db[collection].update_one({"id": row_id}, {"$set": updates})
                return row
            except Exception:
                pass
        with self._lock:
            source = self._memory.get(collection, [])
            for idx, item in enumerate(source):
                if item.get("id") == row_id:
                    source[idx] = row
                    break
        return row

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
        # Hash 'demo-owner' using the same logic as AuthV2Service (SHA256)
        import hashlib
        demo_hash = hashlib.sha256("demo-owner".encode("utf-8")).hexdigest()
        user = self._insert(
            "users",
            {"email": "owner@agentic.local", "name": "Org Owner", "password_hash": demo_hash},
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
        rows = self._find("usage_counters", {"org_id": org_id, "metric": metric})
        if rows:
            row = rows[0]
            value = int(row.get("value", 0)) + amount
            updated = self._update_by_id(
                "usage_counters", row["id"], {"value": value, "updated_at": _utc_now()}
            )
            return updated or {"org_id": org_id, "metric": metric, "value": value}
        return self._insert(
            "usage_counters",
            {"org_id": org_id, "metric": metric, "value": amount, "updated_at": _utc_now()},
        )

    def list_usage(self, org_id: str) -> list[dict[str, Any]]:
        return self._find("usage_counters", {"org_id": org_id})

