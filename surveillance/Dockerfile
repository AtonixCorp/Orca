FROM cgr.dev/chainguard/python:latest@sha256:f960fea6d1fb1c0ad626558d9db323ff84468927ac37cd7fa889b512ba0dc1c9 AS runtime

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    VIRTUAL_ENV=/app/venv \
    PATH=/app/venv/bin:$PATH

WORKDIR /app

FROM cgr.dev/chainguard/python:latest-dev@sha256:c1d503ebc5088bd0143673af0d02f2db31e53acc506ba5a8f4756c337a989d3f AS builder

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    VIRTUAL_ENV=/app/venv \
    PATH=/app/venv/bin:$PATH

WORKDIR /app
RUN python -m venv "$VIRTUAL_ENV"
COPY surveillance/requirements.txt /tmp/requirements.txt
RUN pip install --no-cache-dir -r /tmp/requirements.txt
COPY surveillance /app/surveillance

FROM runtime
COPY --from=builder /app /app

CMD ["uvicorn", "surveillance.drone_gateway_service:app", "--host", "0.0.0.0", "--port", "8020"]
