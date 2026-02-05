#!/bin/bash

# Ensure we are in the project root
cd "$(dirname "$0")"

echo "🚀 Preparing to deploy changes to GitHub..."

# Check status
git status

# Add all changes (just in case there are lingering ones, though implementation is committed)
git add .

# Commit if there are changes
if ! git diff-index --quiet HEAD --; then
    echo "📦 Committing remaining changes..."
    git commit -m "chore: final polish before deployment"
else
    echo "✨ No new changes to commit."
fi

# Push to main
echo "⬆️ Pushing to origin main..."
git push origin main

echo "✅ Done! Railway should trigger the deployment automatically."
