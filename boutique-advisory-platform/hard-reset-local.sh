# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  echo "❌ Error: Docker is not running. Please start Docker Desktop and try again."
  exit 1
fi

echo "🧹 Hard Resetting Boutique Advisory Platform..."

# 1. Stop all containers, remove volumes and networks
docker compose down -v --remove-orphans
docker network prune -f

# 2. Delete the local build cache
echo "🗑️  Deleting local Next.js cache..."
rm -rf frontend/.next
rm -rf frontend/node_modules

# 3. Delete the old Docker images to force a fresh build
echo "🗑️  Cleaning up Docker images and service worker artifacts..."
rm -f frontend/public/sw.js frontend/public/sw.js.map frontend/public/workbox-*.js
docker rmi -f bia-frontend:latest bia-backend:latest 2>/dev/null || true
docker builder prune -f

# 4. Start the system with NO CACHE
echo "🚀 Starting fresh build (this will take a few minutes)..."
docker compose build --no-cache
docker compose up
