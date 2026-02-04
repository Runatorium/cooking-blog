#!/usr/bin/env bash
# Exit on error
set -o errexit

# Build frontend
echo "Building React frontend..."
cd frontend
npm install
npm run build

# Copy frontend build to Django static files
echo "Copying frontend build to Django static files..."
cd ..
mkdir -p cooking_blog/staticfiles
cp -r frontend/dist/* cooking_blog/staticfiles/

# Collect Django static files
echo "Collecting Django static files..."
python manage.py collectstatic --no-input

echo "Build complete!"
