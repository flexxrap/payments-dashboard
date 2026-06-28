FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1 PYTHONDONTWRITEBYTECODE=1

WORKDIR /app

COPY backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ /app/
COPY migrations/ /migrations/

EXPOSE 8000

CMD ["sh", "-c", "alembic upgrade head && if [ \"$RUN_SEED\" = \"1\" ]; then python -m app.seed; fi && uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
