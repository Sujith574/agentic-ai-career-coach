from __future__ import annotations

from typing import Any


def echo_handler(payload: dict[str, Any]) -> dict[str, Any]:
    return {"echo": payload}


def pulse_handler(payload: dict[str, Any]) -> dict[str, Any]:
    pending = int(payload.get("pending_count", 0))
    if pending > 0:
        return {"message": f"Live pulse: {pending} pending tasks still monitored"}
    return {"message": "Live pulse: all tasks complete"}


HANDLERS = {
    "echo": echo_handler,
    "pulse": pulse_handler,
}


def process_job(handler_name: str, payload: dict[str, Any]) -> dict[str, Any]:
    handler = HANDLERS.get(handler_name, echo_handler)
    return handler(payload)

