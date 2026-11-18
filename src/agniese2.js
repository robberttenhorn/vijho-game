// Tien extra missies in de Agniesebuurt en rond Rotterdam Centraal. Ludiek en een beetje grof, zoals de rest.
// Alle personen zijn verzonnen. Rotterdamse woorden: zie agniese.js (straattaal opgegeven door de maker).
import * as THREE from 'three';
import { makeCharacter } from './character.js';

const R = (text, nl) => ({ text, nl });
const std = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.7, ...extra });
const pick = (a) => a[Math.floor(Math.random() * a.length)];

// aftellen in seconden zolang deze missie loopt
function countdown(m, g, secs, onEnd) {
  const act = m.active;
  let left = secs;
  g.ui.timer(`${left} s`);
  const id = setInterval(() => {
    if (m.active !== act) { clearInterval(id); return; }
    left--; g.ui.timer(`${Math.max(0, left)} s`);
    if (left <= 0) { clearInterval(id); onEnd(); }
  }, 1000);
  return { stop: () => { clearInterval(id); g.ui.timer(null); }, get left() { return left; } };
}
const poiPos = (g, id) => g.world.meta.pois.find((p) => p.id === id)?.pos;
// voor het station, op het Stationsplein
const stationFront = (g, dx = 0, dz = 0) => { const p = poiPos(g, 'centraal'); return p ? g.world.resolve(p[0] + 4 + dx, p[1] + 16 + dz, 0.6) : null; };
// een plek langs een straat (fractie 0..1 van de straat), een paar meter opzij, op de stoep
function streetSpot(w, name, t, side = 1, off = 4) {
  const p = w.streetPath(name);
  if (p.length < 2) return null;
  const i = Math.max(1, Math.min(p.length - 1, Math.floor(p.length * t)));
  const [ax, az] = p[i - 1], [bx, bz] = p[i];
  const L = Math.hypot(bx - ax, bz - az) || 1;
  return w.resolve(bx + (-(bz - az) / L) * off * side, bz + ((bx - ax) / L) * off * side, 0.5);
}

// ------------------------------------------------------------ opzet: de mensen bij de nieuwe missies
export function setupAgniese2(m, g, add, S) {
  const w = g.world;
  const st = (dx, dz) => stationFront(g, dx, dz);
  { const s = S('dikkemic', 2.4, 2.6); if (s) add('getuige', 'Getuige van de vrijgezel', s, { shirt: 0xff4fd8, pants: 0x1b1b1b, hair: 0x3e2723, hat: 'cap', hatColor: 0xff4fd8, build: 0.6 }); }
  { const s = st(26, 10); if (s) add('taxi', 'Taxichauffeur', s, { shirt: 0x263238, pants: 0x1b1b1b, hair: 0x9e9e9e, beard: true, build: 1.6, sleeves: 'long' }); }
  { const s = st(-14, 8); if (s) add('conducteur', 'Conducteur', s, { shirt: 0x1a3a7a, pants: 0x14213d, hair: 0x5d4037, hat: 'cap', hatColor: 0x14213d, coat: 0x1a3a7a }); }
  { const s = streetSpot(w, 'Teilingerstraat', 0.3, -1); if (s) add('ratten', 'Ongediertebestrijder', s, { shirt: 0x558b2f, pants: 0x33691e, hair: 0x212121, coat: 0x558b2f, glasses: true }); }
  { const s = S('albertheijn', 3.6, 5.5); if (s) add('statiegeld', 'Statiegeld-Stefan', s, { shirt: 0x6d4c41, pants: 0x3e2723, hair: 0x8d6e63, beard: true, coat: 0x4e342e, hat: 'cap', hatColor: 0x2e7d32 }); }
  { const s = S('reef', 2.6, -7); if (s) add('graffiti', 'Straatkunstenaar', s, { shirt: 0x212121, pants: 0x37474f, hair: 0x111111, hat: 'cap', hatColor: 0xd84315, jacket: 0x263238 }); }
  { const s = S('mooieboules', 2.8, 4.5); if (s) add('vlaggen', 'Fanatieke supporter', s, { shirt: 0xd50000, pants: 0xffffff, hair: 0xe0c070, build: 1.3 }); }
  { const p = poiPos(g, 'hofplein'); if (p) add('instructeur', 'Rijinstructeur', w.spotNear(p[0] + 40, p[1] - 40), { shirt: 0xffffff, pants: 0x263238, hair: 0x9e9e9e, glasses: true, female: true, hairStyle: 'bun', jacket: 0x1565c0 }); }
  { const p = poiPos(g, 'noordplein'); if (p) add('quiz', 'Ome Kees van het Noordplein', w.spotNear(p[0], p[1]), { shirt: 0xbcaaa4, pants: 0x5d4037, hair: 0xeeeeee, beard: true, glasses: true, coat: 0x795548, hat: 'cap', hatColor: 0x3e2723 }); }
  { const s = S('sevinc', 2.6, 3.2); if (s) add('bezorger', 'Bezorger van Sevinc', s, { shirt: 0xd84315, pants: 0x212121, hair: 0x111111, hat: 'cap', hatColor: 0xd84315, skin: 0xc68642 }); }
}

export function agnieseItems2(n) {
  return [
    { id: 'laatstetrein', npc: n.getuige, title: 'De laatste trein', place: 'Dikke Mic → Rotterdam Centraal', desc: 'Een vrijgezellenfeest is zoekgeraakt. Breng ze in een stoet naar Rotterdam Centraal voor de laatste trein.' },
    { id: 'taxi', npc: n.taxi, title: 'Taxi!', place: 'Stationsplein, Rotterdam Centraal', desc: 'De taxichauffeur moet plassen. Rij drie klanten rond zonder te botsen.' },
    { id: 'zwartrijder', npc: n.conducteur, title: 'Zwartrijder', place: 'Rotterdam Centraal', desc: 'Een zwartrijder rent het station uit. Haal hem in en tik hem aan.' },
    { id: 'ratten', npc: n.ratten, title: 'Rattenvanger', place: 'Teilingerstraat', desc: 'Vang acht ratten bij de vuilniszakken. Ze zijn snel.' },
    { id: 'statiegeld', npc: n.statiegeld, title: 'Statiegeld', place: 'Albert Heijn, Eudokiaplein', desc: 'Raap lege blikjes en flesjes op en lever ze in bij de Albert Heijn, voor de andere zwervers je voor zijn.' },
    { id: 'graffiti', npc: n.graffiti, title: 'Graffiti op de Hofbogen', place: 'Vijverhofstraat', desc: 'Zet zes tags op de bogen van het viaduct. Blijf uit de buurt van de agent.' },
    { id: 'vlaggen', npc: n.vlaggen, title: 'Rood-wit', place: 'Vijverhofstraat', desc: 'Vanavond is de wedstrijd. Hang acht rood-witte vlaggen op in de straat.' },
    { id: 'rotonde', npc: n.instructeur, title: 'Rijexamen op het Hofplein', place: 'Hofplein', desc: 'Drie rondjes over de rotonde van het Hofplein, langs alle poortjes, zonder te botsen.' },
    { id: 'quiz', npc: n.quiz, title: 'Spreek je Rotterdams?', place: 'Noordplein', desc: 'Ome Kees overhoort je. Weet je wat de woorden betekenen?' },
    { id: 'kapsalon', npc: n.bezorger, title: 'Kapsalon bezorgen', place: 'Sevinc Pizza, Teilingerstraat', desc: 'Drie kapsalons op de fiets bezorgen voordat ze koud zijn.' },
  ].filter((it) => it.npc);
}

export const AGNIESE2_MISSION_OF = {
  getuige: 'laatstetrein', taxi: 'taxi', conducteur: 'zwartrijder', ratten: 'ratten', statiegeld: 'statiegeld',
  graffiti: 'graffiti', vlaggen: 'vlaggen', instructeur: 'rotonde', quiz: 'quiz', bezorger: 'kapsalon',
};

// ------------------------------------------------------------ dingen
function makeTag(text, col) {
  const c = document.createElement('canvas'); c.width = 512; c.height = 192;
  const x = c.getContext('2d');
  x.font = '900 120px "Baloo 2", sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
  x.translate(256, 100); x.rotate((Math.random() - 0.5) * 0.3);
  x.lineWidth = 16; x.strokeStyle = '#111'; x.strokeText(text, 0, 0); x.fillStyle = col; x.fillText(text, 0, 0);
  x.setTransform(1, 0, 0, 1, 0, 0);
  for (let d = 0; d < 6; d++) { x.fillStyle = col; x.fillRect(80 + Math.random() * 350, 140 + Math.random() * 20, 4, 10 + Math.random() * 30); }
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  return new THREE.Mesh(new THREE.PlaneGeometry(2.6, 0.98), new THREE.MeshStandardMaterial({ map: tex, transparent: true, roughness: 0.9, polygonOffset: true, polygonOffsetFactor: -2 }));
}
function makeFlag() {
  const g = new THREE.Group();
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 3.2, 6), std(0xdddddd, { metalness: 0.6 })); pole.position.y = 1.6; g.add(pole);
  const c = document.createElement('canvas'); c.width = 128; c.height = 96; const x = c.getContext('2d');
  x.fillStyle = '#d50000'; x.fillRect(0, 0, 64, 96); x.fillStyle = '#ffffff'; x.fillRect(64, 0, 64, 96);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  const cloth = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.8, 8, 1), new THREE.MeshStandardMaterial({ map: tex, side: THREE.DoubleSide, roughness: 0.8 }));
  cloth.position.set(0.62, 2.75, 0); g.add(cloth);
  g.userData.cloth = cloth;
  g.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  return g;
}
function makeCan(k) {
  const g = new THREE.Group();
  if (k % 2) { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.2, 10), std(pick([0xc62828, 0x2e7d32, 0x1565c0, 0xfdd835]), { metalness: 0.7, roughness: 0.3 })); c.rotation.z = Math.PI / 2; c.position.y = 0.07; g.add(c); }
  else { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.08, 0.32, 10), std(0x3e7b3a, { roughness: 0.15, transparent: true, opacity: 0.8 })); b.rotation.z = Math.PI / 2; b.position.y = 0.08; g.add(b); }
  // een glinster zodat je ze ziet liggen
  const s = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 4), new THREE.MeshBasicMaterial({ color: 0xffffaa })); s.position.y = 0.35; g.add(s); g.userData.spark = s;
  return g;
}
function addTaxiSign(car, text, bg = '#f2c94c') {
  if (!car.mesh) return;
  const c = document.createElement('canvas'); c.width = 128; c.height = 48; const x = c.getContext('2d');
  x.fillStyle = bg; x.fillRect(0, 0, 128, 48); x.fillStyle = '#111'; x.font = '900 34px Inter, Arial, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(text, 64, 26);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  const box = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.22, 0.24), [std(0xeeeeee), std(0xeeeeee), std(0xeeeeee), std(0xeeeeee), new THREE.MeshStandardMaterial({ map: tex, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: 0.4 }), new THREE.MeshStandardMaterial({ map: tex, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: 0.4 })]);
  box.rotation.y = Math.PI / 2;
  box.position.set(0, (car.t?.H || 1.45) + 0.12, -0.1);
  car.mesh.add(box);
}
// zwevende voorwerpen op de oppakpunten (elk oppakpunt heeft een voorwerp nodig dat ronddraait)
function makeSprayCan() {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.36, 12), std(pick([0xff4fd8, 0xfdd835, 0x43a047, 0x1e88e5, 0xff7043]), { metalness: 0.6, roughness: 0.3 })); body.position.y = 1.0; g.add(body);
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.1, 10), std(0x222222)); cap.position.y = 1.23; g.add(cap);
  return g;
}
function makeRolledFlag() {
  const g = new THREE.Group();
  const c = document.createElement('canvas'); c.width = 64; c.height = 32; const x = c.getContext('2d');
  x.fillStyle = '#d50000'; x.fillRect(0, 0, 32, 32); x.fillStyle = '#ffffff'; x.fillRect(32, 0, 32, 32);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  const roll = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.7, 12), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.8 }));
  roll.rotation.z = Math.PI / 2; roll.position.y = 1.0; g.add(roll);
  return g;
}
function makeKapsalonBak() {
  const g = new THREE.Group();
  const tray = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.08, 0.24), std(0xcfd8dc, { metalness: 0.8, roughness: 0.3 })); tray.position.y = 0.04; g.add(tray);
  const lid = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.02, 0.25), std(0xffffff)); lid.position.y = 0.09; g.add(lid);
  return g;
}

// ------------------------------------------------------------ missies
export const agnieseHandlers2 = {
  // ---------------------------------------------- vrijgezellen naar de laatste trein
  async getuige(npc, N, ui, g) {
    if (this.active?.id === 'laatstetrein') { await ui.dialog(N, [`Nog ${g.followers.length - g.followersJoined()} kwijt. De laatste trein wacht niet!`]); return; }
    const a = await ui.dialog(N, [
      'Help! Ik ben de getuige van Rick. Rick gaat zaterdag trouwen. Rick ligt nu in een plantenbak.',
      'De rest van de groep is ook zoek. Eentje zingt bij de snackbar, eentje probeert een duif te knuffelen, en eentje is gewoon weg.',
      R('Om tien over half twee gaat de laatste trein naar Zoetermeer. Breng ze allemaal naar Rotterdam Centraal, mattie!', 'Om tien over half twee gaat de laatste trein naar Zoetermeer. Breng ze allemaal naar Rotterdam Centraal, vriend!'),
    ], ['Ik verzamel ze', 'Laat ze maar slapen']);
    if (a !== 0) { await ui.dialog(N, ['Slapen? Hier? Dan worden ze wakker zonder schoenen. En zonder Rick.']); return; }
    if (g.mode === 'car') g.exitCar();
    g.setMode('walk');
    const n = g.world.isMobile ? 4 : 5;
    let k = 0;
    const looks = [
      { shirt: 0xff4fd8, pants: 0x1b1b1b, hair: 0x3e2723, hat: 'tophat' }, // Rick, met hoge hoed
      { shirt: 0xff4fd8, pants: 0x263238, hair: 0xe0c070, hat: 'cap', hatColor: 0xff4fd8 },
      { shirt: 0xff4fd8, pants: 0x37474f, hair: 0x111111, glasses: true },
      { shirt: 0xff4fd8, pants: 0x1b1b1b, hair: 0x8d6e63, beard: true },
      { shirt: 0xff4fd8, pants: 0x263238, hair: 0x5d4037, build: 1.5 },
    ];
    g.startPolonaise(n, { minD: 30, maxD: 160, color: '#ff4fd8', glyph: '♥', factory: () => makeCharacter(looks[k++ % looks.length]),
      joinLines: ['Ik hou van jullie allemaal!', 'Waar is m\'n schoen?', 'Nog één pijppie!', 'Rick! RICK! Daar ben je!', 'Is dit Zoetermeer?', 'Ik ga NIET trouwen. O wacht, dat is Rick.'] });
    this.setActive('laatstetrein', 'De laatste trein', 'De vrijgezellen staan als roze punten op de kaart. Haal ze op en breng ze lopend naar Rotterdam Centraal.', `0 / ${n} vrijgezellen`);
    const dest = stationFront(g);
    g.setDestination(dest, 420, async () => {
      g.stopPolonaise();
      await ui.dialog('Op het Stationsplein', ['De hele groep strompelt de hal in, zingend onder de letters CENTRAAL STATION. Rick zwaait met een schoen. Niet de zijne.', 'De trein naar Zoetermeer vertrekt precies op tijd. Voor het eerst dit jaar.']);
      this.complete('laatstetrein', 'Vrijgezellen op de trein gezet!');
    }, (msg) => { g.stopPolonaise(); this.fail(msg || 'De laatste trein is weg. Ze slapen vannacht in de stationshal.'); }, {
      require: () => (g.followersJoined() >= n ? null : `Je hebt pas ${g.followersJoined()} van de ${n} vrijgezellen.`),
      violate: () => (g.mode !== 'walk' ? 'Lopend! Ze kunnen je niet bijhouden.' : null),
    });
  },

  // ---------------------------------------------- taxi op het Stationsplein
  async taxi(npc, N, ui, g) {
    const a = await ui.dialog(N, [
      'Hé jij! Kun je autorijden? Ik moet zo nodig plassen, en de wc in het station kost een euro. Een euro! Voor plassen!',
      'Rij jij even drie klanten voor me rond? Niet botsen. Elke deuk kost een ster, en met minder dan één ster ben ik m\'n vergunning kwijt.',
    ], ['Geef die sleutels', 'Ik heb geen rijbewijs']);
    if (a !== 0) { await ui.dialog(N, ['Geen rijbewijs? Dan ben je de enige in Rotterdam die dat eerlijk zegt.']); return; }
    const w = g.world;
    const s = stationFront(g, 18, 14);
    if (g.mode === 'car') g.exitCar();
    const taxi = g.cars.addCar('sedan', s[0], s[1], Math.PI / 2, 0x111111, {});
    addTaxiSign(taxi, 'TAXI');
    g.enterCar(taxi);
    const rides = [
      { to: poiPos(g, 'noordplein'), who: 'Zakenman met drie telefoons', hi: 'Naar het Noordplein. Snel. Ik heb een call. Nee, twee calls.', bye: 'Ik geef je vijf sterren. Nee, vier. Je nam die bocht te Rotterdams.' },
      { to: g.facades.frames.albertheijn ? [g.facades.frames.albertheijn.x + g.facades.frames.albertheijn.nx * 6, g.facades.frames.albertheijn.z + g.facades.frames.albertheijn.nz * 6] : poiPos(g, 'eudokiaplein'), who: 'Oma met een rollator', hi: 'Naar de Albert Heijn, jongen. Ze hebben de bonus op koffie. Ik moet er twaalf.', bye: 'Wat een schat. Hier, een pepermuntje. Het lag al een tijdje in m\'n tas.' },
      { to: (() => { const f = g.facades.frames.rox; return f ? [f.x + f.nx * 6, f.z + f.nz * 6] : [0, 0]; })(), who: 'Developer met een laptop', hi: 'Vijverhofstraat 47 graag. Ik ben te laat voor de stand-up. Weer.', bye: 'Dankje! Als iemand vraagt: ik zat in de file. Op de fiets.' },
    ];
    let stars = 5, cool = 0, ri = 0;
    this.setActive('taxi', 'Taxi!', 'Breng de klanten naar hun adres. Elke botsing kost een ster.', `Rit 1 / 3 · ★★★★★`);
    const showStars = () => this.progress(`Rit ${Math.min(ri + 1, 3)} / 3 · ${'★'.repeat(stars)}${'☆'.repeat(5 - stars)}`);
    const upd = (dt) => {
      cool = Math.max(0, cool - dt);
      if (g.car === taxi && taxi.bumpSpeed > 3 && cool <= 0) {
        cool = 1.5; stars--; showStars();
        g.ui.toast(pick(['Au! De klant morst koffie.', '"Rij jij altijd zo?"', 'Boem. Een ster minder.', '"Ik bel mijn advocaat. Hij zit in Barendrecht."']), 1800);
        if (stars <= 0) { cleanup(); this.fail('Geen sterren meer. De taxichauffeur is zijn vergunning kwijt (en zijn plasje kwijt).'); }
      }
    };
    g.updaters.add(upd);
    const cleanup = () => { g.updaters.delete(upd); };
    this.active.cleanup = cleanup;
    const next = async () => {
      const r = rides[ri];
      await ui.dialog(r.who, [r.hi]);
      if (this.active?.id !== 'taxi') return;
      const dest = w.resolve(r.to[0], r.to[1], 1.2);
      const dist = Math.hypot(dest[0] - taxi.x, dest[1] - taxi.z);
      showStars();
      g.setDestination(dest, Math.round(35 + dist / 7), async () => {
        if (g.mode === 'car') { taxi.speed = 0; }
        await ui.dialog(r.who, [r.bye]);
        ri++;
        if (ri >= rides.length) {
          cleanup();
          await ui.dialog(N, [stars >= 4 ? `${stars} sterren! Je mag mijn taxi vaker rijden. Ik ga nu nog een keer plassen.` : `${stars} sterren. Nou ja. Ik heb de auto nog. Bijna heel.`]);
          this.complete('taxi', 'Taxirit voltooid!');
        } else next();
      }, (msg) => { cleanup(); this.fail(msg || 'Te laat. De klant is uitgestapt en loopt boos verder.'); }, {
        violate: () => (g.mode !== 'car' || g.car !== taxi ? 'Je bent uit de taxi gestapt.' : null),
      });
    };
    next();
  },

  // ---------------------------------------------- zwartrijder bij het station
  async conducteur(npc, N, ui, g) {
    const a = await ui.dialog(N, [
      'Daar! Die gast in die gele jas! Geen kaartje, geen OV-chip, niks. Hij zei dat hij "een vriend van de machinist" was.',
      'Ik ben te oud om te rennen. Mijn knieën zijn van 1987. Haal jij hem in en tik hem aan? Je hebt anderhalve minuut.',
    ], ['Ik ren al!', 'Ik rijd zelf ook weleens zwart']);
    if (a !== 0) { await ui.dialog(N, ['Dat heb ik niet gehoord. Ik heb vandaag al genoeg formulieren ingevuld.']); return; }
    const w = g.world;
    if (g.mode === 'car') g.exitCar();
    g.setMode('walk');
    const st = stationFront(g, -4, 4);
    const runner = makeCharacter({ shirt: 0xfdd835, pants: 0x263238, hair: 0x111111, hat: 'cap', hatColor: 0x111111, jacket: 0xfdd835 });
    runner.position.set(st[0], w.groundAt(st[0], st[1]), st[1]);
    g.scene.add(runner);
    let x = st[0], z = st[1], t = 0, caught = false, wander = Math.random() * 6;
    this.setActive('zwartrijder', 'Zwartrijder', 'Ren de zwartrijder achterna (gele jas) en tik hem aan.', 'Pak hem!');
    g.tempMarkers = [{ pos: runner.position, color: '#fdd835', glyph: '!' }];
    const timer = countdown(this, g, 90, () => { cleanup(); this.fail('Hij is ontsnapt. Hij zit nu in de metro. Ook zonder kaartje.'); });
    const upd = (dt) => {
      if (caught) return;
      t += dt;
      const p = g.player;
      const dx = x - p.x, dz = z - p.z, d = Math.hypot(dx, dz) || 1;
      if (d < 1.3) {
        caught = true; cleanup();
        (async () => {
          await ui.dialog('Zwartrijder', ['Oké, oké! Ik heb geen kaartje. Maar ik heb wel een stempelkaart van de snackbar. Drie stempels. Telt dat?']);
          await ui.dialog(N, ['Een boete van vijftig euro. Of een bankoe, zoals ze hier zeggen. Bedankt, held!']);
          this.complete('zwartrijder', 'Zwartrijder gepakt!');
        })();
        return;
      }
      // rennen: weg van jou, met wat slingers; na een minuut wordt hij moe
      const speed = (d < 25 ? 5.4 : 3.2) * (t > 60 ? 0.75 : 1);
      wander += (Math.random() - 0.5) * dt * 2;
      let ux = dx / d + Math.sin(wander) * 0.5, uz = dz / d + Math.cos(wander) * 0.5;
      const ul = Math.hypot(ux, uz) || 1; ux /= ul; uz /= ul;
      let [nx, nz] = w.resolve(x + ux * speed * dt, z + uz * speed * dt, 0.35);
      if (Math.hypot(nx - x, nz - z) < speed * dt * 0.3) { wander += 1.6; [nx, nz] = w.resolve(x - uz * speed * dt, z + ux * speed * dt, 0.35); }
      x = nx; z = nz;
      runner.position.set(x, w.groundAt(x, z), z);
      runner.rotation.y = Math.atan2(ux, uz);
      runner.userData.animate?.(dt, speed, 'run');
    };
    g.updaters.add(upd);
    const cleanup = () => { g.updaters.delete(upd); timer.stop(); g.tempMarkers = []; setTimeout(() => g.scene.remove(runner), caught ? 6000 : 0); };
    this.active.cleanup = cleanup;
  },

  // ---------------------------------------------- ratten vangen
  async ratten(npc, N, ui, g) {
    const rats = (g.agniese?.ratten || []);
    if (rats.length < 8) { await ui.dialog(N, ['Rustig vandaag. Ze zijn allemaal bij de Kippie.']); return; }
    const a = await ui.dialog(N, [
      'Ongediertebestrijding, goedemiddag. Ik heb een probleem: de ratten hier zijn groter dan mijn vallen.',
      'Gisteren liep er eentje weg met een hele val. Met de kaas erin. En een stuk van mijn schoen.',
      'Vang er acht voor me: gewoon erop af rennen, ik doe ze in een emmer. Je hebt twee minuten.',
    ], ['Kom maar op, ratjes', 'Ik ben bang voor ratten']);
    if (a !== 0) { await ui.dialog(N, ['Bang? Ze zijn banger voor jou. Behalve Henk. Henk is nergens bang voor.']); return; }
    if (g.mode === 'car') g.exitCar();
    g.setMode('walk');
    let got = 0;
    const need = 8;
    this.setActive('ratten', 'Rattenvanger', 'Ren op de ratten af om ze te vangen (rode punten op de kaart). Ze schieten weg als je eraan komt.', `0 / ${need} ratten`);
    const timer = countdown(this, g, 120, () => { cleanup(); this.fail(`Tijd op. ${got} ratten in de emmer, de rest lacht je uit vanaf de vuilniszakken.`); });
    const p = g.player;
    const live = rats.filter((r) => !r.caught);
    g.tempMarkers = live.map((r) => ({ pos: r.m.position, color: '#e53935', glyph: '•', rat: r }));
    const upd = () => {
      for (const r of live) {
        if (r.caught) continue;
        if (Math.hypot(r.m.position.x - p.x, r.m.position.z - p.z) < 0.9) {
          r.caught = true; r.m.visible = false; got++;
          g.tempMarkers = g.tempMarkers.filter((mk) => mk.rat !== r);
          g.sfx?.play('pop');
          g.ui.toast(pick(['Hebbes! Piep!', 'In de emmer!', 'Die is dik, zeg.', got === 5 ? 'Was dat Henk? Dat was Henk.' : 'Gevangen!']), 1300);
          this.progress(`${got} / ${need} ratten`);
          if (got >= need) {
            cleanup();
            (async () => {
              await ui.dialog(N, ['Acht! Je bent een natuurtalent. Wil je een baan? Het betaalt slecht en het stinkt, maar je krijgt een gratis overall.', 'Ik laat ze vrij in Schiedam. Niet doorvertellen.']);
              this.complete('ratten', 'Acht ratten gevangen!');
            })();
          }
        }
      }
    };
    g.updaters.add(upd);
    const cleanup = () => { g.updaters.delete(upd); timer.stop(); g.tempMarkers = []; setTimeout(() => rats.forEach((r) => { r.caught = false; }), 90000); };
    this.active.cleanup = cleanup;
  },

  // ---------------------------------------------- statiegeld
  async statiegeld(npc, N, ui, g) {
    const a = await ui.dialog(N, [
      R('Faka. Ik ben Stefan. Ik doe in statiegeld. Vijftien cent per blikje, mattie. Twintig blikjes is drie euro. Drie euro is een pijppie en een frikandel.', 'Hoe is het? Ik ben Stefan. Ik doe in statiegeld. Vijftien cent per blikje, vriend. Twintig blikjes is drie euro. Drie euro is een biertje en een frikandel.'),
      'Maar de concurrentie is moordend. De andere zwervers zijn sneller dan ik. Ik heb een kapotte knie. En een kapot winkelwagentje.',
      'Raap jij blikjes en flesjes op in de buurt? Breng ze hier naar de automaat. We delen de winst. Zeventig-dertig. Voor mij.',
    ], ['Deal', 'Zeventig-dertig? Nee']);
    if (a !== 0) { await ui.dialog(N, ['Tachtig-twintig dan? Nee? Jij bent een harde onderhandelaar.']); return; }
    const w = g.world;
    if (g.mode === 'car') g.exitCar();
    const streets = ['Vijverhofstraat', 'Teilingerstraat', 'Eudokiaplein', 'Agniesestraat', 'Zaagmolenstraat'];
    const items = [];
    let tries = 0;
    while (items.length < 12 && tries++ < 400) {
      const name = pick(streets), p = w.streetPath(name);
      if (p.length < 2) continue;
      const [x0, z0] = p[Math.floor(Math.random() * p.length)];
      const ang = Math.random() * 6.28, d = 2.5 + Math.random() * 3;
      const [x, z] = w.resolve(x0 + Math.sin(ang) * d, z0 + Math.cos(ang) * d, 0.4);
      if (items.some((it) => Math.hypot(it[0] - x, it[1] - z) < 10)) continue;
      items.push([x, z]);
    }
    let got = 0, lost = 0;
    const need = 9;
    this.setActive('statiegeld', 'Statiegeld', 'Raap de blikjes en flesjes op (groene punten). De andere zwervers pikken er af en toe een in. Heb je er genoeg? Breng ze naar de automaat bij de Albert Heijn.', `0 / ${need} blikjes`);
    const f = g.facades.frames.albertheijn;
    const machine = f ? w.resolve(f.x + f.nx * 2.5, f.z + f.nz * 2.5, 0.6) : [npc.pos.x, npc.pos.z];
    let steal = 0;
    const cleanup = () => { g.updaters.delete(upd); timer.stop(); g.collectibles.forEach((c) => c.cleanup?.()); g.collectibles = []; };
    const timer = countdown(this, g, 180, () => { cleanup(); this.fail('Tijd op. De automaat is vol. Stefan huilt een beetje.'); });
    const upd = (dt) => {
      steal += dt;
      for (const c of g.collectibles) { if (c.mesh?.userData.spark) c.mesh.userData.spark.position.y = 0.3 + Math.sin(performance.now() / 200) * 0.05; }
      if (steal > 16 && g.collectibles.length) {
        steal = 0;
        const c = pick(g.collectibles);
        c.cleanup(); g.collectibles = g.collectibles.filter((q) => q !== c); lost++;
        g.ui.toast(pick(['Een andere zwerver was je voor!', '"Die is van mij!" Weg blikje.', 'Gejat. Door een man in een badjas.']), 1800);
        if (got + g.collectibles.length < need) { cleanup(); this.fail('Er zijn niet genoeg blikjes meer over. De concurrentie heeft gewonnen.'); }
      }
    };
    g.updaters.add(upd);
    this.active.cleanup = cleanup;
    g.collectibles = items.map(([x, z], k) => {
      const mesh = makeCan(k);
      mesh.position.set(x, w.groundAt(x, z), z); g.scene.add(mesh);
      const item = {
        pos: mesh.position, mesh, color: '#43a047', glyph: '♻',
        cleanup: () => g.scene.remove(mesh),
        onCollect: () => {
          item.cleanup(); g.collectibles = g.collectibles.filter((c) => c !== item); got++;
          g.sfx?.play('pop');
          this.progress(`${got} / ${need} blikjes`);
          if (got >= need && !g.destination) {
            g.ui.toast('Genoeg! Naar de automaat bij de Albert Heijn.', 2200);
            g.setDestination(machine, Math.max(20, timer.left), async () => {
              const total = got;
              cleanup();
              await ui.dialog(N, [`${total} blikjes! Dat is ${(total * 0.15).toFixed(2).replace('.', ',')} euro. Jouw deel is... ${(total * 0.045).toFixed(2).replace('.', ',')} euro. Niet alles tegelijk uitgeven.`, 'Morgen weer? Ik heb nog een plan met oud ijzer. En een plan met een fiets die niet van mij is. Nee, grapje.']);
              this.complete('statiegeld', 'Statiegeld ingeleverd!');
            }, (msg) => { cleanup(); this.fail(msg || 'Te laat bij de automaat.'); }, { noTimer: true });
          }
        },
      };
      return item;
    });
  },

  // ---------------------------------------------- graffiti op de Hofbogen
  async graffiti(npc, N, ui, g) {
    const lines = g.agniese?.viaduct?.lines || [];
    if (!lines.length) { await ui.dialog(N, ['Geen bogen, geen kunst. Kom later terug.']); return; }
    const a = await ui.dialog(N, [
      'Psst. Ik ben kunstenaar. De gemeente noemt het vandalisme, ik noem het "openbare expositie".',
      'Ik wil zes tags op de bogen van de Hofbogen. Maar mijn handen trillen. Van de koffie. Vooral van de koffie.',
      R('Pas op voor de juut. Die loopt rondjes door de Vijverhofstraat. Als hij je ziet spuiten, ben je de klos.', 'Pas op voor de politie. Die loopt rondjes door de Vijverhofstraat. Als hij je ziet spuiten, ben je de klos.'),
    ], ['Geef die spuitbus', 'Ik ben braaf']);
    if (a !== 0) { await ui.dialog(N, ['Braaf? Braaf is ook een kleur. Een saaie kleur.']); return; }
    const w = g.world;
    if (g.mode === 'car') g.exitCar();
    g.setMode('walk');
    // zes plekken op de plint van het viaduct, aan de kant van de Vijverhofstraat, niet te ver van hier
    const here = [npc.pos.x, npc.pos.z];
    const cands = [];
    for (const l of lines) for (let i = 2; i < l.center.length - 2; i += 3) {
      const c = l.center[i], a2 = l.center[i - 1], b2 = l.center[i + 1];
      const ux = b2.x - a2.x, uz = b2.z - a2.z, ul = Math.hypot(ux, uz) || 1;
      for (const sd of [-1, 1]) {
        const nx = (-uz / ul) * sd, nz = (ux / ul) * sd;
        const fx = c.x + nx * (c.width / 2 + 0.1), fz = c.z + nz * (c.width / 2 + 0.1);
        const d = Math.hypot(fx - here[0], fz - here[1]);
        if (d > 30 && d < 260 && !w.insideBuilding(fx + nx * 1.5, fz + nz * 1.5)) cands.push({ fx, fz, nx, nz, d });
      }
    }
    cands.sort(() => Math.random() - 0.5);
    const spots = [];
    for (const c of cands) { if (spots.length >= 6) break; if (spots.every((s) => Math.hypot(s.fx - c.fx, s.fz - c.fz) > 25)) spots.push(c); }
    if (spots.length < 6) { await ui.dialog(N, ['Hm, te veel camera\'s vandaag. Kom later terug.']); return; }
    let got = 0;
    this.setActive('graffiti', 'Graffiti op de Hofbogen', 'Loop naar de oranje punten op de bogen om te taggen. Blijf uit de buurt van de agent (blauw).', `0 / 6 tags`);
    // de agent loopt heen en weer door de Vijverhofstraat
    const path = w.streetPath('Vijverhofstraat');
    const cop = makeCharacter({ shirt: 0x1a237e, pants: 0x101433, hair: 0x3e2723, hat: 'cap', hatColor: 0x101433, sleeves: 'long' });
    g.scene.add(cop);
    let s = 0, dir = 1;
    const L = path.reduce((acc, q, i) => (i ? acc + Math.hypot(q[0] - path[i - 1][0], q[1] - path[i - 1][1]) : 0), 0);
    const along = (sv) => { let acc = 0; for (let i = 1; i < path.length; i++) { const [ax, az] = path[i - 1], [bx, bz] = path[i]; const l = Math.hypot(bx - ax, bz - az); if (acc + l >= sv) { const t = (sv - acc) / l; return [ax + (bx - ax) * t, az + (bz - az) * t, Math.atan2(bx - ax, bz - az)]; } acc += l; } return [...path.at(-1), 0]; };
    s = Math.random() * L;
    const timer = countdown(this, g, 160, () => { cleanup(); this.fail('Tijd op. De verf is op, de inspiratie ook.'); });
    const tags = [];
    const upd = (dt) => {
      s += dir * 1.6 * dt; if (s > L - 3) dir = -1; else if (s < 3) dir = 1;
      const [x, z, h] = along(s);
      cop.position.set(x, w.groundAt(x, z), z); cop.rotation.y = h + (dir < 0 ? Math.PI : 0);
      cop.userData.animate?.(dt, 1.6, 'walk');
      if (Math.hypot(x - g.player.x, z - g.player.z) < 5) {
        cleanup();
        (async () => { await ui.dialog('Agent', ['Ho, ho, ho. Wat hebben we hier? Een spuitbus? En verf op je handen? Dat is "openbare expositie", zeker?']); this.fail('Betrapt door de agent. Je mag morgen de bogen schoonmaken.'); })();
      }
    };
    g.updaters.add(upd);
    const cleanup = () => { g.updaters.delete(upd); timer.stop(); g.scene.remove(cop); g.collectibles.forEach((c) => c.cleanup?.()); g.collectibles = []; };
    this.active.cleanup = cleanup;
    const TXT = ['ROFFA', '010', 'GERS', 'MATTIE', 'FAKA', 'HOFBOOG'], COL = ['#ff4fd8', '#fdd835', '#43a047', '#1e88e5', '#ff7043', '#ab47bc'];
    g.collectibles = spots.map((sp, k) => {
      const pos = new THREE.Vector3(sp.fx + sp.nx * 1.2, w.groundAt(sp.fx, sp.fz), sp.fz + sp.nz * 1.2);
      const mesh = makeSprayCan(); mesh.position.copy(pos); g.scene.add(mesh);
      const item = {
        pos, mesh, color: '#ff7043', glyph: '✎',
        cleanup: () => g.scene.remove(mesh),
        onCollect: () => {
          item.cleanup();
          g.collectibles = g.collectibles.filter((c) => c !== item); got++;
          const tag = makeTag(TXT[k], COL[k]);
          tag.position.set(sp.fx + sp.nx * 0.08, w.groundAt(sp.fx, sp.fz) + 1.6, sp.fz + sp.nz * 0.08);
          tag.rotation.y = Math.atan2(sp.nx, sp.nz);
          g.scene.add(tag); tags.push(tag);
          g.sfx?.play('splash');
          this.progress(`${got} / 6 tags`);
          if (got >= 6) {
            cleanup();
            (async () => {
              await ui.dialog(N, ['Prachtig. Echt kunst. Ik zet het op Instagram. Onder mijn naam, natuurlijk.', 'Morgen staat er een kunstcriticus van de krant. Of de reiniging. Een van de twee.']);
              this.complete('graffiti', 'Zes tags op de Hofbogen!');
            })();
          }
        },
      };
      return item;
    });
  },

  // ---------------------------------------------- rood-witte vlaggen
  async vlaggen(npc, N, ui, g) {
    const a = await ui.dialog(N, [
      'Vanavond is de wedstrijd van het jaar! En kijk deze straat. Niks! Geen vlag, geen sjaal, geen rood-wit te bekennen!',
      'Ik heb acht vlaggen. Hang ze op langs de Vijverhofstraat en de Teilingerstraat, voor de aftrap. Twee minuten nog.',
      'Geen woorden maar daden, zeggen we hier. Nou: daden!',
    ], ['Rood-wit!', 'Ik ben voor de andere club']);
    if (a !== 0) { await ui.dialog(N, ['De andere club?! In déze straat? Loop maar snel door, voor iemand het hoort.']); return; }
    const w = g.world;
    const spots = [];
    for (const [name, n] of [['Vijverhofstraat', 5], ['Teilingerstraat', 3]]) for (let i = 0; i < n; i++) { const s = streetSpot(w, name, 0.1 + (0.8 * i) / Math.max(1, n - 1), i % 2 ? 1 : -1, 4.5); if (s) spots.push(s); }
    let got = 0;
    const need = spots.length;
    this.setActive('vlaggen', 'Rood-wit', 'Loop naar de rode punten om een vlag op te hangen. Allemaal voor de aftrap!', `0 / ${need} vlaggen`);
    const timer = countdown(this, g, 130, () => { cleanup(); this.fail('De aftrap is al geweest. Half rood-wit is ook een beetje rood-wit, maar niet genoeg.'); });
    const flags = [];
    const upd = () => { const t = performance.now() / 300; flags.forEach((f, i) => { f.userData.cloth.rotation.y = Math.sin(t + i) * 0.3; }); };
    g.updaters.add(upd);
    const cleanup = () => { timer.stop(); g.collectibles.forEach((c) => c.cleanup?.()); g.collectibles = []; setTimeout(() => { g.updaters.delete(upd); flags.forEach((f) => g.scene.remove(f)); }, 300000); };
    this.active.cleanup = cleanup;
    g.collectibles = spots.map(([x, z]) => {
      const pos = new THREE.Vector3(x, w.groundAt(x, z), z);
      const mesh = makeRolledFlag(); mesh.position.copy(pos); g.scene.add(mesh);
      const item = {
        pos, mesh, color: '#d50000', glyph: '⚑', cleanup: () => g.scene.remove(mesh),
        onCollect: () => {
          item.cleanup();
          g.collectibles = g.collectibles.filter((c) => c !== item); got++;
          const f = makeFlag(); f.position.copy(pos); f.rotation.y = Math.random() * 6; g.scene.add(f); flags.push(f);
          g.sfx?.play('tally');
          this.progress(`${got} / ${need} vlaggen`);
          if (got >= need) {
            cleanup();
            (async () => {
              await ui.dialog(N, ['Kijk dan! De hele straat rood-wit! Ik krijg er kippenvel van. Of het is de koude. Nee, het is de liefde.', 'Als we vanavond winnen, krijg jij een sjaal. Als we verliezen, heb jij de vlaggen verkeerd opgehangen.']);
              this.complete('vlaggen', 'De straat is rood-wit!');
            })();
          }
        },
      };
      return item;
    });
  },

  // ---------------------------------------------- rijexamen op de rotonde van het Hofplein
  async instructeur(npc, N, ui, g) {
    const w = g.world;
    // de rotonde: een cirkel door de wegvakken met de naam Hofplein (kleinste kwadraten)
    const pts = [];
    for (const [name, ax, az, bx, bz] of w.segments) if (name === 'Hofplein') pts.push([ax, az], [bx, bz]);
    let hp = null, R0 = null;
    if (pts.length >= 6) {
      let sxx = 0, sxz = 0, szz = 0, sx = 0, sz = 0, n = pts.length, sxr = 0, szr = 0, sr = 0;
      for (const [x, z] of pts) { const r2 = x * x + z * z; sxx += x * x; sxz += x * z; szz += z * z; sx += x; sz += z; sxr += x * r2; szr += z * r2; sr += r2; }
      // los A * [a b c] = B op, met A = [[sxx sxz sx][sxz szz sz][sx sz n]] en B = [sxr szr sr]
      const M = [[sxx, sxz, sx, sxr], [sxz, szz, sz, szr], [sx, sz, n, sr]];
      for (let i = 0; i < 3; i++) for (let j = i + 1; j < 3; j++) { const f = M[j][i] / M[i][i]; for (let k = i; k < 4; k++) M[j][k] -= f * M[i][k]; }
      const c3 = M[2][3] / M[2][2], b3 = (M[1][3] - M[1][2] * c3) / M[1][1], a3 = (M[0][3] - M[0][1] * b3 - M[0][2] * c3) / M[0][0];
      hp = [a3 / 2, b3 / 2]; R0 = Math.sqrt(c3 + hp[0] * hp[0] + hp[1] * hp[1]);
      if (!(R0 > 20 && R0 < 120)) R0 = null;
    }
    if (!R0) { await ui.dialog(N, ['De rotonde is afgesloten vandaag. Wegwerkzaamheden. Al sinds 2004.']); return; }
    const a = await ui.dialog(N, [
      'Goedemiddag. Rijexamen. Ik ben uw examinator. Ik ben streng maar rechtvaardig. Vooral streng.',
      'Het Hofplein. De grootste rotonde van Rotterdam. Hier zakt de helft van de stad. De andere helft rijdt er nooit meer.',
      'Drie rondjes, langs alle poortjes, tegen de klok in. Meer dan twee botsingen en u bent gezakt.',
    ], ['Ik ben er klaar voor', 'Ik neem de fiets wel']);
    if (a !== 0) { await ui.dialog(N, ['Verstandig. Op de fiets mag je alles in Rotterdam. Behalve stoppen voor rood, dat doet niemand.']); return; }
    if (g.mode === 'car') g.exitCar();
    // startpunt op de ring, het dichtst bij de instructeur; rijrichting tegen de klok in (van boven gezien)
    const aS = Math.atan2(-(npc.pos.z - hp[1]), npc.pos.x - hp[0]);
    const sp = w.resolve(hp[0] + Math.cos(aS) * R0, hp[1] - Math.sin(aS) * R0, 1.0);
    // raaklijn bij toenemende hoek: d/da (cos a, -sin a) = (-sin a, -cos a)
    const car = g.cars.addCar('hatch', sp[0], sp[1], Math.atan2(-Math.sin(aS), -Math.cos(aS)), 0xf5f5f5, {});
    addTaxiSign(car, 'L', '#1565c0');
    g.enterCar(car);
    const N_CP = 6, LAPS = 3;
    // startpunt: het poortje het dichtst bij de auto, daarna tegen de klok in
    const a0 = Math.atan2(-(sp[1] - hp[1]), sp[0] - hp[0]);
    let cp = 0, bumps = 0, cool = 0;
    this.setActive('rotonde', 'Rijexamen op het Hofplein', 'Rij langs de poortjes, tegen de klok in. Drie rondjes. Hooguit twee botsingen.', `Rondje 1 / ${LAPS} · botsingen 0`);
    const upd = (dt) => {
      cool = Math.max(0, cool - dt);
      if (g.car === car && car.bumpSpeed > 3 && cool <= 0) {
        cool = 1.5; bumps++;
        g.ui.toast(pick(['"Dat noteer ik."', 'Boem. De examinator schrijft iets op.', '"Dat telt."']), 1600);
        this.progress(`Rondje ${Math.min(LAPS, Math.floor(cp / N_CP) + 1)} / ${LAPS} · botsingen ${bumps}`);
        if (bumps > 2) { cleanup(); this.fail('Gezakt. Drie botsingen. De examinator stapt uit en loopt naar huis.'); }
      }
    };
    g.updaters.add(upd);
    const cleanup = () => { g.updaters.delete(upd); };
    this.active.cleanup = cleanup;
    const next = () => {
      if (cp >= N_CP * LAPS) {
        cleanup();
        (async () => {
          if (g.mode === 'car') car.speed = 0;
          await ui.dialog(N, [bumps === 0 ? 'Geslaagd! Foutloos. Dat heb ik in dertig jaar twee keer meegemaakt. De andere keer was mijn moeder.' : `Geslaagd, met ${bumps} ${bumps === 1 ? 'botsing' : 'botsingen'}. In Rotterdam noemen we dat "assertief rijden".`]);
          this.complete('rotonde', 'Rijbewijs gehaald op het Hofplein!');
        })();
        return;
      }
      const k = cp % N_CP, ang = a0 + ((k + 1) / N_CP) * Math.PI * 2;
      const dest = [hp[0] + Math.cos(ang) * R0, hp[1] - Math.sin(ang) * R0];
      this.progress(`Rondje ${Math.floor(cp / N_CP) + 1} / ${LAPS} · botsingen ${bumps}`);
      g.setDestination(dest, 22, () => { cp++; g.sfx?.play('tally'); next(); }, (msg) => { cleanup(); this.fail(msg || 'Te langzaam. "Rotonde is geen parkeerplaats."'); }, {
        violate: () => (g.mode !== 'car' || g.car !== car ? 'U bent uitgestapt tijdens het examen.' : null),
      });
    };
    next();
  },

  // ---------------------------------------------- Rotterdams overhoren
  async quiz(npc, N, ui, g) {
    const a = await ui.dialog(N, [
      'Zo, jij bent niet van hier. Dat zie ik aan je schoenen. Te schoon.',
      'Ik overhoor je. Zes van de acht goed en je bent een echte Rotterdammer. Minder, en je gaat terug naar Den Haag.',
    ], ['Vraag maar raak', 'Ik kom uit Den Haag']);
    if (a !== 0) { await ui.dialog(N, ['Den Haag. Nou, daar kun je ook niks aan doen. Sterkte.']); return; }
    const words = [
      ['gers', 'gaaf', ['boos', 'hongerig']], ['aftaaien', 'weggaan', ['afwassen', 'opeten']], ['juut', 'politie', ['vriendin', 'fiets']],
      ['bakkie pleur', 'kop koffie', ['gevecht', 'regenbui']], ['dakhaas', 'kat', ['duif', 'dakdekker']], ['pijppie', 'biertje', ['sigaretje', 'loodgieter']],
      ['osso', 'huis', ['oom', 'auto']], ['waggie', 'auto', ['wagen met paard', 'portemonnee']], ['pata', 'schoenen', ['patat', 'vader']],
      ['donnie', 'tien euro', ['honderd euro', 'een donut']], ['barkie', 'honderd euro', ['een hond', 'tien euro']], ['doezoe', 'duizend euro', ['een douche', 'twintig euro']],
      ['mattie', 'vriend', ['matras', 'moeder']], ['faka', 'hoe is het?', ['ga weg!', 'proost!']],
    ].sort(() => Math.random() - 0.5).slice(0, 8);
    this.setActive('quiz', 'Spreek je Rotterdams?', 'Kies wat het woord betekent. Zes van de acht goed.', '0 / 8');
    let good = 0;
    for (let i = 0; i < words.length; i++) {
      if (this.active?.id !== 'quiz') return;
      const [wrd, right, wrong] = words[i];
      const opts = [right, ...wrong].sort(() => Math.random() - 0.5);
      const c = await ui.dialog(N, [`Vraag ${i + 1}: wat betekent "${wrd}"?`], opts);
      if (opts[c] === right) { good++; g.sfx?.play('tally'); g.ui.toast(pick(['Goed zo!', 'Klopt!', 'Gers!']), 1000); }
      else { g.sfx?.play('fail'); g.ui.toast(`Nee: ${wrd} is ${right}.`, 1800); }
      this.progress(`${good} goed van ${i + 1}`);
    }
    if (good >= 6) {
      await ui.dialog(N, [`${good} van de 8! Je bent een echte Rotterdammer. Hier, een bakkie pleur. Van mij.`, 'Niet lullen maar poetsen. Dat is de laatste les. Die is gratis.']);
      this.complete('quiz', 'Je spreekt Rotterdams!');
    } else {
      await ui.dialog(N, [`${good} van de 8. Nou. Je mag nog een keer. In Rotterdam geven we iedereen een tweede kans. Behalve Ajax.`]);
      this.fail('Te weinig goed. Oefenen, mattie.');
    }
  },

  // ---------------------------------------------- kapsalon bezorgen op de fiets
  async bezorger(npc, N, ui, g) {
    const a = await ui.dialog(N, [
      'De kapsalon! Uitgevonden in Rotterdam, door een kapper. Patat, shoarma, kaas, sla, knoflooksaus. Een maaltijd en een hartaanval in één bakje.',
      'Mijn scooter is gejat. Weer. Bezorg jij er drie op de fiets? Ze moeten warm aankomen, anders wordt de kaas rubber.',
    ], ['Fiets erop!', 'Ik eet ze liever zelf op']);
    if (a !== 0) { await ui.dialog(N, ['Alle drie? Dan zie ik je straks bij de Eerste Hulp. Groetjes aan de dokter.']); return; }
    const w = g.world;
    if (g.mode === 'car') g.exitCar();
    g.setMode('bike');
    // drie adressen in de buurt: willekeurige panden aan een straat, op 120 tot 380 meter
    const here = [g.player.x, g.player.z];
    const addrs = [];
    let tries = 0;
    while (addrs.length < 3 && tries++ < 400) {
      const fp = w.footprints[Math.floor(Math.random() * w.footprints.length)];
      const cx = (fp.minX + fp.maxX) / 2, cz = (fp.minZ + fp.maxZ) / 2;
      const d = Math.hypot(cx - here[0], cz - here[1]);
      if (d < 120 || d > 380) continue;
      const s = w.spotNear(cx, cz);
      if (!s || addrs.some((q) => Math.hypot(q[0] - s[0], q[1] - s[1]) < 80)) continue;
      addrs.push(s);
    }
    if (addrs.length < 3) { await ui.dialog(N, ['Geen bestellingen. Iedereen is op dieet. Kom later terug.']); return; }
    const bak = makeKapsalonBak();
    g.holdProp(bak);
    const klanten = [
      ['Student in een badjas', 'Eindelijk! Ik heb al drie uur honger. Ik ben net wakker.'],
      ['Bouwvakker op een steiger', 'Top. Dit is mijn ontbijt. En mijn lunch. Misschien ook mijn avondeten.'],
      ['Gamer met een koptelefoon', 'Zet maar neer. Niet praten, ik zit in een potje. Wacht, is er knoflooksaus bij? Gers.'],
    ];
    let i = 0;
    this.setActive('kapsalon', 'Kapsalon bezorgen', 'Fiets naar de adressen voordat de kapsalon koud is.', 'Bestelling 1 / 3');
    const cleanup = () => g.dropProp();
    this.active.cleanup = cleanup;
    const next = () => {
      const dest = addrs[i];
      const dist = Math.hypot(dest[0] - g.player.x, dest[1] - g.player.z);
      this.progress(`Bestelling ${i + 1} / 3`);
      g.setDestination(dest, Math.round(25 + dist / 6), async () => {
        await ui.dialog(klanten[i][0], [klanten[i][1]]);
        i++;
        if (i >= 3) {
          cleanup();
          await ui.dialog(N, ['Drie warme kapsalons! Je bent sneller dan mijn scooter. Die nu trouwens in Schiedam staat, heb ik gehoord.']);
          this.complete('kapsalon', 'Kapsalons bezorgd!');
        } else next();
      }, (msg) => { cleanup(); this.fail(msg || 'Te laat. De kaas is rubber geworden. De klant gebruikt hem als muismat.'); }, {
        violate: () => (g.mode === 'car' ? 'Met de auto? De kapsalon past niet eens in het bekerhouder.' : null),
      });
    };
    next();
  },
};
