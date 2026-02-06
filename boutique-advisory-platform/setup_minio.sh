#!/bin/bash

# MinIO Setup Script for Local Development
# This script helps you set up MinIO for local file storage testing

echo "🚀 MinIO Setup for BIA Platform"
echo "================================"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed"
    echo ""
    echo "📦 To install Docker Desktop:"
    echo "1. Download from: https://www.docker.com/products/docker-desktop"
    echo "2. Or install with Homebrew:"
    echo "   brew install --cask docker"
    echo ""
    echo "3. After installation, open Docker Desktop"
    echo "4. Wait for Docker to start (you'll see the whale icon in your menu bar)"
    echo "5. Run this script again"
    echo ""
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo "❌ Docker is installed but not running"
    echo ""
    echo "Please start Docker Desktop and try again"
    echo ""
    exit 1
fi

echo "✅ Docker is installed and running"
echo ""

# Check if MinIO container already exists
if docker ps -a | grep -q minio-bia; then
    echo "⚠️  MinIO container already exists"
    echo ""
    read -p "Do you want to remove it and start fresh? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🗑️  Removing old MinIO container..."
        docker stop minio-bia 2>/dev/null
        docker rm minio-bia 2>/dev/null
        echo "✅ Old container removed"
        echo ""
    else
        echo "Keeping existing container"
        docker start minio-bia
        echo ""
        echo "✅ MinIO is running!"
        echo "   Console: http://localhost:9001"
        echo "   API: http://localhost:9000"
        echo "   Username: minioadmin"
        echo "   Password: minioadmin123"
        exit 0
    fi
fi

# Start MinIO
echo "🚀 Starting MinIO container..."
docker run -d \
  -p 9000:9000 \
  -p 9001:9001 \
  --name minio-bia \
  -e "MINIO_ROOT_USER=minioadmin" \
  -e "MINIO_ROOT_PASSWORD=minioadmin123" \
  -v ~/minio-data:/data \
  minio/minio server /data --console-address ":9001"

if [ $? -eq 0 ]; then
    echo "✅ MinIO started successfully!"
    echo ""
    echo "📋 MinIO Details:"
    echo "   Console UI: http://localhost:9001"
    echo "   API Endpoint: http://localhost:9000"
    echo "   Username: minioadmin"
    echo "   Password: minioadmin123"
    echo ""
    echo "📝 Next Steps:"
    echo "1. Open http://localhost:9001 in your browser"
    echo "2. Login with minioadmin / minioadmin123"
    echo "3. Create a bucket named 'bia-documents'"
    echo "4. Set bucket to public (for development)"
    echo "5. Update backend/.env with MinIO credentials"
    echo ""
    echo "💡 To update .env automatically, run:"
    echo "   ./setup_minio_env.sh"
    echo ""
else
    echo "❌ Failed to start MinIO"
    echo "Please check Docker logs for details"
    exit 1
fi
