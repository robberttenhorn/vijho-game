// De rug van het shirt van je poppetje: drie keer ROX onder elkaar in grote blauwe, golvende 'trippy' letters
// (zelf getekend: de letters krijgen een paar verschoven lagen in blauwtinten en worden daarna in golven vervormd).
// Geeft een canvas terug met .redraw(), zodat het opnieuw getekend kan worden als het lettertype geladen is.
export function roxBackPrint() {
  const W = 512, H = 768;
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const draw = () => {
    const x = c.getContext('2d');
    x.clearRect(0, 0, W, H);
    // de drie regels staan dicht op elkaar (ze overlappen in het canvas, de letters zelf net niet)
    const lineH = H / 3, step = 172, top = (H - (2 * step + lineH)) / 2;
    for (let line = 0; line < 3; line++) {
      // eerst recht tekenen op een los canvas
      const t = document.createElement('canvas'); t.width = W; t.height = lineH;
      const tx = t.getContext('2d');
      tx.textAlign = 'center'; tx.textBaseline = 'middle'; tx.lineJoin = 'round';
      tx.font = '900 200px "Baloo 2", "Arial Black", Impact, sans-serif';
      const cx = W / 2, cy = lineH / 2 + 8;
      // schaduwlagen: van donker naar licht naar rechtsonder verschoven (een beetje psychedelisch, jaren zeventig)
      const layers = ['#06155c', '#0b2a99', '#1747d6', '#3f7bff'];
      layers.forEach((col, i) => {
        const o = (layers.length - i) * 5;
        tx.lineWidth = 26 - i * 4; tx.strokeStyle = col; tx.strokeText('ROX', cx + o, cy + o);
      });
      // de letter zelf: verloop van diepblauw naar lichtblauw, met een lichte binnenlijn
      const gr = tx.createLinearGradient(0, cy - 90, 0, cy + 90);
      gr.addColorStop(0, '#1d4fff'); gr.addColorStop(0.45, '#5ec8ff'); gr.addColorStop(0.55, '#2b6bff'); gr.addColorStop(1, '#0d2fc0');
      tx.fillStyle = gr; tx.fillText('ROX', cx, cy);
      tx.lineWidth = 3; tx.strokeStyle = '#cfeeff'; tx.strokeText('ROX', cx - 2, cy - 2);
      // dan vervormd overnemen: verticale golf per kolom en een horizontale golf per rij, elke regel anders
      const t2 = document.createElement('canvas'); t2.width = W; t2.height = lineH;
      const t2x = t2.getContext('2d');
      const ph = line * 2.1, amp = 7 + line * 2;
      for (let col = 0; col < W; col += 2) {
        const dy = Math.sin(col / W * Math.PI * 3 + ph) * amp;
        const sy = 1 + Math.sin(col / W * Math.PI * 2 + ph * 1.7) * 0.12; // letters zwellen op en krimpen
        t2x.drawImage(t, col, 0, 2, lineH, col, dy + (1 - sy) * lineH / 2, 2, lineH * sy);
      }
      for (let row = 0; row < lineH; row += 2) {
        const dx = Math.sin(row / lineH * Math.PI * 2.4 + ph * 1.3) * (6 + line * 2);
        x.drawImage(t2, 0, row, W, 2, dx, top + line * step + row, W, 2);
      }
    }
  };
  draw();
  c.redraw = draw;
  return c;
}
