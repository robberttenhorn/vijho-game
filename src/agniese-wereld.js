// De Agniesebuurt (Rotterdam) bovenop de open data: het bord van ROX Digital Agency op de derde verdieping van het
// hoekpand Vijverhofstraat 47, rotzooi en graffiti in de Vijverhofstraat en de Teilingerstraat, zwervers en
// verslaafden die rondslenteren, en dealers die op scooters en in een zwarte auto door de straten rijden.
// Alle personen en de rotzooi zijn verzonnen aankleding: het spel is een overdreven, satirisch beeld van de buurt.
import * as THREE from 'three';
import { makeCharacter } from './character.js';
import { makeCart } from './props.js';

const std = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.8, ...extra });
let seedV = 4242;
const rnd = () => ((seedV = (seedV * 16807) % 2147483647) / 2147483647);
const pick = (arr) => arr[Math.floor(rnd() * arr.length)];

// Rotterdamse straatpraat (woorden uit openbare woordenlijsten van het Rotterdams, nog laten nakijken)
export const ZWERVER_LINES = [
  'Faka mattie! Heb je effe een euro voor me?',
  'Gers petje, mattie. Mag ik hem?',
  'Ik ga zo aftaaien, maar eerst nog een pijppie.',
  'Geepekop! Kijk uit waar je loopt!',
  'Ik ben niet dronken, ik heb gewoon een snee in m\'n neus.',
  'Pas op, de kit komt eraan!',
  'Heb je een sigaretje? Of een halve? Of een peuk?',
  'Ik was vroeger havenbaron. Echt waar. Niet lullen maar poetsen.',
  'Dit is hier een delta, man. Een delta!',
  'Ik heb al drie dagen geen does gehad. Ruik maar.',
  'Bakkie pleur? Nee? Dan een euro. Of een donnie.',
  'Mooie pata, mattie. Zijn ze nieuw? Mag ik ze?',
  'Ik heb geen osso meer. Dit portiek is m\'n osso.',
  'Waggie open laten staan? Ik pas er wel op. Voor een donnie.',
  'Een barkie? Voor een barkie zing ik het Wilhelmus. Achterstevoren.',
  'Faka? Niks faka. Alles kut, maar wel gers.',
  'Die dakhaas daar is van mij. Afblijven.',
];

// tekstballon boven iemand (een paar seconden)
function bubble(text) {
  const c = document.createElement('canvas');
  const x = c.getContext('2d');
  const fs = 44;
  x.font = `700 ${fs}px Inter, sans-serif`;
  const words = text.split(' '); const lines = []; let row = '';
  for (const wd of words) { const t = row ? row + ' ' + wd : wd; if (x.measureText(t).width > 560 && row) { lines.push(row); row = wd; } else row = t; }
  lines.push(row);
  const w = Math.min(620, Math.max(...lines.map((l) => x.measureText(l).width)) + 50), h = lines.length * (fs + 10) + 50;
  c.width = w; c.height = h + 24;
  x.font = `700 ${fs}px Inter, sans-serif`;
  x.fillStyle = 'rgba(255,255,255,0.95)';
  x.beginPath(); x.roundRect(4, 4, w - 8, h - 8, 26); x.fill();
  x.beginPath(); x.moveTo(w / 2 - 18, h - 6); x.lineTo(w / 2, h + 20); x.lineTo(w / 2 + 18, h - 6); x.fill();
  x.fillStyle = '#1b2430'; x.textBaseline = 'top';
  lines.forEach((l, i) => x.fillText(l, 25, 24 + i * (fs + 10)));
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false, fog: false }));
  const sh = 0.0028 * c.height * 1.0;
  s.scale.set((sh * c.width) / c.height, sh, 1);
  s.renderOrder = 12;
  s.layers.set(1);
  return s;
}

// iemand die er verrot uitziet: vuile, verkleurde kleding, grauwe huid, vaak een baard en een muts
export function makeJunkie(i = 0) {
  const skins = [0xc8b49c, 0xb89a80, 0x8d6a52, 0xd2bfa8, 0x6b4f3c];
  const dirty = [0x5a5246, 0x4b4f3a, 0x6b5a48, 0x3d3a35, 0x7a6e5a, 0x55483e, 0x4a4f55];
  const m = makeCharacter({
    shirt: pick(dirty), pants: pick([0x3a3730, 0x4a4438, 0x2f3236, 0x5b5040]), skin: skins[i % skins.length],
    hair: pick([0x5a4a3a, 0x8a8478, 0x2b2420, 0x9e968a]), hairStyle: rnd() < 0.3 ? 'long' : 'short',
    beard: rnd() < 0.7, coat: rnd() < 0.55 ? pick([0x4e4436, 0x3b3f36, 0x5d4f3f, 0x2e2a26]) : null,
    hat: rnd() < 0.5 ? 'cap' : null, hatColor: pick([0x2b2b2b, 0x4a3b2e, 0x3c4a3a]), shoes: 0x2a2520, sleeves: 'long',
    build: -1.2 + rnd() * 0.8, scale: 0.95 + rnd() * 0.06,
  });
  // alles een stuk grauwer en vuiler
  m.traverse((o) => {
    if (!o.isMesh) return;
    o.material = o.material.clone();
    o.material.color = (o.material.color || new THREE.Color(1, 1, 1)).clone().multiply(new THREE.Color(0.78, 0.76, 0.66));
    o.material.roughness = 1;
  });
  return m;
}

// scooter met een dealer erop (zwarte hoodie, petje)
export function makeDealerScooter(i = 0) {
  const g = new THREE.Group();
  const body = std([0x111111, 0xf5f5f5, 0x1e3a5f][i % 3], { roughness: 0.35, metalness: 0.3 });
  const dark = std(0x151515);
  const box = (w, h, d, m, x, y, z, rx = 0) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z); o.rotation.x = rx; o.castShadow = true; g.add(o); return o; };
  box(0.38, 0.28, 1.15, body, 0, 0.42, -0.05);
  box(0.34, 0.12, 0.62, dark, 0, 0.62, -0.2); // zadel
  box(0.3, 0.7, 0.18, body, 0, 0.62, 0.52, -0.25); // voorscherm
  box(0.6, 0.05, 0.05, std(0x888888, { metalness: 0.8 }), 0, 1.02, 0.6); // stuur
  box(0.36, 0.3, 0.32, dark, 0, 0.85, -0.6); // koffer achterop
  for (const z of [0.55, -0.48]) { const wh = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.12, 14), std(0x111111)); wh.rotation.z = Math.PI / 2; wh.position.set(0, 0.22, z); g.add(wh); }
  const rider = makeCharacter({ shirt: 0x161616, pants: 0x1c1c1c, hair: 0x1a1a1a, coat: 0x111111, hat: 'cap', hatColor: [0x111111, 0xb71c1c, 0x1565c0][i % 3], shoes: 0xf5f5f5, sleeves: 'long' });
  rider.position.set(0, 0.18, -0.15);
  g.add(rider);
  g.userData.animate = (dt) => rider.userData.animate(dt, 0, 'sit');
  return g;
}

function streetLine(w, names) {
  const out = [];
  for (const n of names) { const p = w.streetPath(n).map(([x, z]) => [x, z]); if (p.length > 1) out.push({ name: n, path: p }); }
  return out;
}
function along(path, s) {
  let acc = 0;
  for (let k = 1; k < path.length; k++) {
    const [ax, az] = path[k - 1], [bx, bz] = path[k];
    const L = Math.hypot(bx - ax, bz - az);
    if (acc + L >= s || k === path.length - 1) { const f = Math.min(1, Math.max(0, (s - acc) / (L || 1))); return [ax + (bx - ax) * f, az + (bz - az) * f, Math.atan2(bx - ax, bz - az)]; }
    acc += L;
  }
  return [path[0][0], path[0][1], 0];
}
const pathLen = (p) => p.reduce((s, q, i) => (i ? s + Math.hypot(q[0] - p[i - 1][0], q[1] - p[i - 1][1]) : 0), 0);

export function buildAgnieseWorld(g) {
  const out = {};
  try { out.rox = buildRoxSign(g); } catch (e) { console.warn('ROX-bord', e); }
  try { out.reef = buildReef(g); } catch (e) { console.warn('Café Reef', e); }
  try { out.rotzooi = buildRotzooi(g); } catch (e) { console.warn('rotzooi', e); }
  try { out.zwervers = buildZwervers(g); } catch (e) { console.warn('zwervers', e); }
  try { out.dealers = buildDealers(g); } catch (e) { console.warn('dealers', e); }
  g.agniese = out;
  return out;
}

// ------------------------------------------------------------ ROX op de derde verdieping van het hoekpand
function buildRoxSign(g) {
  const fac = g.facades;
  const f = fac.frames.rox || (() => { const p = g.world.meta.pois.find((q) => q.id === 'rox'); return p ? fac.frameFor(...p.pos) : null; })();
  if (!f) return null;
  const grp = fac.group(f, 0.08);
  // bord onder de derde verdieping (ongeveer 9 meter hoog), in een neutrale stijl zonder echt logo
  const c = document.createElement('canvas'); c.width = 1024; c.height = 256;
  const x = c.getContext('2d');
  x.fillStyle = '#111418'; x.fillRect(0, 0, 1024, 256);
  x.fillStyle = '#ffffff'; x.font = '900 170px "Baloo 2", sans-serif'; x.textBaseline = 'middle'; x.fillText('ROX', 40, 132);
  x.font = '600 64px Inter, sans-serif'; x.fillStyle = '#d9dde3'; x.fillText('Digital Agency', 400, 132);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.MeshStandardMaterial({ map: tex, emissiveMap: tex, emissive: 0xffffff, emissiveIntensity: 0.25, roughness: 0.4 });
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 1.05), mat);
  sign.position.set(0, 9.25, 0.04);
  grp.add(sign);
  // drie verlichte kantoorramen op de derde verdieping: daar wordt hard gewerkt (of gegamed)
  for (const sx of [-1.6, 0, 1.6]) {
    const win = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.4), new THREE.MeshStandardMaterial({ color: 0xcfe6ff, emissive: 0x9fc4ff, emissiveIntensity: 0.6, roughness: 0.2 }));
    win.position.set(sx, 10.75, 0.03); grp.add(win);
    const frame = new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.5, 0.05), std(0x222222)); frame.position.set(sx, 10.75, 0.0); grp.add(frame);
  }
  return { frame: f };
}

// gevel die het dichtst bij een punt ligt (voor adressen waarvan het punt net buiten het pand ligt)
function nearestFacade(w, x, z) {
  let best = null;
  const inRing = (px, pz, r) => { let c = false; for (let i = 0, j = r.length - 1; i < r.length; j = i++) { const [xi, zi] = r[i], [xj, zj] = r[j]; if ((zi > pz) !== (zj > pz) && px < ((xj - xi) * (pz - zi)) / (zj - zi) + xi) c = !c; } return c; };
  for (const fp of w.footprints) {
    if (fp.maxX < x - 30 || fp.minX > x + 30 || fp.maxZ < z - 30 || fp.minZ > z + 30) continue;
    const r = fp.ring;
    for (let i = 0; i < r.length; i++) {
      const [ax, az] = r[i], [bx, bz] = r[(i + 1) % r.length];
      const len = Math.hypot(bx - ax, bz - az);
      if (len < 3) continue;
      const t = Math.max(0, Math.min(1, ((x - ax) * (bx - ax) + (z - az) * (bz - az)) / (len * len)));
      const px = ax + (bx - ax) * t, pz = az + (bz - az) * t, d = Math.hypot(x - px, z - pz);
      if (best && d >= best.d) continue;
      let nx = (bz - az) / len, nz = -(bx - ax) / len;
      if (inRing(px + nx * 0.4, pz + nz * 0.4, r)) { nx = -nx; nz = -nz; }
      best = { d, x: px, z: pz, nx, nz, len };
    }
  }
  if (!best) return null;
  const ux = -best.nz, uz = best.nx;
  return { x: best.x, z: best.z, y: w.heightAt(best.x + best.nx * 1.5, best.z + best.nz * 1.5), ux, uz, nx: best.nx, nz: best.nz, len: best.len, yaw: Math.atan2(best.nx, best.nz) };
}

// ------------------------------------------------------------ Café Reef (Vijverhofstraat 26): dichtgetimmerd met houten platen
// De houten platen en het briefje zijn opgegeven door de maker; de reden van de sluiting staat er bewust niet op.
// Het oude bord, de graffiti en het luikje zijn verzonnen aankleding.
function buildReef(g) {
  const fac = g.facades, w = g.world;
  const p = w.meta.pois.find((q) => q.id === 'reef');
  if (!p) return null;
  const f = fac.frameAtAddress(...p.pos, 'Vijverhofstraat') || fac.frameFor(...p.pos) || nearestFacade(w, ...p.pos);
  if (!f) return null;
  fac.frames.reef = f;
  const grp = fac.group(f, 0.1);
  const W = Math.min(Math.max(3.6, f.len - 0.6), 7.5), H = 3.3;
  // multiplex platen: verticale planken in verschillende tinten, met schroeven en twee schoren
  const tints = [0xb48c5c, 0xa98252, 0xbf9868, 0x9e7848];
  const nP = Math.round(W / 1.22);
  for (let i = 0; i < nP; i++) {
    const pw = W / nP;
    const plank = new THREE.Mesh(new THREE.BoxGeometry(pw - 0.02, H, 0.03), std(tints[i % tints.length], { roughness: 0.95 }));
    plank.position.set(-W / 2 + pw * (i + 0.5), H / 2, 0.015);
    grp.add(plank);
    for (const y of [0.25, H / 2, H - 0.25]) for (const sx of [-0.4, 0.4]) { const sc = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.01, 6), std(0x777777, { metalness: 0.8 })); sc.rotation.x = Math.PI / 2; sc.position.set(-W / 2 + pw * (i + 0.5) + sx * pw, y, 0.035); grp.add(sc); }
  }
  for (const sgn of [-1, 1]) { const brace = new THREE.Mesh(new THREE.BoxGeometry(Math.hypot(W, H) * 0.95, 0.14, 0.04), std(0x8a6a3e)); brace.position.set(0, H / 2, 0.05); brace.rotation.z = sgn * Math.atan2(H, W); grp.add(brace); }
  // briefje van de burgemeester (algemene tekst, geen logo)
  const note = document.createElement('canvas'); note.width = 256; note.height = 340;
  const n = note.getContext('2d');
  n.fillStyle = '#fafafa'; n.fillRect(0, 0, 256, 340);
  n.fillStyle = '#1b2430'; n.textAlign = 'center';
  n.font = '900 46px Inter, sans-serif'; n.fillText('GESLOTEN', 128, 70);
  n.font = '600 22px Inter, sans-serif'; ['op last van de', 'burgemeester'].forEach((l, i) => n.fillText(l, 128, 112 + i * 28));
  n.font = '400 15px Inter, sans-serif'; ['Het is verboden dit pand', 'te betreden.', '', 'Gemeente Rotterdam'].forEach((l, i) => n.fillText(l, 128, 200 + i * 22));
  n.strokeStyle = '#999'; n.lineWidth = 2; n.strokeRect(6, 6, 244, 328);
  const nt = new THREE.CanvasTexture(note); nt.colorSpace = THREE.SRGBColorSpace;
  const sheet = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.56), new THREE.MeshStandardMaterial({ map: nt, roughness: 0.9 }));
  sheet.position.set(W * 0.22, 1.65, 0.06); grp.add(sheet);
  // tape op de hoeken
  for (const [dx, dy] of [[-0.2, 0.27], [0.2, 0.27], [-0.2, -0.27], [0.2, -0.27]]) { const tape = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 0.035), std(0xd7ccaa)); tape.position.set(W * 0.22 + dx, 1.65 + dy, 0.065); tape.rotation.z = 0.6; grp.add(tape); }
  // graffiti op de platen
  const tag = document.createElement('canvas'); tag.width = 512; tag.height = 192;
  const tx = tag.getContext('2d');
  tx.font = '900 96px "Baloo 2", sans-serif'; tx.textAlign = 'center'; tx.textBaseline = 'middle';
  tx.save(); tx.translate(256, 96); tx.rotate(-0.08); tx.lineWidth = 12; tx.strokeStyle = '#111'; tx.strokeText('REEF 4EVER', 0, 0); tx.fillStyle = '#e53935'; tx.fillText('REEF 4EVER', 0, 0); tx.restore();
  const tt = new THREE.CanvasTexture(tag); tt.colorSpace = THREE.SRGBColorSpace;
  const graf = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.9), new THREE.MeshStandardMaterial({ map: tt, transparent: true, roughness: 0.9 }));
  graf.position.set(-W * 0.18, 0.95, 0.06); grp.add(graf);
  // het oude bord erboven, een beetje scheef en verbleekt
  const bord = document.createElement('canvas'); bord.width = 512; bord.height = 128;
  const bx = bord.getContext('2d');
  bx.fillStyle = '#1d3b4f'; bx.fillRect(0, 0, 512, 128); bx.fillStyle = '#cfe3ea'; bx.font = '800 76px "Baloo 2", sans-serif'; bx.textAlign = 'center'; bx.textBaseline = 'middle'; bx.fillText('Café Reef', 256, 68);
  const bt = new THREE.CanvasTexture(bord); bt.colorSpace = THREE.SRGBColorSpace;
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 0.65), new THREE.MeshStandardMaterial({ map: bt, roughness: 0.8, color: 0xbbbbbb }));
  sign.position.set(0, H + 0.55, 0.04); sign.rotation.z = -0.06; grp.add(sign);
  // luikje ter hoogte van het hoofd (voor de missie)
  const hatch = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.3, 0.04), std(0x7a5a32));
  hatch.position.set(-W * 0.05, 1.55, 0.06); grp.add(hatch);
  // bierkratten en een verwelkt bosje bloemen ervoor: de vaste klanten missen hun café
  const crate = (x, y) => { const c = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.3, 0.3), std(0xc62828)); c.position.set(x, 0.15 + y, 0.45); grp.add(c); };
  crate(W * 0.38, 0); crate(W * 0.38, 0.3); crate(W * 0.3, 0);
  const flowers = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.35, 8), std(0x8d6e63)); flowers.rotation.z = Math.PI / 2; flowers.position.set(-W * 0.35, 0.06, 0.35); grp.add(flowers);
  grp.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return { frame: f, hatch };
}

// ------------------------------------------------------------ rotzooi en graffiti in de Vijverhofstraat en de Teilingerstraat
function buildRotzooi(g) {
  const w = g.world;
  const streets = streetLine(w, ['Vijverhofstraat', 'Teilingerstraat']);
  const groups = {};
  const free = (x, z) => !w.insideBuilding(x, z) && w.classAt(x, z) !== 'rijbaan' && w.classAt(x, z) !== 'water';
  const bagMat = [std(0x151515, { roughness: 0.35 }), std(0x2a4b8c, { roughness: 0.4 }), std(0x3b3b3b, { roughness: 0.4 })];
  for (const { name, path } of streets) {
    const grp = new THREE.Group();
    groups[name] = grp;
    const L = pathLen(path);
    for (let s = 3; s < L; s += 4 + rnd() * 5) {
      const [px, pz, h] = along(path, s);
      const side = rnd() < 0.5 ? -1 : 1;
      let spot = null;
      for (const off of [4.2, 3.6, 5.0, 2.9]) { const x = px + Math.cos(h) * off * side, z = pz - Math.sin(h) * off * side; if (free(x, z)) { spot = [x, z]; break; } }
      if (!spot) continue;
      const y = w.groundAt(...spot);
      const r = rnd();
      const item = new THREE.Group();
      if (r < 0.4) {
        for (let k = 0; k < 1 + Math.floor(rnd() * 3); k++) { const b = new THREE.Mesh(new THREE.IcosahedronGeometry(0.32, 1), pick(bagMat)); b.scale.set(1, 0.8 + rnd() * 0.4, 1); b.position.set((rnd() - 0.5) * 0.7, 0.26, (rnd() - 0.5) * 0.7); b.castShadow = true; item.add(b); }
      } else if (r < 0.62) {
        for (let k = 0; k < 4; k++) { const can = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.12, 8), std(pick([0xc62828, 0x2e7d32, 0xfdd835, 0xb0bec5]), { metalness: 0.7, roughness: 0.3 })); can.rotation.z = Math.PI / 2; can.rotation.y = rnd() * 6; can.position.set((rnd() - 0.5) * 1.2, 0.035, (rnd() - 0.5) * 1.2); item.add(can); }
        const box = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.04, 0.4), std(0xc8a46a)); box.position.y = 0.02; box.rotation.y = rnd(); item.add(box); // pizzadoos
      } else if (r < 0.72) {
        const mat = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.18, 1.9), std(0xd8cfb8, { roughness: 1 })); mat.position.y = 0.09; item.add(mat); // matras
        const vlek = new THREE.Mesh(new THREE.CircleGeometry(0.25, 12), std(0x8d7a4a)); vlek.rotation.x = -Math.PI / 2; vlek.position.set(0.1, 0.185, 0.3); item.add(vlek);
      } else if (r < 0.8) {
        const cart = makeCart(); cart.rotation.z = rnd() < 0.5 ? Math.PI / 2.2 : 0; cart.position.y = cart.rotation.z ? 0.42 : 0; item.add(cart);
      } else if (r < 0.9) {
        for (let k = 0; k < 3; k++) { const fl = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.045, 0.3, 8), std(0x3e6b2f, { roughness: 0.15, transparent: true, opacity: 0.8 })); fl.rotation.z = Math.PI / 2; fl.rotation.y = rnd() * 6; fl.position.set((rnd() - 0.5), 0.04, (rnd() - 0.5)); item.add(fl); }
      } else {
        const chair = new THREE.Group(); chair.add(new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.05, 0.45), std(0xf5f5f5)), new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.45, 0.05), std(0xf5f5f5))); chair.children[1].position.set(0, 0.22, -0.2); chair.rotation.x = 1.3; chair.position.y = 0.25; item.add(chair); // omgevallen tuinstoel
      }
      item.position.set(spot[0], y, spot[1]);
      item.rotation.y = rnd() * 6;
      grp.add(item);
    }
    // graffiti op de gevels langs de straat
    const tags = ['010', 'ROFFA', 'VIJHO', 'KAPOT', 'GERS', 'NOORD', 'RAT', 'APIES', 'ZOOI', 'XTC?', 'HALLO JUUT'];
    for (let s = 8; s < L; s += 14 + rnd() * 10) {
      const [px, pz] = along(path, s);
      const f = g.facades.frameFor(px, pz);
      if (!f || Math.hypot(f.x - px, f.z - pz) > 12) continue;
      const c = document.createElement('canvas'); c.width = 512; c.height = 192;
      const x = c.getContext('2d');
      const col = pick(['#e53935', '#43a047', '#1e88e5', '#fdd835', '#ab47bc', '#ff7043', '#ffffff', '#111111']);
      x.font = `900 ${110 + Math.floor(rnd() * 40)}px "Baloo 2", sans-serif`; x.textAlign = 'center'; x.textBaseline = 'middle';
      x.lineWidth = 14; x.strokeStyle = col === '#111111' ? '#ffffff' : '#111111'; x.save(); x.translate(256, 100); x.rotate((rnd() - 0.5) * 0.3);
      const t = pick(tags); x.strokeText(t, 0, 0); x.fillStyle = col; x.fillText(t, 0, 0);
      x.restore();
      for (let d = 0; d < 6; d++) { x.fillStyle = col; x.fillRect(80 + rnd() * 350, 140 + rnd() * 20, 4, 10 + rnd() * 30); } // druipers
      const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
      const plane = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 0.98), new THREE.MeshStandardMaterial({ map: tex, transparent: true, roughness: 0.9, polygonOffset: true, polygonOffsetFactor: -2 }));
      const off = (rnd() - 0.5) * Math.max(0, f.len - 3);
      plane.position.set(f.x + f.nx * 0.07 + f.ux * off, f.y + 1.1 + rnd() * 0.8, f.z + f.nz * 0.07 + f.uz * off);
      plane.rotation.y = f.yaw;
      grp.add(plane);
    }
    g.scene.add(grp);
  }
  return groups;
}

// ------------------------------------------------------------ zwervers en verslaafden
function buildZwervers(g) {
  const w = g.world;
  const streets = streetLine(w, ['Vijverhofstraat', 'Teilingerstraat']);
  if (!streets.length) return [];
  const list = [];
  const free = (x, z) => !w.insideBuilding(x, z) && w.classAt(x, z) !== 'water';
  let n = 0;
  for (const { path } of streets) {
    const L = pathLen(path);
    const walkers = Math.max(3, Math.round(L / 45));
    for (let k = 0; k < walkers; k++) {
      const m = makeJunkie(n++);
      g.scene.add(m);
      const z = { model: m, path, L, s: rnd() * L, dir: rnd() < 0.5 ? 1 : -1, speed: 0.45 + rnd() * 0.35, lane: (rnd() < 0.5 ? -1 : 1) * (2.6 + rnd() * 1.4), sway: rnd() * 6, kind: 'walk', bubble: null, bubbleT: 0, cool: rnd() * 5 };
      // een paar duwen een winkelwagentje met hun spullen
      if (rnd() < 0.3) {
        const cart = makeCart();
        for (let b = 0; b < 3; b++) { const bag = new THREE.Mesh(new THREE.IcosahedronGeometry(0.18, 1), std(pick([0x1565c0, 0x111111, 0xd32f2f, 0xf5f5f5]))); bag.position.set((rnd() - 0.5) * 0.3, 0.85 + b * 0.1, (rnd() - 0.5) * 0.4); cart.add(bag); }
        cart.position.set(0, 0, 0.75); m.add(cart); z.cart = cart;
      }
      list.push(z);
    }
    // een paar zitten tegen de gevel op een stuk karton, of liggen in een slaapzak
    for (let k = 0; k < Math.max(2, Math.round(L / 70)); k++) {
      const [px, pz, h] = along(path, rnd() * L);
      const side = rnd() < 0.5 ? -1 : 1;
      let spot = null;
      for (const off of [5.2, 4.6, 4.0, 3.4]) { const x = px + Math.cos(h) * off * side, zz = pz - Math.sin(h) * off * side; if (free(x, zz) && w.insideBuilding(px + Math.cos(h) * (off + 1.0) * side, pz - Math.sin(h) * (off + 1.0) * side)) { spot = [x, zz]; break; } }
      if (!spot) continue;
      const y = w.groundAt(...spot);
      const face = Math.atan2(px - spot[0], pz - spot[1]); // met het gezicht naar de straat
      const karton = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.02, 1.4), std(0xb08a5a, { roughness: 1 }));
      karton.position.set(spot[0], y + 0.01, spot[1]); karton.rotation.y = face; g.scene.add(karton);
      if (rnd() < 0.6) {
        const m = makeJunkie(n++);
        m.position.set(spot[0], y, spot[1]); m.rotation.y = face; g.scene.add(m);
        const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.04, 0.1, 10), std(0xf5f5f5)); cup.position.set(spot[0] + Math.sin(face) * 0.5, y + 0.05, spot[1] + Math.cos(face) * 0.5); g.scene.add(cup); // bekertje voor muntjes
        list.push({ model: m, kind: 'sit', x: spot[0], z: spot[1], bubble: null, bubbleT: 0, cool: rnd() * 5 });
      } else {
        const bag = new THREE.Mesh(new THREE.CapsuleGeometry(0.28, 1.4, 4, 10), std(pick([0x1e4f8a, 0x2e5d2e, 0x6a2a2a]), { roughness: 0.7 }));
        bag.rotation.z = Math.PI / 2; bag.rotation.y = face + Math.PI / 2; bag.position.set(spot[0], y + 0.28, spot[1]); bag.castShadow = true; g.scene.add(bag);
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.13, 10, 8), std(0x9e8a72)); head.position.set(spot[0] + Math.cos(face + Math.PI / 2) * 0.95, y + 0.3, spot[1] - Math.sin(face + Math.PI / 2) * 0.95); g.scene.add(head);
        const muts = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), std(0x3a3a3a)); muts.position.copy(head.position).add(new THREE.Vector3(0, 0.02, 0)); g.scene.add(muts);
      }
    }
  }
  // bijwerken: sloffen, zwalken, en af en toe iets roepen als je in de buurt bent
  const tmp = new THREE.Vector3();
  g.updaters.add((dt) => {
    const p = g.player;
    for (const z of list) {
      const m = z.model;
      if (z.kind === 'walk') {
        const d2 = (m.position.x - p.x) ** 2 + (m.position.z - p.z) ** 2;
        if (d2 > 160 * 160) continue; // ver weg: stilstaan scheelt rekenwerk
        // frikandelbroodjes in de buurt? Dan komen ze eropaf (en pikken er een als ze je te pakken krijgen)
        const bait = g.agniese?.bait;
        if (bait && d2 < 14 * 14) {
          const dx = p.x - m.position.x, dz = p.z - m.position.z, dl = Math.sqrt(d2) || 1;
          m.position.x += (dx / dl) * 1.7 * dt; m.position.z += (dz / dl) * 1.7 * dt;
          m.position.y = w.groundAt(m.position.x, m.position.z);
          m.rotation.y = Math.atan2(dx, dz);
          m.userData.animate(dt, 1.7, 'walk');
          z.stealCd = (z.stealCd || 0) - dt;
          if (dl < 1.3 && z.stealCd <= 0) { z.stealCd = 6; bait.steal(z); }
          z.chased = true;
          continue;
        }
        if (z.chased) { z.chased = false; } // daarna gewoon weer verder over hun eigen route
        z.s += z.dir * z.speed * dt;
        if (z.s > z.L - 2) { z.s = z.L - 2; z.dir = -1; } else if (z.s < 2) { z.s = 2; z.dir = 1; }
        const [x, zz, h] = along(z.path, z.s);
        z.sway += dt * 1.3;
        const lane = z.lane + Math.sin(z.sway) * 0.5; // zwalken
        let px = x + Math.cos(h) * lane, pz = zz - Math.sin(h) * lane;
        if (w.insideBuilding(px, pz)) { px = x + Math.cos(h) * lane * 0.6; pz = zz - Math.sin(h) * lane * 0.6; }
        m.position.set(px, w.groundAt(px, pz), pz);
        m.rotation.y = h + (z.dir < 0 ? Math.PI : 0) + Math.sin(z.sway * 1.7) * 0.25;
        m.rotation.x = 0.12; // voorovergebogen
        m.userData.animate(dt, z.speed, 'walk');
      } else {
        m.userData.animate(dt, 0, 'sit');
      }
      // roepen
      z.cool -= dt;
      const dist = Math.hypot(m.position.x - p.x, m.position.z - p.z);
      if (dist < 4 && z.cool <= 0 && !g.missions?.talking) {
        z.cool = 9 + rnd() * 8;
        if (z.bubble) m.remove(z.bubble);
        z.bubble = bubble(pick(ZWERVER_LINES));
        z.bubble.position.set(0, 2.4, 0);
        m.add(z.bubble);
        z.bubbleT = 3.2;
      }
      if (z.bubble) { z.bubbleT -= dt; if (z.bubbleT <= 0) { m.remove(z.bubble); z.bubble = null; } }
    }
    void tmp;
  });
  return list;
}

// ------------------------------------------------------------ dealers die door de straten rijden
function buildDealers(g) {
  const w = g.world;
  const streets = streetLine(w, ['Vijverhofstraat', 'Teilingerstraat', 'Agniesestraat', 'Zaagmolenstraat', 'Zwaanshals', 'Bergweg']);
  if (!streets.length) return [];
  const list = [];
  const usable = streets.filter((s) => pathLen(s.path) > 80);
  for (let i = 0; i < 4 && usable.length; i++) {
    const st = usable[i % usable.length];
    const grp = makeDealerScooter(i);
    g.scene.add(grp);
    list.push({ grp, kind: 'scooter', path: st.path, L: pathLen(st.path), s: rnd() * pathLen(st.path), dir: rnd() < 0.5 ? 1 : -1, speed: 5 + rnd() * 2.5, lane: 1.4, caught: false, name: st.name });
  }
  // zwarte auto met getinte ramen die stapvoets rondjes rijdt
  const st = usable.find((s) => s.name === 'Vijverhofstraat') || usable[0];
  if (st && g.cars?.makeCarMesh) {
    const car = g.cars.makeCarMesh('sedan', 0x0b0b0c);
    g.scene.add(car);
    list.push({ grp: car, kind: 'car', path: st.path, L: pathLen(st.path), s: 0, dir: 1, speed: 3.2, lane: 1.6, caught: false, name: st.name });
  }
  g.updaters.add((dt) => {
    const p = g.player;
    for (const d of list) {
      if (d.caught) continue;
      const fleeing = d.flee && Math.hypot(d.grp.position.x - p.x, d.grp.position.z - p.z) < 30;
      const v = d.speed * (fleeing ? 1.25 : 1);
      d.s += d.dir * v * dt;
      if (d.s > d.L - 3) { d.s = d.L - 3; d.dir = -1; } else if (d.s < 3) { d.s = 3; d.dir = 1; }
      const [x, z, h] = along(d.path, d.s);
      const lane = d.lane * d.dir; // rechts houden
      const px = x + Math.cos(h) * lane, pz = z - Math.sin(h) * lane;
      d.grp.position.set(px, w.groundAt(px, pz), pz);
      d.grp.rotation.y = h + (d.dir < 0 ? Math.PI : 0);
      d.grp.userData.animate?.(dt);
    }
  });
  return list;
}
