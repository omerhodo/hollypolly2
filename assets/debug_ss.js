const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ headless: true });
  const ctx = await b.newContext({
    viewport: { width: 428, height: 926 },
    deviceScaleFactor: 3,
    locale: 'tr-TR',
  });
  const page = await ctx.newPage();
  await page.goto('https://hollypolly.vercel.app', { waitUntil: 'networkidle', timeout: 30000 });
  await new Promise((r) => setTimeout(r, 2000));
  await page.screenshot({ path: 'assets/debug1-home.png' });
  console.log('HOME URL:', page.url());

  // Click create room button
  const createBtn = await page.$('button:has-text("Oda Olu")');
  if (createBtn) { await createBtn.click(); console.log('Clicked create'); }
  await page.waitForURL(/\/room\//, { timeout: 15000 });
  await new Promise((r) => setTimeout(r, 3000));
  await page.screenshot({ path: 'assets/debug2-room.png' });
  console.log('ROOM URL:', page.url());

  const inputs = await page.evaluate(() =>
    Array.from(document.querySelectorAll('input')).map(
      (e) => `placeholder="${e.placeholder}" | type=${e.type}`
    )
  );
  console.log('Inputs:', JSON.stringify(inputs, null, 2));
  const btns = await page.evaluate(() =>
    Array.from(document.querySelectorAll('button'))
      .map((b) => b.textContent.trim())
      .filter(Boolean)
      .slice(0, 20)
  );
  console.log('Buttons:', JSON.stringify(btns, null, 2));
  await b.close();
})();
