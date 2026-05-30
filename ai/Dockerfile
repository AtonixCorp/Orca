FROM python:3.11-slim AS runtime

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    VIRTUAL_ENV=/app/venv \
    PATH=/app/venv/bin:$PATH

WORKDIR /app

FROM python:3.11-slim AS builder

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    VIRTUAL_ENV=/app/venv \
    PATH=/app/venv/bin:$PATH

WORKDIR /app
RUN python -m venv "$VIRTUAL_ENV"

# Copy the full AI workspace so inference, training, ingestion, and model stack
# commands can all run from one image.
COPY . /app/ai
RUN pip install --no-cache-dir --retries 10 --timeout 1200 -r /app/ai/requirements.txt

FROM runtime
COPY --from=builder /app /app

USER 10001
EXPOSE 8012
ENTRYPOINT ["uvicorn", "ai.ai_models.inference:app", "--host", "0.0.0.0", "--port", "8012"]
