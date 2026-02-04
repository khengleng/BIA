#!/bin/bash

# Configuration
DOMAIN="cambobia.com"
CERT_DIR="/Users/mlh/BIA/boutique-advisory-platform/gcp/certs"
mkdir -p $CERT_DIR

echo "🔐 Generating Local Self-Signed SSL Certificate for $DOMAIN..."

# Generate Self-Signed Certificate
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout $CERT_DIR/tls.key \
    -out $CERT_DIR/tls.crt \
    -subj "/CN=$DOMAIN/O=Boutique Advisory/C=KH" \
    -addext "subjectAltName = DNS:cambobia.com, DNS:www.cambobia.com, DNS:api.cambobia.com"

echo "✅ Local certificates generated in $CERT_DIR"

# Check if kubectl is authenticated
if kubectl get nodes >/dev/null 2>&1; then
    echo "🏗️  Creating Kubernetes TLS Secret..."
    kubectl delete secret bia-local-tls-secret --ignore-not-found
    kubectl create secret tls bia-local-tls-secret \
        --cert=$CERT_DIR/tls.crt \
        --key=$CERT_DIR/tls.key
    echo "✅ Kubernetes secret 'bia-local-tls-secret' created successfully."
else
    echo "⚠️  Kubectl not authenticated. Please run 'gcloud container clusters get-credentials' first."
fi
