.PHONY: install run-frontend run-backend run init-db seed-admin help

# Prepend local node binaries to PATH if they exist (prevents WSL from falling back to Windows node/npm)
LOCAL_BIN := $(CURDIR)/test-node/bin
ifneq ($(wildcard $(LOCAL_BIN)),)
export PATH := $(LOCAL_BIN):$(PATH)
endif

# Detect package manager: use pnpm if available, otherwise fallback to npm
PM ?= $(shell PATH="$(PATH)" command -v pnpm >/dev/null 2>&1 && echo pnpm || echo npm)

help:
	@echo "Available commands:"
	@echo "  install      - Install frontend and backend dependencies"
	@echo "  run-frontend - Run the React frontend (Vite)"
	@echo "  run-backend  - Run the FastAPI backend"
	@echo "  init-db      - Create database tables"
	@echo "  seed-admin   - Create the default admin user"
	@echo "  run          - Run both frontend and backend concurrently"

install:
	@echo "Installing frontend dependencies using $(PM)..."
	cd frontend && $(PM) install
	@echo "Installing backend dependencies..."
	cd backend && ./venv/bin/pip install -r requirements.txt

run-frontend:
	cd frontend && $(PM) run dev

run-backend:
	cd backend && ./venv/bin/uvicorn app.main:app --reload

init-db:
	@echo "Creating database tables..."
	cd backend && ./venv/bin/python app/init_db.py

seed-admin:
	@echo "Seeding admin user..."
	cd backend && ./venv/bin/python app/seed_admin.py

run:
	@echo "Starting frontend and backend concurrently..."
	$(MAKE) -j 2 run-frontend run-backend
