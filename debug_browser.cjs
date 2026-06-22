const puppeteer = require('puppeteer');

(async () => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
    page.on('pageerror', err => console.log('BROWSER ERROR:', err.toString()));
    
    console.log('Navigating...');
    await page.goto('http://localhost:5174/');
    await page.evaluate(() => {
      localStorage.setItem('workden_user', JSON.stringify({ id: 'admin', role: 'admin', email: 'admin' }));
      localStorage.setItem('workden_user_source', 'appuser');
    });
    
    await page.goto('http://localhost:5174/AdminPanel', { waitUntil: 'domcontentloaded' });
    
    for (let i = 0; i < 8; i++) {
       await new Promise(r => setTimeout(r, 1000));
       await page.screenshot({ path: `screen_${i}.png` });
       const html = await page.evaluate(() => document.getElementById('root')?.innerHTML);
       console.log(`Second ${i+1}: root length is`, html ? html.length : 'NULL');
    }
    
    await browser.close();
  } catch (e) {
    console.error('PUPPETEER ERROR:', e);
    process.exit(1);
  }
})();
