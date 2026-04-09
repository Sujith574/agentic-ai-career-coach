from __future__ import annotations

from typing import Any

from services.platform_store import PlatformStore


PLAN_LIMITS = {
    "free": {"resume_analyses_per_month": 15, "team_seats": 1, "mock_interviews_per_month": 10},
    "pro": {"resume_analyses_per_month": 300, "team_seats": 10, "mock_interviews_per_month": 200},
    "enterprise": {
        "resume_analyses_per_month": 100000,
        "team_seats": 1000,
        "mock_interviews_per_month": 100000,
    },
}


class BillingService:
    def __init__(self, store: PlatformStore) -> None:
        self.store = store

    def ensure_subscription(self, org_id: str) -> dict[str, Any]:
        subscription = self.store.get_subscription(org_id)
        if subscription:
            return subscription
        return self.store.create_subscription(org_id=org_id, plan="free", status="active")

    def update_plan(self, org_id: str, plan: str) -> dict[str, Any]:
        if plan not in PLAN_LIMITS:
            raise ValueError("Unknown plan")
        return self.store.create_subscription(org_id=org_id, plan=plan, status="active")

    def limits_for_org(self, org_id: str) -> dict[str, Any]:
        subscription = self.ensure_subscription(org_id)
        return PLAN_LIMITS.get(subscription.get("plan", "free"), PLAN_LIMITS["free"])

    def assert_within_limit(self, org_id: str, metric: str) -> tuple[bool, str]:
        limits = self.limits_for_org(org_id)
        limit = int(limits.get(metric, 999999))
        usage_rows = self.store.list_usage(org_id)
        current = 0
        for row in usage_rows:
            if row.get("metric") == metric:
                current = int(row.get("value", 0))
        if current >= limit:
            return False, f"Plan limit reached for {metric}. Upgrade required."
        return True, ""

