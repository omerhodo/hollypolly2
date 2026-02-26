/**
 * HollyPolly - App Store Screenshot Generator (TR + EN, iPhone + iPad)
 * Output:
 *   iPhone: 1284 x 2778 px (iPhone 14 Plus / 6.5" App Store)
 *   iPad:   2064 x 2752 px (iPad 13" M4 Pro)
 * Folders: assets/screenshots/{tr,en}/  and  assets/screenshots/ipad/{tr,en}/
 *
 * Usage:
 *   yarn gen:screenshots                              -> all (TR+EN, iPhone+iPad)
 *   yarn gen:screenshots:tr                           -> Turkish only (iPhone+iPad)
 *   yarn gen:screenshots:en                           -> English only (iPhone+iPad)
 *   node assets/gen_screenshots.js --device=iphone    -> iPhone only
 *   node assets/gen_screenshots.js --device=ipad      -> iPad only
 *   node assets/gen_screenshots.js --lang=tr --device=iphone
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const APP_URL = 'https://hollypolly.vercel.app';
const BASE_DIR = path.join(__dirname, 'screenshots');

// iPhone 14 Plus: 428x926 logical x3 = 1284x2778 px
const IPHONE_VIEWPORT = { width: 428, height: 926 };
const IPHONE_SCALE = 3;

// iPad 13" (M4 Pro): 1032x1376 logical x2 = 2064x2752 px
const IPAD_VIEWPORT = { width: 1032, height: 1376 };
const IPAD_SCALE = 2;

// ------------------------------------------------------------------
// Language configs
// NOTE: app currently hardcodes locale='tr' in i18n/request.ts so
// both TR and EN runs produce Turkish UI. Update i18n/request.ts to
// auto-detect locale and redeploy to get real English screenshots.
// ------------------------------------------------------------------
const LANG_CONFIG = {
  tr: {
    locale: 'tr-TR',
    dir: 'tr',
    screens: [
      '01-ana-ekran',
      '02-oda-ve-secenekler',
      '03-kazanan-ekrani',
      '04-takimlar-ekrani',
      '05-bilgi-ekrani',
      '06-cark-cevirme',
    ],
    createBtn:      'Oda Oluştur',
    namePlaceholder: 'Adınızı girin',
    titlePlaceholder: 'Kura-Takım',
    titleValue:     'Kim bulaşık yıkıyor?',
    optPlaceholder: 'Yeni seçenek ekle...',
    options: ['Şevket', 'Selin', 'Cengiz', 'Murat', 'Sevinç', 'Erdal'],
    joinBtn:        'Kura Oluştur',
    winnerBtn:      'Kazanan Seç',
    winnerTitle:    'Kazanan!',
    restartBtn:     'Tekrar Başlat',
    teamsBtn:       'Rastgele Takım Oluştur',
    spinWheelBtn:   'Çarkı Çevir',
    closeBtn:       'Kapat',
    infoTitle:      'Bilgi',
  },
  en: {
    locale: 'en-US',
    dir: 'en',
    screens: [
      '01-home-screen',
      '02-room-and-options',
      '03-winner-screen',
      '04-teams-screen',
      '05-info-screen',
      '06-spin-wheel',
    ],
    createBtn:      'Create Room',
    namePlaceholder: 'Enter your name',
    titlePlaceholder: 'Draw-Team',
    titleValue:     'Who does the dishes?',
    optPlaceholder: 'Add new option...',
    options: ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank'],
    joinBtn:        'Create Draw',
    winnerBtn:      'Select Winner',
    winnerTitle:    'Winner!',
    restartBtn:     'Restart',
    teamsBtn:       'Create Random Teams',
    spinWheelBtn:   'Spin the Wheel',
    closeBtn:       'Close',
    infoTitle:      'What is HollyPolly?',
  },
};

// CLI flags:
//   --lang=tr|en               (default = both)
//   --device=iphone|ipad|all   (default = all → both iPhone + iPad)
const args = process.argv.slice(2);
const langArg   = (args.find((a) => a.startsWith('--lang='))   || '').replace('--lang=', '');
const deviceArg = (args.find((a) => a.startsWith('--device=')) || '').replace('--device=', '');
const langs = langArg ? [langArg] : ['tr', 'en'];
const devices = deviceArg && deviceArg !== 'all' ? [deviceArg] : ['iphone', 'ipad'];

// ------------------------------------------------------------------

async function shot(page, dir, name) {
  const file = path.join(BASE_DIR, dir, name + '.png');
  await page.screenshot({ path: file, fullPage: false });
  const kb = (fs.statSync(file).size / 1024).toFixed(0);
  console.log('  OK  ' + name + '.png  (' + kb + ' KB)');
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function clickText(page, ...texts) {
  // Retry a few times with short waits for dynamic/animated buttons
  for (let attempt = 0; attempt < 5; attempt++) {
    for (const text of texts) {
      const btn = await page.$(`button:has-text("${text}")`);
      if (btn) { await btn.click({ force: true }); return true; }
    }
    await wait(1000);
  }
  console.warn('  WARN: Button not found: ' + texts.join(' / '));
  return false;
}

async function closeModal(page) {
  await wait(500);
  // Try clicking the X (close) SVG button inside the modal
  const xBtns = await page.$$('.fixed button:has(svg)');
  for (const btn of xBtns) {
    const box = await btn.boundingBox();
    if (box) { await btn.click({ force: true }); return true; }
  }
  // Fallback: press Escape
  await page.keyboard.press('Escape');
  await wait(300);
  // Last resort: click backdrop
  const backdrop = await page.$('.absolute.inset-0.bg-black');
  if (backdrop) { await backdrop.click({ force: true, position: { x: 5, y: 5 } }); return true; }
  console.warn('  WARN: Could not close modal');
  return false;
}

async function runLang(browser, cfg, deviceType = 'iphone') {
  const isIpad = deviceType === 'ipad';
  const subDir = isIpad ? path.join('ipad', cfg.dir) : cfg.dir;
  const outDir = path.join(BASE_DIR, subDir);
  fs.mkdirSync(outDir, { recursive: true });

  const viewport = isIpad ? IPAD_VIEWPORT : IPHONE_VIEWPORT;
  const scale    = isIpad ? IPAD_SCALE    : IPHONE_SCALE;

  const context = await browser.newContext({
    viewport,
    deviceScaleFactor: scale,
    locale: cfg.locale,
    colorScheme: 'light',
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) ' +
      'AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    extraHTTPHeaders: {
      'Accept-Language': cfg.locale === 'tr-TR' ? 'tr-TR,tr;q=0.9' : 'en-US,en;q=0.9',
    },
  });
  const page = await context.newPage();

  // SCREEN 1: Home
  console.log('  -> Screen 1: Home');
  await page.goto(APP_URL, { waitUntil: 'networkidle', timeout: 30000 });
  await wait(1500);
  await shot(page, subDir, cfg.screens[0]);

  // Navigate into room
  await clickText(page, cfg.createBtn);
  await page.waitForURL(/\/room\//, { timeout: 15000 });
  await page.waitForSelector(`input[placeholder="${cfg.namePlaceholder}"]`, { timeout: 15000 });
  await wait(800);

  // Fill entrance form
  await page.fill(`input[placeholder="${cfg.namePlaceholder}"]`, cfg.options[0]);
  const titleInput = page.locator(`input[placeholder*="${cfg.titlePlaceholder}"]`);
  if ((await titleInput.count()) > 0) await titleInput.fill(cfg.titleValue);
  await clickText(page, cfg.joinBtn);
  await page.waitForSelector(`input[placeholder="${cfg.optPlaceholder}"]`, { timeout: 20000 });
  await wait(1500);

  // Add options
  for (const opt of cfg.options) {
    await page.fill(`input[placeholder="${cfg.optPlaceholder}"]`, opt);
    await page.keyboard.press('Enter');
    await wait(500);
  }
  await wait(800);

  // SCREEN 2: Room + Options
  console.log('  -> Screen 2: Room & options');
  await shot(page, subDir, cfg.screens[1]);

  // Pick winner
  console.log('  -> Picking winner...');
  await clickText(page, cfg.winnerBtn);
  // Wait for the result modal to appear (it depends on Firebase roundtrip)
  try {
    await page.waitForSelector(`h2:has-text("${cfg.winnerTitle}")`, { timeout: 15000 });
    await wait(1500); // Let confetti + animation settle
  } catch {
    console.warn('  WARN: Result modal did not appear, taking screenshot anyway');
    await wait(3000);
  }

  // SCREEN 3: Winner
  console.log('  -> Screen 3: Winner');
  await shot(page, subDir, cfg.screens[2]);
  // Close winner modal: try restart button first, then generic close
  const closed = await clickText(page, cfg.restartBtn);
  if (!closed) await closeModal(page);
  await wait(800);

  // Create teams
  console.log('  -> Creating teams...');
  await clickText(page, cfg.teamsBtn);
  await wait(2000);

  // SCREEN 4: Teams
  console.log('  -> Screen 4: Teams');
  await shot(page, subDir, cfg.screens[3]);
  await closeModal(page);
  await wait(800);

  // Info modal
  const infoBtn = await page.$(`button[title="${cfg.infoTitle}"]`);
  if (infoBtn) { await infoBtn.click(); await wait(1000); }
  else console.warn('  WARN: Info button not found');

  // SCREEN 5: Info
  console.log('  -> Screen 5: Info');
  await shot(page, subDir, cfg.screens[4]);
  await closeModal(page);
  await wait(800);

  // Open spin wheel
  console.log('  -> Opening spin wheel...');
  await clickText(page, cfg.spinWheelBtn);
  await wait(2000);

  // SCREEN 6: Spin Wheel
  console.log('  -> Screen 6: Spin Wheel');
  await shot(page, subDir, cfg.screens[5]);

  await context.close();
}

(async () => {
  const browser = await chromium.launch({ headless: true });

  for (const deviceType of devices) {
    const px = deviceType === 'ipad' ? '2064x2752' : '1284x2778';

    for (const lang of langs) {
      const cfg = LANG_CONFIG[lang];
      if (!cfg) { console.error('Unknown lang: ' + lang); continue; }
      const outPath = deviceType === 'ipad' ? `assets/screenshots/ipad/${cfg.dir}/` : `assets/screenshots/${cfg.dir}/`;
      console.log('\n' + '='.repeat(55));
      console.log('Language: ' + lang.toUpperCase() + ' [' + deviceType.toUpperCase() + ']  ->  ' + outPath);
      console.log('='.repeat(55));
      await runLang(browser, cfg, deviceType);
    }
  }

  await browser.close();

  console.log('\n' + '-'.repeat(55));
  console.log('Done! Output:');
  for (const deviceType of devices) {
    const px = deviceType === 'ipad' ? '2064x2752' : '1284x2778';
    for (const lang of langs) {
      const cfg = LANG_CONFIG[lang];
      if (!cfg) continue;
      const outPath = deviceType === 'ipad' ? `assets/screenshots/ipad/${cfg.dir}/` : `assets/screenshots/${cfg.dir}/`;
      console.log('  ' + outPath + '  (6 files, ' + px + ' px)');
    }
  }
  console.log('-'.repeat(55));
})();
