#!/bin/bash
set -euxo pipefail

LOCATION=asia-northeast1
PROJECT_ID=llm-chat
REPOSITORY_ID=llm-chat

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
