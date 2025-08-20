#!/bin/bash

# OMNIX AI - Simple AWS Deployment Script
# Uses existing S3 bucket or creates a new one

set -e

# Configuration - Use existing bucket name pattern
BUCKET_NAME="omnix-ai-frontend-animations-1754933694"
REGION="eu-central-1"

echo "🚀 OMNIX AI - Simple AWS Deployment"
echo "===================================="
echo "Bucket: $BUCKET_NAME"
echo "Region: $REGION"
echo ""

# Step 1: Build for production
echo "🔨 Building for production..."
VITE_API_BASE_URL=https://wdqm1vpl80.execute-api.eu-central-1.amazonaws.com/dev npm run build
echo "✅ Build completed"

# Step 2: Upload files directly to existing bucket
echo "⬆️  Uploading files to S3..."
aws s3 sync dist/ s3://$BUCKET_NAME --delete \
    --cache-control "max-age=31536000" \
    --exclude "*.html"

aws s3 sync dist/ s3://$BUCKET_NAME --delete \
    --cache-control "max-age=0, no-cache, no-store, must-revalidate" \
    --include "*.html"

echo "✅ Files uploaded successfully"

# Get the website URL
WEBSITE_URL="http://$BUCKET_NAME.s3-website-$REGION.amazonaws.com"

echo ""
echo "🎉 Deployment Complete!"
echo "======================"
echo "Website URL: $WEBSITE_URL"
echo ""
echo "📝 Deployment Info:"
echo "Bucket: $BUCKET_NAME" 
echo "Region: $REGION"
echo "Built with API URL: https://wdqm1vpl80.execute-api.eu-central-1.amazonaws.com/dev"
echo ""
echo "🔗 Your OMNIX AI application is now live!"