#!/bin/bash
# Vercel Environment Variables Setup Script
# Run this after: npm i -g vercel && vercel login

set -e

PROJECT_ID="cosmeticse"
ORG_ID="manuelgodson10-2150s-projects"

echo "🔧 Setting up Vercel environment variables for CR Cosmetics..."

# Core required variables
vercel env add DATABASE_URL production <<< "postgresql://neondb_owner:npg_NTQDd27Agkuw@ep-cool-term-ay9u3ysn-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
vercel env add DATABASE_URL preview <<< "postgresql://neondb_owner:npg_NTQDd27Agkuw@ep-cool-term-ay9u3ysn-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
vercel env add DATABASE_URL development <<< "postgresql://neondb_owner:npg_NTQDd27Agkuw@ep-cool-term-ay9u3ysn-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

# App URL - UPDATE AFTER FIRST DEPLOY
vercel env add APP_URL production <<< "https://cosmeticse.vercel.app"
vercel env add APP_URL preview <<< "https://cosmeticse-git-preview.vercel.app"
vercel env add APP_URL development <<< "http://localhost:3000"

# Node environment
vercel env add NODE_ENV production <<< "production"
vercel env add NODE_ENV preview <<< "development"
vercel env add NODE_ENV development <<< "development"

# Google Auth
vercel env add GOOGLE_CLIENT_ID production <<< "380650654419-afnk7gdffsvbghr3pk5eu7pb3p9dvmj5.apps.googleusercontent.com"
vercel env add GOOGLE_CLIENT_ID preview <<< "380650654419-afnk7gdffsvbghr3pk5eu7pb3p9dvmj5.apps.googleusercontent.com"
vercel env add GOOGLE_CLIENT_ID development <<< "380650654419-afnk7gdffsvbghr3pk5eu7pb3p9dvmj5.apps.googleusercontent.com"
vercel env add VITE_GOOGLE_CLIENT_ID production <<< "380650654419-afnk7gdffsvbghr3pk5eu7pb3p9dvmj5.apps.googleusercontent.com"
vercel env add VITE_GOOGLE_CLIENT_ID preview <<< "380650654419-afnk7gdffsvbghr3pk5eu7pb3p9dvmj5.apps.googleusercontent.com"
vercel env add VITE_GOOGLE_CLIENT_ID development <<< "380650654419-afnk7gdffsvbghr3pk5eu7pb3p9dvmj5.apps.googleusercontent.com"

# AI (Gemini) - ADD YOUR KEY
echo "⚠️  Add your GEMINI_API_KEY manually:"
echo "vercel env add GEMINI_API_KEY production"
echo "vercel env add GEMINI_API_KEY preview"
echo "vercel env add GEMINI_API_KEY development"

# Auth secrets - GENERATE WITH: openssl rand -base64 32
echo "⚠️  Generate and add JWT_SECRET:"
echo "vercel env add JWT_SECRET production <<< \"\$(openssl rand -base64 32)\""
echo "vercel env add JWT_SECRET preview <<< \"\$(openssl rand -base64 32)\""
echo "vercel env add JWT_SECRET development <<< \"\$(openssl rand -base64 32)\""

echo "⚠️  Generate and add SESSION_SECRET:"
echo "vercel env add SESSION_SECRET production <<< \"\$(openssl rand -base64 32)\""
echo "vercel env add SESSION_SECRET preview <<< \"\$(openssl rand -base64 32)\""
echo "vercel env add SESSION_SECRET development <<< \"\$(openssl rand -base64 32)\""

# Mobile Money (Production only - add your credentials)
echo "⚠️  Add Mobile Money credentials for production:"
echo "vercel env add MOMO_MTN_API_KEY production"
echo "vercel env add MOMO_MTN_API_SECRET production"
echo "vercel env add MOMO_MTN_SUBSCRIPTION_KEY production"
echo "vercel env add MOMO_TELECEL_API_KEY production"
echo "vercel env add MOMO_TELECEL_API_SECRET production"
echo "vercel env add MOMO_TELECEL_SUBSCRIPTION_KEY production"
echo "vercel env add MOMO_AT_API_KEY production"
echo "vercel env add MOMO_AT_API_SECRET production"
echo "vercel env add MOMO_AT_SUBSCRIPTION_KEY production"

# Email (Resend / SendGrid)
echo "⚠️  Add Resend credentials:"
echo "vercel env add RESEND_API_KEY production"
echo "vercel env add RESEND_API_KEY preview"
echo "vercel env add RESEND_API_KEY development"

# Email (SendGrid)
echo "⚠️  Add SendGrid credentials:"
echo "vercel env add SENDGRID_API_KEY production"
echo "vercel env add SENDGRID_FROM_EMAIL production <<< \"orders@crcosmetics.com\""

# File Storage (AWS S3)
echo "⚠️  Add AWS credentials:"
echo "vercel env add AWS_S3_BUCKET production <<< \"cr-cosmetics-images\""
echo "vercel env add AWS_S3_BUCKET preview <<< \"cr-cosmetics-images\""
echo "vercel env add AWS_S3_BUCKET development <<< \"cr-cosmetics-images\""
echo "vercel env add AWS_S3_REGION production <<< \"us-east-1\""
echo "vercel env add AWS_S3_REGION preview <<< \"us-east-1\""
echo "vercel env add AWS_S3_REGION development <<< \"us-east-1\""
echo "vercel env add AWS_ACCESS_KEY_ID production"
echo "vercel env add AWS_SECRET_ACCESS_KEY production"
echo "vercel env add AWS_CLOUDFRONT_URL production <<< \"https://cdn.crcosmetics.com\""
echo "vercel env add AWS_CLOUDFRONT_URL preview <<< \"https://cdn.crcosmetics.com\""
echo "vercel env add AWS_CLOUDFRONT_URL development <<< \"http://localhost:3000\""

# Analytics
echo "⚠️  Add Google Analytics:"
echo "vercel env add GA_MEASUREMENT_ID production"

echo "✅ Core variables set! Run the manual commands above for secrets."
echo ""
echo "To verify: vercel env ls"