const puppeteer = require('puppeteer');
const path = require('path');
const sleep = ms => new Promise(r => setTimeout(r, ms));

const TARGET_URL = 'https://cmr-phi.vercel.app';
const SHOTS_DIR = path.resolve(__dirname, 'manual/assets');
const PROFILE_DIR = path.resolve(__dirname, '.profile');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    userDataDir: PROFILE_DIR,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });

  await page.goto(TARGET_URL, { waitUntil: 'networkidle2' });
  await sleep(2000);

  // Ir a pestaña Conversaciones
  console.log('💬 Cambiando a pestaña Conversaciones...');
  await page.evaluate(() => {
    const buttons = [...document.querySelectorAll('button, a')];
    const b = buttons.find(el => el.textContent.trim() === 'Conversaciones');
    if (b) b.click();
  });
  await sleep(2500);

  // Capturar la pantalla de un chat específico abierto
  console.log('💬 Seleccionando el primer chat...');
  await page.evaluate(() => {
    // Buscar el contenedor de chats
    const chatCards = document.querySelectorAll('div[class*="cursor-pointer"]');
    for (const card of chatCards) {
      if (card.querySelector('h4')) {
        card.click();
        break;
      }
    }
  });
  await sleep(3000);

  await page.screenshot({ path: path.join(SHOTS_DIR, '06_conversacion_activa.png') });
  console.log('📸 06_conversacion_activa.png guardada con éxito.');

  await browser.close();
})();
