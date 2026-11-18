// Maakt de achtergrond van het laadscherm: je poppetje voor Vijverhofstraat 47 (ROX) en Dikke Mic (1920 x 1080,
// zonder knoppen en teksten), opgeslagen als public/laadbeeld.jpg en een kleine versie public/laadbeeld-klein.jpg.
// Gebruik: npm run build && npx vite preview --port 4173 &   en dan   node tools/laadbeeld.cjs
// Maakt ook een staand beeld voor de telefoon: public/laadbeeld-staand.jpg en -klein.jpg (STAAND=0 slaat dat over).
// Heeft Python met Pillow nodig om het beeld als JPEG in twee maten op te slaan.
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const root = path.join(__dirname, '..');
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  page.setDefaultTimeout(1800000);
  page.on('console', (m) => { if (m.type() === 'error') console.log('console:', m.text().slice(0, 200)); });
  await page.goto((process.env.URL || 'http://localhost:4173/') + '?kwaliteit=hoog&dev');
  await page.waitForSelector('#start-btn:not([hidden])');
  await page.evaluate(() => { const g = window.game; g.renderer.setAnimationLoop = () => {}; g.adaptQuality = () => {}; g.dawn = async () => {}; g.updateDayNight = () => {}; g.checkBlack = () => {}; });
  await page.click('#start-btn');
  for (let i = 0; i < 8; i++) { await page.waitForTimeout(300); if (!(await page.evaluate(() => game.ui.dialogOpen)) && i > 1) break; await page.evaluate(() => document.getElementById('dialog').click()); }
  const url = await page.evaluate(() => {
    const g = window.game, p = g.player;
    // Vijverhofstraat 47 schuin van de overkant: de glazen gevel met ROX op de derde verdieping, de entree met de 47,
    // rechts het lage pand met Dikke Mic en het terras, en je poppetje vooraan op de stoep
    const f = g.facades.frames.rox, V = g.camera.position.constructor, w = g.world;
    const C = [f.x + f.nx * 13 - f.ux * 10, f.z + f.nz * 13 - f.uz * 10];
    [p.x, p.z] = w.resolve(f.x + f.nx * 6.5 - f.ux * 6.5, f.z + f.nz * 6.5 - f.uz * 6.5, 0.4);
    // met de rug naar de camera, zodat het ROX-shirt in beeld is
    p.heading = Math.atan2(p.x - C[0], p.z - C[1]) - 0.35; p.speed = 0; p.group.visible = true;
    const cy = w.groundAt(C[0], C[1]) + 1.6;
    g.pov = { pos: new V(C[0], cy, C[1]), look: new V(f.x - f.ux * 3, w.groundAt(f.x, f.z) + 7.0, f.z - f.uz * 3), snap: true, steady: true };
    if (g.timeOfDay !== 15) { g.timeOfDay = 15; g.applyTime(); }
    g.clock.getDelta();
    for (let i = 0; i < 3; i++) { g.tickInner(); g.updateCamera(0, true); }
    g.render();
    return { url: g.canvas.toDataURL('image/png'), w: g.canvas.width, h: g.canvas.height };
  });
  const png = path.join(root, 'laadbeeld-tmp.png');
  fs.writeFileSync(png, Buffer.from(url.url.split(',')[1], 'base64'));
  // als JPEG opslaan, groot en klein
  execFileSync('python3', ['-c', `from PIL import Image
im = Image.open(r'${png}').convert('RGB')
im.save(r'${path.join(root, 'public/laadbeeld.jpg')}', quality=80, optimize=True, progressive=True)
im.resize((960, 540), Image.LANCZOS).save(r'${path.join(root, 'public/laadbeeld-klein.jpg')}', quality=78, optimize=True, progressive=True)`]);
  fs.unlinkSync(png);
  console.log('gemaakt', url.w, url.h);

  // staand beeld voor de telefoon: toren en poppetje samen in de bovenste helft (de tekst staat onderin).
  // De camera staat laag, zeven meter voor je poppetje; de toren staat iets rechts van je poppetje.
  if (process.env.STAAND !== '0') {
    await page.setViewportSize({ width: 1080, height: 1920 });
    await page.waitForTimeout(2500);
    const st = await page.evaluate(() => {
      const g = window.game, p = g.player, V = g.camera.position.constructor, w = g.world;
      // staand: vanuit de Teilingerstraat, laag, zodat het hele glazen pand en je poppetje (met de rug
      // naar de camera, het ROX-shirt in beeld) in de bovenste helft staan
      const f = g.facades.frames.rox, deg = Math.PI / 180;
      // de camera in de Teilingerstraat, langs de lange glazen zijgevel, kijkend naar de hoek met de Vijverhofstraat
      const K = [f.x + f.ux * 7, f.z + f.uz * 7]; // de hoek van het pand
      const sideU = [Math.cos(Math.atan2(-34.3, 29.1)), Math.sin(Math.atan2(-34.3, 29.1))]; // langs de zijgevel, van de hoek af
      const out = [sideU[1], -sideU[0]]; // van de zijgevel af, de straat in
      let C = [K[0] + sideU[0] * 25 + out[0] * 8, K[1] + sideU[1] * 25 + out[1] * 8];
      C = w.resolve(C[0], C[1], 0.5);
      const dirK = Math.atan2(K[0] - C[0], K[1] - C[1]);
      [p.x, p.z] = w.resolve(C[0] + Math.sin(dirK + 6 * deg) * 8, C[1] + Math.cos(dirK + 6 * deg) * 8, 0.4);
      p.heading = Math.atan2(p.x - C[0], p.z - C[1]) + 0.25; p.speed = 0; p.group.visible = true;
      const cy = w.groundAt(C[0], C[1]) + 0.6;
      g.camera.fov = 60; g.camera.aspect = innerWidth / innerHeight; g.camera.updateProjectionMatrix();
      const lx = C[0] + Math.sin(dirK + 4 * deg) * 100, lz = C[1] + Math.cos(dirK + 4 * deg) * 100;
      g.pov = { pos: new V(C[0], cy, C[1]), look: new V(lx, cy + Math.tan(6 * deg) * 100, lz), snap: true, steady: true };
      g.clock.getDelta();
      for (let i = 0; i < 3; i++) { g.tickInner(); g.updateCamera(0, true); }
      g.render();
      return { url: g.canvas.toDataURL('image/png'), w: g.canvas.width, h: g.canvas.height };
    });
    const png2 = path.join(root, 'laadbeeld-staand-tmp.png');
    fs.writeFileSync(png2, Buffer.from(st.url.split(',')[1], 'base64'));
    execFileSync('python3', ['-c', `from PIL import Image
im = Image.open(r'${png2}').convert('RGB').resize((1080, 1920), Image.LANCZOS)
im.save(r'${path.join(root, 'public/laadbeeld-staand.jpg')}', quality=80, optimize=True, progressive=True)
im.resize((540, 960), Image.LANCZOS).save(r'${path.join(root, 'public/laadbeeld-staand-klein.jpg')}', quality=78, optimize=True, progressive=True)`]);
    fs.unlinkSync(png2);
    console.log('staand gemaakt', st.w, st.h);
  }
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
