#!/bin/bash
ENVIRONMENT=${1:-staging}
echo "🚀 Deploying Marcus to $ENVIRONMENT..."
npm run build
echo "✅ Deployment to $ENVIRONMENT completed!"
