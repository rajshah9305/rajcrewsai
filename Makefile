# CrewNexus Makefile

.PHONY: help install dev build test clean deploy stop logs

# Default target
.DEFAULT_GOAL := help

# Colors for output
GREEN  := $(shell tput -Txterm setaf 2)
YELLOW := $(shell tput -Txterm setaf 3)
WHITE  := $(shell tput -Txterm setaf 7)
RESET  := $(shell tput -Txterm sgr0)

help: ## Show this help message
	@echo '${GREEN}CrewNexus - Multi-Agent Orchestration Platform${RESET}'
	@echo ''
	@echo '${YELLOW}Usage:${RESET}'
	@echo '  make ${WHITE}<target>${RESET}'
	@echo ''
	@echo '${YELLOW}Available targets:${RESET}'
	@awk 'BEGIN {FS = ":.*##"; printf "\n"} /^[a-zA-Z_-]+:.*?##/ { printf "  ${WHITE}%-15s${RESET} %s\n", $$1, $$2 } /^##@/ { printf "\n${GREEN}%s${RESET}\n", substr($$0, 5) } ' $(MAKEFILE_LIST)

##@ Development

install: ## Install dependencies for all services
	@echo '${GREEN}Installing backend dependencies...${RESET}'
	@cd backend && pip install -r requirements.txt
	@echo '${GREEN}Installing frontend dependencies...${RESET}'
	@cd frontend && npm install

dev: ## Start development servers
	@echo '${GREEN}Starting development environment...${RESET}'
	@docker-compose up -d postgres redis
	@echo '${GREEN}Waiting for services to be ready...${RESET}'
	@sleep 10
	@echo '${GREEN}Starting backend...${RESET}'
	@cd backend && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &
	@echo '${GREEN}Starting frontend...${RESET}'
	@cd frontend && npm run dev &
	@echo '${GREEN}Development servers started!${RESET}'
	@echo '${YELLOW}Frontend: http://localhost:3000${RESET}'
	@echo '${YELLOW}Backend API: http://localhost:8000${RESET}'
	@echo '${YELLOW}API Docs: http://localhost:8000/docs${RESET}'

build: ## Build Docker images
	@echo '${GREEN}Building Docker images...${RESET}'
	@docker-compose build

test: ## Run tests
	@echo '${GREEN}Running backend tests...${RESET}'
	@cd backend && pytest tests/ -v
	@echo '${GREEN}Running frontend tests...${RESET}'
	@cd frontend && npm test

##@ Production

deploy: ## Deploy with Docker Compose
	@echo '${GREEN}Deploying CrewNexus...${RESET}'
	@docker-compose up -d
	@echo '${GREEN}Deployment complete!${RESET}'
	@echo '${YELLOW}Application: http://localhost:3000${RESET}'
	@echo '${YELLOW}API: http://localhost:8000${RESET}'

stop: ## Stop all services
	@echo '${GREEN}Stopping all services...${RESET}'
	@docker-compose down
	@pkill -f "uvicorn app.main" || true
	@pkill -f "npm run dev" || true

##@ Utilities

logs: ## View logs from all services
	@docker-compose logs -f

logs-backend: ## View backend logs
	@docker-compose logs -f backend

logs-frontend: ## View frontend logs
	@docker-compose logs -f frontend

logs-db: ## View database logs
	@docker-compose logs -f postgres

clean: ## Clean up containers and volumes
	@echo '${GREEN}Cleaning up...${RESET}'
	@docker-compose down -v --remove-orphans
	@docker system prune -f
	@rm -rf backend/__pycache__ frontend/.next frontend/node_modules backend/venv

##@ Database

db-migrate: ## Run database migrations
	@echo '${GREEN}Running database migrations...${RESET}'
	@cd backend && alembic upgrade head

db-reset: ## Reset database
	@echo '${GREEN}Resetting database...${RESET}'
	@docker-compose exec postgres psql -U crewnexus -d crewnexus -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
	@cd backend && alembic upgrade head

##@ Development Tools

format: ## Format code
	@echo '${GREEN}Formatting Python code...${RESET}'
	@cd backend && black app/ tests/
	@echo '${GREEN}Formatting TypeScript code...${RESET}'
	@cd frontend && npm run format

lint: ## Lint code
	@echo '${GREEN}Linting Python code...${RESET}'
	@cd backend && flake8 app/ tests/
	@echo '${GREEN}Linting TypeScript code...${RESET}'
	@cd frontend && npm run lint

typecheck: ## Type checking
	@echo '${GREEN}Type checking TypeScript...${RESET}'
	@cd frontend && npm run type-check

##@ Documentation

docs: ## Generate documentation
	@echo '${GREEN}Generating API documentation...${RESET}'
	@cd backend && python -m pydoc -w app.main
	@echo '${GREEN}Generating frontend documentation...${RESET}'
	@cd frontend && npm run docs

##@ Monitoring

monitor: ## Start monitoring stack
	@echo '${GREEN}Starting monitoring stack...${RESET}'
	@docker-compose -f docker-compose.monitoring.yml up -d

##@ Backup

backup: ## Backup database
	@echo '${GREEN}Creating database backup...${RESET}'
	@docker-compose exec postgres pg_dump -U crewnexus crewnexus > backup_$(shell date +%Y%m%d_%H%M%S).sql

restore: ## Restore database from backup
	@echo '${YELLOW}Usage: make restore FILE=backup.sql${RESET}'
ifdef FILE
	@docker-compose exec -T postgres psql -U crewnexus -d crewnexus < $(FILE)
else
	@echo '${RED}Please specify backup file: make restore FILE=backup.sql${RESET}'
endif