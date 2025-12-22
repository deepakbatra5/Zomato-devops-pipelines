#!/bin/bash

# Script to rebuild and deploy the Zomato application
# This script removes old containers/volumes and rebuilds everything

set -e

echo "🧹 Cleaning up old containers and volumes..."
docker compose down || true
docker volume rm zomato-app_dbdata 2>/dev/null || true

echo "🏗️  Building fresh Docker images..."
docker compose build --no-cache

echo "🚀 Starting services..."
docker compose up -d

echo "⏳ Waiting for database to be healthy..."
sleep 5

echo "📊 Checking backend initialization..."
for i in {1..60}; do
    echo "  Attempt $i/60..."
    if curl -s http://localhost:4000/api/restaurants | grep -q '\['; then
        echo "✅ Backend API is responding with data!"
        COUNT=$(curl -s http://localhost:4000/api/restaurants | grep -o '"name"' | wc -l)
        echo "📋 Total restaurants found: $((COUNT))"
        break
    fi
    sleep 3
done

echo "🌐 Frontend access:"
echo "  Local: http://localhost:3000"
echo "  Domain: https://foodhub.sbs"

echo ""
echo "📊 Service status:"
docker compose ps

echo ""
echo "✅ Deployment complete!"
