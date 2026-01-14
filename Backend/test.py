# python
import argparse
from pathlib import Path
from datetime import datetime

DOCKERFILE_TPL = """FROM python:3.12-slim

ENV PYTHONUNBUFFERED=1 \\
    PIP_NO_CACHE_DIR=off \\
    POETRY_VIRTUALENVS_CREATE=false

WORKDIR /app

RUN apt-get update && apt-get install -y build-essential libpq-dev --no-install-recommends \\
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --upgrade pip && pip install -r requirements.txt

COPY . .

# collectstatic si nécessaire (adapter selon settings)
RUN python manage.py collectstatic --noinput || true

EXPOSE 8000
CMD ["gunicorn", "{wsgi}", "--bind", "0.0.0.0:8000", "--workers", "3"]
"""

DOCKERIGNORE = """__pycache__
*.pyc
*.pyo
*.pyd
env
venv
.venv
.git
.gitlab-ci.yml
Dockerfile
"""

GITLAB_CI_TPL = """image: docker:24.0.5
services:
  - docker:24.0.5-dind

variables:
  DOCKER_HOST: "tcp://docker:2375"
  DOCKER_TLS_CERTDIR: ""
  IMAGE: "{image}"
  # TAG vaut CI_COMMIT_TAG si présent, sinon CI_COMMIT_SHORT_SHA
  TAG: "${{CI_COMMIT_TAG:-${{CI_COMMIT_SHORT_SHA}}}}"

stages:
  - build
  - push

build:
  stage: build
  script:
    - docker info
    - docker build -t "$IMAGE:$TAG" -t "$IMAGE:latest" .
  only:
    - main
    - tags

push:
  stage: push
  script:
    - echo "$DOCKER_HUB_PASSWORD" | docker login -u "$DOCKER_HUB_USERNAME" --password-stdin
    - docker push "$IMAGE:$TAG"
    - docker push "$IMAGE:latest"
  only:
    - main
    - tags
"""

def backup_if_exists(path: Path):
    if path.exists():
        ts = datetime.utcnow().strftime("%Y%m%dT%H%M%SZ")
        bak = path.with_suffix(path.suffix + f".{ts}.bak") if path.suffix else Path(str(path) + f".{ts}.bak")
        path.rename(bak)
        print(f"Existing `{path}` moved to `{bak}`")

def write(path: Path, content: str, overwrite: bool):
    if path.exists() and not overwrite:
        backup_if_exists(path)
    path.write_text(content, encoding="utf-8")
    print(f"Wrote `{path}`")

def main():
    p = argparse.ArgumentParser(description="Créer `Dockerfile`, `.dockerignore` et `.gitlab-ci.yml` avec tagging Docker")
    p.add_argument("--wsgi", default="project_name.wsgi:application", help="Import WSGI pour gunicorn (ex: myproj.wsgi:application)")
    p.add_argument("--image", default='$DOCKER_HUB_USERNAME/kid-backend', help="Variable IMAGE pour `.gitlab-ci.yml` (peut contenir $DOCKER_HUB_USERNAME)")
    p.add_argument("--overwrite", action="store_true", help="Écrase sans sauvegarde les fichiers existants")
    args = p.parse_args()

    root = Path.cwd()
    write(root / "Dockerfile", DOCKERFILE_TPL.format(wsgi=args.wsgi), args.overwrite)
    write(root / ".dockerignore", DOCKERIGNORE, args.overwrite)
    write(root / ".gitlab-ci.yml", GITLAB_CI_TPL.format(image=args.image), args.overwrite)
    print("Terminé.")

if __name__ == "__main__":
    main()
