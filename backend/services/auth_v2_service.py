from __future__ import annotations

import base64
import hashlib
import hmac
import json
import os
import secrets
from datetime import datetime, timedelta, timezone
from typing import Any

from services.platform_store import PlatformStore


def _now_epoch() -> int:
    return int(datetime.now(timezone.utc).timestamp())


class AuthV2Service:
    def __init__(self, store: PlatformStore, jwt_secret: str) -> None:
        self.store = store
        self.jwt_secret = jwt_secret or "change-me"

    @staticmethod
    def hash_password(password: str) -> str:
        return hashlib.sha256(password.encode("utf-8")).hexdigest()

    def _sign(self, payload: dict[str, Any]) -> str:
        raw = json.dumps(payload, separators=(",", ":"), sort_keys=True).encode("utf-8")
        sig = hmac.new(self.jwt_secret.encode("utf-8"), raw, hashlib.sha256).hexdigest()
        body = base64.urlsafe_b64encode(raw).decode("utf-8").rstrip("=")
        return f"{body}.{sig}"

    def _decode(self, token: str) -> dict[str, Any] | None:
        try:
            body, sig = token.rsplit(".", 1)
            raw = base64.urlsafe_b64decode(body + "===")
            expected = hmac.new(self.jwt_secret.encode("utf-8"), raw, hashlib.sha256).hexdigest()
            if not hmac.compare_digest(expected, sig):
                return None
            payload = json.loads(raw.decode("utf-8"))
            if int(payload.get("exp", 0)) < _now_epoch():
                return None
            return payload
        except Exception:
            return None

    def register(
        self, *, email: str, password: str, name: str, org_name: str | None = None
    ) -> dict[str, Any]:
        existing = self.store.get_user_by_email(email)
        if existing:
            return {"ok": False, "message": "Email already exists"}

        org = self.store.ensure_default_org()
        if org_name:
            slug = org_name.strip().lower().replace(" ", "-")
            org = self.store._insert("organizations", {"name": org_name.strip(), "slug": slug})

        user = self.store.create_user(email=email, name=name, password_hash=self.hash_password(password))
        role = "org_owner" if org_name else "student"
        self.store.add_membership(org_id=org["id"], user_id=user["id"], role=role)
        self.store.log_audit(org_id=org["id"], user_id=user["id"], action="user_registered")
        return self.login(email=email, password=password, org_id=org["id"])

    def login(self, *, email: str, password: str, org_id: str | None = None) -> dict[str, Any]:
        user = self.store.get_user_by_email(email)
        if not user:
            return {"ok": False, "message": "Invalid credentials"}
        if user.get("password_hash") != self.hash_password(password):
            return {"ok": False, "message": "Invalid credentials"}

        memberships = self.store._find("memberships", {"user_id": user["id"]})
        if not memberships:
            return {"ok": False, "message": "No organization membership found"}

        membership = memberships[0]
        if org_id:
            match = [row for row in memberships if row.get("org_id") == org_id]
            if not match:
                return {"ok": False, "message": "No membership for selected organization"}
            membership = match[0]

        access_payload = {
            "sub": user["id"],
            "org_id": membership["org_id"],
            "role": membership["role"],
            "iat": _now_epoch(),
            "exp": _now_epoch() + 3600,
        }
        access_token = self._sign(access_payload)
        refresh_token = secrets.token_urlsafe(32)
        self.store.create_session(user_id=user["id"], org_id=membership["org_id"], refresh_token=refresh_token)
        self.store.log_audit(
            org_id=membership["org_id"], user_id=user["id"], action="user_logged_in", meta={"role": membership["role"]}
        )
        return {
            "ok": True,
            "access_token": access_token,
            "refresh_token": refresh_token,
            "user": {"id": user["id"], "email": user["email"], "name": user.get("name", "")},
            "organization": {"id": membership["org_id"]},
            "role": membership["role"],
        }

    def refresh(self, *, refresh_token: str) -> dict[str, Any]:
        sessions = self.store._find("sessions", {"refresh_token": refresh_token})
        if not sessions:
            return {"ok": False, "message": "Invalid refresh token"}
        session = sessions[0]
        memberships = self.store._find("memberships", {"org_id": session["org_id"], "user_id": session["user_id"]})
        if not memberships:
            return {"ok": False, "message": "Membership not found"}
        membership = memberships[0]
        payload = {
            "sub": session["user_id"],
            "org_id": session["org_id"],
            "role": membership["role"],
            "iat": _now_epoch(),
            "exp": _now_epoch() + 3600,
        }
        return {"ok": True, "access_token": self._sign(payload)}

    def logout(self, *, refresh_token: str) -> dict[str, Any]:
        self.store.revoke_session(refresh_token)
        return {"ok": True}

    def verify_access_token(self, token: str) -> dict[str, Any] | None:
        return self._decode(token)

    @staticmethod
    def extract_bearer_token(headers: dict[str, Any]) -> str:
        auth_header = str(headers.get("Authorization", ""))
        if not auth_header.startswith("Bearer "):
            return ""
        return auth_header.replace("Bearer ", "", 1).strip()

