from redis import Redis
from rq import Connection, Worker

from services.config import load_settings


def run_worker() -> None:
    settings = load_settings()
    if not settings.redis_url:
        raise RuntimeError("REDIS_URL is required to run worker")
    redis_conn = Redis.from_url(settings.redis_url)
    with Connection(redis_conn):
        worker = Worker([settings.queue_name])
        worker.work(with_scheduler=True)


if __name__ == "__main__":
    run_worker()

