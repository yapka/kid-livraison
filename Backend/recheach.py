import os

# Define the project root directory
PROJECT_ROOT_DIR = "." # Assuming the .gitlab-ci.yml will be at the project root

# Define the content for the combined .gitlab-ci.yml
gitlab_ci_content = '''
# .gitlab-ci.yml for Django Backend Application

# Define Docker images for different stages
# Use a Docker image with Docker CLI and Docker-in-Docker (dind) capabilities
image: docker:latest
services:
  - docker:dind

variables:
  # Docker Hub Credentials (set as protected/masked CI/CD variables in GitLab)
  DOCKER_HUB_USERNAME: "$DOCKER_HUB_USERNAME"
  DOCKER_HUB_PASSWORD: "$DOCKER_HUB_PASSWORD"

  # Backend variables
  PYTHON_IMAGE_TAG: "3.9-slim-buster"
  DJANGO_PROJECT_ROOT: "." # Assuming Django project root is the GitLab CI root (where .gitlab-ci.yml is)
  DJANGO_IMAGE_NAME: "$DOCKER_HUB_USERNAME/delivery-backend"
  DJANGO_IMAGE_TAG: "${CI_COMMIT_REF_SLUG:-latest}" # Use branch/tag name or 'latest'

# Define the stages of the pipeline
stages:
  - install
  - test
  - build_docker
  - deploy # Optional: for deploying the entire application

# --------------------------------------------------------------------------
# Backend CI/CD Jobs
# --------------------------------------------------------------------------

install_backend_dependencies:
  stage: install
  image: python:$PYTHON_IMAGE_TAG
  cache:
    key: "$CI_COMMIT_REF_SLUG-backend"
    paths:
      - $DJANGO_PROJECT_ROOT/.venv/
    policy: pull-push # Cache the virtual environment
  script:
    - echo "Installing backend dependencies..."
    - cd $DJANGO_PROJECT_ROOT
    - python -m venv .venv
    - source .venv/bin/activate
    - pip install --upgrade pip
    - pip install -r requirements.txt
  rules:
    - changes:
        - $DJANGO_PROJECT_ROOT/**/* # Monitor all files in Django project root
        - .gitlab-ci.yml
    - when: always # Always run install on changes

test_backend_app:
  stage: test
  image: python:$PYTHON_IMAGE_TAG
  cache:
    key: "$CI_COMMIT_REF_SLUG-backend"
    paths:
      - $DJANGO_PROJECT_ROOT/.venv/
    policy: pull # Only pull cache
  needs: ["install_backend_dependencies"]
  script:
    - echo "Running backend tests..."
    - cd $DJANGO_PROJECT_ROOT
    - source .venv/bin/activate
    - python manage.py test # Assuming your tests are set up to run with this command
  rules:
    - changes:
        - $DJANGO_PROJECT_ROOT/**/*
        - .gitlab-ci.yml
    - when: always

build_backend_docker_image:
  stage: build_docker
  needs: ["test_backend_app"]
  script:
    - echo "Logging into Docker Hub for backend..."
    - docker login -u "$DOCKER_HUB_USERNAME" -p "$DOCKER_HUB_PASSWORD"
    - echo "Building backend Docker image..."
    # Assuming the Dockerfile for the backend is at the project root and named Dockerfile.backend
    - docker build -t "$DJANGO_IMAGE_NAME:$DJANGO_IMAGE_TAG" -f $DJANGO_PROJECT_ROOT/Dockerfile.backend $DJANGO_PROJECT_ROOT
    - echo "Pushing backend Docker image to Docker Hub..."
    - docker push "$DJANGO_IMAGE_NAME:$DJANGO_IMAGE_TAG"
    - echo "Backend Docker image pushed successfully!"
  rules:
    - changes:
        - $DJANGO_PROJECT_ROOT/**/*
        - $DJANGO_PROJECT_ROOT/Dockerfile.backend # Monitor changes in backend Dockerfile
        - .gitlab-ci.yml
    - when: always

# --------------------------------------------------------------------------
# Deployment Stage (Optional - Example)
# --------------------------------------------------------------------------

# deploy_to_production:
#   stage: deploy
#   image: alpine/helm:latest # Example: Using Helm for Kubernetes deployment
#   needs: ["build_backend_docker_image"]
#   script:
#     - echo "Deploying application to production..."
#     # Add your deployment specific commands here
#     # e.g., kubectl apply -f kubernetes/deployments.yaml
#     # e.g., helm upgrade --install my-app ./helm-chart
#   rules:
#     - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH # Only deploy from main branch
#       when: manual # Manual trigger for production deployment
'''

# Define the full path for .gitlab-ci.yml at the project root
file_path = os.path.join(PROJECT_ROOT_DIR, '.gitlab-ci.yml')

# Write the content to the file
with open(file_path, 'w', encoding='utf-8') as f:
    f.write(gitlab_ci_content)

print(f"✅ Successfully created {file_path} with backend-only CI/CD configuration.")
print("\n--- IMPORTANT ---")
print("\nPour que cette pipeline fonctionne correctement, vous devrez créer un `Dockerfile` pour votre backend Django.\n")
print("**Instructions pour créer `Dockerfile.backend` (à la racine de votre projet) :**")
print("1. Créez un fichier nommé `Dockerfile.backend` à la racine de votre projet (là où se trouve `manage.py`).")
print("2. Ajoutez le contenu suivant à `Dockerfile.backend` (exemple) :")
print("```dockerfile")
print("FROM python:3.9-slim-buster")
print("WORKDIR /app")
print("COPY requirements.txt .")
print("RUN pip install --no-cache-dir -r requirements.txt")
print("COPY . .")
print("EXPOSE 8000")
print("CMD [\"python\", \"manage.py\", \"runserver\", \"0.0.0.0:8000\"]")
print("```")
print("\n**Instructions supplémentaires :**")
print("1. Assurez-vous d'avoir un fichier `requirements.txt` à la racine de votre projet Django avec toutes les dépendances.")
print("2. Configurez les variables CI/CD `DOCKER_HUB_USERNAME` et `DOCKER_HUB_PASSWORD` dans les paramètres de votre projet GitLab (Settings > CI/CD > Variables).")