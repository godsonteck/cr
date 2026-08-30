#!/usr/bin/env node
/**
 * Vercel Environment Variables Setup via API
 * Usage: 
 * 1. Get Vercel token: vercel tokens create "cr-cosmetics-setup"
 * 2. Set VERCEL_TOKEN env var or pass --token
 * 3. Run: npx tsx scripts/setup-vercel-env-api.ts
 */

import { createClient } from '@vercel/sdk';

// Configuration
const VERCEL_TOKEN = process.env.VERCEL_TOKEN || process.argv.find(a => a.startsWith('--token='))?.split('=')[1];
const PROJECT_NAME = 'cosmeticse';
const ORG_SLUG = 'manuelgodson10-2150s-projects';

if (!VERCEL_TOKEN) {
  console.error('❌ VERCEL_TOKEN not set. Get token: vercel tokens create "cr-cosmetics-setup"');
  console.error('Usage: VERCEL_TOKEN=xxx npx tsx scripts/setup-vercel-env-api.ts');
  process.exit(1);
}

const client = createClient({ token: VERCEL_TOKEN });

const ENV_VARS = [
  // Required - Core
  { key: 'DATABASE_URL', value: 'postgresql://neondb_owner:npg_NTQDd27Agkuw@ep-cool-term-ay9u3ysn-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require', target: ['production', 'preview', 'development'] },
  { key: 'APP_URL', value: 'https://cosmeticse.vercel.app', target: ['production'] },
  { key: 'APP_URL', value: 'https://cosmeticse-git-preview.vercel.app', target: ['preview'] },
  { key: 'APP_URL', value: 'http://localhost:3000', target: ['development'] },
  { key: 'NODE_ENV', value: 'production', target: ['production'] },
  { key: 'NODE_ENV', value: 'development', target: ['preview', 'development'] },

  // Required - Secrets (FILL THESE IN)
  { key: 'GEMINI_API_KEY', value: process.env.GEMINI_API_KEY || '', target: ['production', 'preview', 'development'] },
  { key: 'JWT_SECRET', value: process.env.JWT_SECRET || '', target: ['production', 'preview', 'development'] },
  { key: 'SESSION_SECRET', value: process.env.SESSION_SECRET || '', target: ['production', 'preview', 'development'] },

  // Optional - Mobile Money (Production only)
  { key: 'MOMO_MTN_API_KEY', value: process.env.MOMO_MTN_API_KEY || '', target: ['production'] },
  { key: 'MOMO_MTN_API_SECRET', value: process.env.MOMO_MTN_API_SECRET || '', target: ['production'] },
  { key: 'MOMO_MTN_SUBSCRIPTION_KEY', value: process.env.MOMO_MTN_SUBSCRIPTION_KEY || '', target: ['production'] },
  { key: 'MOMO_TELECEL_API_KEY', value: process.env.MOMO_TELECEL_API_KEY || '', target: ['production'] },
  { key: 'MOMO_TELECEL_API_SECRET', value: process.env.MOMO_TELECEL_API_SECRET || '', target: ['production'] },
  { key: 'MOMO_TELECEL_SUBSCRIPTION_KEY', value: process.env.MOMO_TELECEL_SUBSCRIPTION_KEY || '', target: ['production'] },
  { key: 'MOMO_AT_API_KEY', value: process.env.MOMO_AT_API_KEY || '', target: ['production'] },
  { key: 'MOMO_AT_API_SECRET', value: process.env.MOMO_AT_API_SECRET || '', target: ['production'] },
  { key: 'MOMO_AT_SUBSCRIPTION_KEY', value: process.env.MOMO_AT_SUBSCRIPTION_KEY || '', target: ['production'] },

  // Optional - Email
  { key: 'SENDGRID_API_KEY', value: process.env.SENDGRID_API_KEY || '', target: ['production'] },
  { key: 'SENDGRID_FROM_EMAIL', value: 'orders@crcosmetics.com', target: ['production', 'preview', 'development'] },

  // Optional - AWS
  { key: 'AWS_S3_BUCKET', value: 'cr-cosmetics-images', target: ['production', 'preview', 'development'] },
  { key: 'AWS_S3_REGION', value: 'us-east-1', target: ['production', 'preview', 'development'] },
  { key: 'AWS_ACCESS_KEY_ID', value: process.env.AWS_ACCESS_KEY_ID || '', target: ['production', 'preview', 'development'] },
  { key: 'AWS_SECRET_ACCESS_KEY', value: process.env.AWS_SECRET_ACCESS_KEY || '', target: ['production', 'preview', 'development'] },
  { key: 'AWS_CLOUDFRONT_URL', value: 'https://cdn.crcosmetics.com', target: ['production', 'preview'] },
  { key: 'AWS_CLOUDFRONT_URL', value: 'http://localhost:3000', target: ['development'] },

  // Optional - Analytics
  { key: 'GA_MEASUREMENT_ID', value: process.env.GA_MEASUREMENT_ID || '', target: ['production'] },
];

async function getProjectId() {
  const projects = await client.projects.list();
  const project = projects.projects?.find(p => p.name === PROJECT_NAME);
  if (!project) throw new Error(`Project ${PROJECT_NAME} not found`);
  return project.id;
}

async function upsertEnvVar(projectId: string, key: string, value: string, target: string[]) {
  if (!value) {
    console.log(`⚠️  Skipping ${key} (empty value)`);
    return;
  }

  try {
    await client.envVariables.upsert(projectId, {
      key,
      value,
      target,
      type: 'encrypted',
    });
    console.log(`✅ ${key} (${target.join(', ')})`);
  } catch (error: any) {
    console.error(`❌ ${key}: ${error.message}`);
  }
}

async function main() {
  console.log('🔧 Setting up Vercel environment variables...\n');
  
  try {
    const projectId = await getProjectId();
    console.log(`📦 Project: ${PROJECT_NAME} (${projectId})\n`);

    for (const envVar of ENV_VARS) {
      await upsertEnvVar(projectId, envVar.key, envVar.value, envVar.target);
    }

    console.log('\n🎉 Done! Verify with: vercel env ls');
  } catch (error) {
    console.error('❌ Failed:', error);
    process.exit(1);
  }
}

main();