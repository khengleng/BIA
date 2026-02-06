#!/bin/bash

# Automatically configure .env for MinIO

echo "🔧 Configuring backend/.env for MinIO..."
echo ""

ENV_FILE="backend/.env"

# Check if .env exists
if [ ! -f "$ENV_FILE" ]; then
    echo "❌ backend/.env not found"
    exit 1
fi

# Backup existing .env
cp "$ENV_FILE" "$ENV_FILE.backup-$(date +%s)"
echo "✅ Backed up existing .env"

# Check if S3 config already exists
if grep -q "S3_ENDPOINT=" "$ENV_FILE"; then
    echo "⚠️  S3 configuration already exists in .env"
    echo ""
    read -p "Do you want to replace it with MinIO config? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Keeping existing configuration"
        exit 0
    fi
    
    # Remove old S3 config
    sed -i '' '/^S3_/d' "$ENV_FILE"
    sed -i '' '/^STRIPE_/d' "$ENV_FILE"
fi

# Add MinIO configuration
cat >> "$ENV_FILE" << 'EOF'

# Cloud Storage Configuration (MinIO - Local Development)
S3_ENDPOINT=http://localhost:9000
S3_REGION=us-east-1
S3_ACCESS_KEY_ID=minioadmin
S3_SECRET_ACCESS_KEY=minioadmin123
S3_BUCKET_NAME=bia-documents
S3_PUBLIC_URL=http://localhost:9000/bia-documents

# Stripe Payment Configuration (Optional)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
EOF

echo "✅ MinIO configuration added to backend/.env"
echo ""
echo "📋 Configuration:"
echo "   Endpoint: http://localhost:9000"
echo "   Bucket: bia-documents"
echo "   Access Key: minioadmin"
echo "   Secret Key: minioadmin123"
echo ""
echo "⚠️  IMPORTANT: Create the 'bia-documents' bucket in MinIO Console"
echo "   1. Open http://localhost:9001"
echo "   2. Login: minioadmin / minioadmin123"
echo "   3. Click 'Create Bucket'"
echo "   4. Name: bia-documents"
echo "   5. Click 'Create Bucket'"
echo ""
echo "🔄 Restart your backend server to apply changes"
echo ""
