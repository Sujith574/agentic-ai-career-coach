from __future__ import annotations

import json
import logging
import time
from collections import defaultdict
from typing import Any

from flask import Flask, g, request


class MetricsRegistry:
    def __init__(self) -> None:
        self.counters: dict[str, int] = defaultdict(int)
        self.timers: dict[str, list[float]] = defaultdict(list)

    def inc(self, key: str, value: int = 1) -> None:
        self.counters[key] += value

    def observe(self, key: str, value: float) -> None:
        self.timers[key].append(value)

    def snapshot(self) -> dict[str, Any]:
        latency = {}
        for key, values in self.timers.items():
            if values:
                latency[key] = {
                    "count": len(values),
                    "avg_ms": round((sum(values) / len(values)) * 1000, 2),
                    "p95_ms": round(sorted(values)[int(len(values) * 0.95) - 1] * 1000, 2)
                    if len(values) > 1
                    else round(values[0] * 1000, 2),
                }
        return {"counters": dict(self.counters), "latency": latency}


def setup_observability(app: Flask) -> None:
    app.metrics = MetricsRegistry()
    logger = logging.getLogger("agentic_saas")
    logger.setLevel(logging.INFO)
    app.logger = logger

    @app.before_request
    def _start_timer():
        g._obs_start = time.time()

    @app.after_request
    def _log_request(response):
        duration = time.time() - getattr(g, "_obs_start", time.time())
        app.metrics.inc("http_requests_total")
        app.metrics.observe("http_request_duration_seconds", duration)
        app.metrics.inc(f"http_status_{response.status_code}")
        log_data = {
            "request_id": getattr(g, "request_id", ""),
            "method": request.method,
            "path": request.path,
            "status": response.status_code,
            "duration_ms": round(duration * 1000, 2),
            "org_id": getattr(g, "org_id", ""),
            "user_id": getattr(g, "user_id", ""),
        }
        app.logger.info(json.dumps(log_data))
        return response

