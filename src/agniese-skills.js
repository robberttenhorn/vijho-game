// Minispellen voor de Agniesebuurt: sambal eten bij Silvia, karaoke in Dikke Mic, bugs pletten bij ROX en
// jeu de boules bij Mooie Boules. Elk spel geeft een Promise met de uitslag, of null als de klus gestopt is.
import { popText, flash, shake, makeCombo, Particles, fitCanvas } from './minifx.js';

function runMini(g, update, cleanup) {
  return new Promise((resolve) => {
    let done = false;
    const finish = (r) => { if (done) return; done = true; g.minigame = null; cleanup?.(); resolve(r); };
    g.minigame = { stop: () => finish(null), update: (dt) => update(dt, finish) };
  });
}
function overlay(g, title, inner, hint) {
  const ov = document.createElement('div');
  ov.className = 'mini-overlay';
  ov.innerHTML = `<div class="mini-head"><b>${title}</b><span class="mini-score"></span><button class="mini-stop" type="button">Stoppen</button></div>${inner}<div class="mini-hint">${hint}</div>`;
  document.getElementById('hud').prepend(ov);
  document.body.classList.add('pov');
  ov.querySelector('.mini-stop').addEventListener('click', () => g.missions.stop());
  return { ov, close: () => { ov.remove(); document.body.classList.remove('pov'); }, score: (t) => { ov.querySelector('.mini-score').textContent = t; } };
}
const pressed = (g) => { const p = g.input.consumeAction() || g.input.spacePressed; g.input.spacePressed = false; return p; };
const rr = (x, px, py, w, h, r) => { x.beginPath(); x.roundRect(px, py, w, h, r); };

// ------------------------------------------------------------ Silvia: sambal-uitdaging
// Tik = een hap roti met sambal (de hitte stijgt, steeds pittiger). Water = de hitte zakt, maar je hebt maar drie glazen.
// Boven de 100 procent spuw je vuur en ben je af. Haal het aantal happen binnen de tijd.
export function startSambal(g, { need = 12, limit = 45 } = {}) {
  const ui = overlay(g, 'Sambal-uitdaging bij Silvia', '<canvas class="mini-canvas"></canvas><div class="sb-btns"><button class="sb-bite" type="button">Hap!</button><button class="sb-water" type="button">Water (3)</button></div>',
    g.input.isTouch ? 'Tik op Hap voor een hap roti met sambal. Te heet? Tik op Water, maar je hebt maar drie glazen.' : 'Spatie of E: een hap. W: een slok water (drie glazen). Niet boven de 100 procent!');
  const cv = ui.ov.querySelector('canvas'), ctx = cv.getContext('2d');
  fitCanvas(cv);
  ui.ov.style.background = '#3b1a0c';
  const style = document.createElement('style');
  style.textContent = '.sb-btns{position:absolute;left:0;right:0;bottom:64px;display:flex;gap:14px;justify-content:center;z-index:3}.sb-btns button{font:800 22px "Baloo 2",sans-serif;padding:10px 26px;border:0;border-radius:14px;color:#fff;box-shadow:0 4px 0 rgba(0,0,0,.35)}.sb-bite{background:#d84315}.sb-water{background:#1e88e5}.sb-water:disabled{opacity:.4}';
  ui.ov.appendChild(style);
  const parts = new Particles();
  const combo = makeCombo(ui.ov);
  let t = 0, heat = 0, bites = 0, water = 3, level = 1, chew = 0, end = null, sweat = 0, fire = 0;
  let wantBite = false, wantWater = false;
  ui.ov.querySelector('.sb-bite').addEventListener('pointerdown', (e) => { e.stopPropagation(); wantBite = true; });
  const wb = ui.ov.querySelector('.sb-water');
  wb.addEventListener('pointerdown', (e) => { e.stopPropagation(); wantWater = true; });
  const kd = (e) => { if (e.code === 'KeyW') wantWater = true; };
  addEventListener('keydown', kd);
  return runMini(g, (dt, finish) => {
    fitCanvas(cv);
    t += dt; chew = Math.max(0, chew - dt * 3); sweat += dt; fire = Math.max(0, fire - dt);
    const W = cv.width, H = cv.height, u = Math.min(W, H) / 100;
    if (end === null) {
      if (pressed(g) || wantBite) {
        wantBite = false;
        if (chew <= 0.05) {
          bites++; chew = 1;
          heat += 0.055 + level * 0.018 + Math.random() * 0.02;
          if (bites % 3 === 0) { level++; popText(ui.ov, `Sambal level ${level}!`, 50, 30, 'bad big'); }
          const c = combo.hit(); if (c >= 3) popText(ui.ov, `x${c}`, 50, 40, 'gold');
          g.sfx?.play('pop');
          parts.spawn(W * 0.5, H * 0.52, 10, { color: '#d84315', speed: 200, up: 120, size: 4 * devicePixelRatio, shape: 'circle', life: 0.5 });
        }
      }
      if (wantWater) {
        wantWater = false;
        if (water > 0) { water--; heat = Math.max(0, heat - 0.38); wb.textContent = `Water (${water})`; if (!water) wb.disabled = true; g.sfx?.play('splash'); popText(ui.ov, 'Ahhh...', 50, 35, 'good'); }
      }
      heat = Math.max(0, heat - dt * 0.035);
      if (heat >= 1) { end = { ok: false, bites, fire: true }; fire = 2; g.sfx?.play('fail'); flash(ui.ov, 'bad'); shake(ui.ov, true); popText(ui.ov, 'VUURSPUWEN!', 50, 40, 'bad big'); }
      else if (bites >= need) { end = { ok: true, bites, heat }; flash(ui.ov, 'gold'); g.sfx?.play('cheer'); popText(ui.ov, 'Opgegeten!', 50, 40, 'gold big'); }
      else if (t >= limit) { end = { ok: false, bites }; popText(ui.ov, 'Tijd op!', 50, 40, 'bad big'); }
      if (end) setTimeout(() => finish(end), 1600);
    }
    ui.score(`${bites} / ${need} happen · ${Math.max(0, limit - t).toFixed(0)} s`);
    // ---- tekenen
    ctx.fillStyle = '#4a2412'; ctx.fillRect(0, 0, W, H);
    // tafel en bord met roti
    ctx.fillStyle = '#6d3b1f'; ctx.fillRect(0, H * 0.7, W, H * 0.3);
    ctx.fillStyle = '#f5f5f0'; ctx.beginPath(); ctx.ellipse(W / 2, H * 0.78, 26 * u, 8 * u, 0, 0, 7); ctx.fill();
    const left = Math.max(0, 1 - bites / need);
    ctx.fillStyle = '#e8c27a'; ctx.beginPath(); ctx.ellipse(W / 2, H * 0.77, 20 * u * (0.3 + left * 0.7), 6 * u * (0.3 + left * 0.7), 0, 0, 7); ctx.fill();
    ctx.fillStyle = '#b71c1c'; ctx.beginPath(); ctx.ellipse(W / 2 + 12 * u, H * 0.765, 4 * u, 1.6 * u, 0, 0, 7); ctx.fill(); // sambal
    // gezicht: wordt roder, zweet, stoom uit de oren
    const fx = W / 2, fy = H * 0.4, fr = 15 * u;
    const red = Math.min(1, heat);
    ctx.fillStyle = `rgb(${240},${Math.round(200 - red * 150)},${Math.round(160 - red * 130)})`;
    ctx.beginPath(); ctx.arc(fx, fy, fr, 0, 7); ctx.fill();
    ctx.fillStyle = '#3b2a1a'; ctx.beginPath(); ctx.arc(fx, fy - fr * 0.55, fr * 0.95, Math.PI, 0); ctx.fill(); // haar
    ctx.fillStyle = '#111'; for (const s of [-1, 1]) { ctx.beginPath(); ctx.arc(fx + s * fr * 0.38, fy - fr * 0.12, fr * (red > 0.7 ? 0.05 : 0.09), 0, 7); ctx.fill(); }
    ctx.strokeStyle = '#5a1a0a'; ctx.lineWidth = 0.8 * u; ctx.beginPath();
    if (chew > 0) ctx.ellipse(fx, fy + fr * 0.42, fr * 0.3, fr * 0.12 * (1 + Math.sin(t * 30)), 0, 0, 7); else ctx.arc(fx, fy + fr * 0.35, fr * 0.3, 0.2, Math.PI - 0.2);
    ctx.stroke();
    if (red > 0.4) for (let i = 0; i < 4; i++) { const a = (sweat * 1.5 + i * 1.7) % 1; ctx.fillStyle = 'rgba(160,210,255,0.9)'; ctx.beginPath(); ctx.arc(fx + (i % 2 ? 1 : -1) * fr * 0.9, fy - fr * 0.3 + a * fr * 1.2, 0.9 * u, 0, 7); ctx.fill(); }
    if (red > 0.65) for (const s of [-1, 1]) { ctx.fillStyle = `rgba(255,255,255,${0.3 + 0.3 * Math.sin(t * 8)})`; ctx.beginPath(); ctx.arc(fx + s * fr * 1.2, fy - fr * 0.2 - ((t * 20) % (6 * u)), 2 * u, 0, 7); ctx.fill(); }
    if (fire > 0) { ctx.fillStyle = 'rgba(255,120,0,0.85)'; ctx.beginPath(); ctx.moveTo(fx - fr * 0.3, fy + fr * 0.4); ctx.lineTo(fx + 40 * u, fy + fr * 0.1 - 10 * u * Math.random()); ctx.lineTo(fx + 40 * u, fy + fr * 0.9 + 10 * u * Math.random()); ctx.fill(); }
    // hittemeter
    const bx = W * 0.82, by = H * 0.12, bw = 5 * u, bh = H * 0.5;
    rr(ctx, bx, by, bw, bh, bw / 2); ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.fill();
    const hh = bh * Math.min(1, heat);
    const gr = ctx.createLinearGradient(0, by + bh, 0, by); gr.addColorStop(0, '#fdd835'); gr.addColorStop(0.6, '#ff7043'); gr.addColorStop(1, '#b71c1c');
    ctx.fillStyle = gr; rr(ctx, bx, by + bh - hh, bw, hh, bw / 2); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = `800 ${3 * u}px "Baloo 2", sans-serif`; ctx.textAlign = 'center'; ctx.fillText(`${Math.round(heat * 100)}%`, bx + bw / 2, by - 1.5 * u);
    ctx.fillText(`Level ${level}`, W * 0.18, H * 0.15);
    parts.update(dt); parts.draw(ctx);
  }, () => { removeEventListener('keydown', kd); ui.close(); });
}

// ------------------------------------------------------------ Dikke Mic: karaoke
// Noten schuiven naar de lijn; tik als de noot op de lijn staat. De tekst loopt mee. Score in procenten.
const SONG = [
  'In de Vijverhofstraat, daar ben ik geboren',
  'Tussen zwerver en dealer, ik heb niks verloren',
  'Ik zing voor de juut, ik zing voor de kit',
  'Een pijppie erbij en ik zing tot de nacht is voorbij',
  'Roffa, oh Roffa, jij bent m\'n schat',
  'Niet lullen maar zingen, dan wordt de Teilinger nat!',
];
export function startKaraoke(g, { need = 0.7 } = {}) {
  const ui = overlay(g, 'Karaoke in Dikke Mic', '<canvas class="mini-canvas"></canvas>',
    g.input.isTouch ? 'Tik als een noot op de gele lijn staat. Hoe beter op de maat, hoe harder de zaal juicht.' : 'Spatie of E als een noot op de gele lijn staat. Hoe beter op de maat, hoe harder de zaal juicht.');
  const cv = ui.ov.querySelector('canvas'), ctx = cv.getContext('2d');
  fitCanvas(cv);
  ui.ov.style.background = '#14061f';
  const parts = new Particles();
  const combo = makeCombo(ui.ov);
  // per regel 4 noten, met een kleine variatie in de maat
  const beat = 0.62, notes = [];
  let tt = 2.2;
  SONG.forEach((line, li) => { for (let k = 0; k < 4; k++) { notes.push({ t: tt, li, hit: null }); tt += beat * (k === 1 ? 0.5 : 1) + (k === 3 ? beat * 0.5 : 0); } tt += beat * 0.6; });
  const total = notes.length, endT = tt + 1.2;
  let t = 0, score = 0, done = false, crowd = 0.3;
  return runMini(g, (dt, finish) => {
    fitCanvas(cv);
    t += dt;
    const W = cv.width, H = cv.height, u = Math.min(W, H) / 100;
    if (pressed(g)) {
      let best = null, bd = 9;
      for (const n of notes) { if (n.hit !== null) continue; const d = Math.abs(n.t - t); if (d < bd) { bd = d; best = n; } }
      if (best && bd < 0.2) {
        best.hit = bd < 0.09 ? 1 : 0.6; score += best.hit; crowd = Math.min(1, crowd + 0.08);
        const c = combo.hit(); popText(ui.ov, bd < 0.09 ? (c >= 4 ? `Perfect x${c}!` : 'Perfect!') : 'Goed', 30, 55, bd < 0.09 ? 'gold' : 'good'); g.sfx?.play('tally');
        parts.spawn(W * 0.25, H * 0.55, 12, { color: '#f48fb1', speed: 260, up: 160, size: 4 * devicePixelRatio, life: 0.6 });
      } else { combo.miss(); crowd = Math.max(0, crowd - 0.06); popText(ui.ov, 'Vals!', 30, 55, 'bad'); g.sfx?.play('fail'); }
    }
    for (const n of notes) if (n.hit === null && t - n.t > 0.22) { n.hit = 0; combo.miss(); crowd = Math.max(0, crowd - 0.05); }
    const pct = score / total;
    ui.score(`${Math.round((score / Math.max(1, notes.filter((n) => n.hit !== null).length)) * 100) || 0}% raak`);
    if (!done && t > endT) {
      done = true;
      const ok = pct >= need;
      if (ok) { g.sfx?.play('cheer'); flash(ui.ov, 'gold'); popText(ui.ov, 'Applaus!', 50, 40, 'gold big'); } else popText(ui.ov, 'Boe!', 50, 40, 'bad big');
      setTimeout(() => finish({ ok, pct }), 1500);
    }
    // ---- tekenen: neonzaal met scherm
    ctx.fillStyle = '#14061f'; ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 6; i++) { ctx.fillStyle = `hsla(${(i * 60 + t * 40) % 360},90%,60%,0.12)`; ctx.beginPath(); ctx.arc(W * (0.1 + i * 0.16), H * 0.12, 20 * u, 0, 7); ctx.fill(); }
    // notenbaan
    const ly = H * 0.42, lx = W * 0.25, speed = 30 * u;
    ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.fillRect(0, ly - 6 * u, W, 12 * u);
    ctx.fillStyle = '#fdd835'; ctx.fillRect(lx - 0.5 * u, ly - 8 * u, 1 * u, 16 * u);
    for (const n of notes) {
      const x = lx + (n.t - t) * speed;
      if (x < -10 * u || x > W + 10 * u) continue;
      ctx.fillStyle = n.hit === null ? '#f06292' : n.hit > 0.9 ? '#ffd54f' : n.hit > 0 ? '#81c784' : '#555';
      ctx.beginPath(); ctx.arc(x, ly, 3.4 * u, 0, 7); ctx.fill();
      ctx.fillRect(x + 2.6 * u, ly - 9 * u, 0.8 * u, 9 * u);
    }
    // tekst: de huidige regel, met de al gezongen woorden in roze
    const cur = notes.find((n) => n.t > t - 0.3) || notes[notes.length - 1];
    const line = SONG[cur.li];
    const lineNotes = notes.filter((n) => n.li === cur.li);
    const prog = lineNotes.filter((n) => n.t < t).length / 4;
    ctx.font = `800 ${Math.min(5.2 * u, W / line.length * 1.6)}px "Baloo 2", sans-serif`; ctx.textAlign = 'center';
    const tw = ctx.measureText(line).width, tx = W / 2 - tw / 2;
    ctx.fillStyle = '#fff'; ctx.textAlign = 'left'; ctx.fillText(line, tx, H * 0.66);
    ctx.save(); ctx.beginPath(); ctx.rect(tx, H * 0.6, tw * prog, H * 0.1); ctx.clip(); ctx.fillStyle = '#f06292'; ctx.fillText(line, tx, H * 0.66); ctx.restore();
    if (SONG[cur.li + 1]) { ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.font = `700 ${3.4 * u}px "Baloo 2", sans-serif`; ctx.textAlign = 'center'; ctx.fillText(SONG[cur.li + 1], W / 2, H * 0.74); }
    // publiek: hoofdjes die meeknikken, harder als het goed gaat
    for (let i = 0; i < 14; i++) {
      const x = W * (0.04 + i * 0.07), y = H * 0.9 - Math.abs(Math.sin(t * (3 + crowd * 5) + i)) * crowd * 3 * u;
      ctx.fillStyle = ['#ffcc80', '#8d6e63', '#f5d0b0', '#5d4037'][i % 4]; ctx.beginPath(); ctx.arc(x, y, 3.2 * u, 0, 7); ctx.fill();
      if (crowd > 0.6 && i % 3 === 0) { ctx.fillRect(x + 2 * u, y - 7 * u, 0.8 * u, 4 * u); }
    }
    parts.update(dt); parts.draw(ctx);
  }, () => ui.close());
}

// ------------------------------------------------------------ ROX: bugs pletten in de website van de klant
// Bugs kruipen over de site naar de knop "Bestel nu". Tik ze plat. Niet op de berichtjes van de klant tikken
// ("Kan het logo groter?"): dat kost tijd. Vier bugs bij de knop en de site ligt plat.
export function startBugs(g, { need = 15, limit = 45 } = {}) {
  const ui = overlay(g, 'Bugs pletten bij ROX', '<canvas class="mini-canvas"></canvas>',
    g.input.isTouch ? 'Tik op de bugs voordat ze bij de knop "Bestel nu" zijn. Niet op de berichtjes van de klant tikken!' : 'Klik op de bugs voordat ze bij de knop "Bestel nu" zijn. Niet op de berichtjes van de klant klikken!');
  const cv = ui.ov.querySelector('canvas'), ctx = cv.getContext('2d');
  fitCanvas(cv);
  ui.ov.style.background = '#0f141a';
  const parts = new Particles();
  const combo = makeCombo(ui.ov);
  const bugs = [], msgs = [];
  let t = 0, squashed = 0, leaks = 0, spawn = 0.6, mspawn = 4, end = null, penalty = 0;
  const CLIENT = ['Kan het logo groter?', 'Kan het iets meer poppen?', 'Mijn neefje vindt het lelijk', 'Kan dit vandaag nog live?', 'Waarom is de site paars?', 'Kan Comic Sans?'];
  const click = (e) => {
    if (end) return;
    const r = cv.getBoundingClientRect();
    const x = (e.clientX - r.left) * devicePixelRatio, y = (e.clientY - r.top) * devicePixelRatio;
    const u = Math.min(cv.width, cv.height) / 100;
    for (let i = msgs.length - 1; i >= 0; i--) { const m = msgs[i]; if (x > m.x && x < m.x + m.w && y > m.y && y < m.y + m.h) { msgs.splice(i, 1); penalty += 3; combo.miss(); popText(ui.ov, '"Kun je even bellen?" (-3 s)', 50, 30, 'bad'); g.sfx?.play('fail'); return; } }
    for (let i = bugs.length - 1; i >= 0; i--) { const b = bugs[i]; if (Math.hypot(b.x - x, b.y - y) < 5.5 * u) { bugs.splice(i, 1); squashed++; const c = combo.hit(); if (c >= 4) popText(ui.ov, `Combo x${c}`, 50, 35, 'gold'); g.sfx?.play('splat'); parts.spawn(x, y, 14, { color: '#7cb342', speed: 220, up: 60, size: 4 * devicePixelRatio, shape: 'circle', life: 0.5 }); return; } }
  };
  cv.addEventListener('pointerdown', click);
  return runMini(g, (dt, finish) => {
    fitCanvas(cv);
    t += dt;
    const W = cv.width, H = cv.height, u = Math.min(W, H) / 100;
    const btn = { x: W * 0.5 - 14 * u, y: H * 0.7, w: 28 * u, h: 8 * u };
    if (!end) {
      spawn -= dt; mspawn -= dt;
      if (spawn <= 0) {
        spawn = Math.max(0.35, 1.1 - t * 0.02);
        const side = Math.floor(Math.random() * 3);
        const x = side === 0 ? -4 * u : side === 1 ? W + 4 * u : Math.random() * W, y = side === 2 ? H * 0.15 : H * (0.18 + Math.random() * 0.4);
        bugs.push({ x, y, v: (9 + Math.random() * 6 + t * 0.2) * u, wig: Math.random() * 6 });
      }
      if (mspawn <= 0) { mspawn = 3.5 + Math.random() * 3; msgs.push({ x: W * (0.05 + Math.random() * 0.55), y: H * (0.2 + Math.random() * 0.4), w: 36 * u, h: 8 * u, text: CLIENT[Math.floor(Math.random() * CLIENT.length)], life: 4 }); }
      for (let i = bugs.length - 1; i >= 0; i--) {
        const b = bugs[i];
        const tx = btn.x + btn.w / 2, ty = btn.y + btn.h / 2;
        const a = Math.atan2(ty - b.y, tx - b.x) + Math.sin(t * 6 + b.wig) * 0.5;
        b.x += Math.cos(a) * b.v * dt; b.y += Math.sin(a) * b.v * dt; b.a = a;
        if (Math.hypot(tx - b.x, ty - b.y) < 6 * u) { bugs.splice(i, 1); leaks++; flash(ui.ov, 'bad'); shake(ui.ov); g.sfx?.play('fail'); popText(ui.ov, `Bug in productie! (${leaks}/4)`, 50, 45, 'bad'); }
      }
      for (let i = msgs.length - 1; i >= 0; i--) { msgs[i].life -= dt; if (msgs[i].life <= 0) msgs.splice(i, 1); }
      if (leaks >= 4) end = { ok: false, squashed, down: true };
      else if (squashed >= need) end = { ok: true, squashed, leaks };
      else if (t + penalty >= limit) end = { ok: false, squashed };
      if (end) { if (end.ok) { g.sfx?.play('cheer'); popText(ui.ov, 'Live! Geen bugs!', 50, 40, 'gold big'); } else popText(ui.ov, end.down ? 'Site plat!' : 'Deadline gemist!', 50, 40, 'bad big'); setTimeout(() => finish(end), 1500); }
    }
    ui.score(`${squashed} / ${need} bugs · ${Math.max(0, limit - t - penalty).toFixed(0)} s`);
    // ---- tekenen: browser met een webwinkel
    ctx.fillStyle = '#0f141a'; ctx.fillRect(0, 0, W, H);
    rr(ctx, W * 0.03, H * 0.08, W * 0.94, H * 0.86, 2 * u); ctx.fillStyle = '#ffffff'; ctx.fill();
    ctx.fillStyle = '#e8eaed'; ctx.fillRect(W * 0.03, H * 0.08, W * 0.94, 5 * u);
    ['#ff5f57', '#febc2e', '#28c840'].forEach((c, i) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(W * 0.05 + i * 3 * u, H * 0.08 + 2.5 * u, 1 * u, 0, 7); ctx.fill(); });
    ctx.fillStyle = '#5f6368'; ctx.font = `600 ${2.2 * u}px Inter, sans-serif`; ctx.textAlign = 'left'; ctx.fillText('https://www.klant-van-rox.nl', W * 0.15, H * 0.08 + 3.3 * u);
    ctx.fillStyle = '#1b2430'; ctx.font = `800 ${5 * u}px "Baloo 2", sans-serif`; ctx.fillText('Webwinkel van de klant', W * 0.08, H * 0.22);
    for (let i = 0; i < 3; i++) { ctx.fillStyle = '#eceff1'; ctx.fillRect(W * (0.08 + i * 0.3), H * 0.28, W * 0.25, H * 0.3); ctx.fillStyle = '#cfd8dc'; ctx.fillRect(W * (0.1 + i * 0.3), H * 0.3, W * 0.21, H * 0.18); }
    rr(ctx, btn.x, btn.y, btn.w, btn.h, 2 * u); ctx.fillStyle = leaks >= 4 ? '#9e9e9e' : '#e53935'; ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = `800 ${3.6 * u}px "Baloo 2", sans-serif`; ctx.textAlign = 'center'; ctx.fillText(leaks >= 4 ? '500 Error' : 'Bestel nu', btn.x + btn.w / 2, btn.y + btn.h * 0.68);
    for (const m of msgs) { rr(ctx, m.x, m.y, m.w, m.h, 1.5 * u); ctx.fillStyle = '#e3f2fd'; ctx.fill(); ctx.strokeStyle = '#1e88e5'; ctx.lineWidth = 0.4 * u; ctx.stroke(); ctx.fillStyle = '#0d47a1'; ctx.font = `700 ${2.3 * u}px Inter, sans-serif`; ctx.textAlign = 'left'; ctx.fillText('Klant: ' + m.text, m.x + 1.5 * u, m.y + m.h * 0.62); }
    for (const b of bugs) {
      ctx.save(); ctx.translate(b.x, b.y); ctx.rotate((b.a || 0) + Math.PI / 2);
      ctx.fillStyle = '#2e2e2e'; ctx.beginPath(); ctx.ellipse(0, 0, 2.2 * u, 3 * u, 0, 0, 7); ctx.fill();
      ctx.fillStyle = '#c62828'; ctx.beginPath(); ctx.arc(0, -2.8 * u, 1.3 * u, 0, 7); ctx.fill();
      ctx.strokeStyle = '#2e2e2e'; ctx.lineWidth = 0.5 * u;
      for (const s of [-1, 1]) for (let k = -1; k <= 1; k++) { ctx.beginPath(); ctx.moveTo(s * 1.8 * u, k * 1.4 * u); ctx.lineTo(s * 3.6 * u, k * 1.4 * u + Math.sin(t * 20 + k) * 0.8 * u); ctx.stroke(); }
      ctx.restore();
    }
    parts.update(dt); parts.draw(ctx);
  }, () => { cv.removeEventListener('pointerdown', click); ui.close(); });
}

// ------------------------------------------------------------ Mooie Boules: jeu de boules
// Eerst richten (de pijl zwaait), dan de kracht (de balk loopt op en neer). Gooi drie ballen; win als jouw beste bal
// dichter bij het butje ligt dan de beste bal van de tegenstander.
export function startBoules(g, { throws = 3 } = {}) {
  const ui = overlay(g, 'Jeu de boules bij Mooie Boules', '<canvas class="mini-canvas"></canvas>',
    g.input.isTouch ? 'Tik om te richten, en tik nog eens om de kracht te kiezen.' : 'Spatie of E om te richten, nog eens om de kracht te kiezen.');
  const cv = ui.ov.querySelector('canvas'), ctx = cv.getContext('2d');
  fitCanvas(cv);
  ui.ov.style.background = '#2b2118';
  const parts = new Particles();
  // baan in meters: 4 breed, 12 lang. Butje (jack) ergens bij 8-10 m. Tegenstander heeft al drie ballen liggen.
  const jack = { x: (Math.random() - 0.5) * 1.6, y: 8.3 + Math.random() * 1.4 };
  const theirs = [0, 1, 2].map(() => { const a = Math.random() * 6.28, d = 0.35 + Math.random() * 0.9; return { x: jack.x + Math.cos(a) * d, y: jack.y + Math.sin(a) * d * 1.2 }; });
  const mine = [];
  let phase = 'aim', t = 0, aim = 0, power = 0, ball = null, end = null, left = throws;
  const best = (arr) => Math.min(...arr.map((b) => Math.hypot(b.x - jack.x, b.y - jack.y)));
  const theirBest = best(theirs);
  return runMini(g, (dt, finish) => {
    fitCanvas(cv);
    t += dt;
    const W = cv.width, H = cv.height;
    const scale = Math.min(W / 4.8, H / 12.9), ox = W / 2, oy = H - scale * 0.6;
    const P = (x, y) => [ox + x * scale, oy - y * scale];
    if (!end) {
      if (phase === 'aim') { aim = Math.sin(t * 2.2) * 0.32; if (pressed(g)) { phase = 'power'; t = 0; } }
      else if (phase === 'power') { power = 0.5 - Math.cos(t * 2.6) * 0.5; if (pressed(g)) { phase = 'roll'; const dist = 5 + power * 7; ball = { x: 0, y: 0.3, vx: Math.sin(aim) * dist * 0.9, vy: Math.cos(aim) * dist * 0.9, air: 0.5 }; g.sfx?.play('kick'); } }
      else if (phase === 'roll' && ball) {
        // eerst door de lucht, daarna rollen met wrijving
        const f = ball.air > 0 ? 0 : 2.2;
        ball.air -= dt;
        ball.x += ball.vx * dt; ball.y += ball.vy * dt;
        const sp = Math.hypot(ball.vx, ball.vy);
        if (ball.air <= 0 && sp > 0) { const ns = Math.max(0, sp - f * dt * 1.6); ball.vx *= ns / sp; ball.vy *= ns / sp; }
        if (ball.air <= 0 && ball.air > -dt) g.sfx?.play('pop');
        // botsen tegen andere ballen (schuiven)
        for (const o of [...theirs, ...mine, jack]) { const d = Math.hypot(o.x - ball.x, o.y - ball.y); if (d < 0.16 && ball.air <= 0) { const nx = (o.x - ball.x) / (d || 1), ny = (o.y - ball.y) / (d || 1); o.x += nx * 0.08; o.y += ny * 0.08; ball.vx *= 0.6; ball.vy *= 0.6; g.sfx?.play('tally'); } }
        if (Math.abs(ball.x) > 2 || ball.y > 12) { ball.vx = 0; ball.vy = 0; }
        if (ball.air <= 0 && Math.hypot(ball.vx, ball.vy) < 0.05) {
          mine.push({ x: ball.x, y: ball.y }); ball = null; left--;
          const d = Math.hypot(mine.at(-1).x - jack.x, mine.at(-1).y - jack.y);
          popText(ui.ov, `${Math.round(d * 100)} cm van het butje`, 50, 30, d < best(theirs) ? 'gold' : '');
          if (left <= 0) {
            const mb = best(mine), tb = best(theirs);
            end = { ok: mb < tb, mine: mb, theirs: tb };
            if (end.ok) { g.sfx?.play('cheer'); popText(ui.ov, 'Punt voor jou!', 50, 42, 'gold big'); } else popText(ui.ov, 'Punt voor de tegenstander', 50, 42, 'bad big');
            setTimeout(() => finish(end), 1600);
          } else { phase = 'aim'; t = 0; }
        }
      }
    }
    ui.score(`Nog ${left} ${left === 1 ? 'bal' : 'ballen'} · beste tegenstander ${Math.round(theirBest * 100)} cm`);
    // ---- tekenen: grindbaan met houten rand, lichtslingers erboven
    ctx.fillStyle = '#2b2118'; ctx.fillRect(0, 0, W, H);
    const [lx0, ly0] = P(-2, 12), [lx1, ly1] = P(2, 0);
    ctx.fillStyle = '#c9b08a'; ctx.fillRect(lx0, ly0, lx1 - lx0, ly1 - ly0);
    for (let i = 0; i < 500; i++) { const px = lx0 + ((i * 97) % 1000) / 1000 * (lx1 - lx0), py = ly0 + ((i * 61) % 1000) / 1000 * (ly1 - ly0); ctx.fillStyle = i % 2 ? '#b89b72' : '#d8c29e'; ctx.fillRect(px, py, 2, 2); }
    ctx.strokeStyle = '#6d4c2f'; ctx.lineWidth = scale * 0.12; ctx.strokeRect(lx0, ly0, lx1 - lx0, ly1 - ly0);
    for (let i = 0; i < 12; i++) { ctx.fillStyle = `hsl(${(i * 47) % 360},90%,${60 + 10 * Math.sin(t * 3 + i)}%)`; ctx.beginPath(); ctx.arc(W * (i + 0.5) / 12, H * 0.04 + Math.sin(i) * 4, 4, 0, 7); ctx.fill(); }
    const drawBall = (b, col, r = 0.19) => { const [x, y] = P(b.x, b.y); const lift = b.air > 0 ? b.air * scale * 0.6 : 0; ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.beginPath(); ctx.ellipse(x, y + 2, r * scale, r * scale * 0.5, 0, 0, 7); ctx.fill(); const gr = ctx.createRadialGradient(x - r * scale * 0.3, y - lift - r * scale * 0.3, 1, x, y - lift, r * scale); gr.addColorStop(0, '#fff'); gr.addColorStop(0.3, col); gr.addColorStop(1, '#222'); ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(x, y - lift, r * scale, 0, 7); ctx.fill(); };
    drawBall(jack, '#f9a825', 0.09);
    theirs.forEach((b) => drawBall(b, '#8d6e63'));
    mine.forEach((b) => drawBall(b, '#b0bec5'));
    if (ball) drawBall(ball, '#cfd8dc');
    if (phase === 'aim' || phase === 'power') {
      const [sx, sy] = P(0, 0.3), [ex, ey] = P(Math.sin(aim) * 3, 0.3 + Math.cos(aim) * 3);
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.setLineDash([8, 8]); ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.stroke(); ctx.setLineDash([]);
    }
    if (phase === 'power') {
      const bx = W * 0.88, by = H * 0.3, bh = H * 0.4, bw = W * 0.03;
      ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.fillRect(bx, by, bw, bh);
      ctx.fillStyle = '#fdd835'; ctx.fillRect(bx, by + bh * (1 - power), bw, bh * power);
    }
    parts.update(dt); parts.draw(ctx);
  }, () => ui.close());
}

// ------------------------------------------------------------ Subway: broodje beleggen
// Het broodje schuift over de toonbank. Leg het beleg erop in de volgorde van het bonnetje, voordat het broodje
// aan de andere kant is. Verkeerd beleg kost een fout. Vijf klanten, hooguit drie fouten.
const BELEG = [
  { n: 'Kip', c: '#e0b07a' }, { n: 'Tonijn', c: '#c9b9a6' }, { n: 'Kaas', c: '#ffd54f' }, { n: 'Sla', c: '#7cb342' },
  { n: 'Tomaat', c: '#e53935' }, { n: 'Komkommer', c: '#9ccc65' }, { n: 'Ui', c: '#f3e5f5' }, { n: 'Augurk', c: '#558b2f' },
  { n: 'Jalapeño', c: '#2e7d32' }, { n: 'Saus', c: '#fff3e0' },
];
export function startSub(g, { need = 5, maxMistakes = 3, limit = 75 } = {}) {
  const ui = overlay(g, 'Broodje beleggen bij Subway', '<canvas class="mini-canvas"></canvas><div class="sub-btns"></div>',
    g.input.isTouch ? 'Tik het beleg aan in de volgorde van het bonnetje, voordat het broodje aan de andere kant is.' : 'Klik het beleg aan (of toets 1 t/m 6) in de volgorde van het bonnetje, voordat het broodje aan de andere kant is.');
  const cv = ui.ov.querySelector('canvas'), ctx = cv.getContext('2d');
  fitCanvas(cv);
  ui.ov.style.background = '#0e3b22';
  const style = document.createElement('style');
  style.textContent = '.sub-btns{position:absolute;left:0;right:0;bottom:62px;display:flex;flex-wrap:wrap;gap:8px;justify-content:center;z-index:3;padding:0 12px}.sub-btns button{font:800 17px "Baloo 2",sans-serif;padding:8px 14px;border:0;border-radius:12px;color:#1b2430;box-shadow:0 3px 0 rgba(0,0,0,.3);min-width:84px}';
  ui.ov.appendChild(style);
  const btnBox = ui.ov.querySelector('.sub-btns');
  const parts = new Particles();
  const combo = makeCombo(ui.ov);
  const names = ['Bouwvakker', 'Student met kater', 'Agent in burger', 'Zwerver met een tientje', 'Developer van ROX', 'Oma met rollator'];
  let t = 0, served = 0, mistakes = 0, end = null, order = null, layers = [], x = 0, opts = [], picked = [];
  const newOrder = () => {
    const pool = BELEG.slice().sort(() => Math.random() - 0.5);
    const n = Math.min(5, 3 + Math.floor(served / 2));
    order = { who: names[Math.floor(Math.random() * names.length)], list: pool.slice(0, n), bread: Math.random() < 0.5 ? 'Wit' : 'Bruin' };
    opts = pool.slice(0, 6).sort(() => Math.random() - 0.5);
    if (!order.list.every((b) => opts.includes(b))) opts = order.list.concat(pool.slice(n, n + 6 - order.list.length)).sort(() => Math.random() - 0.5);
    layers = []; picked = []; x = 0;
    btnBox.innerHTML = '';
    opts.forEach((b, i) => { const el = document.createElement('button'); el.type = 'button'; el.textContent = `${i + 1} ${b.n}`; el.style.background = b.c; el.addEventListener('pointerdown', (e) => { e.stopPropagation(); choose(i); }); btnBox.appendChild(el); });
  };
  const choose = (i) => {
    if (end || !order) return;
    const b = opts[i]; if (!b) return;
    const want = order.list[layers.length];
    if (b === want) { layers.push(b); const c = combo.hit(); g.sfx?.play('pop'); if (c >= 4) popText(ui.ov, `x${c}`, 50, 30, 'gold'); }
    else { mistakes++; combo.miss(); flash(ui.ov, 'bad'); g.sfx?.play('fail'); popText(ui.ov, `Nee! ${want.n} eerst.`, 50, 30, 'bad'); }
    if (layers.length === order.list.length) {
      served++; g.sfx?.play('tally'); popText(ui.ov, ['Lekker!', 'Top sub!', 'Eet smakelijk!'][served % 3], 50, 40, 'good big');
      if (served < need) newOrder();
    }
  };
  const kd = (e) => { const k = parseInt(e.key, 10); if (k >= 1 && k <= 6) choose(k - 1); };
  addEventListener('keydown', kd);
  newOrder();
  return runMini(g, (dt, finish) => {
    fitCanvas(cv);
    t += dt;
    const W = cv.width, H = cv.height, u = Math.min(W, H) / 100;
    if (!end) {
      x += dt * (0.085 + served * 0.012); // broodje schuift op
      if (x >= 1) { mistakes++; flash(ui.ov, 'bad'); popText(ui.ov, 'Te traag! Klant weg.', 50, 40, 'bad'); newOrder(); }
      if (served >= need) end = { ok: true, served, mistakes };
      else if (mistakes >= maxMistakes) end = { ok: false, served, mistakes };
      else if (t >= limit) end = { ok: false, served, mistakes };
      if (end) { if (end.ok) { g.sfx?.play('cheer'); popText(ui.ov, 'Sandwich artist!', 50, 40, 'gold big'); } setTimeout(() => finish(end), 1400); }
    }
    ui.score(`${served} / ${need} klanten · fouten ${mistakes}/${maxMistakes} · ${Math.max(0, limit - t).toFixed(0)} s`);
    // ---- tekenen: toonbank met het broodje en het bonnetje
    ctx.fillStyle = '#0e3b22'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#d7ccc8'; ctx.fillRect(0, H * 0.48, W, H * 0.14);
    ctx.fillStyle = '#9e9e9e'; ctx.fillRect(0, H * 0.62, W, H * 0.02);
    // bonnetje
    if (order) {
      rr(ctx, W * 0.03, H * 0.06, W * 0.3, H * 0.36, 1.5 * u); ctx.fillStyle = '#fffde7'; ctx.fill();
      ctx.fillStyle = '#1b2430'; ctx.font = `800 ${3 * u}px "Baloo 2", sans-serif`; ctx.textAlign = 'left';
      ctx.fillText(order.who, W * 0.05, H * 0.12);
      ctx.font = `700 ${2.5 * u}px Inter, sans-serif`;
      ctx.fillText(`${order.bread} brood`, W * 0.05, H * 0.17);
      order.list.forEach((b, i) => { ctx.fillStyle = i < layers.length ? '#9e9e9e' : '#1b2430'; ctx.fillText(`${i + 1}. ${b.n}${i < layers.length ? '  ✓' : ''}`, W * 0.05, H * (0.22 + i * 0.045)); });
      // broodje op de toonbank
      const bx = W * (0.08 + x * 0.86), by = H * 0.5, bw = 26 * u;
      ctx.fillStyle = order.bread === 'Wit' ? '#f0d9a8' : '#a1673a';
      rr(ctx, bx - bw / 2, by - 3 * u, bw, 6 * u, 3 * u); ctx.fill();
      layers.forEach((b, i) => { ctx.fillStyle = b.c; rr(ctx, bx - bw / 2 + 1 * u, by - 3 * u - (i + 1) * 1.6 * u, bw - 2 * u, 1.8 * u, 0.9 * u); ctx.fill(); });
      ctx.fillStyle = order.bread === 'Wit' ? '#f5e1b5' : '#b07444';
      rr(ctx, bx - bw / 2, by - 6 * u - layers.length * 1.6 * u, bw, 4 * u, 2 * u); ctx.fill(); // bovenkant (open)
      // tijdsbalk van dit broodje
      ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.fillRect(W * 0.38, H * 0.08, W * 0.58, 1.6 * u);
      ctx.fillStyle = x > 0.75 ? '#e53935' : '#ffc20e'; ctx.fillRect(W * 0.38, H * 0.08, W * 0.58 * (1 - x), 1.6 * u);
    }
    parts.update(dt); parts.draw(ctx);
  }, () => { removeEventListener('keydown', kd); ui.close(); });
}

// ------------------------------------------------------------ Café Reef: de geheime klopcode
// Luister naar de klopcode achter de dichtgetimmerde deur en klop hem na, met hetzelfde ritme.
// Drie rondes, steeds langer. Twee keer fout en de deur blijft dicht.
export function startKlopcode(g, { rounds = 3 } = {}) {
  const ui = overlay(g, 'De klopcode van Café Reef', '<canvas class="mini-canvas"></canvas>',
    g.input.isTouch ? 'Luister naar de klopjes. Daarna tik je ze na, in hetzelfde ritme.' : 'Luister naar de klopjes. Daarna klop je ze na met spatie of E, in hetzelfde ritme.');
  const cv = ui.ov.querySelector('canvas'), ctx = cv.getContext('2d');
  fitCanvas(cv);
  ui.ov.style.background = '#2a1d12';
  const parts = new Particles();
  let round = 0, phase = 'listen', t = 0, pattern = [], taps = [], lives = 2, shake = 0, end = null, lastPlay = -1, msg = '';
  const make = (n) => { const gaps = [0]; for (let i = 1; i < n; i++) gaps.push(gaps[i - 1] + (Math.random() < 0.4 ? 0.55 : 0.28)); return gaps; };
  const start = () => { pattern = make(3 + round); taps = []; phase = 'listen'; t = -0.6; lastPlay = -1; msg = 'Luister...'; };
  start();
  return runMini(g, (dt, finish) => {
    fitCanvas(cv);
    t += dt; shake = Math.max(0, shake - dt * 4);
    const W = cv.width, H = cv.height, u = Math.min(W, H) / 100;
    if (!end) {
      if (phase === 'listen') {
        for (let i = lastPlay + 1; i < pattern.length; i++) if (t >= pattern[i]) { lastPlay = i; shake = 1; g.sfx?.play('kick'); }
        if (t > pattern.at(-1) + 0.9) { phase = 'tap'; t = 0; msg = 'Jouw beurt: klop na!'; }
        pressed(g); // tikken tijdens het luisteren telt niet
      } else if (phase === 'tap') {
        if (pressed(g)) { taps.push(t); shake = 1; g.sfx?.play('kick'); parts.spawn(W / 2, H * 0.45, 6, { color: '#c8a46a', speed: 160, up: 60, size: 3 * devicePixelRatio, life: 0.4 }); }
        const done = taps.length >= pattern.length || (taps.length && t - taps.at(-1) > 1.6) || t > pattern.at(-1) + 4;
        if (done) {
          let ok = taps.length === pattern.length;
          if (ok) {
            const span = pattern.at(-1) || 1, tspan = (taps.at(-1) - taps[0]) || 1;
            for (let i = 1; i < pattern.length && ok; i++) { const a = pattern[i] / span, b = (taps[i] - taps[0]) / tspan; if (Math.abs(a - b) > 0.16) ok = false; }
          }
          if (ok) {
            round++; flash(ui.ov, 'good'); g.sfx?.play('tally');
            if (round >= rounds) { end = { ok: true }; popText(ui.ov, 'Klik. Het luikje gaat open!', 50, 40, 'gold big'); g.sfx?.play('cheer'); }
            else { popText(ui.ov, 'Goed! Er wordt teruggeklopt...', 50, 40, 'good'); start(); }
          } else {
            lives--; flash(ui.ov, 'bad'); g.sfx?.play('fail');
            if (lives <= 0) { end = { ok: false }; popText(ui.ov, '"Wegwezen, juut!"', 50, 40, 'bad big'); }
            else { popText(ui.ov, '"Wie is daar?" Nog een keer.', 50, 40, 'bad'); start(); }
          }
          if (end) setTimeout(() => finish(end), 1600);
        }
      }
    }
    ui.score(`Ronde ${Math.min(round + 1, rounds)} / ${rounds} · nog ${lives} ${lives === 1 ? 'kans' : 'kansen'}`);
    // ---- tekenen: dichtgetimmerde deur van houten platen, met het briefje van de burgemeester
    ctx.fillStyle = '#2a1d12'; ctx.fillRect(0, 0, W, H);
    ctx.save(); ctx.translate((Math.random() - 0.5) * shake * 6, 0);
    for (let i = 0; i < 8; i++) { ctx.fillStyle = i % 2 ? '#b08a5a' : '#a37c4c'; ctx.fillRect(W * 0.2 + i * W * 0.075, H * 0.08, W * 0.072, H * 0.8); }
    ctx.fillStyle = '#8a6a3e'; ctx.save(); ctx.translate(W / 2, H * 0.48); ctx.rotate(-0.5); ctx.fillRect(-W * 0.36, -2 * u, W * 0.72, 4 * u); ctx.restore();
    ctx.fillStyle = '#555'; for (let i = 0; i < 16; i++) { ctx.beginPath(); ctx.arc(W * 0.21 + (i % 8) * W * 0.075 + W * 0.03, i < 8 ? H * 0.12 : H * 0.84, 0.6 * u, 0, 7); ctx.fill(); }
    rr(ctx, W * 0.56, H * 0.18, W * 0.16, H * 0.2, 0.5 * u); ctx.fillStyle = '#fafafa'; ctx.fill();
    ctx.fillStyle = '#1b2430'; ctx.font = `800 ${2.4 * u}px Inter, sans-serif`; ctx.textAlign = 'center';
    ctx.fillText('GESLOTEN', W * 0.64, H * 0.24); ctx.font = `600 ${1.4 * u}px Inter, sans-serif`; ctx.fillText('op last van de', W * 0.64, H * 0.28); ctx.fillText('burgemeester', W * 0.64, H * 0.31);
    ctx.fillStyle = '#e53935'; ctx.font = `900 ${5 * u}px "Baloo 2", sans-serif`; ctx.save(); ctx.translate(W * 0.36, H * 0.66); ctx.rotate(-0.12); ctx.fillText('REEF 4EVER', 0, 0); ctx.restore();
    // luikje
    rr(ctx, W * 0.43, H * 0.4, W * 0.1, H * 0.08, 0.5 * u); ctx.fillStyle = end?.ok ? '#111' : '#7a5a32'; ctx.fill();
    if (end?.ok) { ctx.fillStyle = '#f0c8a0'; ctx.fillRect(W * 0.46, H * 0.43, W * 0.04, H * 0.03); ctx.fillStyle = '#3e6b2f'; ctx.fillRect(W * 0.475, H * 0.36, W * 0.012, H * 0.07); } // hand met een pijppie
    ctx.restore();
    // ritme in stippen
    const n = pattern.length;
    for (let i = 0; i < n; i++) {
      const px = W * 0.5 + (i - (n - 1) / 2) * 6 * u;
      const lit = phase === 'listen' ? i <= lastPlay : i < taps.length;
      ctx.fillStyle = lit ? '#ffd54f' : 'rgba(255,255,255,0.25)'; ctx.beginPath(); ctx.arc(px, H * 0.94, 1.8 * u, 0, 7); ctx.fill();
    }
    ctx.fillStyle = '#fff'; ctx.font = `800 ${3.4 * u}px "Baloo 2", sans-serif`; ctx.textAlign = 'center'; ctx.fillText(msg, W / 2, H * 0.05 + 2 * u);
    parts.update(dt); parts.draw(ctx);
  }, () => ui.close());
}

// ------------------------------------------------------------ Kippie: de frituur leegvissen
// Uit het groene, borrelende vet komt van alles bovendrijven. Tik de troep eruit met het schepnet voordat het weer
// zinkt, maar laat de verse kip liggen: die is voor de klanten. Genoeg troep eruit = gewonnen; te vaak verse kip
// eruit of de tijd om = mislukt.
const TROEP = [
  { e: '🧦', n: 'een sok', p: 10 }, { e: '🩹', n: 'een pleister', p: 10 }, { e: '🦷', n: 'een kies', p: 15 },
  { e: '🔑', n: 'een sleutelbos', p: 10 }, { e: '📱', n: 'de telefoon van de stagiair', p: 20 }, { e: '🪳', n: 'een kakkerlak', p: 15 },
  { e: '🦴', n: 'een kippenbot uit 2019', p: 10 }, { e: '🐀', n: 'een rat (gefrituurd)', p: 25 }, { e: '👓', n: 'een bril', p: 15 },
  { e: '💍', n: 'een trouwring', p: 30 }, { e: '🩲', n: 'een onderbroek', p: 25 }, { e: '🧽', n: 'een sponsje', p: 10 },
];
const VERS = [{ e: '🍗', n: 'verse kippenpoot' }, { e: '🍗', n: 'verse kippenpoot' }];
export function startFrituur(g, { need = 12, maxMistakes = 3, limit = 50 } = {}) {
  const ui = overlay(g, 'De frituur van Kippie', '<canvas class="mini-canvas"></canvas>',
    g.input.isTouch ? 'Tik de troep uit het vet voordat het weer zinkt. Laat de verse kip (🍗) liggen!' : 'Klik de troep uit het vet voordat het weer zinkt. Laat de verse kip (🍗) liggen!');
  const cv = ui.ov.querySelector('canvas'), ctx = cv.getContext('2d');
  fitCanvas(cv);
  ui.ov.style.background = '#2a2410';
  const parts = new Particles();
  const combo = makeCombo(ui.ov);
  let t = 0, fished = 0, mistakes = 0, end = null, spawnT = 0.4, score = 0, best = null;
  const items = []; // { x, y (0..1 binnen het vet), it, good, t, life }
  const bubbles = Array.from({ length: 40 }, () => ({ x: Math.random(), y: Math.random(), r: 0.3 + Math.random(), s: 0.2 + Math.random() * 0.5 }));
  let vat = null; // rechthoek van het vet in pixels
  const hitAt = (px, py) => {
    if (end || !vat) return;
    let hit = null, hd = Infinity;
    for (const o of items) {
      if (o.gone) continue;
      const ox = vat.x + o.x * vat.w, oy = vat.y + o.y * vat.h;
      const d = Math.hypot(px - ox, py - oy);
      if (d < vat.item * 0.8 && d < hd) { hd = d; hit = o; }
    }
    // spetters, ook als je mis tikt
    parts.spawn(px, py, hit ? 14 : 6, { color: '#9a8f2a', speed: 260, up: 220, size: 4 * devicePixelRatio, shape: 'circle', life: 0.6 });
    if (!hit) { g.sfx?.play('splash'); return; }
    hit.gone = true;
    if (hit.good) {
      mistakes++; combo.miss(); flash(ui.ov, 'bad'); shake(ui.ov); g.sfx?.play('fail');
      popText(ui.ov, ['Die was voor een klant!', 'Nee! Verse kip!', 'Die kip moet erin blijven!'][mistakes % 3], 50, 30, 'bad');
    } else {
      fished++; score += hit.it.p; if (!best || hit.it.p > best.p) best = hit.it;
      const c = combo.hit(); g.sfx?.play('pop');
      popText(ui.ov, `${hit.it.e} ${hit.it.n}${c >= 3 ? ` x${c}` : ''}`, 50, 26, hit.it.p >= 25 ? 'gold' : 'good');
    }
  };
  const pd = (e) => { e.preventDefault(); const r = cv.getBoundingClientRect(); hitAt((e.clientX - r.left) * (cv.width / r.width), (e.clientY - r.top) * (cv.height / r.height)); };
  cv.addEventListener('pointerdown', pd);
  const pr = runMini(g, (dt, finish) => {
    fitCanvas(cv);
    t += dt;
    const W = cv.width, H = cv.height, u = Math.min(W, H) / 100;
    vat = { x: W * 0.12, y: H * 0.3, w: W * 0.76, h: H * 0.42, item: 9 * u };
    if (!end) {
      spawnT -= dt;
      if (spawnT <= 0) {
        spawnT = Math.max(0.35, 0.9 - t * 0.012) * (0.6 + Math.random() * 0.8);
        const good = Math.random() < 0.28;
        const it = good ? VERS[0] : TROEP[Math.floor(Math.random() * TROEP.length)];
        items.push({ x: 0.08 + Math.random() * 0.84, y: 0.15 + Math.random() * 0.7, it, good, t: 0, life: Math.max(1.1, 2.1 - t * 0.02) });
      }
      for (const o of items) { o.t += dt; if (o.t > o.life) o.gone = true; }
      if (fished >= need) end = { ok: true, fished, mistakes, score, best: best?.n || 'niks' };
      else if (mistakes >= maxMistakes) end = { ok: false, fished, mistakes, why: 'kip' };
      else if (t >= limit) end = { ok: false, fished, mistakes, why: 'tijd' };
      if (end) {
        if (end.ok) { g.sfx?.play('cheer'); flash(ui.ov, 'gold'); popText(ui.ov, 'Frituur schoon(er)!', 50, 40, 'gold big'); }
        else popText(ui.ov, end.why === 'kip' ? 'Alle verse kip is weg!' : 'Tijd op!', 50, 40, 'bad big');
        setTimeout(() => finish(end), 1500);
      }
    }
    for (let i = items.length - 1; i >= 0; i--) if (items[i].gone && items[i].t > items[i].life + 0.4) items.splice(i, 1);
    ui.score(`${fished} / ${need} troep · verse kip eruit ${mistakes}/${maxMistakes} · ${Math.max(0, limit - t).toFixed(0)} s`);
    // ---- tekenen: vieze tegels, de frituur, het groene vet
    ctx.fillStyle = '#d8cfa4'; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = '#b7ab78'; ctx.lineWidth = Math.max(1, 0.3 * u);
    for (let y = 0; y < H; y += 8 * u) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    for (let x = 0; x < W; x += 8 * u) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    // vetspetters en druipers op de tegels
    ctx.fillStyle = 'rgba(120,100,20,0.35)';
    for (let i = 0; i < 18; i++) { const sx = ((i * 137) % 100) / 100 * W, sy = ((i * 61) % 30) / 100 * H; ctx.beginPath(); ctx.ellipse(sx, sy, 1.6 * u, 1.1 * u, 0, 0, 7); ctx.fill(); ctx.fillRect(sx - 0.25 * u, sy, 0.5 * u, (3 + (i % 5)) * u); }
    // de bak
    rr(ctx, vat.x - 3 * u, vat.y - 3 * u, vat.w + 6 * u, vat.h + 8 * u, 2 * u); ctx.fillStyle = '#8f9599'; ctx.fill();
    rr(ctx, vat.x - 1 * u, vat.y - 1 * u, vat.w + 2 * u, vat.h + 2 * u, 1.5 * u); ctx.fillStyle = '#3d3f41'; ctx.fill();
    const gr = ctx.createLinearGradient(0, vat.y, 0, vat.y + vat.h);
    gr.addColorStop(0, '#7d7a22'); gr.addColorStop(0.5, '#5d5a17'); gr.addColorStop(1, '#3a3010');
    ctx.fillStyle = gr; ctx.fillRect(vat.x, vat.y, vat.w, vat.h);
    // bubbels
    for (const b of bubbles) {
      b.y -= b.s * dt * 0.4; if (b.y < 0) { b.y = 1; b.x = Math.random(); }
      ctx.strokeStyle = 'rgba(220,210,120,0.55)'; ctx.lineWidth = Math.max(1, 0.25 * u);
      ctx.beginPath(); ctx.arc(vat.x + b.x * vat.w, vat.y + b.y * vat.h, b.r * u, 0, 7); ctx.stroke();
    }
    // dingen die bovendrijven: komen op, dobberen, zinken weer
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (const o of items) {
      if (o.gone) continue;
      const k = Math.min(1, o.t / 0.25) * Math.min(1, (o.life - o.t) / 0.3);
      const ox = vat.x + o.x * vat.w, oy = vat.y + o.y * vat.h + Math.sin(o.t * 6) * 0.6 * u;
      ctx.globalAlpha = Math.max(0, k);
      ctx.fillStyle = 'rgba(40,35,8,0.5)'; ctx.beginPath(); ctx.ellipse(ox, oy + 3 * u, 5 * u * k, 1.4 * u * k, 0, 0, 7); ctx.fill();
      if (o.good) { ctx.strokeStyle = '#ffd54f'; ctx.lineWidth = 0.5 * u; ctx.beginPath(); ctx.arc(ox, oy, 5.5 * u, 0, 7); ctx.stroke(); }
      ctx.font = `${7 * u * (0.6 + 0.4 * k)}px sans-serif`;
      ctx.fillText(o.it.e, ox, oy);
      ctx.font = `700 ${2.1 * u}px Inter, sans-serif`; ctx.fillStyle = o.good ? '#ffe082' : '#f1ead0';
      ctx.fillText(o.good ? 'vers!' : o.it.n, ox, oy + 5.5 * u);
      ctx.globalAlpha = 1;
    }
    // bordje
    ctx.fillStyle = '#c62828'; rr(ctx, W * 0.32, H * 0.08, W * 0.36, H * 0.11, 1.5 * u); ctx.fill();
    ctx.fillStyle = '#ffd54f'; ctx.font = `800 ${4.4 * u}px "Baloo 2", sans-serif`; ctx.fillText('KIPPIE', W * 0.5, H * 0.12);
    ctx.fillStyle = '#fff'; ctx.font = `600 ${1.9 * u}px Inter, sans-serif`; ctx.fillText('vet ververst op: ??-??-20??', W * 0.5, H * 0.165);
    parts.update(dt); parts.draw(ctx);
  }, () => { cv.removeEventListener('pointerdown', pd); ui.close(); });
  // voor testen vanuit de console: de dingen in het vet en de tik-functie
  if (g.minigame) g.minigame.debug = { items, get vat() { return vat; }, hitAt };
  return pr;
}
