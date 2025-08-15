#!/bin/bash

# Script to package and deploy the Cloud Function
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FUNCTION_DIR="$SCRIPT_DIR/function-source"
ZIP_FILE="$SCRIPT_DIR/function-source.zip"

echo "Packaging Cloud Function..."

# Remove existing zip file if it exists
if [ -f "$ZIP_FILE" ]; then
    rm "$ZIP_FILE"
fi

# Create zip file with function source
cd "$FUNCTION_DIR"
zip -r "$ZIP_FILE" .

echo "Function packaged successfully: $ZIP_FILE"
echo ""
echo "Next steps:"
echo "1. Run 'terraform plan' to see what will be created"
echo "2. Run 'terraform apply' to deploy the infrastructure"
echo "3. The function will be automatically triggered every 5 minutes"
echo ""
echo "Note: You may need to manually upload the function source code to the storage bucket"
echo "created by Terraform, or modify the cloud-function.tf to use a local source path."
