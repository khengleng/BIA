#!/bin/bash

# GCP Deployment Guide for Boutique Advisory Platform

# 1. Configuration
PROJECT_ID="cambobia"
REGION="us-central1"
CLUSTER_NAME="bia-cluster"
STATIC_IP_NAME="bia-frontend-ip"

echo "🚀 Starting GCP Deployment for Boutique Advisory Platform..."

# 2. Enable APIs
echo "📡 Enabling Required APIs..."
gcloud services enable container.googleapis.com \
    cloudbuild.googleapis.com \
    containerregistry.googleapis.com

# 3. Create GKE Cluster
echo "🏗️ Creating GKE Cluster (this may take a few minutes)..."
gcloud container clusters create $CLUSTER_NAME \
    --region $REGION \
    --num-nodes 3 \
    --machine-type e2-medium

# 4. Get Credentials
gcloud container clusters get-credentials $CLUSTER_NAME --region $REGION

# 5. Create Secrets
echo "🔐 Creating Secrets..."
kubectl create secret generic bia-secrets \
    --from-literal=database-password="secure-password-here" \
    --from-literal=jwt-secret="32-char-jwt-secret-here" \
    --from-literal=initial-admin-password="BIA_GCP_Admin_2026!"

# 6. Build and Push Images using Cloud Build
echo "📦 Building images with Cloud Build..."
gcloud builds submit --config cloudbuild.yaml --substitutions=_PROJECT_ID=$PROJECT_ID

# 7. Reserve Static IP for the domain
echo "🌐 Reserving Static IP..."
gcloud compute addresses create $STATIC_IP_NAME --global --project=$PROJECT_ID || echo "Static IP already exists"

# 8. Apply Kubernetes Manifests
echo "⚓ Deploying to Kubernetes..."
# Update project ID in manifests
sed -i '' "s/PROJECT_ID_PLACEHOLDER/$PROJECT_ID/g" gcp/k8s/*.yaml

kubectl apply -f gcp/k8s/postgres.yaml
echo "⏳ Waiting for database to be ready..."
kubectl wait --for=condition=available deployment/bia-postgres --timeout=300s

kubectl apply -f gcp/k8s/backend.yaml
kubectl apply -f gcp/k8s/frontend.yaml
kubectl apply -f gcp/k8s/certificate.yaml
kubectl apply -f gcp/k8s/ingress.yaml

echo "✅ Deployment requested. Check status with: kubectl get pods"
echo "🌐 Get public IPs with: kubectl get svc"
