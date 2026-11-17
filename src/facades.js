// Gedetailleerde gevels en aankleding voor de plekken met missies en interacties.
import * as THREE from 'three';
import { buildPrimosa } from './primosa.js';
import { makeInteriorWindow } from './interior-window.js';
import { signTexture } from './textures.js';
import { makeCart, makeStringLights, makeVlaai } from './props.js';
import { pointInRing } from './world.js';
import { buildShops } from './shops.js';
import { Parts, buildAwning, signFrame, windowFrame, doorParts, parasolParts, terraceSetParts, flagGeometry } from './gevelbouw.js';

const std = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.7, ...extra });
const at = (m, x, y, z) => { m.position.set(x, y, z); return m; };

export class Facades {
  constructor(game) {
    this.g = game;
    this.world = game.world;
    this.scene = game.scene;
    this.signMats = [];
    this.frames = {};
  }

  // Zoekt de gevel van het gebouw op het adres die naar de straat kijkt.
  frameFor(x, z) {
    const w = this.world;
    let fp = null;
    for (const i of w.nearbyFootprints(x, z)) if (pointInRing(x, z, w.footprints[i].ring)) fp = w.footprints[i];
    if (!fp) {
      let bd = 25;
      for (const i of w.nearbyFootprints(x, z)) {
        const f = w.footprints[i];
        const cx = (f.minX + f.maxX) / 2, cz = (f.minZ + f.maxZ) / 2;
        const d = Math.hypot(cx - x, cz - z);
        if (d < bd) { bd = d; fp = f; }
      }
    }
    const street = w.nearestStreet(x, z);
    if (!fp || !street) return null;
    const r = fp.ring;
    let best = null, bd = Infinity;
    for (let i = 0; i < r.length; i++) {
      const [ax, az] = r[i], [bx, bz] = r[(i + 1) % r.length];
      const len = Math.hypot(bx - ax, bz - az);
      if (len < 3) continue;
      const mx = (ax + bx) / 2, mz = (az + bz) / 2;
      // hoe open is het aan de buitenkant van deze gevel (straat of plein, geen ander pand)?
      let nx0 = (bz - az) / len, nz0 = -(bx - ax) / len;
      if (pointInRing(mx + nx0 * 0.5, mz + nz0 * 0.5, r)) { nx0 = -nx0; nz0 = -nz0; }
      let open = 0;
      for (const t of [0.2, 0.5, 0.8]) for (const o of [3, 6, 9]) {
        const px = ax + (bx - ax) * t + nx0 * o, pz = az + (bz - az) * t + nz0 * o;
        if (!w.insideBuilding(px, pz) && !w.blocked(px, pz)) open++;
      }
      const d = Math.hypot(mx - street.x, mz - street.z) * 0.15 - open * 2 - Math.min(len, 12) * 0.2;
      if (d < bd) { bd = d; best = { ax, az, bx, bz, len, mx, mz }; }
    }
    if (!best) return null;
    let ux = (best.bx - best.ax) / best.len, uz = (best.bz - best.az) / best.len;
    let nx = uz, nz = -ux;
    // normaal moet van het gebouw af wijzen
    if (pointInRing(best.mx + nx * 0.5, best.mz + nz * 0.5, r)) { nx = -nx; nz = -nz; }
    // lokale x-as zo kiezen dat x = rechts gezien vanaf de straat
    ux = -nz; uz = nx;
    const y = w.heightAt(best.mx + nx * 1.5, best.mz + nz * 1.5);
    return { x: best.mx, z: best.mz, y, ux, uz, nx, nz, len: best.len, yaw: Math.atan2(nx, nz) };
  }

  // Gevelplek voor één adres: de gevel van het pand die bij het adrespunt en de straat hoort,
  // met het midden op de plek van het adres (handig als meerdere winkels in één pand zitten).
  frameAtAddress(x, z, streetName = null) {
    const w = this.world;
    let fp = null;
    for (const i of w.nearbyFootprints(x, z)) if (pointInRing(x, z, w.footprints[i].ring)) fp = w.footprints[i];
    if (!fp) {
      let bd = 15;
      for (const i of w.nearbyFootprints(x, z)) {
        const f = w.footprints[i];
        if (f.extra) continue;
        const cx = (f.minX + f.maxX) / 2, cz = (f.minZ + f.maxZ) / 2;
        const d = Math.hypot(cx - x, cz - z);
        if (d < bd) { bd = d; fp = f; }
      }
    }
    const street = w.nearestStreet(x, z, streetName || undefined) || w.nearestStreet(x, z);
    if (!fp || !street) return null;
    const r = fp.ring;
    let best = null, bs = Infinity;
    for (let i = 0; i < r.length; i++) {
      const [ax, az] = r[i], [bx, bz] = r[(i + 1) % r.length];
      const len = Math.hypot(bx - ax, bz - az);
      if (len < 2.5) continue;
      let nx0 = (bz - az) / len, nz0 = -(bx - ax) / len;
      const mx = (ax + bx) / 2, mz = (az + bz) / 2;
      if (pointInRing(mx + nx0 * 0.5, mz + nz0 * 0.5, r)) { nx0 = -nx0; nz0 = -nz0; }
      let open = 0;
      for (const t of [0.2, 0.5, 0.8]) for (const o of [3, 6]) {
        if (!w.insideBuilding(ax + (bx - ax) * t + nx0 * o, az + (bz - az) * t + nz0 * o)) open++;
      }
      if (open < 3) continue; // gevel tegen een ander pand
      const t = Math.max(0, Math.min(1, ((x - ax) * (bx - ax) + (z - az) * (bz - az)) / (len * len)));
      const px = ax + (bx - ax) * t, pz = az + (bz - az) * t;
      const dAddr = Math.hypot(px - x, pz - z);
      const dStreet = Math.hypot(px - street.x, pz - street.z);
      const score = dAddr + dStreet * 0.25 - open * 0.8;
      if (score < bs) { bs = score; best = { ax, az, bx, bz, len, t, nx0, nz0 }; }
    }
    if (!best) return this.frameFor(x, z);
    const { ax, az, bx, bz, len } = best;
    // midden op het adres, maar niet over de hoek van het pand heen
    const margin = Math.min(2.6, len / 2);
    const t = Math.max(margin / len, Math.min(1 - margin / len, best.t));
    const cx = ax + (bx - ax) * t, cz = az + (bz - az) * t;
    const nx = best.nx0, nz = best.nz0;
    const ux = -nz, uz = nx;
    const avail = 2 * Math.min(t * len, (1 - t) * len);
    const y = w.heightAt(cx + nx * 1.5, cz + nz * 1.5);
    return { x: cx, z: cz, y, ux, uz, nx, nz, len: Math.max(2.6, avail), yaw: Math.atan2(nx, nz) };
  }

  group(frame, out = 0.06) {
    const g = new THREE.Group();
    g.position.set(frame.x + frame.nx * out, frame.y, frame.z + frame.nz * out);
    g.rotation.y = frame.yaw;
    this.scene.add(g);
    return g;
  }

  // Gevelbord: een plaat met een opliggende lijst en, bij grotere borden, zwanenhalslampjes die er 's avonds op schijnen.
  sign(parent, text, { w = 4, h = 0.8, x = 0, y = 3.4, z = 0.05, bg, fg, font, sub, border, glow = true } = {}) {
    const tex = signTexture(text, { bg, fg, font, sub, border, w: 1024, h: Math.round((1024 * h) / w) });
    const mat = new THREE.MeshStandardMaterial({ map: tex, emissiveMap: tex, emissive: glow ? 0xffffff : 0x000000, emissiveIntensity: 0, roughness: 0.5 });
    if (glow) this.signMats.push(mat);
    const p = new Parts();
    const spots = signFrame(p, { w, h, x, y, z, lamps: glow });
    p.build(parent);
    if (spots.length) {
      if (!this.bulbMat) {
        this.bulbMat = new THREE.MeshStandardMaterial({ color: 0xfff1d6, emissive: 0xffd9a0, emissiveIntensity: 0.05 });
        this.signMats.push({ isWindow: true, mat: this.bulbMat });
      }
      const geo = new THREE.SphereGeometry(0.035, 8, 6);
      for (const [lx, ly, lz] of spots) { const b = new THREE.Mesh(geo, this.bulbMat); b.position.set(lx, ly, lz); parent.add(b); }
    }
    const face = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
    face.position.set(x, y, z + 0.047);
    parent.add(face);
    return face;
  }

  // Markies (uitvalscherm) met doek, volant, cassette en armen; zie gevelbouw.js.
  awning(parent, opts = {}) { return buildAwning(parent, opts); }

  // Etalageruit met een kijkje naar binnen (zie interior-window.js): type bepaalt de inrichting.
  // Rond de ruit zit een kozijn met diepte, roeden, een vensterbank en een plint.
  shopWindow(parent, { w = 2.6, h = 1.8, x = 0, y = 0.6, type = 'winkel', seed = 1 } = {}) {
    const p = new Parts();
    windowFrame(p, { w, h, x, y });
    p.build(parent);
    const glass = makeInteriorWindow(w, h, type, seed);
    glass.position.set(x, y + h / 2, 0.06);
    this.signMats.push({ interior: glass });
    parent.add(glass);
  }

  door(parent, { x = 0, color = 0x3b2a1e } = {}) {
    const p = new Parts();
    doorParts(p, { x, color });
    p.build(parent);
  }

  // ------------------------------------------------------------ alle plekken

  build() {
    const pois = Object.fromEntries(this.world.meta.pois.map((p) => [p.id, p]));
    const F = (id) => {
      if (!pois[id]) return null;
      const f = this.frameFor(...pois[id].pos);
      this.frames[id] = f;
      return f;
    };
    // plekken zonder eigen gevel, wel met een plek voor de mensen die er een missie hebben
    F('rox'); F('hofplein'); F('noordplein'); F('eudokiaplein');
    // winkels, cafés en restaurants op hun eigen adres (shops.js)
    buildShops(this, pois);
  }

  // Terras voor de gevel: tafels met bistrostoelen, glazen en een parasol. Per tafel twee à drie meshes.
  terrace(f, n) {
    const w = this.world;
    // nooit op de rijbaan, het fietspad of een parkeervak: alleen op stoep of plein
    const bad = new Set(['rijbaan', 'fietspad', 'parkeer']);
    const free = (x, z) => !w.insideBuilding(x, z) && !w.blocked(x, z) && !bad.has(w.classAt(x, z));
    for (let i = 0; i < n; i++) {
      const along = (i - (n - 1) / 2) * 2.6;
      let x = 0, z = 0, ok = false;
      for (let out = 1.7 + (i % 2) * 2.2; out >= 1.5 && !ok; out -= 0.3) {
        x = f.x + f.ux * along + f.nx * out; z = f.z + f.uz * along + f.nz * out;
        ok = free(x, z) && free(x + f.nx * 1.15, z + f.nz * 1.15) && free(x + f.ux * 1.1, z + f.uz * 1.1) && free(x - f.ux * 1.1, z - f.uz * 1.1);
      }
      if (!ok) continue;
      const g = new THREE.Group();
      g.position.set(x, w.groundAt(x, z), z);
      g.rotation.y = f.yaw + i * 0.7;
      const p = new Parts();
      terraceSetParts(p);
      parasolParts(p, { r: 1.5, top: 2.7, drop: 0.5 });
      p.build(g);
      this.scene.add(g);
    }
  }

  busStop(f) {
    const w = this.world;
    const s = w.nearestStreet(f.x + f.nx * 4, f.z + f.nz * 4);
    if (!s) return;
    const x = f.x + f.ux * 6 + f.nx * 3, z = f.z + f.uz * 6 + f.nz * 3;
    if (w.insideBuilding(x, z)) return;
    const g = new THREE.Group();
    g.position.set(x, w.groundAt(x, z), z);
    g.rotation.y = f.yaw;
    const glass = new THREE.MeshStandardMaterial({ color: 0x9fb8c8, transparent: true, opacity: 0.35, roughness: 0.05 });
    const back = new THREE.Mesh(new THREE.BoxGeometry(3.2, 2.2, 0.03), glass);
    back.position.set(0, 1.2, -0.7);
    const roof = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.08, 1.6), std(0x37474f, { metalness: 0.5 }));
    roof.position.y = 2.35;
    const bench = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.05, 0.4), std(0x607d8b));
    bench.position.set(0, 0.48, -0.45);
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.8, 8), std(0xaaaaaa, { metalness: 0.7 }));
    pole.position.set(2.2, 1.4, 0.4);
    const bord = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.03), new THREE.MeshStandardMaterial({ map: signTexture('H', { w: 128, h: 128, bg: '#1565c0', fg: '#fff', font: '800 100px Inter, sans-serif' }) }));
    bord.position.set(2.2, 2.6, 0.42);
    g.add(back, roof, bench, pole, bord);
    {
      // staanders, zijruiten in een lijst, pootjes onder het bankje, een dakrand en een bordje met de vertrektijden
      const p = new Parts(), staal = 0x37474f;
      for (const sx of [-1.62, 1.62]) for (const sz of [-0.72, 0.62]) p.box(0.06, 2.35, 0.06, staal, sx, 1.175, sz, 'metaal');
      p.box(3.3, 0.05, 0.05, staal, 0, 0.12, -0.72, 'metaal').box(3.3, 0.05, 0.05, staal, 0, 2.28, -0.72, 'metaal');
      p.box(3.5, 0.05, 0.06, 0x263238, 0, 2.33, 0.82, 'metaal').box(3.5, 0.05, 0.06, 0x263238, 0, 2.33, -0.82, 'metaal');
      for (const sx of [-1.0, 1.0]) p.box(0.05, 0.46, 0.34, staal, sx, 0.23, -0.45, 'metaal');
      p.box(0.5, 0.7, 0.04, 0xf3f1ea, 1.2, 1.5, -0.66).box(0.56, 0.76, 0.03, staal, 1.2, 1.5, -0.68, 'metaal');
      p.build(g);
      for (const sx of [-1.62, 1.62]) { const side = new THREE.Mesh(new THREE.BoxGeometry(0.03, 2.0, 1.3), glass); side.position.set(sx, 1.25, -0.05); g.add(side); }
    }
    g.traverse((o) => { if (o.isMesh) o.castShadow = true; });
    this.scene.add(g);
  }

  // Voetbalveld van FC Gulpen op het grasveld van het sportpark.
  buildPitch([px, pz]) {
    const w = this.world;
    const fields = (w.ground.grassFields || []).map((ring) => {
      const pts = [];
      for (let i = 0; i < ring.length; i += 2) pts.push([ring[i], ring[i + 1]]);
      let a = 0, cx = 0, cz = 0;
      for (let i = 0; i < pts.length - 1; i++) a += pts[i][0] * pts[i + 1][1] - pts[i + 1][0] * pts[i][1];
      pts.forEach(([x, z]) => { cx += x; cz += z; });
      return { pts, area: Math.abs(a) / 2, cx: cx / pts.length, cz: cz / pts.length };
    }).filter((f) => f.area > 5500 && f.area < 10000 && Math.hypot(f.cx - px, f.cz - pz) < 260)
      .sort((a, b) => Math.hypot(a.cx - px, a.cz - pz) - Math.hypot(b.cx - px, b.cz - pz));
    const field = fields[0];
    let cx, cz, ang, L = 100, W = 64;
    if (field) {
      // oriëntatie: langste zijde van het veld
      let best = 0;
      for (let i = 0; i < field.pts.length - 1; i++) {
        const [ax, az] = field.pts[i], [bx, bz] = field.pts[i + 1];
        const l = Math.hypot(bx - ax, bz - az);
        if (l > best) { best = l; ang = Math.atan2(bx - ax, bz - az); }
      }
      // afmetingen binnen het veld
      const ux = Math.sin(ang), uz = Math.cos(ang);
      let minA = Infinity, maxA = -Infinity, minB = Infinity, maxB = -Infinity;
      for (const [x, z] of field.pts) {
        const a = (x - field.cx) * ux + (z - field.cz) * uz, b = -(x - field.cx) * uz + (z - field.cz) * ux;
        minA = Math.min(minA, a); maxA = Math.max(maxA, a); minB = Math.min(minB, b); maxB = Math.max(maxB, b);
      }
      L = Math.min(100, maxA - minA - 8); W = Math.min(64, maxB - minB - 8);
      const ca = (minA + maxA) / 2, cb = (minB + maxB) / 2;
      cx = field.cx + ux * ca - uz * cb; cz = field.cz + uz * ca + ux * cb;
    } else {
      cx = px + 40; cz = pz; ang = 0;
    }
    this.pitch = { cx, cz, ang, L, W };
    const g = new THREE.Group();
    g.position.set(cx, w.heightAt(cx, cz), cz);
    g.rotation.y = ang;
    this.scene.add(g);

    // gras met maaibanen
    const c = document.createElement('canvas');
    c.width = 1024; c.height = 660;
    const ctx = c.getContext('2d');
    for (let i = 0; i < 12; i++) { ctx.fillStyle = i % 2 ? '#4f8a35' : '#5a9a3c'; ctx.fillRect(0, (i * 660) / 12, 1024, 660 / 12 + 1); }
    ctx.strokeStyle = '#f4f4f0'; ctx.lineWidth = 4;
    const sx = 1024 / W, sz = 660 / L; // let op: canvas x = breedte, y = lengte
    ctx.strokeRect(4, 4, 1016, 652);
    ctx.beginPath(); ctx.moveTo(0, 330); ctx.lineTo(1024, 330); ctx.stroke();
    ctx.beginPath(); ctx.arc(512, 330, 9.15 * sx, 0, Math.PI * 2); ctx.stroke();
    for (const end of [0, 1]) {
      const y0 = end ? 660 - 16.5 * sz : 0, y1 = end ? 660 - 5.5 * sz : 0;
      ctx.strokeRect(512 - 20.15 * sx, y0, 40.3 * sx, 16.5 * sz);
      ctx.strokeRect(512 - 9.16 * sx, end ? 660 - 5.5 * sz : 0, 18.32 * sx, 5.5 * sz);
      ctx.beginPath(); ctx.arc(512, end ? 660 - 11 * sz : 11 * sz, 3, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.fill();
      void y1;
    }
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    const turf = new THREE.Mesh(new THREE.PlaneGeometry(W, L, 24, 32), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.95, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -6 }));
    turf.rotation.x = -Math.PI / 2;
    // het veld volgt het terrein
    const pos = turf.geometry.attributes.position;
    const base = w.heightAt(cx, cz);
    for (let i = 0; i < pos.count; i++) {
      const lx = pos.getX(i), lz = -pos.getY(i);
      const wx = cx + Math.cos(ang) * lx + Math.sin(ang) * lz;
      const wz = cz - Math.sin(ang) * lx + Math.cos(ang) * lz;
      pos.setZ(i, w.heightAt(wx, wz) - base + 0.06);
    }
    turf.geometry.computeVertexNormals();
    turf.receiveShadow = true;
    g.add(turf);

    // doelen
    const white = std(0xffffff, { roughness: 0.4 });
    const netMat = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.25, side: THREE.DoubleSide, wireframe: false });
    this.goals = [];
    for (const end of [-1, 1]) {
      const goal = new THREE.Group();
      const gz = end * (L / 2 - 0.1);
      const postGeo = new THREE.CylinderGeometry(0.06, 0.06, 2.44, 8);
      for (const gx of [-3.66, 3.66]) {
        const p = new THREE.Mesh(postGeo, white);
        p.position.set(gx, 1.22, 0);
        goal.add(p);
      }
      const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 7.32, 8), white);
      bar.rotation.z = Math.PI / 2; bar.position.y = 2.44;
      const net = new THREE.Mesh(new THREE.BoxGeometry(7.32, 2.44, 1.6), netMat);
      net.position.set(0, 1.22, end * 0.8);
      goal.add(bar, net);
      goal.position.set(0, w.heightAt(cx, cz + gz) - base, gz);
      goal.traverse((o) => { if (o.isMesh) o.castShadow = true; });
      g.add(goal);
      this.goals.push(goal);
    }
    // lichtmasten
    for (const [lx, lz] of [[-W / 2 - 3, -L / 4], [-W / 2 - 3, L / 4], [W / 2 + 3, -L / 4], [W / 2 + 3, L / 4]]) {
      const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.2, 16, 8), std(0x9e9e9e, { metalness: 0.6 }));
      mast.position.set(lx, 8, lz);
      const head = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.8, 0.3), new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0 }));
      head.position.set(lx, 16, lz);
      this.signMats.push(head.material);
      mast.castShadow = true;
      g.add(mast, head);
    }
    // clubbord
    const bord = new THREE.Group();
    bord.position.set(-W / 2 - 4, 0, 0);
    bord.rotation.y = Math.PI / 2;
    this.sign(bord, 'FC Gulpen', { w: 6, h: 1.2, y: 2.6, bg: '#ffffff', fg: '#1a237e', font: '800 170px "Baloo 2", sans-serif', border: '#c62828' });
    for (const sxp of [-2.8, 2.8]) {
      const p = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.6, 6), std(0x777777));
      p.position.set(sxp, 1.3, 0);
      bord.add(p);
    }
    g.add(bord);
  }

  pitchToWorld(lx, lz) {
    const p = this.pitch;
    return [p.cx + Math.cos(p.ang) * lx + Math.sin(p.ang) * lz, p.cz - Math.sin(p.ang) * lx + Math.cos(p.ang) * lz];
  }

  // Sint-Petruskerk: een kruis op de toren (de toren zelf komt uit de 3D BAG).
  // (De wijzerplaten zijn weg: de toren werd niet altijd goed herkend en dan staken ze half door het dak.)
  buildChurch() {
    const w = this.world;
    // torenlocatie volgens TOP10NL (Kadaster), in lokale coördinaten
    const tx = -177.0, tz = 53.2;
    let tower = null;
    for (const i of w.nearbyFootprints(tx, tz)) if (pointInRing(tx, tz, w.footprints[i].ring)) tower = w.footprints[i];
    if (!tower) return;
    const cx = (tower.minX + tower.maxX) / 2, cz = (tower.minZ + tower.maxZ) / 2;
    const hw = (tower.maxX - tower.minX) / 2, hd = (tower.maxZ - tower.minZ) / 2;
    const top = tower.top;
    // kruis met haan bovenop
    const gold = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 1, roughness: 0.3 });
    const cross = new THREE.Group();
    cross.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 3, 8), gold), 0, 1.5, 0));
    cross.add(at(new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.1, 0.1), gold), 0, 2.2, 0));
    const haan = new THREE.Mesh(new THREE.ConeGeometry(0.25, 0.5, 4), gold);
    haan.rotation.z = Math.PI / 2;
    haan.position.set(0, 3.1, 0);
    cross.add(haan);
    cross.position.set(cx, top, cz);
    this.scene.add(cross);
    this.church = { x: cx, z: cz, top };
  }

  // Het Mariamonument op de top van de Gulperberg (ruim tien meter, beton).
  buildMaria([x, z]) {
    const w = this.world;
    const g = new THREE.Group();
    g.position.set(x, w.heightAt(x, z), z);
    const concrete = new THREE.MeshStandardMaterial({ color: 0xc9c4b8, roughness: 0.92 });
    const steps = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 3.6, 0.6, 8), concrete);
    steps.position.y = 0.3;
    const ped = new THREE.Mesh(new THREE.BoxGeometry(2.2, 4, 2.2), concrete);
    ped.position.y = 2.6;
    const robe = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 1.15, 4.6, 16), concrete);
    robe.position.y = 6.9;
    const shoulders = new THREE.Mesh(new THREE.SphereGeometry(0.8, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), concrete);
    shoulders.position.y = 9.2;
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.42, 16, 12), concrete);
    head.position.y = 9.85;
    const veil = new THREE.Mesh(new THREE.ConeGeometry(0.62, 1.2, 16, 1, true), concrete);
    veil.position.y = 9.75;
    const hands = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.6, 0.25), concrete);
    hands.position.set(0, 8.4, 0.85);
    const crown = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.04, 6, 24), new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 1, roughness: 0.3, emissive: 0x4a3600, emissiveIntensity: 0.4 }));
    crown.rotation.x = Math.PI / 2;
    crown.position.y = 10.45;
    g.add(steps, ped, robe, shoulders, head, veil, hands, crown);
    g.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    // het beeld kijkt uit over het dorp (richting de Markt)
    g.rotation.y = Math.atan2(-x, -z);
    this.scene.add(g);
    // botsing: het monument is een obstakel
    const ring = [];
    for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; ring.push([x + Math.cos(a) * 3.4, z + Math.sin(a) * 3.4]); }
    w.addObstacle(ring);
  }

  // Marktkramen van de Hubertusmarkt rond de Markt. Geeft een functie terug om ze weer op te ruimen.
  marketStalls(n = 18) {
    const w = this.world;
    const ok = ['klinkers', 'voetpad', 'erf', 'verhard_open', 'parkeer'];
    const placed = [];
    const group = new THREE.Group();
    const cols = [['#c62828', '#ffffff'], ['#1565c0', '#ffffff'], ['#2e7d32', '#f1e6c8'], ['#f9a825', '#ffffff'], ['#6d4c41', '#efe3c8']];
    for (let i = 0; i < 600 && placed.length < n; i++) {
      const a = Math.random() * Math.PI * 2, r = 8 + Math.random() * 55;
      const x = Math.cos(a) * r + 15, z = Math.sin(a) * r;
      if (!ok.includes(w.classAt(x, z)) || w.insideBuilding(x, z) || w.blocked(x, z)) continue;
      if (placed.some(([px, pz]) => Math.hypot(px - x, pz - z) < 5)) continue;
      const st = w.nearestStreet(x, z);
      const yaw = st ? Math.atan2(st.x - x, st.z - z) : 0;
      const stall = new THREE.Group();
      const c = cols[placed.length % cols.length];
      const table = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.08, 1.1), std(0x8d6e63));
      table.position.y = 0.85;
      const cloth = new THREE.Mesh(new THREE.BoxGeometry(2.62, 0.5, 1.12), std(new THREE.Color(c[0]).getHex()));
      cloth.position.y = 0.58;
      const goods = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.18, 0.8), std([0xd9a441, 0x8bc34a, 0xbf360c, 0x795548][placed.length % 4]));
      goods.position.y = 0.98;
      stall.add(table, cloth, goods);
      for (const sx of [-1.25, 1.25]) for (const sz of [-0.5, 0.5]) {
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 2.3, 6), std(0xbdbdbd, { metalness: 0.6 }));
        pole.position.set(sx, 1.15, sz);
        stall.add(pole);
      }
      const roofG = new THREE.Group();
      roofG.position.set(0, 2.3, 0);
      this.awning(roofG, { w: 2.8, depth: 1.4, y: 0, colors: c, stripes: 8, stall: true });
      roofG.children.forEach((m) => { m.position.z -= 0.65; });
      stall.add(roofG);
      stall.position.set(x, w.groundAt(x, z), z);
      stall.rotation.y = yaw;
      stall.traverse((o) => { if (o.isMesh) o.castShadow = true; });
      group.add(stall);
      placed.push([x, z]);
    }
    this.scene.add(group);
    return () => this.scene.remove(group);
  }

  setNight(t) {
    for (const m of this.signMats) {
      if (m.interior) m.interior.userData.setNight(t);
      else if (m.isWindow) m.mat.emissiveIntensity = 0.05 + t * 1.2;
      else m.emissiveIntensity = t * 0.9;
    }
  }
}
