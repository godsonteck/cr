import { test, expect } from '@playwright/test';

// Vercel Environment Variables to add
const ENV_VARS = [
  {
    key: 'DATABASE_URL',
    value: 'postgresql://neondb_owner:npg_NTQDd27Agkuw@ep-cool-term-ay9u3ysn-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
    target: ['production', 'preview', 'development']
  },
  {
    key: 'APP_URL',
    value: 'https://cosmeticse.vercel.app', // Update after first deploy
    target: ['production', 'preview', 'development']
  },
  {
    key: 'NODE_ENV',
    value: 'production',
    target: ['production']
  },
  {
    key: 'NODE_ENV',
    value: 'development',
    target: ['preview', 'development']
  },
  {
    key: 'GEMINI_API_KEY',
    value: '', // Add your Gemini API key
    target: ['production', 'preview', 'development']
  },
  {
    key: 'JWT_SECRET',
    value: '', // Generate: openssl rand -base64 32
    target: ['production', 'preview', 'development']
  },
  {
    key: 'SESSION_SECRET',
    value: '', // Generate: openssl rand -base64 32
    target: ['production', 'preview', 'development']
  },
  {
    key: 'MOMO_MTN_API_KEY',
    value: '', // Add MTN MoMo API key
    target: ['production']
  },
  {
    key: 'MOMO_MTN_API_SECRET',
    value: '', // Add MTN MoMo API secret
    target: ['production']
  },
  {
    key: 'MOMO_MTN_SUBSCRIPTION_KEY',
    value: '', // Add MTN subscription key
    target: ['production']
  },
  {
    key: 'MOMO_TELECEL_API_KEY',
    value: '', // Add Telecel MoMo API key
    target: ['production']
  },
  {
    key: 'MOMO_TELECEL_API_SECRET',
    value: '', // Add Telecel MoMo API secret
    target: ['production']
  },
  {
    key: 'MOMO_TELECEL_SUBSCRIPTION_KEY',
    value: '', // Add Telecel subscription key
    target: ['production']
  },
  {
    key: 'MOMO_AT_API_KEY',
    value: '', // Add AirtelTigo MoMo API key
    target: ['production']
  },
  {
    key: 'MOMO_AT_API_SECRET',
    value: '', // Add AirtelTigo MoMo API secret
    target: ['production']
  },
  {
    key: 'MOMO_AT_SUBSCRIPTION_KEY',
    value: '', // Add AirtelTigo subscription key
    target: ['production']
  },
  {
    key: 'SENDGRID_API_KEY',
    value: '', // Add SendGrid API key
    target: ['production']
  },
  {
    key: 'SENDGRID_FROM_EMAIL',
    value: 'orders@crcosmetics.com',
    target: ['production', 'preview', 'development']
  },
  {
    key: 'AWS_S3_BUCKET',
    value: 'cr-cosmetics-images',
    target: ['production', 'preview', 'development']
  },
  {
    key: 'AWS_S3_REGION',
    value: 'us-east-1',
    target: ['production', 'preview', 'development']
  },
  {
    key: 'AWS_ACCESS_KEY_ID',
    value: '', // Add AWS access key
    target: ['production', 'preview', 'development']
  },
  {
    key: 'AWS_SECRET_ACCESS_KEY',
    value: '', // Add AWS secret key
    target: ['production', 'preview', 'development']
  },
  {
    key: 'AWS_CLOUDFRONT_URL',
    value: 'https://cdn.crcosmetics.com',
    target: ['production', 'preview', 'development']
  },
  {
    key: 'GA_MEASUREMENT_ID',
    value: '', // Add Google Analytics ID
    target: ['production']
  },
];

test('Add environment variables to Vercel', async ({ page }) => {
  // 1. Login to Vercel
  await page.goto('https://vercel.com/login');
  
  // Fill in your login credentials
  // You may need to use email/password or GitHub/GitLab/Bitbucket OAuth
  // await page.fill('input[type="email"]', 'your-email@example.com');
  // await page.click('button:has-text("Continue")');
  // await page.fill('input[type="password"]', 'your-password');
  // await page.click('button:has-text("Log in")');

  // Wait for manual login
  console.log('Please log in manually, then press Enter to continue...');
  await page.waitForURL('https://vercel.com/dashboard', { timeout: 120000 });

  // 2. Navigate to project settings
  await page.goto('https://vercel.com/manuelgodson10-2150s-projects/cosmeticse/settings/environment-variables');
  
  // Wait for page to load
  await page.waitForSelector('h1:has-text("Environment Variables")', { timeout: 30000 });

  // 3. Add each environment variable
  for (const envVar of ENV_VARS) {
    console.log(`Adding ${envVar.key}...`);
    
    // Click "Add New" button
    await page.click('button:has-text("Add New")');
    
    // Wait for modal
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    
    // Fill key
    await page.fill('input[name="key"]', envVar.key);
    
    // Fill value
    await page.fill('input[name="value"]', envVar.value);
    
    // Select environments
    for (const target of envVar.target) {
      const checkbox = page.locator(`label:has-text("${target.charAt(0).toUpperCase() + target.slice(1)}") input[type="checkbox"]`);
      if (await checkbox.isVisible()) {
        await checkbox.check();
      }
    }
    
    // Click "Add"
    await page.click('button:has-text("Add"):not(:has-text("Add New"))');
    
    // Wait for modal to close
    await page.waitForSelector('[role="dialog"]', { state: 'hidden', timeout: 5000 });
    
    // Small delay between additions
    await page.waitForTimeout(500);
  }
  
  console.log('All environment variables added!');
});