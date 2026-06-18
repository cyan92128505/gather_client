COMPOSE := docker compose

.DEFAULT_GOAL := help

.PHONY: help up down restart logs ps build enable

help:
	@echo "Targets:"
	@echo "  make up       build image and start (detached)"
	@echo "  make down     stop and remove the container"
	@echo "  make restart  restart the service"
	@echo "  make logs     follow logs"
	@echo "  make ps       show status"
	@echo "  make build    rebuild image only"
	@echo "  make enable   one-time: make dockerd start on boot (needs sudo)"

up:
	$(COMPOSE) up -d --build

down:
	$(COMPOSE) down

restart:
	$(COMPOSE) restart

logs:
	$(COMPOSE) logs -f

ps:
	$(COMPOSE) ps

build:
	$(COMPOSE) build

enable:
	sudo systemctl enable --now docker