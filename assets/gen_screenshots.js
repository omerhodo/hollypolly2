/**
 * HollyPolly - App Store Screenshot Generator (TR + EN)
 * Output: 1284 x 2778 px (iPhone 14 Plus / 6.5" App Store)
 * Folders: assets/screenshots/tr/  and  assets/screenshots/en/
 *
 * Usage:
 *   yarn gen:screenshots          -> both languages
 *   yarn gen:screenshots:tr       -> Turkish only
 *   yarn gen:screenshots:en       -> English only
 *   node assets/gen_screenshots.js --lang=tr|en
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
    ],
    createBtn:      'Oda Oluştur',
    namePlaceholder: 'Adınızı girin',
    titlePlaceholder: 'Kura-Takım',
    titleValue:     'Kim bulaşık yıkıyor?',
    optPlaceholder: 'Yeni seçenek ekle...',
    options: ['Ayşe', 'Mehmet', 'Ali', 'Fatma', 'Zeynep'],
    joinBtn:        'Kura Oluştur',
    winnerBtn:      'Kazanan Seç',
    restartBtn:     'Tekrar Başlat',
    teamsBtn:       'Rastgele Takım Oluştur',
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
    ],
    createBtn:      'Oda Oluştur',  // app button is TR for now
    namePlaceholder: 'Adınızı girin',
    titlePlaceholder: 'Kura-Takım',
    titleValue:     'Who does the dishes?',
    optPlaceholder: 'Yeni seçenek ekle...',
    options: ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve'],
    joinBtn:        'Kura Oluştur',
    winnerBtn:      'Kazanan Seç',
    restartBtn:     'Tekrar Başlat',
    teamsBtn:       'Rastgele Takım Oluştur',
    closeBtn:       'Kapat',
    infoTitle:      'Bilgi',
  },
};

// CLI flags:
//   --lang=tr|en           (default = both)
//   --device=iphone|ipad   (default = iphone)
const args = process.argv.slice(2);
const langArg   = (args.find((a) => a.startsWith('--lang='))   || '').replace('--lang=', '');
const deviceArg = (args.find((a) => a.startsWith('--device=')) || '').replace('--device=', '');
const langs = langArg ? [langArg] : ['tr', 'en'];
const device = deviceArg || 'iphone'; // 'iphone' | 'ipad'

// ------------------------------------------------------------------

async function shot(page, dir, name) {
  const file = path.join(BASE_DIR, dir, name + '.png');
  await page.screenshot({ path: file, fullPage: false });
  const kb = (fs.statSync(file).size / 1024).toFixed(0);
  console.log('  OK  ' + name + '.png  (' + kb + ' KB)');
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function clickText(page, ...texts) {
  for (const text of texts) {
    const btn = await page.$(`button:has-text("${text}")`);
    if (btn) { await btn.click(); return true; }
  }
  console.warn('  WARN: Button not found: ' + texts.join(' / '));
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
  await wait(2500);

  // SCREEN 3: Winner
  console.log('  -> Screen 3: Winner');
  await shot(page, subDir, cfg.screens[2]);
  await clickText(page, cfg.restartBtn);
  await wait(800);

  // Create teams
  console.log('  -> Creating teams...');
  await clickText(page, cfg.teamsBtn);
  await wait(2000);

  // SCREEN 4: Teams
  console.log('  -> Screen 4: Teams');
  await shot(page, subDir, cfg.screens[3]);
  await clickText(page, cfg.closeBtn);
  await wait(800);

  // Info modal
  const infoBtn = await page.$(`button[title="${cfg.infoTitle}"]`);
  if (infoBtn) { await infoBtn.click(); await wait(1000); }
  else console.warn('  WARN: Info button not found');

  // SCREEN 5: Info
  console.log('  -> Screen 5: Info');
  await shot(page, subDir, cfg.screens[4]);

  await context.close();
}

(async () => {
  const browser = await chromium.launch({ headless: true });

  const px = device === 'ipad' ? '2064x2752' : '1284x2778';

  for (const lang of langs) {
    const cfg = LANG_CONFIG[lang];
    if (!cfg) { console.error('Unknown lang: ' + lang); continue; }
    const outPath = device === 'ipad' ? `assets/screenshots/ipad/${cfg.dir}/` : `assets/screenshots/${cfg.dir}/`;
    console.log('\n' + '='.repeat(55));
    console.log('Language: ' + lang.toUpperCase() + ' [' + device.toUpperCase() + ']  ->  ' + outPath);
    console.log('='.repeat(55));
    await runLang(browser, cfg, device);
  }

  await browser.close();

  console.log('\n' + '-'.repeat(55));
  console.log('Done! Output:');
  for (const lang of langs) {
    const cfg = LANG_CONFIG[lang];
    if (!cfg) continue;
    const outPath = device === 'ipad' ? `assets/screenshots/ipad/${cfg.dir}/` : `assets/screenshots/${cfg.dir}/`;
    console.log('  ' + outPath + '  (5 files, ' + px + ' px)');
  }
  console.log('-'.repeat(55));
})();
