// Rotterdam Centraal, niet te uitgebreid maar wel met de vorm:
//  - de hal aan het Stationsplein met het grote, schuine puntdak (boven roestvrij staal, onder hout) dat naar de
//    stad wijst, een glazen gevel en de oude letters CENTRAAL STATION;
//  - een glazen passage door naar de noordkant (Proveniersplein);
//  - de grote, lichte perronkap over de sporen, met perrons en rails eronder.
// De omtrek van de hal en de passage is die van het pand in de 3D BAG (2013); de hoogtes (punt ongeveer 26 m,
// achterkant 15 m) en de maten van de perronkap (250 x 105 m) zijn geschat naar foto's en de luchtfoto.
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

const RD = (w, x, y) => [x - w.meta.origin.x, -(y - w.meta.origin.y)];

export function buildCentraal(g) {
  const w = g.world;
  const ring = w.meta.station;
  if (!ring || ring.length < 4) return null;
  const P = (x, y) => RD(w, x, y);
  // as van het pand: van de noordkant (Proveniersplein) naar de zuidkant (Stationsplein)
  const north = P(91840, 437888), south = P(91906, 437656);
  const al = Math.hypot(south[0] - north[0], south[1] - north[1]);
  const ax = [(south[0] - north[0]) / al, (south[1] - north[1]) / al]; // richting de stad
  const tr = [-ax[1], ax[0]]; // langs de sporen
  const base = w.groundAt(...P(91900, 437640));
  const parts = { steel: [], wood: [], glass: [], frame: [], kap: [], kapFrame: [], col: [], perron: [], ballast: [], rail: [], letters: [] };

  // ---- de hal: het schuine puntdak
  // dakvlak in bovenaanzicht (RD): achter laag tegen de perronkap, voor hoog met de punt boven het plein
  const roofPts = [P(91840, 437764), P(91960, 437770), P(91950, 437668), P(91914, 437634), P(91856, 437682)];
  const roofH = [15.0, 15.5, 23.0, 26.5, 21.5]; // hoogte boven het plein per punt
  const T = 1.3; // dikte van het dak
  {
    const n = roofPts.length;
    const top = roofPts.map(([x, z], i) => new THREE.Vector3(x, base + roofH[i], z));
    const bot = roofPts.map(([x, z], i) => new THREE.Vector3(x, base + roofH[i] - T, z));
    // het vlak is niet helemaal plat: een waaier vanuit het midden houdt het netjes
    const cx = roofPts.reduce((s, p) => s + p[0], 0) / n, cz = roofPts.reduce((s, p) => s + p[1], 0) / n, ch = roofH.reduce((s, h) => s + h, 0) / n;
    const ct = new THREE.Vector3(cx, base + ch + 0.6, cz), cb = new THREE.Vector3(cx, base + ch - T + 0.6, cz);
    const tri = (arr, a, b, c) => arr.push(a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z);
    const st = [], wd = [], ed = [];
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      tri(st, ct, top[j], top[i]);
      tri(wd, cb, bot[i], bot[j]);
      // rand: staal, en aan de voorkant (de punt) de rand van het hout
      tri(ed, top[i], top[j], bot[j]); tri(ed, top[i], bot[j], bot[i]);
    }
    const mk = (arr) => { const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(arr, 3)); geo.computeVertexNormals(); return geo; };
    // de draairichting hangt af van de volgorde van de punten; beide kanten tekenen we met DoubleSide
    parts.steel.push(mk(st), mk(ed));
    parts.wood.push(mk(wd));
    // hoogte van de onderkant van het dak boven een punt (voor de gevel eronder)
    var underAt = (x, z) => {
      // vlak door drie punten: achter-links, punt, voor-rechts is te grof; neem het gewogen gemiddelde naar afstand
      let sw = 0, sh = 0;
      roofPts.forEach(([px, pz], i) => { const d = Math.max(1, Math.hypot(px - x, pz - z)); const k = 1 / (d * d); sw += k; sh += k * (roofH[i] - T); });
      return base + sh / sw;
    };
  }

  // ---- glazen gevel van de hal en de passage, op de omtrek uit de BAG
  const hallCut = (x, z) => (x - north[0]) * ax[0] + (z - north[1]) * ax[1] > 128; // ten zuiden van de achterkant van de hal
  for (let i = 0; i < ring.length; i++) {
    const [x1, z1] = ring[i], [x2, z2] = ring[(i + 1) % ring.length];
    const L = Math.hypot(x2 - x1, z2 - z1); if (L < 1) continue;
    const mx = (x1 + x2) / 2, mz = (z1 + z2) / 2;
    const inHall = hallCut(mx, mz);
    const h = inHall ? underAt(mx, mz) - base : 7.5;
    const yaw = Math.atan2(z2 - z1, x2 - x1);
    const pane = new THREE.BoxGeometry(L, h, 0.12); pane.rotateY(-yaw); pane.translate(mx, base + h / 2, mz); parts.glass.push(pane);
    const nM = Math.max(1, Math.round(L / 2.4));
    for (let k = 0; k <= nM; k++) {
      const t = k / nM, px = x1 + (x2 - x1) * t, pz = z1 + (z2 - z1) * t;
      const hh = inHall ? underAt(px, pz) - base : 7.5;
      const m = new THREE.BoxGeometry(0.12, hh, 0.22); m.translate(px, base + hh / 2, pz); parts.frame.push(m);
    }
    for (const y of [3.2, 7.4]) { if (y >= h) continue; const b = new THREE.BoxGeometry(L, 0.14, 0.22); b.rotateY(-yaw); b.translate(mx, base + y, mz); parts.frame.push(b); }
  }
  // plat dak van de passage
  {
    const pass = ring.filter(([x, z]) => !hallCut(x, z));
    if (pass.length >= 3) {
      const shape = new THREE.Shape(ring.map(([x, z]) => new THREE.Vector2(x, -z)));
      const roof = new THREE.ShapeGeometry(shape); roof.rotateX(-Math.PI / 2); roof.translate(0, base + 7.5, 0);
      parts.frame.push(roof);
    }
  }

  // ---- de letters CENTRAAL STATION op de voorgevel, onder de punt
  {
    const a = P(91876, 437647), b = P(91937, 437666);
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const c = document.createElement('canvas'); c.width = 2048; c.height = 192;
    const x = c.getContext('2d');
    const draw = () => { x.clearRect(0, 0, 2048, 192); x.fillStyle = '#f4f1e8'; x.font = '700 150px "Helvetica Neue", Arial, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('CENTRAAL STATION', 1024, 100); };
    draw();
    const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
    if (document.fonts?.ready) document.fonts.ready.then(() => { draw(); tex.needsUpdate = true; });
    const mat = new THREE.MeshStandardMaterial({ map: tex, transparent: true, alphaTest: 0.3, emissive: 0xfff4dc, emissiveMap: tex, emissiveIntensity: 0.4, side: THREE.DoubleSide });
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(L * 0.8, L * 0.8 * 192 / 2048), mat);
    const yaw = Math.atan2(b[1] - a[1], b[0] - a[0]);
    const mx = (a[0] + b[0]) / 2, mz = (a[1] + b[1]) / 2;
    sign.rotation.y = -yaw; // naar het plein toe
    sign.position.set(mx + ax[0] * 0.5, base + Math.min(16, underAt(mx, mz) - base - 1.6), mz + ax[1] * 0.5);
    g.scene.add(sign);
    parts._sign = sign;
  }

  // ---- de perronkap over de sporen
  const C = P(91852, 437816);
  const KL = 250, KW = 105;
  // de sporen liggen hoger dan het plein (op een dijk); de hoogtekaart weet hoe hoog
  const samples = [-60, -20, 20, 60].flatMap((d) => [-30, 0, 30].map((o) => w.groundAt(C[0] + tr[0] * d + ax[0] * o, C[1] + tr[1] * d + ax[1] * o))).sort((a, b) => a - b);
  const tb = Math.max(base, samples[Math.floor(samples.length / 2)]);
  const KH = Math.max(15.5, tb - base + 9.5);
  {
    const kap = new THREE.PlaneGeometry(KL, KW);
    kap.rotateX(-Math.PI / 2);
    kap.rotateY(-Math.atan2(tr[1], tr[0]));
    kap.translate(C[0], base + KH, C[1]);
    parts.kap.push(kap);
    // randbalk en een raster van liggers
    const yawT = Math.atan2(tr[1], tr[0]);
    for (const s of [-1, 1]) {
      const e = new THREE.BoxGeometry(KL, 0.8, 0.6); e.rotateY(-yawT); e.translate(C[0] + ax[0] * s * KW / 2, base + KH, C[1] + ax[1] * s * KW / 2); parts.kapFrame.push(e);
      const f = new THREE.BoxGeometry(0.6, 0.8, KW); f.rotateY(-yawT); f.translate(C[0] + tr[0] * s * KL / 2, base + KH, C[1] + tr[1] * s * KL / 2); parts.kapFrame.push(f);
    }
    for (let d = -KL / 2 + 12.5; d < KL / 2; d += 12.5) { const b = new THREE.BoxGeometry(0.25, 0.4, KW); b.rotateY(-yawT); b.translate(C[0] + tr[0] * d, base + KH - 0.3, C[1] + tr[1] * d); parts.kapFrame.push(b); }
    // perrons en sporen, kolommen op de perrons
    const PERRONS = [-36, -12, 12, 36]; // dwars op de sporen, vanaf het midden
    for (const o of PERRONS) {
      const pc = [C[0] + ax[0] * o, C[1] + ax[1] * o];
      const pr = new THREE.BoxGeometry(KL - 30, 0.9, 9); pr.rotateY(-yawT); pr.translate(pc[0], tb + 0.45, pc[1]); parts.perron.push(pr);
      w.addObstacle([-1, 1].flatMap((s) => [[pc[0] + tr[0] * s * (KL - 30) / 2 + ax[0] * 4.5 * (s > 0 ? 1 : -1), pc[1] + tr[1] * s * (KL - 30) / 2 + ax[1] * 4.5 * (s > 0 ? 1 : -1)], [pc[0] + tr[0] * s * (KL - 30) / 2 - ax[0] * 4.5 * (s > 0 ? 1 : -1), pc[1] + tr[1] * s * (KL - 30) / 2 - ax[1] * 4.5 * (s > 0 ? 1 : -1)]]));
      for (let d = -KL / 2 + 25; d < KL / 2 - 20; d += 25) { const cl = new THREE.CylinderGeometry(0.35, 0.35, base + KH - tb - 0.9, 10); cl.translate(pc[0] + tr[0] * d, tb + 0.9 + (base + KH - tb - 0.9) / 2, pc[1] + tr[1] * d); parts.col.push(cl); }
    }
    // tussen de perrons twee sporen
    for (const o of [-48, -24, 0, 24, 48]) for (const so of [-2.4, 2.4]) {
      const tc = [C[0] + ax[0] * (o + so), C[1] + ax[1] * (o + so)];
      if (Math.abs(o) === 48 && Math.sign(so) === Math.sign(o)) continue;
      const bl = new THREE.BoxGeometry(KL + 40, 0.25, 3); bl.rotateY(-yawT); bl.translate(tc[0], tb + 0.12, tc[1]); parts.ballast.push(bl);
      for (const r of [-0.72, 0.72]) { const rl = new THREE.BoxGeometry(KL + 40, 0.14, 0.08); rl.rotateY(-yawT); rl.translate(tc[0] + ax[0] * r, tb + 0.32, tc[1] + ax[1] * r); parts.rail.push(rl); }
    }
  }

  // ---- materialen en samenvoegen
  const kapTex = (() => {
    const c = document.createElement('canvas'); c.width = 256; c.height = 256;
    const x = c.getContext('2d');
    x.fillStyle = 'rgba(220,232,240,0.55)'; x.fillRect(0, 0, 256, 256);
    x.fillStyle = 'rgba(40,60,90,0.85)'; for (let i = 0; i < 4; i++) x.fillRect(i * 64 + 6, 6, 52, 52); // zonnepanelen in een rij
    x.strokeStyle = 'rgba(90,100,110,0.9)'; x.lineWidth = 4; for (let i = 0; i <= 4; i++) { x.beginPath(); x.moveTo(i * 64, 0); x.lineTo(i * 64, 256); x.stroke(); x.beginPath(); x.moveTo(0, i * 64); x.lineTo(256, i * 64); x.stroke(); }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(KL / 12, KW / 12);
    return t;
  })();
  const mats = {
    steel: new THREE.MeshStandardMaterial({ color: 0xc9ced3, metalness: 0.75, roughness: 0.32, side: THREE.DoubleSide }),
    wood: new THREE.MeshStandardMaterial({ color: 0xb07a4a, roughness: 0.75, side: THREE.DoubleSide }),
    glass: new THREE.MeshStandardMaterial({ color: 0xcfe2ec, metalness: 0.25, roughness: 0.05, transparent: true, opacity: 0.3, depthWrite: false }),
    frame: new THREE.MeshStandardMaterial({ color: 0x8a9096, metalness: 0.5, roughness: 0.45, side: THREE.DoubleSide }),
    kap: new THREE.MeshStandardMaterial({ map: kapTex, transparent: true, depthWrite: false, roughness: 0.3, metalness: 0.2, side: THREE.DoubleSide }),
    kapFrame: new THREE.MeshStandardMaterial({ color: 0xe8eaec, roughness: 0.5 }),
    col: new THREE.MeshStandardMaterial({ color: 0xf2f3f4, roughness: 0.5 }),
    perron: new THREE.MeshStandardMaterial({ color: 0x9a9690, roughness: 0.9 }),
    ballast: new THREE.MeshStandardMaterial({ color: 0x6e675e, roughness: 1 }),
    rail: new THREE.MeshStandardMaterial({ color: 0x8c8a86, metalness: 0.7, roughness: 0.4 }),
  };
  const grp = new THREE.Group();
  for (const [k, geos] of Object.entries(parts)) {
    if (!Array.isArray(geos) || !geos.length || !mats[k]) continue;
    const norm = geos.map((x) => { const y = x.index ? x.toNonIndexed() : x; if (k !== 'kap' && y.attributes.uv) y.deleteAttribute('uv'); if (!y.attributes.normal) y.computeVertexNormals(); return y; });
    const m = new THREE.Mesh(mergeGeometries(norm, false), mats[k]);
    m.castShadow = !['kap', 'glass', 'rail'].includes(k); m.receiveShadow = true;
    if (k === 'kap' || k === 'glass') m.renderOrder = 2;
    grp.add(m);
  }
  g.scene.add(grp);
  return { group: grp, center: C };
}
