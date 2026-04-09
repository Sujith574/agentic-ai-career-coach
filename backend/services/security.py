from __future__ import annotations

import threading
import time
import uuid
from collections import defaultdict, deque
from typing import Any, Callable

from flask import Flask, g, jsonify, request


class InMemoryRateLimiter:
    def __init__(self, per_minute: int) -> None:
        self.per_minute = per_minute
        self._buckets: dict[str, deque[float]] = defaultdict(deque)
        self._lock = threading.Lock()

    def allow(self, key: str) -> bool:
        now = time.time()
        with self._lock:
            bucket = self._buckets[key]
            while bucket and now - bucket[0] > 60:
                bucket.popleft()
            if len(bucket) >= self.per_minute:
                return False
            bucket.append(now)
            return True


def apply_security_headers(response):
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["X-Request-Id"] = getattr(g, "request_id", "unknown")
    return response


def setup_request_guardrails(app: Flask, *, per_minute: int) -> None:
    limiter = InMemoryRateLimiter(per_minute=per_minute)

    @app.before_request
    def _before_request():
        g.request_id = str(uuid.uuid4())
        g.request_started_at = time.time()
        ip = request.headers.get("X-Forwarded-For", request.remote_addr or "unknown")
        key = f"{ip}:{request.path}"
        if not limiter.allow(key):
            return jsonify({"error": "Rate limit exceeded"}), 429
        return None

    app.after_request(apply_security_headers)


def require_roles(allowed_roles: set[str]) -> Callable:
    from functools import wraps

    from flask import g, jsonify

    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            role = getattr(g, "role", "")
            if role not in allowed_roles:
                return jsonify({"error": "Forbidden"}), 403
            return func(*args, **kwargs)

        return wrapper

    return decorator


def validate_required_fields(payload: dict[str, Any], fields: list[str]) -> tuple[bool, str]:
    for field in fields:
        value = payload.get(field)
        if value is None or (isinstance(value, str) and not value.strip()):
            return False, f"Missing required field: {field}"
    return True, ""

