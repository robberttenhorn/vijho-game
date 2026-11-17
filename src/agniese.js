// Missies in de Agniesebuurt (Rotterdam), tussen Hofplein, Noordplein, Eudokiaplein en Bergweg.
// Ludiek en grof: een overdreven, satirisch beeld van de buurt. Alle personen in de missies zijn verzonnen.
// Rotterdamse woorden komen uit openbare woordenlijsten (Wikipedia, webwoordenboek.nl, OPEN Rotterdam en andere);
// nog laten nakijken door een echte Rotterdammer.
import * as THREE from 'three';
import { startGyros } from './skills2.js';
import { startParking } from './skills.js';
import { startSambal, startKaraoke, startBugs, startBoules, startSub, startKlopcode, startFrituur } from './agniese-skills.js';
import { makeJunkie, makeRat } from './agniese-wereld.js';

// Rotterdamse zin met Nederlandse vertaling
const R = (text, nl) => ({ text, nl });
const std = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.7, ...extra });

// emmer met twintig liter groen frituurvet, met een kippenpoot die bovendrijft
function makeVetEmmer() {
  const g = new THREE.Group();
  const pail = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.14, 0.32, 16, 1, true), std(0xb0b6ba, { metalness: 0.5, roughness: 0.4, side: THREE.DoubleSide }));
  pail.position.y = 0.16; g.add(pail);
  const bottom = new THREE.Mesh(new THREE.CircleGeometry(0.14, 16), std(0x8f9599)); bottom.rotation.x = -Math.PI / 2; bottom.position.y = 0.005; g.add(bottom);
  const fat = new THREE.Mesh(new THREE.CircleGeometry(0.162, 18), std(0x6b6a1e, { roughness: 0.15, metalness: 0.2 })); fat.rotation.x = -Math.PI / 2; fat.position.y = 0.28; g.add(fat);
  const bone = new THREE.Mesh(new THREE.CapsuleGeometry(0.018, 0.08, 4, 6), std(0xc9a24a)); bone.rotation.z = Math.PI / 2.4; bone.position.set(0.04, 0.012, 0); fat.add(bone);
  bone.rotation.x = Math.PI / 2;
  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.008, 6, 20, Math.PI), std(0x555555, { metalness: 0.7 })); handle.position.y = 0.32; g.add(handle);
  // druipers langs de rand
  for (let i = 0; i < 5; i++) { const d = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.08 + Math.random() * 0.08, 0.006), std(0x6b6a1e, { roughness: 0.2 })); const a = i * 1.3; d.position.set(Math.sin(a) * 0.162, 0.26, Math.cos(a) * 0.162); d.rotation.y = a; g.add(d); }
  g.userData.fat = fat;
  return g;
}
// grijze container met een bord VET erop en vetvlekken eromheen
function makeVetContainer() {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.15, 0.9), std(0x5f6b62, { roughness: 0.6 })); body.position.y = 0.6; g.add(body);
  const lid = new THREE.Mesh(new THREE.BoxGeometry(1.36, 0.08, 0.96), std(0x3e4741)); lid.position.y = 1.22; lid.rotation.x = -0.25; lid.position.z = -0.08; g.add(lid);
  const c = document.createElement('canvas'); c.width = 256; c.height = 128; const x = c.getContext('2d');
  x.fillStyle = '#f2c94c'; x.fillRect(0, 0, 256, 128); x.fillStyle = '#1b1b1b'; x.font = '900 72px "Baloo 2", sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('VET', 128, 58);
  x.font = '600 20px Inter, sans-serif'; x.fillText('alleen frituurvet!', 128, 104);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.35), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.6 })); sign.position.set(0, 0.75, 0.452); g.add(sign);
  for (let i = 0; i < 4; i++) { const v = new THREE.Mesh(new THREE.CircleGeometry(0.25 + Math.random() * 0.3, 14), std(0x4d4a16, { roughness: 0.1, metalness: 0.2 })); v.rotation.x = -Math.PI / 2; v.position.set((Math.random() - 0.5) * 1.8, 0.012 + i * 0.002, 0.6 + Math.random() * 0.6); g.add(v); }
  for (const sx of [-0.5, 0.5]) { const wh = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.06, 12), std(0x111111)); wh.rotation.z = Math.PI / 2; wh.position.set(sx, 0.09, -0.35); g.add(wh); }
  g.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  return g;
}

// stapel frikandelbroodjes op een bakplaat (elke botsing of zwerver kost er een)
function makeBroodjesTray() {
  const g = new THREE.Group();
  g.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.02, 0.34), std(0x9e9e9e, { metalness: 0.6 })), {}));
  g.userData.layers = [];
  for (let r = 0; r < 2; r++) for (let k = 0; k < 4; k++) {
    const b = new THREE.Group();
    const dough = new THREE.Mesh(new THREE.CapsuleGeometry(0.045, 0.16, 4, 10), std(0xd9a35a, { roughness: 0.6 }));
    dough.rotation.z = Math.PI / 2; b.add(dough);
    for (let s = -1; s <= 1; s++) { const cut = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.012, 0.06), std(0x8d4a2a)); cut.position.set(s * 0.05, 0.043, 0); cut.rotation.y = 0.6; b.add(cut); }
    b.position.set(-0.17 + k * 0.115, 0.06 + r * 0.09, (r ? 0 : 0.08) - 0.04);
    g.add(b);
    g.userData.layers.push(b);
  }
  return g;
}

// stukje rotzooi om op te ruimen (vuilniszak, blikje, pizzadoos, oude schoen)
function makeTrash(kind) {
  const g = new THREE.Group();
  if (kind === 0) { const b = new THREE.Mesh(new THREE.IcosahedronGeometry(0.3, 1), std(0x111111, { roughness: 0.3 })); b.scale.y = 0.85; b.position.y = 0.26; g.add(b); }
  else if (kind === 1) { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.2, 10), std(0xc62828, { metalness: 0.7, roughness: 0.3 })); c.rotation.z = Math.PI / 2; c.position.y = 0.06; g.add(c); }
  else if (kind === 2) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.05, 0.42), std(0xc8a46a)); p.position.y = 0.03; g.add(p); }
  else { const s = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.12, 0.32), std(0x5d4037)); s.position.y = 0.06; g.add(s); }
  return g;
}

// Parkeerplekken langs de stoep van een straat: om de zes meter, aan beide kanten, net binnen de rand van de rijbaan.
function curbSpots(w, name) {
  const p = w.streetPath(name).map(([x, z]) => [x, z]);
  const out = [];
  if (p.length < 2) return out;
  const road = (c) => c === 'rijbaan' || c === 'parkeer' || c === 'klinkers';
  let acc = 0;
  for (let k = 1; k < p.length; k++) {
    const [ax, az] = p[k - 1], [bx, bz] = p[k];
    const L = Math.hypot(bx - ax, bz - az);
    if (L < 1) { acc += L; continue; }
    const ux = (bx - ax) / L, uz = (bz - az) / L;
    for (let d = 6 - (acc % 6); d < L; d += 6) {
      const px = ax + ux * d, pz = az + uz * d;
      for (const side of [-1, 1]) {
        // een parkeerstrook (BGT 'parkeer') naast de rijbaan, of anders net binnen de rand van de rijbaan
        let edge = 0, p0 = null, p1 = null;
        for (let o = 0.5; o < 9; o += 0.25) {
          const c = w.classAt(px - uz * o * side, pz + ux * o * side);
          if (c === 'parkeer') { if (p0 === null) p0 = o; p1 = o; }
          if (!road(c)) break;
          edge = o;
        }
        let off;
        if (p0 !== null && p1 - p0 >= 1.2) off = (p0 + p1) / 2;
        else if (edge >= 2.8) off = edge - 1.1;
        else continue; // te smal om te parkeren
        const x = px - uz * off * side, z = pz + ux * off * side;
        if (w.insideBuilding(x, z)) continue;
        out.push({ x, z, heading: Math.atan2(ux, uz), lot: 'vijverhof', parallel: true });
      }
    }
    acc += L;
  }
  // niet vlak bij de kruisingen aan het begin en eind
  return out.filter((s) => Math.hypot(s.x - p[0][0], s.z - p[0][1]) > 10 && Math.hypot(s.x - p.at(-1)[0], s.z - p.at(-1)[1]) > 10);
}

// Een paar geparkeerde auto's weghalen rond een punt, zodat er vakken vrij zijn om in te parkeren
// (in de Vijverhofstraat staat anders alles vol).
function freeParking(g, near, n = 6, r = 70) {
  const cars = g.cars;
  if (!cars?.batches) return;
  const spots = (g.world.parkingSpots || []).map((s) => ({ s, d: Math.hypot(s.x - near[0], s.z - near[1]) })).filter((q) => q.d < r).sort((a, b) => a.d - b.d);
  const kill = new Set();
  for (const { s } of spots) {
    if (kill.size >= n) break;
    const c = cars.cars.find((k) => k.parked && !k.mesh && !kill.has(k) && Math.hypot(k.x - s.x, k.z - s.z) < 1.5);
    if (c) kill.add(c);
  }
  if (!kill.size) return;
  for (const b of Object.values(cars.batches)) b.cars = b.cars.filter((c) => !kill.has(c));
  cars.cars = cars.cars.filter((c) => !kill.has(c));
  cars.refreshBatches(true);
}

// ------------------------------------------------------------ opzet

export function setupAgniese(m, g, add) {
  const w = g.world;
  const poi = (id) => w.meta.pois.find((p) => p.id === id);
  const spotFor = (id, out = 2.4, side = 0) => {
    const f = g.facades.frames[id];
    if (f) return w.resolve(f.x + f.nx * out + (f.ux || 0) * side, f.z + f.nz * out + (f.uz || 0) * side, 0.5);
    const p = poi(id);
    return p ? w.spotNear(...p.pos) : null;
  };
  const S = (id, out, side) => spotFor(id, out, side);
  { const s = S('rox', 2.6, 3.2); if (s) add('rox', 'Developer van ROX', s, { shirt: 0x263238, pants: 0x1b1b1b, hair: 0x3e2723, glasses: true, beard: true, sleeves: 'long' }); }
  { const s = S('dikkemic', 2.6, -1.2); if (s) add('waard', 'Gastheer van Dikke Mic', s, { shirt: 0x6a1b9a, pants: 0x111111, hair: 0x111111, apron: 0x111111 }); }
  { const s = S('mooieboules', 2.6); if (s) add('boules', 'Gastvrouw van Mooie Boules', s, { shirt: 0x2e7d32, pants: 0x263238, hair: 0xd7b56d, female: true, hairStyle: 'bun', apron: 0xf5f0e6 }); }
  { const s = S('nas', 2.8); if (s) add('nasmw', 'Medewerker van de NAS', s, { shirt: 0xef6c00, pants: 0x37474f, hair: 0x5d4037, coat: 0xef6c00 }); }
  { const s = S('silvia', 2.6); if (s) add('silvia', 'Achter de toonbank bij Silvia', s, { shirt: 0xfdd835, pants: 0x1b5e20, hair: 0x111111, female: true, hairStyle: 'bun', apron: 0xc62828, skin: 0x8d5524 }); }
  { const s = S('sevinc', 2.6); if (s) add('sevinc', 'De pizzabakker van Sevinc', s, { shirt: 0xffffff, pants: 0x222222, hair: 0x111111, apron: 0xd84315, beard: true, skin: 0xc68642 }); }
  { const s = S('albertheijn', 3.2, -1.6); if (s) add('ahmw', 'Bakker van de Albert Heijn', s, { shirt: 0x00a0e2, pants: 0x263238, hair: 0xa1887f, apron: 0xffffff, hat: 'chef' }); }
  // Kippie zit ook in het winkelcentrum: de frituurbaas staat even buiten, met een schort vol vetvlekken
  { const s = S('albertheijn', 3.2, 2.2); if (s) add('kippie', 'Frituurbaas van Kippie', s, { shirt: 0xc62828, pants: 0x263238, hair: 0x2b1d14, apron: 0xe9dcae, hat: 'cap', hatColor: 0xffd54f, build: 1.4, beard: true }); }
  { const s = S('subway', 2.6, 1.2); if (s) add('subway', 'Medewerker van Subway', s, { shirt: 0x00843d, pants: 0x1b1b1b, hair: 0x3e2723, hat: 'cap', hatColor: 0xffc20e }); }
  // vaste klant van Café Reef, op een bierkrat voor de dichtgetimmerde deur
  { const s = S('reef', 2.4, 2.0); if (s) add('reefklant', 'Vaste klant van Café Reef', s, { shirt: 0x5d4037, pants: 0x37474f, hair: 0x9e9e9e, beard: true, coat: 0x3e2723, hat: 'cap', hatColor: 0x1d3b4f, build: 1.2 }); }
  // wijkagent op de hoek van de Teilingerstraat
  { const s = S('subway', 3.4, -4); if (s) add('agent', 'Wijkagent', s, { shirt: 0x1a237e, pants: 0x101433, hair: 0x3e2723, hat: 'cap', hatColor: 0x101433, sleeves: 'long' }); }
  // stadsreiniger met bezem halverwege de Teilingerstraat
  {
    const p = w.streetPath('Teilingerstraat');
    if (p.length > 1) { const [x, z] = p[Math.floor(p.length * 0.55)]; add('veger', 'Stadsreiniger', w.resolve(x + 3, z + 3, 0.5), { shirt: 0xff6f00, pants: 0x263238, hair: 0x9e9e9e, coat: 0xff6f00, hat: 'cap', hatColor: 0xff6f00 }); }
  }
  // parkeerplekken langs de stoep van de Vijverhofstraat (fileparkeren); de BGT heeft hier geen losse vakken
  {
    const spots = curbSpots(w, 'Vijverhofstraat');
    w.parkingSpots.push(...spots);
    m.vijverhofSpots = spots.length;
    // buurvrouw die een plek zoekt, op de stoep halverwege de vakken
    const mid = spots[Math.floor(spots.length / 2)];
    const p = w.streetPath('Vijverhofstraat');
    const at = mid ? [mid.x, mid.z] : p.length > 1 ? p[Math.floor(p.length * 0.3)] : null;
    if (at) add('parkeer', 'Buurvrouw met sleutels', w.resolve(at[0] + 2, at[1] + 2, 0.5), { shirt: 0xad1457, pants: 0x37474f, hair: 0xbdbdbd, female: true, hairStyle: 'bun', glasses: true, coat: 0x6d4c41 });
  }
  m.agnieseTrash = null;
}

// ------------------------------------------------------------ lijst

export function agnieseItems(n) {
  return [
    { id: 'rox', npc: n.rox, title: 'Bugs bij ROX', place: 'ROX Digital Agency, Vijverhofstraat 47', desc: 'De webwinkel van een klant gaat zo live, maar zit vol bugs. Plet ze voordat de klant belt.' },
    { id: 'nachtopvang', npc: n.nasmw, title: 'Nachtopvang', place: 'NAS, Vijverhofstraat 35-37', desc: 'Het wordt donker. Haal de vaste slapers op en breng ze in een stoet naar de nachtopvang.' },
    { id: 'dealers', npc: n.agent, title: 'Dealers pakken', place: 'Teilingerstraat', desc: 'Drie dealers op scooters. Rij ze klem en tik ze aan voordat ze ervandoor gaan.' },
    { id: 'kippie', npc: n.kippie, title: 'Frituurvet verversen', place: 'Kippie, winkelcentrum Eudokiaplein', desc: 'Vis de troep uit de groene frituur van Kippie en breng het oude vet naar de vetcontainer. De ratten ruiken het.' },
    { id: 'frikandel', npc: n.ahmw, title: 'Frikandelbroodjes voor de borrel', place: 'Albert Heijn, winkelcentrum Eudokiaplein', desc: 'Breng de frikandelbroodjes naar ROX. Pas op voor botsingen en voor hongerige zwervers.' },
    { id: 'sambal', npc: n.silvia, title: 'Sambal-uitdaging', place: 'Afhaalrestaurant Silvia, Teilingerstraat', desc: 'Roti met sambal, steeds heter. Eet alles op zonder vuur te spuwen.' },
    { id: 'kebab', npc: n.sevinc, title: 'Kebab snijden', place: 'Sevinc Pizza, Teilingerstraat', desc: 'Snijd alleen het krokante vlees van de rol.' },
    { id: 'inparkeren', npc: n.parkeer, title: 'Inparkeren zonder deuk', place: 'Vijverhofstraat', desc: 'Parkeer drie keer in een vak in de Vijverhofstraat. Eén deuk en het is mislukt.' },
    { id: 'rotzooi', npc: n.veger, title: 'Rotzooi opruimen', place: 'Teilingerstraat', desc: 'Raap de rotzooi op in de Teilingerstraat voordat de vuilniswagen langskomt.' },
    { id: 'karaoke', npc: n.waard, title: 'Karaoke in Dikke Mic', place: 'Dikke Mic, Vijverhofstraat 47', desc: 'Zing het buurtlied op de maat. Daarna een pilsje (en wordt het avond of weer ochtend).', repeat: true },
    { id: 'subway', npc: n.subway, title: 'Broodje beleggen', place: 'Subway, Teilingerstraat 83B', desc: 'Lunchrush bij de Subway. Beleg de broodjes in de volgorde van het bonnetje.' },
    { id: 'reef', npc: n.reefklant, title: 'De klopcode van Café Reef', place: 'Café Reef, Vijverhofstraat 26', desc: 'Het café is dichtgetimmerd, maar binnen zit nog iemand. Klop de geheime code na.' },
    { id: 'boules', npc: n.boules, title: 'Jeu de boules', place: 'Mooie Boules, Vijverhofstraat 45', desc: 'Gooi je ballen dichter bij het butje dan de tegenstander.' },
  ].filter((it) => it.npc);
}

export const AGNIESE_MISSION_OF = {
  rox: 'rox', nasmw: 'nachtopvang', agent: 'dealers', ahmw: 'frikandel', silvia: 'sambal', sevinc: 'kebab',
  parkeer: 'inparkeren', veger: 'rotzooi', waard: 'karaoke', boules: 'boules', subway: 'subway', reefklant: 'reef', kippie: 'kippie',
};

// ------------------------------------------------------------ missies

export const agnieseHandlers = {
  // ---------------------------------------------- ROX Digital Agency
  async rox(npc, N, ui, g) {
    const a = await ui.dialog(N, [
      'Hé! Jij komt als geroepen. De webwinkel van een klant gaat over een minuut live, en hij zit vol bugs.',
      'De klant zelf stuurt intussen berichtjes. "Kan het logo groter?" Niet op klikken, anders moet je bellen. En bellen duurt bij deze klant drie kwartier.',
      R('Niet lullen maar poetsen: plet die bugs voordat ze bij de knop "Bestel nu" zijn.', 'Minder praten, meer doen: plet die bugs voordat ze bij de knop "Bestel nu" zijn.'),
    ], ['Laptop open!', 'Ik ben geen developer']);
    if (a !== 0) { await ui.dialog(N, ['Geen developer? Dan word je projectleider. Die hoeven ook niks te kunnen.']); return; }
    if (g.mode === 'car') g.exitCar();
    g.setMode('walk');
    this.setActive('rox', 'Bugs bij ROX', 'Tik de bugs plat voordat ze bij de knop "Bestel nu" zijn. Niet op de berichtjes van de klant tikken.', '');
    const r = await startBugs(g, { need: 15, limit: 45 });
    if (!r || this.active?.id !== 'rox') return;
    if (r.ok) {
      await ui.dialog(N, [
        r.leaks ? `Live! Met ${r.leaks} ${r.leaks === 1 ? 'bugje' : 'bugjes'} in productie, maar dat noemen we "features".` : 'Live, zonder één bug! Dat is ons nog nooit gelukt.',
        'De klant belt: hij vindt het logo nog steeds te klein. Ik zet het in de backlog. Onderaan.',
      ]);
      this.complete('rox', 'Bugvrij live bij ROX!');
    } else {
      await ui.dialog(N, [r.down ? '500 Error. De klant belt. Ik neem niet op. Jij ook niet.' : 'Deadline gemist. Nou ja, we zeggen gewoon dat het aan de hosting lag.']);
      this.fail('De site ging niet goed live.');
    }
  },

  // ---------------------------------------------- NAS: nachtopvang
  async nasmw(npc, N, ui, g) {
    if (this.active?.id === 'nachtopvang') { await ui.dialog(N, [`Nog ${g.followers.length - g.followersJoined()} slapers. Over een paar minuten gaat de deur dicht!`]); return; }
    const a = await ui.dialog(N, [
      R('Faka mattie. Om tien uur gaat de nachtopvang dicht, en mijn vaste slapers hebben geen osso. Ze zwerven nog door de buurt.', 'Hoe is het, vriend? Om tien uur gaat de nachtopvang dicht, en mijn vaste slapers hebben geen huis. Ze zwerven nog door de buurt.'),
      R('Eentje staat bij de Albert Heijn te bedelen, eentje slaapt in een portiek, en Kees heeft weer een snee in z\'n neus.', 'Eentje staat bij de Albert Heijn te bedelen, eentje slaapt in een portiek, en Kees is weer dronken.'),
      'Haal ze op en breng ze in een stoet hierheen. Lopend, ze kunnen je fiets niet bijhouden. En niet ademen in hun buurt.',
    ], ['Ik haal ze op', 'Ik heb een gevoelige neus']);
    if (a !== 0) { await ui.dialog(N, ['Een gevoelige neus? In de Vijverhofstraat? Dan ben je verkeerd verhuisd.']); return; }
    if (g.mode === 'car') g.exitCar();
    g.setMode('walk');
    const n = g.world.isMobile ? 4 : 5;
    let i = 0;
    g.startPolonaise(n, { minD: 40, maxD: 180, color: '#ef6c00', glyph: 'Z', factory: () => makeJunkie(100 + i++),
      joinLines: ['Krijg ik soep?', 'Ik loop mee als er een pijppie in zit.', 'Is het bed schoon? Maakt niet uit.', 'Wacht, m\'n winkelwagentje!', 'Ik was hier eerst!', 'Hebben ze daar een does?'] });
    this.setActive('nachtopvang', 'Nachtopvang', 'De slapers staan als oranje punten op de kaart. Loop erheen, dan sloffen ze achter je aan. Breng ze naar de NAS voordat de deur dichtgaat.', `0 / ${n} slapers`);
    const f = g.facades.frames.nas;
    const dest = f ? g.world.resolve(f.x + f.nx * 3, f.z + f.nz * 3, 0.6) : [npc.pos.x, npc.pos.z];
    g.setDestination(dest, 300, async () => {
      g.stopPolonaise();
      await ui.dialog(N, ['Allemaal binnen! Vierentwintig bedden, vijf snurkers en één die in zijn slaap zingt. Bedankt.', 'Wil je een bakkie? Het is wel van vanochtend.']);
      this.complete('nachtopvang', 'Iedereen veilig binnen!');
    }, (msg) => { g.stopPolonaise(); this.fail(msg || 'De deur is al dicht. Ze slapen vannacht weer in het portiek.'); }, {
      require: () => (g.followersJoined() >= n ? null : `Je hebt pas ${g.followersJoined()} van de ${n} slapers.`),
      violate: () => (g.mode !== 'walk' ? 'Lopend! Ze kunnen je niet bijhouden.' : null),
    });
  },

  // ---------------------------------------------- dealers pakken
  async agent(npc, N, ui, g) {
    const dealers = (g.agniese?.dealers || []).filter((d) => d.kind === 'scooter');
    if (dealers.length < 3) { await ui.dialog(N, ['Rustig vandaag. Kom later terug.']); return; }
    const a = await ui.dialog(N, [
      R('Ik ben de juut van deze wijk. En ik ben het zat.', 'Ik ben de politieagent van deze wijk. En ik ben het zat.'),
      'Die gasten op de scooters rijden de hele dag rondjes. Met koffers achterop. Ze bezorgen geen pizza, dat weet ik zeker.',
      R('Ze tikken een doezoe per dag. Ik verdien een donnie per uur. Dat is toch niet eerlijk, mattie?', 'Ze verdienen duizend euro per dag. Ik verdien tien euro per uur. Dat is toch niet eerlijk, vriend?'),
      'Pak ze voor mij: rij ernaast en tik ze aan. Drie stuks in twee minuten. Ik zou het zelf doen, maar mijn fiets heeft een lekke band. Al sinds 2019.',
    ], ['Ik pak ze!', 'Ik koop er liever wat']);
    if (a !== 0) { await ui.dialog(N, ['Dat heb ik niet gehoord. Doorlopen.']); return; }
    if (g.mode === 'car') g.exitCar();
    g.setMode('bike');
    const targets = dealers.slice(0, 3);
    targets.forEach((d) => { d.caught = false; d.flee = true; d.grp.visible = true; });
    const marks = targets.map((d) => ({ x: d.grp.position.x, z: d.grp.position.z, color: '#e53935', glyph: '$', done: false }));
    g.tempMarkers = marks;
    this.setActive('dealers', 'Dealers pakken', 'De dealers staan als rode punten op de kaart. Rij ernaast en tik ze aan (binnen twee meter). Drie stuks in twee minuten.', '0 / 3 gepakt');
    const act = this.active;
    let left = 120, got = 0;
    const done = (ok) => {
      g.updaters.delete(upd);
      targets.forEach((d) => { d.flee = false; });
      g.tempMarkers = [];
      g.ui.timer(null);
      if (this.active !== act) return;
      if (ok) {
        ui.dialog(N, ['Drie dealers in de cel! Eentje had een barkie in zijn pata verstopt. Een ander had een koffer vol frikandelbroodjes. Die nemen we in beslag. Voor het onderzoek.']).then(() => this.complete('dealers', 'Dealers gepakt!'));
      } else this.fail('Ze zijn ervandoor. Morgen rijden ze weer rondjes.');
    };
    const upd = (dt) => {
      if (this.active !== act) { done(false); return; }
      left -= dt;
      g.ui.timer(`${Math.max(0, Math.ceil(left))} s`);
      targets.forEach((d, i) => {
        if (d.caught) return;
        marks[i].x = d.grp.position.x; marks[i].z = d.grp.position.z;
        if (Math.hypot(d.grp.position.x - g.player.x, d.grp.position.z - g.player.z) < 2.2) {
          d.caught = true; marks[i].done = true; got++;
          d.grp.visible = false; // afgevoerd
          g.sfx?.play('whistle');
          g.ui.toast(['Gepakt! "Ik bezorg alleen pizza, meneer!"', 'Gepakt! "Dit is niet mijn koffer!"', 'Gepakt! "Ik ken mijn rechten! Welke rechten?"'][got - 1] || 'Gepakt!', 2200);
          this.progress(`${got} / 3 gepakt`);
          if (got >= 3) done(true);
        }
      });
      if (left <= 0) done(false);
    };
    g.updaters.add(upd);
    act.cleanup = () => { g.updaters.delete(upd); targets.forEach((d) => { d.flee = false; }); g.tempMarkers = []; g.ui.timer(null); };
    // na de missie komen de dealers vanzelf terug (ze zitten nooit lang vast)
    setTimeout(() => targets.forEach((d) => { d.caught = false; d.grp.visible = true; }), 200000);
  },

  // ---------------------------------------------- Albert Heijn: frikandelbroodjes naar ROX
  async ahmw(npc, N, ui, g) {
    const a = await ui.dialog(N, [
      'Vrijdagmiddagborrel bij ROX aan de Vijverhofstraat. Ze hebben acht frikandelbroodjes besteld, warm uit de oven.',
      'Breng jij ze? Let op: botsen is een broodje kwijt. En de zwervers in de Vijverhofstraat ruiken ze op honderd meter. Blijf uit hun buurt!',
      R('Het is een prakkie van niks, maar ze zijn er gek op.', 'Het is een eenvoudig hapje, maar ze zijn er gek op.'),
    ], ['Geef die bakplaat', 'Ik eet ze zelf op']);
    if (a !== 0) { await ui.dialog(N, ['Zelf opeten? Allemaal? Dan zie ik je straks bij de huisarts. De pillendraaier, zeggen ze hier.']); return; }
    if (g.mode === 'car') g.exitCar();
    g.setMode('walk');
    this.setActive('frikandel', 'Frikandelbroodjes voor de borrel', 'Breng de frikandelbroodjes naar ROX. Botsen kost een broodje, en zwervers pikken er een als ze dichtbij komen.', 'Broodjes: 8 / 8');
    const act = this.active;
    act.noVehicles = true;
    const tray = makeBroodjesTray();
    g.holdProp(tray);
    let left = 8;
    const lose = (why) => {
      const b = tray.userData.layers.pop();
      if (!b) return;
      tray.remove(b); left--;
      g.sfx?.play('splat');
      g.ui.toast(why, 1800);
      this.progress(`Broodjes: ${left} / 8`);
      if (left <= 2) { cleanup(); this.fail('Bijna alle frikandelbroodjes zijn weg. De borrel wordt een droge boel.'); }
    };
    g.fragile = () => lose('Boem! Daar gaat een frikandelbroodje.');
    // zwervers komen eropaf
    if (g.agniese) g.agniese.bait = { steal: () => lose(['"Dank je, maat!" Er is er een weg.', 'Gejat! "Gers broodje, mattie."', 'Een zwerver pakt er eentje en rent weg. Nou ja, rent...'][Math.floor(Math.random() * 3)]) };
    const cleanup = () => { g.fragile = null; g.dropProp(); if (g.agniese) g.agniese.bait = null; };
    act.cleanup = cleanup;
    const f = g.facades.frames.rox;
    const dest = f ? g.world.resolve(f.x + f.nx * 3, f.z + f.nz * 3, 0.6) : [0, 0];
    g.setDestination(dest, 240, async () => {
      cleanup();
      await ui.dialog('De borrel bij ROX', [
        `${left} frikandelbroodjes! De developers vallen erop aan alsof er een deadline is.`,
        left === 8 ? 'Alle acht nog heel. Jij mag blijven voor de borrel. Er is bier, en een klant die over zijn logo begint.' : 'Er missen er een paar? Dan zeggen we dat de stagiair ze heeft opgegeten. Dat geloven ze meteen.',
      ]);
      this.complete('frikandel', 'Frikandelbroodjes bezorgd!');
    }, (msg) => { cleanup(); this.fail(msg || 'Te laat. De borrel is al begonnen met chips.'); });
  },

  // ---------------------------------------------- Kippie: de frituur leegvissen en het oude vet wegbrengen
  async kippie(npc, N, ui, g) {
    const a = await ui.dialog(N, [
      'Welkom bij Kippie! Kip, kip, kip, en voor de vegetariërs: kip.',
      'Probleempje. Het frituurvet is niet meer ververst sinds de vorige baas. Het is groen. Het borrelt ook als de pan uit staat.',
      'Gisteren viste een klant er een kunstgebit uit. Hij was er niet eens blij mee: het was niet het zijne.',
      R('Vis jij de troep eruit? Laat de verse kip liggen, die is voor de klanten. Niet lullen maar poetsen!', 'Vis jij de troep eruit? Laat de verse kip liggen, die is voor de klanten. Minder praten, meer doen!'),
    ], ['Schepnet erin!', 'Ik ga wel naar de AH']);
    if (a !== 0) { await ui.dialog(N, ['De AH? Daar haal ik mijn vet ook. Dat verklaart een hoop, eigenlijk.']); return; }
    if (g.mode === 'car') g.exitCar();
    g.setMode('walk');
    this.setActive('kippie', 'Frituurvet verversen', 'Vis de troep uit de frituur. Laat de verse kip liggen!', '');
    const r = await startFrituur(g, { need: 12, maxMistakes: 3, limit: 50 });
    if (!r || this.active?.id !== 'kippie') return;
    if (!r.ok) {
      await ui.dialog(N, [r.why === 'kip' ? 'Je hebt alle verse kip eruit gevist! Wat moet ik nu verkopen? Die sok?' : 'Te langzaam. Het vet heeft intussen een eigen wil gekregen.']);
      this.fail(r.why === 'kip' ? 'Te veel verse kip uit de frituur gevist.' : 'De frituur is niet schoon.');
      return;
    }
    // stap 2: twintig liter oud vet naar de vetcontainer, met de ratten op je hielen
    const w = g.world;
    const p = w.streetPath('Teilingerstraat');
    const f = g.facades.frames.albertheijn;
    const here = [g.player.x, g.player.z];
    let spot = null;
    if (p.length > 1) {
      // een plek in de Teilingerstraat op een flink stuk lopen (60 tot 140 meter), op de stoep
      let bd = Infinity;
      for (let i = 0; i < p.length; i++) { const d = Math.hypot(p[i][0] - here[0], p[i][1] - here[1]); const score = Math.abs(d - 100); if (d > 60 && d < 140 && score < bd) { bd = score; spot = p[i]; } }
      if (!spot) spot = p[Math.floor(p.length / 2)];
    }
    if (!spot && f) spot = [f.x + f.nx * 30, f.z + f.nz * 30];
    const dest = w.resolve(spot[0] + 4, spot[1] + 4, 0.8);
    await ui.dialog(N, [
      `Kijk eens wat eruit kwam! Het mooiste: ${r.best}. Die hang ik bij de kassa, als waarschuwing.`,
      'Nu het oude vet. Twintig liter, in een emmer zonder deksel. Breng het naar de vetcontainer in de Teilingerstraat.',
      R('Pas op: de ratten ruiken het op een kilometer. Laat er geen een in de emmer springen, en niet botsen. Anders gutst het eruit.', 'Pas op: de ratten ruiken het van heel ver. Laat er geen in de emmer springen, en niet botsen, anders klotst het eruit.'),
    ]);
    if (this.active?.id !== 'kippie') return;
    this.setActive('kippie', 'Frituurvet verversen', 'Breng de emmer oud vet naar de vetcontainer in de Teilingerstraat. Niet botsen, en laat geen rat in de emmer springen.', 'Vet in de emmer: 3 / 3');
    const act = this.active;
    act.noVehicles = true;
    const bucket = makeVetEmmer();
    g.holdProp(bucket);
    // de vetcontainer
    const bin = makeVetContainer();
    bin.position.set(dest[0], w.groundAt(dest[0], dest[1]), dest[1]);
    bin.rotation.y = Math.atan2(here[0] - dest[0], here[1] - dest[1]);
    g.scene.add(bin);
    let lives = 3, cool = 0, wave = 0;
    const rats = [];
    const spawnRat = () => {
      const m = makeRat(); m.scale.setScalar(1.25);
      const a2 = Math.random() * Math.PI * 2, d = 10 + Math.random() * 6;
      let x = g.player.x + Math.cos(a2) * d, z = g.player.z + Math.sin(a2) * d;
      [x, z] = w.resolve(x, z, 0.2);
      m.position.set(x, w.groundAt(x, z), z);
      g.scene.add(m);
      rats.push({ m, speed: 3.1 + Math.random() * 1.2 + Math.min(0.6, rats.length * 0.1), ph: Math.random() * 6 });
    };
    for (let i = 0; i < 3; i++) spawnRat();
    const hit = (why) => {
      if (cool > 0) return;
      cool = 1.2; lives--;
      g.sfx?.play('splat');
      g.ui.toast(why, 2000);
      this.progress(`Vet in de emmer: ${lives} / 3`);
      const top = bucket.userData.fat; if (top) top.position.y -= 0.06;
      if (lives <= 0) { cleanup(); this.fail('De emmer is leeg. De halve Teilingerstraat glimt nu van het vet.'); }
    };
    g.fragile = () => hit('Boem! Een golf groen vet over je schoenen.');
    const upd = (dt) => {
      cool = Math.max(0, cool - dt);
      wave += dt;
      if (wave > 7 && rats.length < 8) { wave = 0; spawnRat(); }
      for (const r2 of rats) {
        const m = r2.m, dx = g.player.x - m.position.x, dz = g.player.z - m.position.z, d = Math.hypot(dx, dz);
        r2.ph += dt;
        if (d < 0.75) {
          hit(['Een rat springt in de emmer en zwemt een baantje.', 'Plons! Een rat neemt een vetbad.', 'Een rat klimt langs je been omhoog, recht de emmer in.', '"Dat is Henk!" roept iemand. Henk zit in de emmer.'][Math.floor(Math.random() * 4)]);
          // de rat schiet weg en komt later terug
          const a3 = Math.random() * Math.PI * 2; const [x, z] = w.resolve(g.player.x + Math.cos(a3) * 14, g.player.z + Math.sin(a3) * 14, 0.2);
          m.position.set(x, w.groundAt(x, z), z);
          continue;
        }
        const step = Math.min(d, r2.speed * dt);
        const [nx, nz] = w.resolve(m.position.x + (dx / d) * step, m.position.z + (dz / d) * step, 0.15);
        m.position.set(nx, w.groundAt(nx, nz), nz);
        m.rotation.y = Math.atan2(dx, dz);
        m.userData.body.position.y = Math.abs(Math.sin(r2.ph * 28)) * 0.012;
        m.userData.tail.rotation.y = Math.sin(r2.ph * 14) * 0.35;
      }
    };
    g.updaters.add(upd);
    const cleanup = () => {
      g.fragile = null; g.dropProp(); g.updaters.delete(upd);
      for (const r2 of rats) g.scene.remove(r2.m);
      rats.length = 0;
      setTimeout(() => g.scene.remove(bin), 4000);
    };
    act.cleanup = cleanup;
    const dist = Math.hypot(dest[0] - here[0], dest[1] - here[1]);
    g.setDestination(dest, Math.round(45 + dist / 2.2), async () => {
      cleanup();
      await ui.dialog('Bij de vetcontainer', [
        lives === 3 ? 'Glug, glug, glug. Twintig liter groen vet de container in, zonder één rat erin. Respect.' : 'Glug, glug... plons. Er zat nog een rat in. Die zwemt nu in de container. Hij lijkt het naar zijn zin te hebben.',
      ]);
      await ui.dialog(N, [
        'Vers vet in de frituur! De kip glimt weer goudbruin in plaats van groen.',
        R('Hier, een gratis emmer kip. Gefrituurd in vers vet. Nou ja, verser. Doe je best, mattie!', 'Hier, een gratis emmer kip. Gefrituurd in vers vet. Nou ja, verser. Goed gedaan, vriend!'),
      ]);
      this.complete('kippie', 'Frituur van Kippie ververst!');
    }, (msg) => { cleanup(); this.fail(msg || 'Te laat. Het vet is in de emmer gestold. Hij staat nu rechtop zonder emmer.'); });
  },

  // ---------------------------------------------- Silvia: sambal
  async silvia(npc, N, ui, g) {
    const a = await ui.dialog(N, [
      'Welkom bij Silvia! Roti, bami, moksi meti. En sambal. Veel sambal.',
      'Mijn huisgemaakte sambal is beroemd in de buurt. De laatste die alles opat, zit nog steeds op de wc. Sinds dinsdag.',
      'Durf jij? Twaalf happen, steeds heter. Je mag drie keer water drinken. Wie vuur spuwt, betaalt.',
    ], ['Kom maar op!', 'Doe maar zonder sambal']);
    if (a !== 0) { await ui.dialog(N, ['Zonder sambal? Dan krijg je een broodje kaas. Van de Subway hiernaast.']); return; }
    if (g.mode === 'car') g.exitCar();
    g.setMode('walk');
    this.setActive('sambal', 'Sambal-uitdaging', 'Twaalf happen roti met steeds hetere sambal. Drie glazen water. Niet boven de 100 procent!', '');
    const r = await startSambal(g, { need: 12, limit: 45 });
    if (!r || this.active?.id !== 'sambal') return;
    if (r.ok) {
      await ui.dialog(N, ['Alles op! En je ogen tranen niet eens. Nou ja, een beetje.', 'Morgenochtend voel je deze sambal nog een keer. Op de terugweg. Geloof me.']);
      this.complete('sambal', 'Sambal-kampioen van de Teilingerstraat!');
    } else {
      await ui.dialog(N, [r.fire ? 'Vuur! Mijn gordijnen! Ga maar even buiten staan, met je mond open.' : `${r.bites} happen... De rest neem je maar mee. In een bakje. Met extra sambal.`]);
      this.fail(r.fire ? 'Vuur gespuwd.' : 'Niet alles opgegeten.');
    }
  },

  // ---------------------------------------------- Sevinc: kebab snijden
  async sevinc(npc, N, ui, g) {
    const a = await ui.dialog(N, [
      'Welkom bij Sevinc! Pizza, kapsalon, en de beste kebab van de Teilingerstraat. Van de rol, niet uit een zakje.',
      'Mijn hulp is er niet. Hij zegt dat hij ziek is, maar ik zag hem net bij de Subway. Verrader.',
      'Snijd jij? Alleen het krokante, bruine vlees eraf. Het lichte vlees moet nog draaien, anders krijgen de klanten rauwe lappen.',
    ], ['Geef dat mes', 'Ik ben vegetariër']);
    if (a !== 0) { await ui.dialog(N, ['Vegetariër? Dan krijg jij een kapsalon zonder vlees. Dat is dus friet met kaas en sla. Ook lekker.']); return; }
    if (g.mode === 'car') g.exitCar();
    g.setMode('walk');
    this.setActive('kebab', 'Kebab snijden', 'Snijd zes keer het krokante vlees van de rol.', '');
    const r = await startGyros(g, { plates: false, title: 'Kebab snijden bij Sevinc' });
    if (!r || this.active?.id !== 'kebab') return;
    if (r.ok) {
      await ui.dialog(N, [`${r.good} perfecte plakken! Jij mag hier zo beginnen. Zwart, natuurlijk.`, 'Hier, een kapsalon van het huis. Met zoveel knoflooksaus dat je vannacht alleen slaapt.']);
      this.complete('kebab', 'Kebabmeester van Sevinc!');
    } else {
      await ui.dialog(N, ['Rauw, aangebrand, rauw... De klanten gaan nu naar de Subway. Probeer het nog eens.']);
      this.fail('Te weinig goede plakken.');
    }
  },

  // ---------------------------------------------- inparkeren zonder deuk
  async parkeer(npc, N, ui, g) {
    const a = await ui.dialog(N, [
      R('Bloedverziekend is het hier. Ik rij al een half uur rondjes voor een plekkie.', 'Heel erg vervelend is het hier. Ik rij al een half uur rondjes voor een parkeerplek.'),
      R('Parkeer jij m\'n waggie? Drie keer langs de stoep in de Vijverhofstraat. En geen deuk! Mijn man telt de deuken. Hij heeft er een schriftje voor.', 'Parkeer jij mijn auto? Drie keer langs de stoep in de Vijverhofstraat. En geen deuk! Mijn man telt de deuken. Hij heeft er een schriftje voor.'),
    ], ['Geef de sleutels', 'Ik heb geen rijbewijs']);
    if (a !== 0) { await ui.dialog(N, ['Geen rijbewijs? In deze straat heeft niemand een rijbewijs, dat houdt ze ook niet tegen.']); return; }
    this.setActive('inparkeren', 'Inparkeren zonder deuk', 'Fileparkeren: rij de groene auto in het gele vak langs de stoep en sta even stil. Drie keer. Eén botsing en het is mislukt.', 'Ingeparkeerd: 0 / 3');
    freeParking(g, [npc.pos.x, npc.pos.z], 6);
    const r = await startParking(g, [npc.pos.x, npc.pos.z], { need: 3, limit: 150, lot: this.vijverhofSpots ? 'vijverhof' : null });
    if (!r || this.active?.id !== 'inparkeren') return;
    if (r.none) { await ui.dialog(N, ['Hm, alles staat vol. Natuurlijk. Kom straks maar terug.']); this.abort(); return; }
    if (r.ok && !r.bumps) {
      await ui.dialog(N, ['Drie keer erin, zonder één deuk! Mijn man gaat huilen. Van geluk. Of omdat zijn schriftje leeg blijft.']);
      this.complete('inparkeren', 'Inparkeren zonder deuk!');
    } else {
      await ui.dialog(N, [r.bumps ? `${r.bumps === 1 ? 'Eén deuk' : r.bumps + ' deuken'}! Die komt in het schriftje. Met datum en tijd.` : `${r.parked} van de ${r.need}... Ik ga wel met de tram.`]);
      this.fail(r.bumps ? 'Deuk in de auto.' : 'Niet genoeg ingeparkeerd.');
    }
  },

  // ---------------------------------------------- rotzooi opruimen in de Teilingerstraat
  async veger(npc, N, ui, g) {
    const a = await ui.dialog(N, [
      'Kijk nou. Gisteren alles schoon, vandaag weer een delta. Vuilniszakken, blikjes, pizzadozen, een schoen. Eén schoen. Waar is de andere?',
      'De vuilniswagen komt over twee minuten. Help je me? Raap alles op in de Teilingerstraat: gewoon ertegenaan lopen.',
    ], ['Ik pak een vuilniszak', 'Niet mijn rotzooi']);
    if (a !== 0) { await ui.dialog(N, ['Niet jouw rotzooi? Dat zegt iedereen hier. Daarom ligt het er nog.']); return; }
    const w = g.world;
    const path = w.streetPath('Teilingerstraat');
    if (path.length < 2) return;
    // twaalf stukken rotzooi langs de stoep
    const items = [];
    let tries = 0;
    while (items.length < 12 && tries++ < 200) {
      const [x0, z0] = path[Math.floor(Math.random() * path.length)];
      const ang = Math.random() * 6.28, d = 2.5 + Math.random() * 2.5;
      const [x, z] = w.resolve(x0 + Math.sin(ang) * d, z0 + Math.cos(ang) * d, 0.4);
      if (items.some((it) => Math.hypot(it[0] - x, it[1] - z) < 6)) continue;
      items.push([x, z]);
    }
    this.setActive('rotzooi', 'Rotzooi opruimen', 'Loop tegen de rotzooi aan om hem op te rapen (gele punten op de kaart). Alles voordat de vuilniswagen komt.', `0 / ${items.length}`);
    const act = this.active;
    let got = 0, left = 120;
    const timer = setInterval(() => { if (this.active !== act) { clearInterval(timer); return; } left--; g.ui.timer(`${left} s`); if (left <= 0) { clearInterval(timer); this.fail('De vuilniswagen is al geweest. Morgen weer een delta.'); } }, 1000);
    g.collectibles = items.map(([x, z], k) => {
      const mesh = makeTrash(k % 4);
      mesh.position.set(x, w.groundAt(x, z), z);
      g.scene.add(mesh);
      const item = {
        pos: mesh.position, mesh, color: '#fdd835', glyph: '!',
        cleanup: () => g.scene.remove(mesh),
        onCollect: async () => {
          item.cleanup();
          g.collectibles = g.collectibles.filter((c) => c !== item);
          got++;
          this.progress(`${got} / ${items.length}`);
          if (got >= items.length) {
            clearInterval(timer); g.ui.timer(null);
            // de vaste rotzooi in de straat verdwijnt ook (voor even)
            const grp = g.agniese?.rotzooi?.Teilingerstraat;
            if (grp) { grp.visible = false; setTimeout(() => { grp.visible = true; }, 240000); }
            g.player.lockedFor = true;
            await ui.dialog(N, ['Schoon! De Teilingerstraat glimt. Nou ja, glimt... Hij is in elk geval niet meer plakkerig.', 'Over een uur ligt het er weer. Maar dat is een probleem voor dan.']);
            g.player.lockedFor = false;
            this.complete('rotzooi', 'De Teilingerstraat is schoon!');
          }
        },
      };
      return item;
    });
    act.cleanup = () => { clearInterval(timer); g.ui.timer(null); g.collectibles.forEach((c) => c.cleanup?.()); g.collectibles = []; };
  },

  // ---------------------------------------------- Dikke Mic: karaoke
  async waard(npc, N, ui, g) {
    const night = g.night > 0.5;
    const a = await ui.dialog(N, [night ? 'Nog een rondje karaoke? De microfoon is nog warm.' : R('Faka mattie! Welkom in Dikke Mic. Karaoke, spelletjes en eten. Zin om te zingen?', 'Hoe is het, vriend? Welkom in Dikke Mic. Karaoke, spelletjes en eten. Zin om te zingen?')], [night ? 'Nog eentje (tot morgenochtend)' : 'Geef die microfoon!', 'Nee, dank je']);
    if (a !== 0) return;
    let sing = !this.done.has('karaoke');
    if (!sing) sing = (await ui.dialog(N, ['Zing je nog een keer? Het buurtlied, op verzoek van de vaste klant.'], ['Ja, zingen!', 'Nee, gewoon een pilsje'])) === 0;
    if (sing) {
      await ui.dialog(N, [
        'Vanavond op het programma: het buurtlied van de Vijverhofstraat. Zelf geschreven door een vaste klant, na zes pijppies.',
        'Tik als de noot op de gele lijn staat. Zeventig procent goed en de zaal gaat los.',
      ]);
      if (g.mode === 'car') g.exitCar();
      g.setMode('walk');
      this.setActive('karaoke', 'Karaoke in Dikke Mic', 'Tik op de maat als de noot op de gele lijn staat.', '');
      const r = await startKaraoke(g, { need: 0.7 });
      if (!r || this.active?.id !== 'karaoke') return;
      this.active = null;
      if (!r.ok) { await ui.dialog(N, [`${Math.round(r.pct * 100)} procent... De buren bonken op de muur. En dat zijn zwervers, die zijn wat gewend.`]); this.refresh(); return; }
      await ui.dialog(N, [`${Math.round(r.pct * 100)} procent! De zaal staat op de tafels. Dit was gers, mattie.`]);
    }
    await g.drinkPils();
    await ui.dialog(N, [R('Proost! Op Roffa!', 'Proost! Op Rotterdam!')]);
    await g.skipTime(night ? 15 : 22.5);
    this.done.add('karaoke');
    this.save();
    this.refresh();
  },

  // ---------------------------------------------- Subway: broodje beleggen
  async subway(npc, N, ui, g) {
    const a = await ui.dialog(N, [
      'Lunchrush! De halve Teilingerstraat staat in de rij, en mijn collega is buiten aan het roken. Al een uur.',
      'Help je even? Het broodje schuift over de toonbank. Beleg het precies zoals op het bonnetje, in de goede volgorde.',
      'Vijf klanten, hooguit drie fouten. En geen jalapeño op het broodje van de agent, die wordt chagrijnig.',
    ], ['Handschoenen aan!', 'Ik eet alleen bij Sevinc']);
    if (a !== 0) { await ui.dialog(N, ['Bij Sevinc? Daar krijg je knoflooksaus tot in je sokken. Maar goed, jij je zin.']); return; }
    if (g.mode === 'car') g.exitCar();
    g.setMode('walk');
    this.setActive('subway', 'Broodje beleggen', 'Beleg de broodjes in de volgorde van het bonnetje, voordat ze aan de andere kant van de toonbank zijn.', '');
    const r = await startSub(g, { need: 5, maxMistakes: 3, limit: 75 });
    if (!r || this.active?.id !== 'subway') return;
    if (r.ok) {
      await ui.dialog(N, [r.mistakes ? `Vijf broodjes, ${r.mistakes} ${r.mistakes === 1 ? 'foutje' : 'foutjes'}. De zwerver kreeg per ongeluk tonijn in plaats van kip. Hij zei dat het de beste dag van zijn leven was.` : 'Vijf broodjes zonder één fout! Jij bent een echte sandwich artist.', 'Hier, een broodje van de zaak. Met extra saus. Niet aan je kleren komen.']);
      this.complete('subway', 'Sandwich artist van de Teilingerstraat!');
    } else {
      await ui.dialog(N, ['De rij staat tot aan de NAS. Mijn collega komt binnen, kijkt, en gaat weer roken. Volgende keer beter.']);
      this.fail('Te veel fouten of te traag.');
    }
  },

  // ---------------------------------------------- Café Reef: de klopcode
  async reefklant(npc, N, ui, g) {
    const a = await ui.dialog(N, [
      R('Kijk nou. Mijn stamkroeg. Dichtgetimmerd. Bloedverziekend.', 'Kijk nou. Mijn stamkroeg. Dichtgetimmerd. Heel erg vervelend.'),
      'Maar weet je wat het is? Gerrit zit er nog in. Al sinds de platen ervoor gingen. Hij heeft nog bier voor drie jaar, zegt hij.',
      'Hij doet alleen open met de geheime klopcode. Ik weet hem niet meer, ik heb een snee in m\'n neus. Luister goed en klop hem na. Dan krijgen we allebei een pijppie door het luikje.',
    ], ['Ik klop!', 'Dat is toch verboden?']);
    if (a !== 0) { await ui.dialog(N, ['Verboden? Er staat "niet betreden". Over kloppen staat er niks. Ik heb het drie keer gelezen.']); return; }
    if (g.mode === 'car') g.exitCar();
    g.setMode('walk');
    this.setActive('reef', 'De klopcode van Café Reef', 'Luister naar de klopcode achter de platen en klop hem na in hetzelfde ritme. Drie rondes.', '');
    const r = await startKlopcode(g, { rounds: 3 });
    if (!r || this.active?.id !== 'reef') return;
    if (r.ok) {
      await g.drinkPils?.();
      await ui.dialog(N, ['Het luikje gaat open, er komt een hand naar buiten met twee pijppies. "Proost," zegt Gerrit. "En niks tegen de juut zeggen."', 'Café Reef is dicht, maar Café Reef leeft nog! Gerrit vraagt of je volgende week de bitterballen door het luikje komt brengen.']);
      this.complete('reef', 'Binnen bij Café Reef (een beetje)!');
    } else {
      await ui.dialog(N, ['"Wegwezen, juut!" roept Gerrit. Hij denkt dat je van de politie bent. Nou ja, met dat ritme zou ik het ook denken.']);
      this.fail('Verkeerde klopcode.');
    }
  },

  // ---------------------------------------------- Mooie Boules: jeu de boules
  async boules(npc, N, ui, g) {
    const a = await ui.dialog(N, [
      'Welkom bij Mooie Boules! Jeu de boules met een biertje. Een Franse sport, maar wij spelen hem op z\'n Rotterdams: met veel geschreeuw.',
      'Je tegenstander heeft zijn drie ballen al gegooid. Gooi jij er eentje dichter bij het butje? Eerst richten, dan de kracht.',
    ], ['Ik gooi!', 'Ik kijk wel']);
    if (a !== 0) { await ui.dialog(N, ['Kijken mag. Maar dan wel een rondje geven.']); return; }
    if (g.mode === 'car') g.exitCar();
    g.setMode('walk');
    this.setActive('boules', 'Jeu de boules', 'Richten, kracht kiezen, gooien. Drie ballen. Dichter bij het butje dan de tegenstander.', '');
    const r = await startBoules(g, { throws: 3 });
    if (!r || this.active?.id !== 'boules') return;
    if (r.ok) {
      await ui.dialog(N, [`${Math.round(r.mine * 100)} centimeter van het butje! Je tegenstander gooit zijn pet op de grond. Dat mag hier.`]);
      this.complete('boules', 'Boules-kampioen van de Vijverhofstraat!');
    } else {
      await ui.dialog(N, [`${Math.round(r.mine * 100)} centimeter... Zijn bal lag op ${Math.round(r.theirs * 100)}. Een rondje voor hem dus.`]);
      this.fail('Verloren met jeu de boules.');
    }
  },
};
