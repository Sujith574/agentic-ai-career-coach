from __future__ import annotations

from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from typing import Any

from redis import Redis
from rq import Queue

from services.platform_store import PlatformStore
from services.worker_tasks import process_job


def _utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


class QueueService:
    def __init__(self, store: PlatformStore, redis_url: str = "", queue_name: str = "agentic_jobs") -> None:
        self.store = store
        self.executor = ThreadPoolExecutor(max_workers=4, thread_name_prefix="agent-worker")
        self.queue: Queue | None = None
        if redis_url:
            try:
                redis_conn = Redis.from_url(redis_url)
                redis_conn.ping()
                self.queue = Queue(name=queue_name, connection=redis_conn)
            except Exception:
                self.queue = None

    def submit(
        self,
        *,
        org_id: str,
        user_id: str,
        job_type: str,
        payload: dict[str, Any],
        handler_name: str = "echo",
    ) -> dict[str, Any]:
        job = self.store._insert(
            "job_runs",
            {
                "org_id": org_id,
                "user_id": user_id,
                "job_type": job_type,
                "payload": payload,
                "status": "queued",
            },
        )

        if self.queue is not None:
            try:
                self.queue.enqueue(
                    process_job,
                    handler_name,
                    payload,
                    job_timeout=120,
                    result_ttl=3600,
                )
                self._set_status(job["id"], "queued_remote", queue="rq")
                return job
            except Exception as error:
                self._set_status(job["id"], "queue_fallback", error=str(error))

        def _run():
            try:
                self._set_status(job["id"], "running")
                result = process_job(handler_name, payload)
                self._set_status(job["id"], "completed", result=result)
            except Exception as error:
                self._set_status(job["id"], "failed", error=str(error))
                self.store._insert(
                    "dead_letter_jobs",
                    {
                        "org_id": org_id,
                        "user_id": user_id,
                        "job_type": job_type,
                        "payload": payload,
                        "error": str(error),
                        "created_at": _utc_now(),
                    },
                )

        self.executor.submit(_run)
        return job

    def _set_status(self, job_id: str, status: str, **extra: Any) -> None:
        updates = {"status": status, "updated_at": _utc_now(), **extra}
        self.store._update_by_id("job_runs", job_id, updates)

