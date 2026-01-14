.PHONY: help build up down restart logs clean test migrate shell

help: ## Affiche cette aide
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

build: ## Build les images Docker
	docker-compose build

up: ## Démarre tous les services
	docker-compose up -d

down: ## Arrête tous les services
	docker-compose down

restart: ## Redémarre tous les services
	docker-compose restart

logs: ## Affiche les logs (usage: make logs service=backend)
	docker-compose logs -f $(service)

logs-all: ## Affiche tous les logs
	docker-compose logs -f

clean: ## Nettoie les containers, volumes et images
	docker-compose down -v
	docker system prune -af

test-backend: ## Lance les tests backend
	docker-compose exec backend python manage.py test

test-frontend: ## Lance les tests frontend
	docker-compose exec frontend npm test

migrate: ## Lance les migrations Django
	docker-compose exec backend python manage.py migrate

makemigrations: ## Crée de nouvelles migrations
	docker-compose exec backend python manage.py makemigrations

shell: ## Ouvre un shell Django
	docker-compose exec backend python manage.py shell

shell-db: ## Ouvre un shell PostgreSQL
	docker-compose exec db psql -U kid_user -d kid_livraison

createsuperuser: ## Crée un superuser Django
	docker-compose exec backend python manage.py createsuperuser

collectstatic: ## Collecte les fichiers statiques
	docker-compose exec backend python manage.py collectstatic --noinput

backup-db: ## Sauvegarde la base de données
	docker-compose exec -T db pg_dump -U kid_user kid_livraison > backup_$(shell date +%Y%m%d_%H%M%S).sql

restore-db: ## Restaure la base de données (usage: make restore-db file=backup.sql)
	docker-compose exec -T db psql -U kid_user -d kid_livraison < $(file)

dev-backend: ## Lance le backend en mode développement
	cd Backend && source venv/bin/activate && python manage.py runserver

dev-frontend: ## Lance le frontend en mode développement
	cd Frontent/frontend-app && npm run dev

install-backend: ## Installe les dépendances backend
	cd Backend && python -m venv venv && source venv/bin/activate && pip install -r requirements.txt

install-frontend: ## Installe les dépendances frontend
	cd Frontent/frontend-app && npm install

prod: ## Lance en mode production avec Nginx
	docker-compose --profile production up -d

status: ## Affiche le statut des services
	docker-compose ps

update: ## Met à jour et redémarre les services
	git pull
	docker-compose build
	docker-compose up -d
	docker-compose exec backend python manage.py migrate
	docker-compose exec backend python manage.py collectstatic --noinput
