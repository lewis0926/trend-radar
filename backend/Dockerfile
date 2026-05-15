FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY src/ ./src/

EXPOSE 8000

# config.json is not baked in — mount it at runtime:
#   docker run -v /path/to/config.json:/app/config.json trend-radar-backend
CMD ["uvicorn", "src.api:app", "--host", "0.0.0.0", "--port", "8000"]
