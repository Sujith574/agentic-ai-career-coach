from __future__ import annotations

import csv
import io
from typing import Any

from services.platform_store import PlatformStore


class EnterpriseService:
    def __init__(self, store: PlatformStore) -> None:
        self.store = store

    def get_sso_metadata(self, org_id: str) -> dict[str, Any]:
        return {
            "org_id": org_id,
            "sso_enabled": True,
            "issuer": f"https://agentic.local/sso/{org_id}",
            "acs_url": f"https://agentic.local/sso/{org_id}/acs",
        }

    def scim_provision_user(self, org_id: str, email: str, name: str, role: str) -> dict[str, Any]:
        user = self.store.get_user_by_email(email)
        if not user:
            user = self.store.create_user(email=email, name=name, password_hash="scim-managed")
        existing = self.store.get_membership(org_id=org_id, user_id=user["id"])
        if not existing:
            self.store.add_membership(org_id=org_id, user_id=user["id"], role=role)
        return {"ok": True, "user_id": user["id"], "org_id": org_id, "role": role}

    def export_org_data_csv(self, org_id: str) -> str:
        rows = []
        rows.extend([{"type": "task", **item} for item in self.store._find("tasks", {"org_id": org_id})])
        rows.extend([{"type": "alert", **item} for item in self.store._find("alerts", {"org_id": org_id})])
        rows.extend(
            [{"type": "timeline_event", **item} for item in self.store._find("timeline_events", {"org_id": org_id})]
        )
        if not rows:
            rows = [{"type": "empty", "org_id": org_id}]
        output = io.StringIO()
        writer = csv.DictWriter(output, fieldnames=sorted({k for row in rows for k in row.keys()}))
        writer.writeheader()
        writer.writerows(rows)
        return output.getvalue()

