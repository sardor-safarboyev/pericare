.PHONY: run lint format check up down

# Python virtual muhiti yo'li
VENV = backend/.venv/bin

run:
	$(VENV)/uvicorn app.api.main:app --app-dir backend --host 0.0.0.0 --port 8000 --reload

lint:
	$(VENV)/ruff check backend/

format:
	$(VENV)/ruff format backend/
	$(VENV)/ruff check backend/ --fix

check:
	$(VENV)/mypy backend/app/

# Docker orkestratsiyasi (Kechroq bazani ko'tarish uchun)
up:
	docker-compose up -d

down:
	docker-compose down
