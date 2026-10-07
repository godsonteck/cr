export function getPaystackSecretKey(): string | undefined {
  const secretKey = process.env.PAYSTACK_SECRET_KEY?.replace(/^\uFEFF/, '').trim();
  if (!secretKey) return undefined;

  const deploymentEnvironment = process.env.VERCEL_ENV || process.env.NODE_ENV;
  if (deploymentEnvironment === 'production' && secretKey.startsWith('sk_test_')) return undefined;
  if (deploymentEnvironment !== 'production' && secretKey.startsWith('sk_live_')) return undefined;
  return secretKey;
}