const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const CHROME = path.join(
  process.env.LOCALAPPDATA,
  'ms-playwright', 'chromium-1234', 'chrome-win64', 'chrome.exe'
);

const OUT = path.join(__dirname, '..', 'screenshots');
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

// Use puppeteer-core or just CDP via node http
// Actually let's just use the playwright-core package which is already installed
const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.launch({
    executablePath: CHROME,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const pages = [
    { url: 'http://localhost:3001/', name: 'home' },
    { url: 'http://localhost:3001/shop', name: 'shop' },
    { url: 'http://localhost:3001/beauty', name: 'beauty' },
    { url: 'http://localhost:3001/cart', name: 'cart' },
  ];

  for (const { url, name } of pages) {
    // LIGHT MODE
    const lightPage = await browser.newPage();
    await lightPage.setViewportSize({ width: 1280, height: 900 });
    await lightPage.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
    await lightPage.waitForTimeout(1000);
    await lightPage.screenshot({ path: path.join(OUT, `${name}-light.png`), fullPage: true });
    console.log(`✓ ${name}-light`);
    await lightPage.close();

    // DARK MODE
    const darkPage = await browser.newPage();
    await darkPage.setViewportSize({ width: 1280, height: 900 });
    // Set dark mode via localStorage before navigating
    await darkPage.addInitScript(() => {
      localStorage.setItem('cr_theme_mode', 'dark');
    });
    await darkPage.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
    await darkPage.waitForTimeout(1000);
    await darkPage.screenshot({ path: path.join(OUT, `${name}-dark.png`), fullPage: true });
    console.log(`✓ ${name}-dark`);
    await darkPage.close();
  }

  await browser.close();
  console.log('\nAll screenshots saved to /screenshots/');
})().catch(err => {
  console.error('Screenshot error:', err.message);
  process.exit(1);
});
