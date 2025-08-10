#!/bin/bash
set -euxo pipefail

# Load environment variables from .env file if it exists
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
fi

# Set default values if not provided in .env
LOCATION=${LOCATION:-asia-northeast1}
PROJECT_ID=${PROJECT_ID:-}
REPOSITORY_ID=${REPOSITORY_ID:-llm-chat}

# Check if PROJECT_ID is set
if [ -z "$PROJECT_ID" ]; then
  echo "Error: PROJECT_ID is not set. Please create a .env file with your project ID."
  echo "You can copy env.example to .env and update the values."
  exit 1
fi

# project rootに移動
script_dir=$(
  cd $(dirname $0)
  pwd
)
cd $script_dir/../../

# Get the current git commit hash
GIT_COMMIT=$(git rev-parse HEAD)

IMAGE_URL=$LOCATION-docker.pkg.dev/$PROJECT_ID/$REPOSITORY_ID/web:$GIT_COMMIT

# Build the Docker image with git commit hash as tag
docker build --platform linux/amd64 . -t $IMAGE_URL -f apps/web/Dockerfile

# Push the Docker image to GCR
docker push $IMAGE_URL

gcloud run deploy web --project $PROJECT_ID --image=$IMAGE_URL --region $LOCATION
