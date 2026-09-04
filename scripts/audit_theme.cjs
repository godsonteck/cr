const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = path.join(
  process.env.LOCALAPPDATA,
  'ms-playwright',
  'chromium-1234',
  'chrome-win64',
  'chrome.exe'
);

const OUTPUT_DIR = path.join(__dirname, '..', 'audit-screens');
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function runAudit() {
  const browser = await chromium.launch({
    executablePath: CHROME_PATH,
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
  });

  const page = await context.newPage();

  const routes = [
    { name: 'home', url: 'http://localhost:3001/' },
    { name: 'shop', url: 'http://localhost:3001/shop' },
    { name: 'product', url: 'http://localhost:3001/product/prod-1' },
    { name: 'beauty', url: 'http://localhost:3001/beauty' },
    { name: 'signin', url: 'http://localhost:3001/signin' },
    { name: 'cart', url: 'http://localhost:3001/cart' },
    { name: 'checkout', url: 'http://localhost:3001/checkout' },
    { name: 'admin-login', url: 'http://localhost:3001/admin' },
    { name: 'admin-dash', url: 'http://localhost:3001/admin', admin: true },
  ];

  for (const route of routes) {
    console.log(`Auditing ${route.name}...`);
    // Light mode
    await page.goto(route.url, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    await page.evaluate((isAdmin) => {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      localStorage.setItem('cr_theme_mode', 'light');
      if (isAdmin) {
        localStorage.setItem('admin_session', JSON.stringify({
          isLoggedIn: true,
          adminName: 'Store Administrator',
          adminRole: 'Super Admin',
          email: 'admin@crcosmetics.com'
        }));
      } else {
        localStorage.removeItem('admin_session');
      }
    }, route.admin);
    if (route.admin) {
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1200);
    }
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(OUTPUT_DIR, `${route.name}-light.png`), fullPage: false });

    // Dark mode
    await page.evaluate(() => {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
      localStorage.setItem('cr_theme_mode', 'dark');
    });
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(OUTPUT_DIR, `${route.name}-dark.png`), fullPage: false });
  }

  await browser.close();
  console.log('Audit screenshots saved to', OUTPUT_DIR);
}

runAudit().catch(err => {
  console.error(err);
  process.exit(1);
});
