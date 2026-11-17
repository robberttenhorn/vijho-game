// Maakt de achtergrond van het laadscherm: je poppetje voor ROX en Dikke Mic aan de Vijverhofstraat (1920 x 1080,
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
    // voor het hoekpand Vijverhofstraat 47: ROX op de derde verdieping, Dikke Mic beneden, je poppetje vooraan
    const f = g.facades.frames.rox, V = g.camera.position.constructor, w = g.world;
    [p.x, p.z] = w.resolve(f.x + f.nx * 4.5 - f.ux * 1.2, f.z + f.nz * 4.5 - f.uz * 1.2, 0.4);
    const C = [f.x + f.nx * 13 + f.ux * 3, f.z + f.nz * 13 + f.uz * 3];
    p.heading = Math.atan2(C[0] - p.x, C[1] - p.z) + 0.4; p.speed = 0; p.group.visible = true;
    const cy = w.groundAt(C[0], C[1]) + 1.5;
    g.pov = { pos: new V(C[0], cy, C[1]), look: new V(f.x - f.ux * 1, w.groundAt(f.x, f.z) + 5.2, f.z - f.uz * 1), snap: true, steady: true };
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
      // staand: camera laag en dichtbij, het ROX-bord en je poppetje samen in de bovenste helft
      const f = g.facades.frames.rox;
      [p.x, p.z] = w.resolve(f.x + f.nx * 4 + f.ux * 0.8, f.z + f.nz * 4 + f.uz * 0.8, 0.4);
      const C = [f.x + f.nx * 11 - f.ux * 1.5, f.z + f.nz * 11 - f.uz * 1.5];
      p.heading = Math.atan2(C[0] - p.x, C[1] - p.z) + 0.45; p.speed = 0; p.group.visible = true;
      const cy = w.groundAt(C[0], C[1]) + 0.4;
      g.camera.fov = 60; g.camera.aspect = innerWidth / innerHeight; g.camera.updateProjectionMatrix();
      g.pov = { pos: new V(C[0], cy, C[1]), look: new V(f.x, w.groundAt(f.x, f.z) + 7.5, f.z), snap: true, steady: true };
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
