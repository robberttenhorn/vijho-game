// De Agniesebuurt (Rotterdam) bovenop de open data: het bord van ROX Digital Agency op de derde verdieping van het
// hoekpand Vijverhofstraat 47, rotzooi en graffiti in de Vijverhofstraat en de Teilingerstraat, zwervers en
// verslaafden die rondslenteren, en dealers die op scooters en in een zwarte auto door de straten rijden.
// Alle personen en de rotzooi zijn verzonnen aankleding: het spel is een overdreven, satirisch beeld van de buurt.
import * as THREE from 'three';
import { makeCharacter } from './character.js';
import { makeCart } from './props.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

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
  'Die ratten hier zijn groter dan m\'n hond. En ik heb niet eens een hond.',
  'Niet op die rat gaan staan, mattie. Dat is Henk. Henk is van mij.',
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
  try { out.viaduct = buildViaduct(g); } catch (e) { console.warn('viaduct', e); }
  g.agniese = out;
  try { out.reef = buildReef(g); } catch (e) { console.warn('Café Reef', e); }
  try { out.rotzooi = buildRotzooi(g); } catch (e) { console.warn('rotzooi', e); }
  try { out.zwervers = buildZwervers(g); } catch (e) { console.warn('zwervers', e); }
  try { out.dealers = buildDealers(g); } catch (e) { console.warn('dealers', e); }
  try { out.ratten = buildRatten(g); } catch (e) { console.warn('ratten', e); }
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
  let glass = null;
  try { glass = buildRoxGlass(g, f); } catch (e) { console.warn('rox-glas', e); }
  return { frame: f, glass };
}

// De derde verdieping van het hoekpand Vijverhofstraat 47 / Teilingerstraat helemaal rondom van glas, met de
// branding van ROX erachter. De omtrek is het hoge deel van het pand (dak op ongeveer 17 meter) uit de 3D BAG,
// overgetrokken uit de dakvlakken; de verdiepingshoogte (begane grond 4 m, daarna 3,3 m) is een schatting.
const ROX_OUTLINE = [[-7.1, -4.5], [3.3, 4.4], [6.1, 1.2], [7.3, 0.2], [9.2, -2.3], [10.4, -1.3], [11.1, -0.3], [14.9, -5.0], [18.2, -9.0], [16.5, -10.5],
  [25.5, -21.2], [29.0, -25.5], [31.0, -25.0], [32.0, -29.0], [33.2, -31.3], [36.5, -34.2], [24.2, -40.6], [22.0, -38.8]];
function roxBrandTexture() {
  const c = document.createElement('canvas'); c.width = 1536; c.height = 512;
  const x = c.getContext('2d');
  const draw = () => {
  // kantoor erachter: donker blauw, lichtbalken aan het plafond
  const bg = x.createLinearGradient(0, 0, 0, 512); bg.addColorStop(0, '#1b2440'); bg.addColorStop(0.6, '#0e1530'); bg.addColorStop(1, '#0a0f22');
  x.fillStyle = bg; x.fillRect(0, 0, 1536, 512);
  for (let i = 0; i < 6; i++) { x.fillStyle = 'rgba(235,245,255,0.85)'; x.fillRect(40 + i * 256, 26, 170, 10); }
  // bureaus met schermen onderin
  for (let i = 0; i < 9; i++) {
    const dx = 30 + i * 170;
    x.fillStyle = '#05070f'; x.fillRect(dx, 420, 140, 16); x.fillRect(dx + 10, 436, 8, 60); x.fillRect(dx + 122, 436, 8, 60);
    x.fillStyle = i % 3 ? '#3d8bff' : '#7ad1ff'; x.fillRect(dx + 30, 362, 74, 50);
    x.fillStyle = '#05070f'; x.fillRect(dx + 62, 412, 10, 10);
  }
  // groot ROX met een blauwe gloed, en de payoff
  x.textBaseline = 'middle';
  x.font = '900 250px "Baloo 2", "Arial Black", sans-serif';
  x.shadowColor = '#2f7bff'; x.shadowBlur = 40; x.fillStyle = '#ffffff'; x.fillText('ROX', 70, 215);
  x.shadowBlur = 0;
  x.font = '700 70px Inter, "Helvetica Neue", Arial, sans-serif'; x.fillStyle = '#8fc4ff'; x.fillText('DIGITAL AGENCY', 660, 170);
  x.font = '600 46px Inter, "Helvetica Neue", Arial, sans-serif'; x.fillStyle = '#d7e6ff'; x.fillText('websites · apps · platforms', 664, 250);
  // blauwe band als accent
  x.fillStyle = '#2f6bff'; x.fillRect(660, 300, 760, 12);
  };
  draw();
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.wrapS = THREE.RepeatWrapping; tex.anisotropy = 4;
  if (document.fonts?.ready) document.fonts.ready.then(() => { draw(); tex.needsUpdate = true; });
  return tex;
}
function buildRoxGlass(g, f) {
  const w = g.world;
  const base = f.y; // maaiveld bij de voorgevel
  const Y0 = base + 10.3, Y1 = base + 13.7, H = Y1 - Y0;
  const tex = roxBrandTexture();
  const TILE = 9; // meter per herhaling van de branding
  const ring = ROX_OUTLINE;
  // buitenom: de ring met de klok mee of tegen de klok in?
  let area = 0; for (let i = 0; i < ring.length; i++) { const [x1, z1] = ring[i], [x2, z2] = ring[(i + 1) % ring.length]; area += x1 * z2 - x2 * z1; }
  const sgn = area > 0 ? -1 : 1; // zo wijst de normaal naar buiten
  const parts = { brand: [], glass: [], alu: [] };
  // de muurdriehoeken van het pand in de buurt (om de gevel precies te vinden)
  const tris = [];
  {
    const { f32, n } = w.bld;
    const xs = ring.map((q) => q[0]), zs = ring.map((q) => q[1]);
    const x0 = Math.min(...xs) - 3, x1 = Math.max(...xs) + 3, z0 = Math.min(...zs) - 3, z1 = Math.max(...zs) + 3;
    for (let v = 0; v < n; v += 3) {
      let ok = true;
      for (let k = 0; k < 3 && ok; k++) { const x = f32[(v + k) * 7], z = f32[(v + k) * 7 + 2]; if (x < x0 || x > x1 || z < z0 || z > z1) ok = false; }
      if (ok) tris.push([0, 1, 2].map((k) => [f32[(v + k) * 7], f32[(v + k) * 7 + 1], f32[(v + k) * 7 + 2]]));
    }
  }
  // Möller-Trumbore, alleen horizontaal: afstand tot de dichtstbijzijnde muur langs (dx, 0, dz)
  const wallHit = (ox, oy, oz, dx, dz) => {
    let best = null;
    for (const [a, b, c] of tris) {
      const e1x = b[0] - a[0], e1y = b[1] - a[1], e1z = b[2] - a[2], e2x = c[0] - a[0], e2y = c[1] - a[1], e2z = c[2] - a[2];
      const px = -dz * e2y, py = dz * e2x - dx * e2z, pz = dx * e2y; // d x e2 met d = (dx, 0, dz)
      const det = e1x * px + e1y * py + e1z * pz;
      if (Math.abs(det) < 1e-9) continue;
      const inv = 1 / det, tx = ox - a[0], ty = oy - a[1], tz = oz - a[2];
      const u = (tx * px + ty * py + tz * pz) * inv; if (u < 0 || u > 1) continue;
      const qx = ty * e1z - tz * e1y, qy = tz * e1x - tx * e1z, qz = tx * e1y - ty * e1x;
      const vv = (dx * qx + dz * qz) * inv; if (vv < 0 || u + vv > 1) continue;
      const t = (e2x * qx + e2y * qy + e2z * qz) * inv;
      if (t > 0 && (best == null || t < best)) best = t;
    }
    return best;
  };
  let along = 0;
  for (let i = 0; i < ring.length; i++) {
    const [ax, az] = ring[i], [bx, bz] = ring[(i + 1) % ring.length];
    const L = Math.hypot(bx - ax, bz - az); if (L < 0.4) continue;
    const ux = (bx - ax) / L, uz = (bz - az) / L;
    // normaal naar buiten
    const nx = -uz * sgn, nz = ux * sgn;
    const yaw = Math.atan2(nx, nz);
    const mx = (ax + bx) / 2, mz = (az + bz) / 2;
    const ext = 0.45; // aan de uiteinden een stukje doorlopen, zodat de hoeken dicht zijn
    // waar staat de muur echt? (de omtrek is overgetrokken en kan een paar decimeter binnen de gevel liggen)
    // gemeten met een horizontale straal op het 3D-model, op de hoogte van de verdieping
    let dW = -Infinity;
    for (const t of [0.15, 0.35, 0.5, 0.65, 0.85]) {
      const sx = ax + (bx - ax) * t, sz = az + (bz - az) * t;
      const hit = wallHit(sx + nx * 3, Y0 + 1.6, sz + nz * 3, -nx, -nz);
      if (hit != null && hit > 1 && hit < 5) dW = Math.max(dW, 3 - hit);
    }
    if (!isFinite(dW)) dW = 0;
    const place = (geo, off) => { geo.rotateY(yaw); geo.translate(mx + nx * (off + dW), 0, mz + nz * (off + dW)); return geo; };
    // branding vlak voor de muur
    const pb = new THREE.PlaneGeometry(L + ext * 2, H - 0.5);
    const uv = pb.attributes.uv; for (let k = 0; k < uv.count; k++) uv.setX(k, (along - ext + uv.getX(k) * (L + ext * 2)) / TILE);
    pb.translate(0, Y0 + 0.25 + (H - 0.5) / 2, 0); parts.brand.push(place(pb, 0.08));
    // glas
    const gl = new THREE.PlaneGeometry(L + ext * 2, H - 0.5); gl.translate(0, Y0 + 0.25 + (H - 0.5) / 2, 0); parts.glass.push(place(gl, 0.42));
    // vloer- en plafondrand en stijlen van aluminium
    for (const y of [Y0 + 0.13, Y1 - 0.13]) { const b = new THREE.BoxGeometry(L + ext * 2, 0.26, 0.55); b.translate(0, y, 0); parts.alu.push(place(b, 0.27)); }
    for (let d = 0; d <= L + 0.01; d += L / Math.max(1, Math.round(L / 1.6))) {
      const st = new THREE.BoxGeometry(0.07, H - 0.5, 0.12); st.translate(d - L / 2, Y0 + 0.25 + (H - 0.5) / 2, 0); parts.alu.push(place(st, 0.42));
    }
    along += L;
  }
  const mats = {
    brand: new THREE.MeshStandardMaterial({ map: tex, emissiveMap: tex, emissive: 0xffffff, emissiveIntensity: 0.55, roughness: 0.6 }),
    glass: new THREE.MeshStandardMaterial({ color: 0x9cc4dc, transparent: true, opacity: 0.3, roughness: 0.05, metalness: 0.4, depthWrite: false, side: THREE.DoubleSide }),
    alu: new THREE.MeshStandardMaterial({ color: 0x2b3036, roughness: 0.45, metalness: 0.6 }),
  };
  const grp = new THREE.Group();
  for (const [k, geos] of Object.entries(parts)) {
    const norm = geos.map((x) => (x.index ? x.toNonIndexed() : x));
    if (k !== 'brand') for (const y of norm) y.deleteAttribute('uv');
    const m = new THREE.Mesh(mergeGeometries(norm, false), mats[k]);
    m.castShadow = k === 'alu'; m.receiveShadow = k !== 'glass';
    if (k === 'glass') m.renderOrder = 2;
    grp.add(m);
  }
  g.scene.add(grp);
  return grp;
}

// ------------------------------------------------------------ het spoorviaduct (Hofpleinlijn, de Hofbogen)
// In de BGT staat het viaduct als lange smalle strook 'overbruggingsdeel'; de panden in de bogen staan in de 3D BAG
// als lage blokken van ongeveer 6 meter. Hier komt het dek erbovenop: een betonnen plaat op ongeveer de hoogte van
// de eerste verdieping, met een borstwering, een dubbel spoor op ballast, pijlers waar geen pand onder staat en
// bogen op de gevels van de panden in de plint. De Teilingerstraat loopt eronderdoor.
function buildViaduct(g) {
  const w = g.world;
  const ci = w.ground.classes.indexOf('brug');
  if (ci < 0) return null;
  const rings = [];
  for (const [c, rs] of w.ground.polys) {
    if (c !== ci) continue;
    const r = rs[0]; const pts = [];
    for (let i = 0; i < r.length; i += 2) { const p = [r[i], r[i + 1]]; if (!pts.length || Math.hypot(p[0] - pts.at(-1)[0], p[1] - pts.at(-1)[1]) > 0.3) pts.push(p); }
    if (pts.length < 6) continue;
    const xs = pts.map((p) => p[0]), zs = pts.map((p) => p[1]);
    const diag = Math.hypot(Math.max(...xs) - Math.min(...xs), Math.max(...zs) - Math.min(...zs));
    let area = 0; for (let i = 0; i < pts.length; i++) { const [x1, z1] = pts[i], [x2, z2] = pts[(i + 1) % pts.length]; area += x1 * z2 - x2 * z1; }
    area = Math.abs(area) / 2;
    // lang en smal: het viaduct (geen gewone brug over een singel)
    if (diag < 80 || area / diag > 16) continue;
    rings.push(pts);
  }
  if (!rings.length) return null;
  const DECK = 6.3, SLAB = 0.9, PARA = 1.05;
  const concrete = new THREE.MeshStandardMaterial({ color: 0xd4c4a4, roughness: 0.9 });
  const parts = { deck: [], wall: [], ballast: [], rail: [], sleeper: [], plinth: [], arch: [], relief: [], pane: [], shop: [], cornice: [], stone: [], stoneDark: [], mast: [], wire: [] };
  const lines = [], arches = [];
  for (const ring of rings) {
    const y0 = w.groundAt(...ring[Math.floor(ring.length / 2)]);
    const top = y0 + DECK;
    // dek: de strook zelf, met een rand eromheen
    const shape = new THREE.Shape(ring.map(([x, z]) => new THREE.Vector2(x, -z)));
    const deck = new THREE.ExtrudeGeometry(shape, { depth: SLAB, bevelEnabled: false });
    deck.rotateX(-Math.PI / 2); deck.translate(0, top - SLAB, 0);
    parts.deck.push(deck);
    // hartlijn: de ring in twee lange zijden knippen bij de twee punten die het verst uit elkaar liggen
    let ia = 0, ib = 0, bd = 0;
    for (let i = 0; i < ring.length; i++) for (let j = i + 1; j < ring.length; j++) { const d = Math.hypot(ring[i][0] - ring[j][0], ring[i][1] - ring[j][1]); if (d > bd) { bd = d; ia = i; ib = j; } }
    const sideA = [], sideB = [];
    for (let k = ia; k !== ib; k = (k + 1) % ring.length) sideA.push(ring[k]); sideA.push(ring[ib]);
    for (let k = ib; k !== ia; k = (k + 1) % ring.length) sideB.push(ring[k]); sideB.push(ring[ia]);
    const nearestOn = (chain, x, z) => { let best = null; for (let k = 1; k < chain.length; k++) { const [ax, az] = chain[k - 1], [bx, bz] = chain[k]; const dx = bx - ax, dz = bz - az, l2 = dx * dx + dz * dz || 1; const t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / l2)); const px = ax + dx * t, pz = az + dz * t, d = Math.hypot(x - px, z - pz); if (!best || d < best.d) best = { d, x: px, z: pz }; } return best; };
    const center = [];
    let acc = 0;
    for (let k = 1; k < sideA.length; k++) {
      const [ax, az] = sideA[k - 1], [bx, bz] = sideA[k];
      const L = Math.hypot(bx - ax, bz - az);
      for (let d = (3 - acc % 3) % 3; d < L; d += 3) {
        const x = ax + (bx - ax) * (d / L), z = az + (bz - az) * (d / L);
        const o = nearestOn(sideB, x, z);
        if (o && o.d > 3 && o.d < 30) center.push({ x: (x + o.x) / 2, z: (z + o.z) / 2, width: o.d });
      }
      acc += L;
    }
    if (center.length < 4) continue;
    // de hartlijn wat gladder maken
    const sm = center.map((c, i) => { let sx = 0, sz = 0, sw = 0, n = 0; for (let j = Math.max(0, i - 2); j <= Math.min(center.length - 1, i + 2); j++) { sx += center[j].x; sz += center[j].z; sw += center[j].width; n++; } return { x: sx / n, z: sz / n, width: sw / n }; });
    lines.push({ ring, center: sm, top });
    // borstwering langs de lange zijden (niet over de dwarse kopse kanten)
    for (const chain of [sideA, sideB]) {
      for (let k = 1; k < chain.length; k++) {
        const [ax, az] = chain[k - 1], [bx, bz] = chain[k];
        const L = Math.hypot(bx - ax, bz - az);
        if (L < 0.5) continue;
        const mx = (ax + bx) / 2, mz = (az + bz) / 2;
        // richting van de hartlijn hier
        let ci2 = 0, cd = Infinity; sm.forEach((c, i) => { const d = Math.hypot(c.x - mx, c.z - mz); if (d < cd) { cd = d; ci2 = i; } });
        const c0 = sm[Math.max(0, ci2 - 1)], c1 = sm[Math.min(sm.length - 1, ci2 + 1)];
        const cl = Math.hypot(c1.x - c0.x, c1.z - c0.z) || 1;
        const cos = Math.abs(((bx - ax) * (c1.x - c0.x) + (bz - az) * (c1.z - c0.z)) / (L * cl));
        if (cos < 0.75) continue;
        const wall = new THREE.BoxGeometry(L + 0.05, PARA, 0.28);
        wall.rotateY(-Math.atan2(bz - az, bx - ax)); wall.translate(mx, top + PARA / 2, mz);
        parts.wall.push(wall);
      }
    }
    // dubbel spoor op ballast, dwarsliggers, en pijlers waar geen pand onder staat
    for (let i = 1; i < sm.length; i++) {
      const a = sm[i - 1], b = sm[i];
      const L = Math.hypot(b.x - a.x, b.z - a.z);
      if (L < 0.2) continue;
      const ux = (b.x - a.x) / L, uz = (b.z - a.z) / L, ang = -Math.atan2(uz, ux);
      const mx = (a.x + b.x) / 2, mz = (a.z + b.z) / 2;
      const half = Math.min(a.width, b.width) / 2;
      const tracks = half > 4 ? [-1.9, 1.9] : [0];
      for (const off of tracks) {
        const tx = mx - uz * off, tz = mz + ux * off;
        const bal = new THREE.BoxGeometry(L + 0.05, 0.3, 2.9); bal.rotateY(ang); bal.translate(tx, top + 0.15, tz); parts.ballast.push(bal);
        for (const r of [-0.72, 0.72]) { const rail = new THREE.BoxGeometry(L + 0.05, 0.14, 0.07); rail.rotateY(ang); rail.translate(tx - uz * r, top + 0.42, tz + ux * r); parts.rail.push(rail); }
        for (let d = 0; d < L; d += 0.65) { const sl = new THREE.BoxGeometry(0.22, 0.12, 2.5); sl.rotateY(ang); sl.translate(a.x + ux * d - uz * off, top + 0.34, a.z + uz * d + ux * off); parts.sleeper.push(sl); }
      }
    }
    // de plint: dicht met bogen en winkelpuien, behalve waar een straat onder het viaduct door loopt
    const crossing = (x, z, ux, uz) => w.segments.some(([, ax, az, bx, bz]) => {
      const dx = bx - ax, dz = bz - az, l = Math.hypot(dx, dz) || 1;
      if (Math.abs((dx * ux + dz * uz) / l) > 0.7) return false; // evenwijdig: de straat ernaast, niet eronderdoor
      const t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (l * l)));
      return Math.hypot(x - ax - dx * t, z - az - dz * t) < 6;
    });
    // welke stukjes van de hartlijn boven een straat liggen
    const xs = sm.map((c, i) => { if (!i) return false; const a = sm[i - 1], L = Math.hypot(c.x - a.x, c.z - a.z) || 1; return crossing((a.x + c.x) / 2, (a.z + c.z) / 2, (c.x - a.x) / L, (c.z - a.z) / L); });
    let acc2 = 0, archN = 0;
    for (let i = 1; i < sm.length; i++) {
      const a = sm[i - 1], b = sm[i];
      const L = Math.hypot(b.x - a.x, b.z - a.z); if (L < 0.2) continue;
      const ux = (b.x - a.x) / L, uz = (b.z - a.z) / L, mx = (a.x + b.x) / 2, mz = (a.z + b.z) / 2;
      if (xs[i]) { acc2 += L; continue; }
      const width = Math.min(a.width, b.width) - 0.3;
      const gy = w.groundAt(mx, mz), hgt = top - SLAB - gy;
      if (hgt < 2) continue;
      const blk = new THREE.BoxGeometry(L + 0.3, hgt, width); blk.rotateY(-Math.atan2(uz, ux)); blk.translate(mx, gy + hgt / 2, mz);
      parts.plinth.push(blk);
      const hw = width / 2;
      w.addObstacle([[a.x - uz * hw, a.z + ux * hw], [b.x - uz * hw, b.z + ux * hw], [b.x + uz * hw, b.z - ux * hw], [a.x + uz * hw, a.z - ux * hw]]);
      // bogen aan beide kanten, om de 6,5 meter, met een donkere pui of een verlichte etalage erin
      for (let d = (6.5 - acc2 % 6.5) % 6.5; d < L; d += 6.5) {
        const x = a.x + ux * d, z = a.z + uz * d;
        for (const sd of [-1, 1]) {
          const nx = -uz * sd, nz = ux * sd;
          const fx = x + nx * (hw + 0.02), fz = z + nz * (hw + 0.02);
          const R = 2.0, spring = hgt - R - 1.35;
          if (spring < 1.6) continue;
          const yaw = Math.atan2(nx, nz);
          const ag = new THREE.TorusGeometry(R, 0.17, 6, 18, Math.PI); ag.translate(0, spring, 0.06);
          const pl = new THREE.BoxGeometry(0.36, spring, 0.14);
          const p1 = pl.clone(); p1.translate(-R, spring / 2, 0.06); const p2 = pl.clone(); p2.translate(R, spring / 2, 0.06);
          for (const geo of [ag, p1, p2]) { geo.rotateY(yaw); geo.translate(fx, gy, fz); parts.arch.push(geo.index ? geo.toNonIndexed() : geo); }
          // pui in de boog
          const sh = new THREE.Shape(); sh.moveTo(-R + 0.2, 0); sh.lineTo(R - 0.2, 0); sh.lineTo(R - 0.2, spring); sh.absarc(0, spring, R - 0.2, 0, Math.PI, false); sh.lineTo(-R + 0.2, 0);
          const pg = new THREE.ShapeGeometry(sh, 8); pg.translate(0, 0, 0.03); pg.rotateY(yaw); pg.translate(fx, gy, fz);
          (archN++ % 3 === 0 ? parts.shop : parts.pane).push(pg);
          // reliëfpaneel boven de boog, in een lijst
          const py0 = spring + R + 0.45, ph = hgt - 0.3 - py0;
          if (ph > 0.35) {
            const fr = new THREE.BoxGeometry(3.4, ph + 0.2, 0.06); fr.translate(0, py0 + ph / 2, 0.03);
            const pn = new THREE.BoxGeometry(3.0, ph - 0.12, 0.12); pn.translate(0, py0 + ph / 2, 0.06);
            const ro = new THREE.BoxGeometry(0.5, 0.5, 0.1); ro.rotateZ(Math.PI / 4); ro.translate(R + 1.25, py0 + ph / 2, 0.05);
            for (const [geo, k] of [[fr, 'arch'], [pn, 'relief'], [ro, 'relief']]) { geo.rotateY(yaw); geo.translate(fx, gy, fz); parts[k].push(geo); }
          }
        }
      }
      acc2 += L;
    }
    // donkere kroonlijst met consoles onder de rand van het dek, bovenleidingmasten en draden
    let acc3 = 0, nextMast = 6;
    for (let i = 1; i < sm.length; i++) {
      const a = sm[i - 1], b = sm[i];
      const L = Math.hypot(b.x - a.x, b.z - a.z); if (L < 0.2) continue;
      const ux = (b.x - a.x) / L, uz = (b.z - a.z) / L, ang = -Math.atan2(uz, ux), mx = (a.x + b.x) / 2, mz = (a.z + b.z) / 2;
      const half = Math.min(a.width, b.width) / 2;
      for (const sd of [-1, 1]) {
        const nx = -uz * sd, nz = ux * sd;
        const cor = new THREE.BoxGeometry(L + 0.06, 0.4, 0.5); cor.rotateY(ang); cor.translate(mx + nx * (half + 0.1), top - 0.2, mz + nz * (half + 0.1)); parts.cornice.push(cor);
        for (let d = (1.2 - acc3 % 1.2) % 1.2; d < L; d += 1.2) {
          const c = new THREE.BoxGeometry(0.22, 0.45, 0.34); c.rotateY(ang); c.translate(a.x + ux * d + nx * (half + 0.05), top - 0.62, a.z + uz * d + nz * (half + 0.05)); parts.cornice.push(c);
        }
      }
      const MH = 5.6, mo = Math.max(1.2, half - 0.5);
      const tracks = half > 4 ? [-1.9, 1.9] : [0];
      for (const off of tracks) for (const wy of [MH - 0.8, MH - 0.35]) {
        const wr = new THREE.BoxGeometry(L + 0.05, 0.03, 0.03); wr.rotateY(ang); wr.translate(mx - uz * off, top + wy, mz + ux * off); parts.wire.push(wr);
      }
      while (nextMast < acc3 + L) {
        const d = nextMast - acc3, x = a.x + ux * d, z = a.z + uz * d;
        for (const sd of [-1, 1]) { const pole = new THREE.BoxGeometry(0.26, MH, 0.26); pole.rotateY(ang); pole.translate(x - uz * mo * sd, top + MH / 2, z + ux * mo * sd); parts.mast.push(pole); }
        const beam = new THREE.BoxGeometry(0.2, 0.28, 2 * mo + 0.3); beam.rotateY(ang); beam.translate(x, top + MH - 0.12, z); parts.mast.push(beam);
        for (const off of tracks) { const hang = new THREE.BoxGeometry(0.05, 0.75, 0.05); hang.translate(x - uz * off, top + MH - 0.6, z + ux * off); parts.mast.push(hang); }
        nextMast += 25;
      }
      acc3 += L;
    }
    // waar een straat eronderdoor loopt: een grote, vlakke boog op zware pijlers van natuursteen
    for (let i = 1; i < sm.length;) {
      if (!xs[i]) { i++; continue; }
      let j = i; while (j + 1 < sm.length && xs[j + 1]) j++;
      const S = sm[i - 1], E = sm[j], run = sm.slice(i - 1, j + 1);
      i = j + 1;
      const span = Math.hypot(E.x - S.x, E.z - S.z);
      if (span < 5 || span > 40) continue;
      const ux = (E.x - S.x) / span, uz = (E.z - S.z) / span, ang = -Math.atan2(uz, ux);
      const width = Math.min(...run.map((c) => c.width)) - 0.3;
      const gy = Math.min(w.groundAt(S.x, S.z), w.groundAt(E.x, E.z));
      const H = top - SLAB - gy;
      if (H < 3.5) continue;
      const sp = span - 0.6, p0x = S.x + ux * 0.3, p0z = S.z + uz * 0.3;
      arches.push({ x: (S.x + E.x) / 2, z: (S.z + E.z) / 2, ux, uz, span });
      const rise = Math.min(2, sp * 0.12), hs = H - 0.7 - rise;
      const Rr = (sp * sp / 4 + rise * rise) / (2 * rise), cx = sp / 2, cy = hs + rise - Rr;
      const t1 = Math.atan2(hs - cy, sp / 2), t2 = Math.PI - t1;
      // het boogveld boven de opening, dwars door het hele viaduct (dat geeft ook de onderkant van de boog)
      const sh = new THREE.Shape(); sh.moveTo(0, hs); sh.lineTo(0, H); sh.lineTo(sp, H); sh.lineTo(sp, hs); sh.absarc(cx, cy, Rr, t1, t2, false);
      const place = (geo, z0) => { geo.translate(0, 0, z0); geo.rotateY(ang); geo.translate(p0x, gy, p0z); return geo; };
      parts.plinth.push(place(new THREE.ExtrudeGeometry(sh, { depth: width, bevelEnabled: false, curveSegments: 28 }), -width / 2));
      // boogrand aan beide kanten
      const band = new THREE.Shape();
      band.moveTo(cx + Rr * Math.cos(t1), cy + Rr * Math.sin(t1)); band.absarc(cx, cy, Rr, t1, t2, false);
      band.lineTo(cx + (Rr + 0.45) * Math.cos(t2), cy + (Rr + 0.45) * Math.sin(t2)); band.absarc(cx, cy, Rr + 0.45, t2, t1, true);
      for (const z0 of [width / 2, -width / 2 - 0.12]) parts.arch.push(place(new THREE.ExtrudeGeometry(band, { depth: 0.12, bevelEnabled: false, curveSegments: 28 }), z0));
      // sluitsteen
      for (const z0 of [width / 2 + 0.06, -width / 2 - 0.06]) { const ks = new THREE.BoxGeometry(0.7, 0.75, 0.24); ks.translate(sp / 2, hs + rise + 0.25, 0); parts.relief.push(place(ks, z0)); }
      // pijlers: blokken met diepe voegen (rustica), een kern en een dekplaat
      for (const [px, pz] of [[S.x - ux * 0.6, S.z - uz * 0.6], [E.x + ux * 0.6, E.z + uz * 0.6]]) {
        const pw = width + 0.5;
        const core = new THREE.BoxGeometry(1.8, hs + 0.3, pw); core.rotateY(ang); core.translate(px, gy + (hs + 0.3) / 2, pz); parts.stoneDark.push(core);
        for (let y = 0, n = 0; y < hs - 0.3; y += 0.7, n++) {
          const blk = new THREE.BoxGeometry(1.94 + (n % 2) * 0.08, 0.6, pw + 0.14 + (n % 2) * 0.08); blk.rotateY(ang); blk.translate(px, gy + y + 0.32, pz); parts.stone.push(blk);
        }
        const cap = new THREE.BoxGeometry(2.15, 0.32, pw + 0.4); cap.rotateY(ang); cap.translate(px, gy + hs + 0.14, pz); parts.stone.push(cap);
        const hx = 0.95, hz = pw / 2 + 0.1;
        w.addObstacle([[px + ux * hx - uz * hz, pz + uz * hx + ux * hz], [px - ux * hx - uz * hz, pz - uz * hx + ux * hz], [px - ux * hx + uz * hz, pz - uz * hx - ux * hz], [px + ux * hx + uz * hz, pz + uz * hx - ux * hz]]);
      }
    }
  }
  const mats = {
    deck: concrete, wall: concrete, plinth: new THREE.MeshStandardMaterial({ color: 0xdacaaa, roughness: 0.95 }), arch: new THREE.MeshStandardMaterial({ color: 0xc2b090, roughness: 0.9 }),
    relief: new THREE.MeshStandardMaterial({ color: 0xe6d9bd, roughness: 0.85 }), cornice: new THREE.MeshStandardMaterial({ color: 0x4b4540, roughness: 0.8 }),
    stone: new THREE.MeshStandardMaterial({ color: 0x96938d, roughness: 0.95 }), stoneDark: new THREE.MeshStandardMaterial({ color: 0x5f5d59, roughness: 1 }),
    mast: new THREE.MeshStandardMaterial({ color: 0x7b4a2c, roughness: 0.75, metalness: 0.3 }), wire: new THREE.MeshStandardMaterial({ color: 0x2b2927, roughness: 0.6 }),
    pane: new THREE.MeshStandardMaterial({ color: 0x1d2328, roughness: 0.15, metalness: 0.5 }),
    shop: new THREE.MeshStandardMaterial({ color: 0xe8d9b8, emissive: 0x6b5530, emissiveIntensity: 0.5, roughness: 0.4 }),
    ballast: new THREE.MeshStandardMaterial({ color: 0x6f6a63, roughness: 1 }), rail: new THREE.MeshStandardMaterial({ color: 0x8a8580, metalness: 0.7, roughness: 0.4 }),
    sleeper: new THREE.MeshStandardMaterial({ color: 0x5a4a3c, roughness: 1 }),
  };
  const grp = new THREE.Group();
  for (const [k, geos] of Object.entries(parts)) {
    if (!geos.length) continue;
    const norm = geos.map((x) => { const y = x.index ? x.toNonIndexed() : x; for (const a of Object.keys(y.attributes)) if (a !== 'position' && a !== 'normal') y.deleteAttribute(a); return y; });
    const m = new THREE.Mesh(mergeGeometries(norm, false), mats[k]);
    m.castShadow = !['rail', 'sleeper', 'wire'].includes(k); m.receiveShadow = true;
    grp.add(m);
  }
  g.scene.add(grp);
  return { lines, arches, deck: DECK };
}

// Plek voor een pand in de plint van het viaduct: de lange zijde van de strook die het dichtst bij het adres ligt en
// naar de opgegeven straat kijkt.
const inRingV = (px, pz, r) => { let c = false; for (let i = 0, j = r.length - 1; i < r.length; j = i++) { const [xi, zi] = r[i], [xj, zj] = r[j]; if ((zi > pz) !== (zj > pz) && px < ((xj - xi) * (pz - zi)) / (zj - zi) + xi) c = !c; } return c; };
function viaductFrame(g, x, z, streetName) {
  const v = g.agniese?.viaduct;
  if (!v) return null;
  const w = g.world;
  const st = w.nearestStreet(x, z, streetName) || w.nearestStreet(x, z);
  let best = null;
  for (const { ring } of v.lines) {
    for (let i = 0; i < ring.length; i++) {
      const [ax, az] = ring[i], [bx, bz] = ring[(i + 1) % ring.length];
      const L = Math.hypot(bx - ax, bz - az); if (L < 3) continue;
      const t = Math.max(0, Math.min(1, ((x - ax) * (bx - ax) + (z - az) * (bz - az)) / (L * L)));
      const px = ax + (bx - ax) * t, pz = az + (bz - az) * t;
      let nx = (bz - az) / L, nz = -(bx - ax) / L;
      // buitenwaarts (weg van de strook)...
      if (inRingV(px + nx * 0.4, pz + nz * 0.4, ring)) { nx = -nx; nz = -nz; }
      // ...en naar de straat toe
      if (st && (st.x - px) * nx + (st.z - pz) * nz <= 0.5) continue;
      const d = Math.hypot(x - px, z - pz);
      if (!best || d < best.d) best = { d, x: px, z: pz, nx, nz, len: L };
    }
  }
  if (!best || best.d > 25) return null;
  return { x: best.x, z: best.z, y: w.heightAt(best.x + best.nx * 1.5, best.z + best.nz * 1.5), ux: -best.nz, uz: best.nx, nx: best.nx, nz: best.nz, len: best.len, yaw: Math.atan2(best.nx, best.nz) };
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
  // Café Reef zit in de plint van het viaduct, aan de kant van de Vijverhofstraat
  const f = viaductFrame(g, ...p.pos, 'Vijverhofstraat') || fac.frameAtAddress(...p.pos, 'Vijverhofstraat') || fac.frameFor(...p.pos) || nearestFacade(w, ...p.pos);
  if (!f) return null;
  fac.frames.reef = f;
  const grp = fac.group(f, 0.1);
  const W = Math.min(Math.max(3.6, f.len - 0.6), 6.0), H = 3.3;
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
  const trashSpots = [];
  g.agnieseTrash = trashSpots;
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
        for (let k = 0; k < 1 + Math.floor(rnd() * 4); k++) { const b = makeTrashBag(); const sc = 0.8 + rnd() * 0.45; b.scale.setScalar(sc); b.position.set((rnd() - 0.5) * 0.9, 0, (rnd() - 0.5) * 0.9); b.rotation.set((rnd() - 0.5) * 0.3, rnd() * 6, (rnd() - 0.5) * 0.3); item.add(b); }
        trashSpots.push(spot);
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
        for (let b = 0; b < 3; b++) { const bag = makeTrashBag(); bag.scale.setScalar(0.55); bag.position.set((rnd() - 0.5) * 0.3, 0.62 + b * 0.08, (rnd() - 0.5) * 0.4); bag.rotation.y = rnd() * 6; cart.add(bag); }
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

// ------------------------------------------------------------ vuilniszakken: glimmend plastic, onderin plat, bovenin dichtgeknoopt met twee oortjes
const BAG_GEOS = [];
function bagGeo(v) {
  if (BAG_GEOS[v]) return BAG_GEOS[v];
  const geo = new THREE.SphereGeometry(0.3, 18, 14);
  const p = geo.attributes.position;
  const sd = v * 1.7 + 0.3;
  for (let i = 0; i < p.count; i++) {
    let x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const t = (y + 0.3) / 0.6; // 0 onder, 1 boven
    // onderkant plat op de grond, de zak zakt wat uit
    if (y < -0.1) y = -0.1 + (y + 0.1) * 0.3;
    const bulge = 1 + 0.12 * (1 - Math.abs(t - 0.35) * 2.2);
    // bovenin samengeknepen tot een hals
    const pinch = t > 0.6 ? 1 - Math.pow((t - 0.6) / 0.4, 1.2) * 0.88 : 1;
    // plooien en kreukels
    const wr = 1 + 0.07 * Math.sin(Math.atan2(z, x) * (7 + v) + sd) * (0.4 + t) + 0.03 * Math.sin(y * 38 + x * 12 + sd);
    x *= bulge * pinch * wr * (1.08 - v * 0.04); z *= bulge * pinch * wr * (0.95 + v * 0.05);
    if (t > 0.6) y += (t - 0.6) * 0.18;
    p.setXYZ(i, x, y + 0.13, z);
  }
  geo.computeVertexNormals();
  // knoop en twee oortjes
  const knot = new THREE.SphereGeometry(0.04, 8, 6); knot.scale(1, 0.8, 1); knot.translate(0, 0.53, 0);
  const ears = [-1, 1].map((sx) => { const e = new THREE.ConeGeometry(0.035, 0.1, 6); e.scale(1, 1, 0.35); e.rotateZ(-sx * 1.0); e.translate(sx * 0.045, 0.56, 0); return e; });
  const all = [geo, knot, ...ears].map((x) => { const y = x.index ? x.toNonIndexed() : x; y.deleteAttribute('uv'); return y; });
  BAG_GEOS[v] = mergeGeometries(all, false);
  return BAG_GEOS[v];
}
const BAG_MATS = [];
export function makeTrashBag() {
  if (!BAG_MATS.length) {
    BAG_MATS.push(new THREE.MeshStandardMaterial({ color: 0x0e0e10, roughness: 0.22, metalness: 0.05 }));
    BAG_MATS.push(new THREE.MeshStandardMaterial({ color: 0x1a1b1e, roughness: 0.28, metalness: 0.05 }));
    BAG_MATS.push(new THREE.MeshStandardMaterial({ color: 0x45484c, roughness: 0.3, metalness: 0.05 }));
    BAG_MATS.push(new THREE.MeshStandardMaterial({ color: 0xe9e9e6, roughness: 0.35, metalness: 0 }));
  }
  const r = rnd();
  const m = new THREE.Mesh(bagGeo(Math.floor(rnd() * 3)), BAG_MATS[r < 0.5 ? 0 : r < 0.75 ? 1 : r < 0.9 ? 2 : 3]);
  m.castShadow = true; m.receiveShadow = true;
  return m;
}

// ------------------------------------------------------------ ratten die bij de vuilniszakken rondscharrelen en wegschieten als je dichtbij komt
function makeRat() {
  const grp = new THREE.Group();
  const fur = std(0x4b4038, { roughness: 0.95 }), pink = std(0xd49a94, { roughness: 0.7 }), black = std(0x050505, { roughness: 0.3 });
  const body = new THREE.Group(); grp.add(body);
  const torso = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 9), fur); torso.scale.set(1, 0.82, 1.9); torso.position.set(0, 0.065, 0); body.add(torso);
  const head = new THREE.Mesh(new THREE.ConeGeometry(0.048, 0.13, 10), fur); head.rotation.x = Math.PI / 2; head.position.set(0, 0.068, 0.17); body.add(head);
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.011, 6, 5), pink); nose.position.set(0, 0.066, 0.235); body.add(nose);
  for (const sx of [-1, 1]) {
    const ear = new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 6), pink); ear.scale.set(1, 1, 0.35); ear.position.set(sx * 0.03, 0.105, 0.13); body.add(ear);
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.008, 6, 5), black); eye.position.set(sx * 0.026, 0.083, 0.185); body.add(eye);
  }
  const legs = [];
  for (const [lx, lz] of [[-0.045, 0.08], [0.045, 0.08], [-0.05, -0.07], [0.05, -0.07]]) { const l = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.04, 0.03), pink); l.position.set(lx, 0.02, lz); grp.add(l); legs.push(l); }
  const tail = new THREE.Group(); tail.position.set(0, 0.05, -0.12); grp.add(tail);
  const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.02, -0.03, -0.12), new THREE.Vector3(-0.03, -0.045, -0.25), new THREE.Vector3(0.02, -0.045, -0.36)]);
  tail.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 12, 0.007, 5), pink));
  grp.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  grp.userData = { body, tail, legs };
  return grp;
}
function buildRatten(g) {
  const w = g.world;
  const spots = (g.agnieseTrash || []).slice();
  if (!spots.length) return [];
  const free = (x, z) => !w.insideBuilding(x, z) && w.classAt(x, z) !== 'water';
  const rats = [];
  const n = Math.min(26, spots.length * 2);
  for (let i = 0; i < n; i++) {
    const home = spots[Math.floor(rnd() * spots.length)];
    const m = makeRat();
    const x = home[0] + (rnd() - 0.5) * 2, z = home[1] + (rnd() - 0.5) * 2;
    m.position.set(x, w.groundAt(x, z), z); m.rotation.y = rnd() * 6;
    g.scene.add(m);
    rats.push({ m, home, tx: x, tz: z, state: 'sniff', t: rnd() * 2, speed: 0, ph: rnd() * 6, flee: 0 });
  }
  g.updaters.add((dt) => {
    const p = g.player;
    for (const r of rats) {
      const m = r.m, d = Math.hypot(m.position.x - p.x, m.position.z - p.z);
      if (d > 90) { m.visible = false; continue; }
      m.visible = true;
      r.t -= dt; r.ph += dt;
      // schrikken: hard weg van je af
      if (d < 3.2 && r.flee <= 0) {
        const ax = m.position.x - p.x, az = m.position.z - p.z, al = Math.hypot(ax, az) || 1;
        r.tx = m.position.x + (ax / al) * 5; r.tz = m.position.z + (az / al) * 5;
        if (!free(r.tx, r.tz)) { r.tx = m.position.x + (az / al) * 4; r.tz = m.position.z - (ax / al) * 4; }
        r.state = 'run'; r.speed = 4.2; r.flee = 1.6;
      }
      r.flee -= dt;
      if (r.state === 'sniff') {
        // snuffelen: kop op en neer, staart zwiept
        m.userData.body.rotation.x = Math.sin(r.ph * 9) * 0.06;
        if (r.t <= 0) {
          for (let k = 0; k < 6; k++) {
            const a = rnd() * 6.283, rr = 0.6 + rnd() * 3;
            const tx = r.home[0] + Math.cos(a) * rr, tz = r.home[1] + Math.sin(a) * rr;
            if (free(tx, tz)) { r.tx = tx; r.tz = tz; break; }
          }
          r.state = 'run'; r.speed = 1.4 + rnd() * 1.4;
        }
      } else {
        const dx = r.tx - m.position.x, dz = r.tz - m.position.z, dl = Math.hypot(dx, dz);
        if (dl < 0.15) { r.state = 'sniff'; r.t = 0.6 + rnd() * 2.5; }
        else {
          const step = Math.min(dl, r.speed * dt);
          const nx2 = m.position.x + (dx / dl) * step, nz2 = m.position.z + (dz / dl) * step;
          if (free(nx2, nz2)) { m.position.x = nx2; m.position.z = nz2; } else { r.state = 'sniff'; r.t = 0.3; }
          m.position.y = w.groundAt(m.position.x, m.position.z);
          const want = Math.atan2(dx, dz);
          let da = want - m.rotation.y; da = Math.atan2(Math.sin(da), Math.cos(da));
          m.rotation.y += da * Math.min(1, dt * 14);
          // trippelen
          m.userData.body.position.y = Math.abs(Math.sin(r.ph * 28)) * 0.012;
          m.userData.legs.forEach((l, k) => { l.position.y = 0.02 + Math.max(0, Math.sin(r.ph * 28 + (k % 2) * Math.PI)) * 0.012; });
        }
      }
      m.userData.tail.rotation.y = Math.sin(r.ph * (r.state === 'run' ? 14 : 3)) * 0.35;
    }
  });
  return rats;
}
