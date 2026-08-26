import { execSync } from 'child_process';

const envVars = [
  {
    key: 'DATABASE_URL',
    value: 'postgresql://neondb_owner:npg_NTQDd27Agkuw@ep-cool-term-ay9u3ysn-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
    sensitive: true
  },
  {
    key: 'NEXT_PUBLIC_SITE_URL',
    value: 'https://cr-cosmetics.vercel.app',
    sensitive: false
  },
  {
    key: 'NEXT_PUBLIC_WHATSAPP_NUMBER',
    value: '233592153306',
    sensitive: false
  },
  {
    key: 'NEXT_PUBLIC_CURRENCY',
    value: 'GHS',
    sensitive: false
  },
  {
    key: 'NEXT_PUBLIC_STORE_LOCATION',
    value: 'Botwe, near Galaxy International School, Accra, Ghana',
    sensitive: false
  }
];

const targets = ['production', 'preview', 'development'];

for (const env of envVars) {
  for (const target of targets) {
    try {
      console.log(`Setting ${env.key} for ${target}...`);
      const flags = env.sensitive
        ? `--value "${env.value}" --force --yes`
        : `--value "${env.value}" --no-sensitive --visibility config --force --yes`;
      
      const cmd = `vercel env add ${env.key} ${target} ${flags}`;
      execSync(cmd, { stdio: 'inherit' });
    } catch (err) {
      console.error(`Error setting ${env.key} for ${target}:`, err.message);
    }
  }
}

console.log('\nListing current Vercel environment variables:');
execSync('vercel env ls', { stdio: 'inherit' });
