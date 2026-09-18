FROM python:3.10-slim

# Muhit o'zgaruvchilari
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app

WORKDIR /app

# Tizim paketlarini o'rnatish (C-kompilyatorlar ML kutubxonalari uchun kerak)
RUN apt-get update \
    && apt-get install -y --no-install-recommends gcc libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Kutubxonalarni o'rnatish
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Loyiha kodini nusxalash
COPY . .

# Konteyner ishga tushganda bajariladigan standart komanda
CMD ["uvicorn", "app.api.main:app", "--host", "0.0.0.0", "--port", "8000"]
