import { chromium } from 'playwright';

const urlsToCheck = [
  'https://cr-cosmetics.vercel.app',
  'https://cr-cosmetics-manuelgodson10-2150s-projects.vercel.app',
];

(async () => {
  const browser = await chromium.launch({ headless: true });

  for (const url of urlsToCheck) {
    console.log(`\n========================================`);
    console.log(`Checking: ${url}`);
    console.log(`========================================`);

    const page = await browser.newPage();
    await page.setViewportSize({ width: 1440, height: 900 });

    try {
      const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await page.waitForTimeout(3000);

      const status = response?.status();
      const title = await page.title();
      const bodyText = await page.evaluate(() => document.body.innerText).catch(() => '');

      console.log(`HTTP Status: ${status}`);
      console.log(`Page Title: ${title}`);
      console.log(`\nPage Content Preview (first 1500 chars):`);
      console.log(bodyText.substring(0, 1500));

      const screenshotPath = `scripts/vercel-${url.replace(/https?:\/\//, '').replace(/\//g, '-')}.png`;
      await page.screenshot({ path: screenshotPath, fullPage: false });
      console.log(`\nScreenshot saved: ${screenshotPath}`);

    } catch (err) {
      console.log(`Failed to reach ${url}: ${err.message}`);
    }

    await page.close();
  }

  await browser.close();
  console.log('\nDone checking all URLs.');
})();
