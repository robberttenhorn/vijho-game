# Locals: Agniesebuurt

Een browsergame die zich afspeelt in de echte Agniesebuurt in Rotterdam, tussen Hofplein, Noordplein, Eudokiaplein en Bergweg. De wijk is opgebouwd uit open overheidsdata: elk pand staat op de goede plek met de echte dakvorm en de straten hebben hun echte namen.

De game geeft een bewust overdreven, satirisch beeld van de buurt: verpauperd, met zwervers en verslaafden in de Vijverhofstraat en de Teilingerstraat, dealers op scooters en rotzooi op straat. Alle personen in de game zijn verzonnen.

Dit is een losse kopie van [Locals: Boxmeer](https://github.com/robberttenhorn/boxmeer-game), dat weer een kopie is van [Locals: Gulpen](https://github.com/robberttenhorn/gulpen-game). De motor is dezelfde; de plekken, de buurt en de missies zijn nieuw.

## Spelen

```bash
npm install
npm run dev
```

Open daarna de link die Vite toont (meestal http://localhost:5173). Online: https://robberttenhorn.github.io/vijho-game/ (na het aanzetten van GitHub Pages).

**Besturing**
- Computer: WASD of pijltjes om te bewegen, Shift om te rennen, muis slepen om te kijken, E om te praten of in en uit te stappen, F voor fiets of skateboard, spatie als handrem, M voor de kaart.
- Mobiel: joystick links, slepen op de rechterhelft om te kijken, knoppen rechtsonder. Tik op de minikaart voor de grote kaart.

Je begint voor ROX Digital Agency aan de Vijverhofstraat 47, in een beige ROX-shirt met drie keer ROX op de rug.

## Plekken

| Plek | Adres |
| --- | --- |
| ROX Digital Agency (hoekpand, derde verdieping) | Vijverhofstraat 47 |
| Dikke Mic (karaoke) | Vijverhofstraat 47 |
| Mooie Boules | Vijverhofstraat 45 |
| NAS (Nico Adriaans Stichting, dag- en nachtopvang) | Vijverhofstraat 35-37 |
| Subway | Teilingerstraat 83B |
| Café Reef (dichtgetimmerd met houten platen) | Vijverhofstraat 26 |
| Afhaalrestaurant Silvia (Surinaams) | Teilingerstraat 85A |
| Sevinc Pizza | Teilingerstraat 67C |
| Albert Heijn | Eudokiaplein 12 |

Langs de Vijverhofstraat loopt de Hofbogen, het oude spoorviaduct van de Hofpleinlijn, op de hoogte van de eerste verdieping. In de plint zitten panden achter bogen, waaronder het dichtgetimmerde Café Reef. Het viaduct heeft licht beton met reliëfpanelen, een donkere kroonlijst met consoles, bovenleidingmasten en een dubbel spoor. Waar de Teilingerstraat en de andere straten eronderdoor lopen, staat een grote, vlakke boog op zware pijlers van natuursteen. De ligging komt uit de BGT; het uiterlijk is nagemaakt naar een Street View-beeld van de maker.

De derde verdieping van het hoekpand van ROX is helemaal rondom van glas, met de branding van ROX erachter (de omtrek komt uit de 3D BAG, de verdiepingshoogte is geschat).

In de Vijverhofstraat en de Teilingerstraat liggen vuilniszakken, blikjes, pizzadozen, matrassen en omgevallen winkelwagentjes, en staat graffiti op de gevels. Zwervers en verslaafden sloffen rond, zitten op een stuk karton of liggen in een slaapzak, en roepen af en toe iets in het Rotterdams. Bij de vuilniszakken scharrelen ratten rond, die wegschieten als je te dichtbij komt. Dealers rijden rondjes op scooters, en een zwarte auto met getinte ramen rijdt stapvoets door de Vijverhofstraat.

## Missies

| Missie | Waar |
| --- | --- |
| Bugs bij ROX: de webwinkel van een klant gaat live; plet de bugs en klik niet op de berichtjes van de klant | ROX Digital Agency |
| Nachtopvang: haal de slapers op en breng ze in een stoet naar de nachtopvang | NAS |
| Dealers pakken: rij de dealers op scooters klem en tik ze aan | Teilingerstraat (wijkagent) |
| Frikandelbroodjes voor de borrel: van de Albert Heijn naar ROX, zonder botsen en langs de hongerige zwervers | Albert Heijn, Eudokiaplein |
| Sambal-uitdaging: roti met steeds hetere sambal, drie glazen water | Afhaalrestaurant Silvia |
| Kebab snijden: alleen het krokante vlees van de rol | Sevinc Pizza |
| Inparkeren zonder deuk: drie keer in een vak in de Vijverhofstraat | Vijverhofstraat |
| Rotzooi opruimen: alles oprapen voordat de vuilniswagen komt | Teilingerstraat |
| Karaoke in Dikke Mic: het buurtlied op de maat, daarna een pilsje | Dikke Mic |
| Jeu de boules: dichter bij het butje dan de tegenstander | Mooie Boules |
| Broodje beleggen: beleg de subs in de volgorde van het bonnetje | Subway, Teilingerstraat |
| De klopcode van Café Reef: klop de geheime code na, dan gaat het luikje open | Café Reef, Vijverhofstraat 26 |

Na de laatste missie geeft de gastheer van Dikke Mic een feest in de Vijverhofstraat: je wordt Ereburger van de Agniesebuurt.

Verborgen: drie OQ-flyers (bij de Albert Heijn, op het Hofplein en in de Teilingerstraat). Heb je ze alle drie, dan komt er een zwarte bus met een gouden OQ voorrijden.

## Data

Alle data staat in `public/data/`. Opnieuw ophalen (achter een proxy met `NODE_USE_ENV_PROXY=1`):

```bash
node tools/fetch-data.mjs     # gebouwen, BGT, wegen, hoogte, plekken
python3 tools/fetch-ortho.py  # luchtfoto
```

| Bron | Wat | Licentie |
| --- | --- | --- |
| [3D BAG](https://3dbag.nl) (TU Delft / 3DGI) | Gebouwen in 3D | CC BY 4.0 |
| [AHN](https://www.ahn.nl) via PDOK | Hoogte van het maaiveld | CC0 |
| [BGT](https://www.pdok.nl) via PDOK | Wegen, water, groen, bomen | CC0 |
| [NWB](https://www.pdok.nl) via PDOK | Wegennet met straatnamen | CC0 |
| [Luchtfoto](https://www.beeldmateriaal.nl) via PDOK | Kleur van groen en daken | CC BY 4.0 |
| [ez-tree](https://github.com/dgreenheck/ez-tree) | Boommodellen | MIT |
| [Poly Haven](https://polyhaven.com) | Fototexturen en luchten | CC0 |

## Nog te controleren

- **Rotterdams en straattaal**: de woorden en uitdrukkingen (gers, aftaaien, pijppie, geepekop, zeikstraal, juut, de kit, delta, does, dakhaas, bakkie pleur, niet lullen maar poetsen, een snee in z'n neus, bloedverziekend, prakkie, pillendraaier, havenbaron, Roffa) komen uit openbare woordenlijsten (Wikipedia, webwoordenboek.nl, OPEN Rotterdam en andere). De straattaal (faka, mattie, osso, waggie, pata, donnie, barkie, doezoe) is aangeleverd door de maker. Laat het nakijken door een echte Rotterdammer.
- **Adressen**: ROX, Silvia, Sevinc en Café Reef zijn opgegeven door de maker. Dat Café Reef met houten platen is dichtgetimmerd ook; de reden van de sluiting staat er bewust niet bij, en Gerrit en het luikje zijn verzonnen. Mooie Boules, Dikke Mic, Subway en de Albert Heijn komen uit online gidsen. De NAS staat op Vijverhofstraat 35-37 (hoofdadres volgens de gemeente); volgens een bericht uit 2022 is de nachtopvang mogelijk verhuisd. De ligging komt uit de PDOK Locatieserver.
- **Merken en zaken** (ROX, Dikke Mic, Mooie Boules, de NAS, Subway, Silvia, Sevinc, Café Reef, Albert Heijn, OQ) worden bij naam genoemd. De borden en kleuren zijn verzonnen, zonder echte logo's. Vraag toestemming voordat de game breed gedeeld wordt, zeker omdat de buurt en de zaken op een grove, overdreven manier worden neergezet.
- **Hofbogen**: het spoor en de bovenleiding op het dek zijn nagemaakt zoals op het Street View-beeld; of er nog rails liggen en hoe het dek er nu precies uitziet, is niet gecontroleerd. Er rijden in de game geen treinen over.
- **Echte personen**: bewust weggelaten. De zwervers, verslaafden, dealers en medewerkers zijn verzonnen rollen.

## Techniek

Vite + Three.js, geen game-engine. De buurt (zwervers, dealers, rotzooi, graffiti, het ROX-bord) staat in `src/agniese-wereld.js`, de missies in `src/agniese.js` en de nieuwe minispellen (sambal, karaoke, bugs, jeu de boules, broodje beleggen, klopcode) in `src/agniese-skills.js`.
