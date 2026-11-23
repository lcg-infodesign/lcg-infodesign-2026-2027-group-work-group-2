function disegnaBottoni() {
  // margine esterno: 48px a schermo intero, si riduce quando la finestra si stringe
  const margine = min(48, width * 0.025);

  const disponibile = width - 2 * margine; // spazio utile tra i due margini
  const w = disponibile * 0.19;  // larghezza bottone relativa alla finestra
  const h = w / 5.5;  // altezza proporzionale alla larghezza
  // spazio tra i bottoni
  const spazio = (disponibile - ANNI.length * w) / (ANNI.length - 1);

  let x = margine; // il primo bottone parte dal margine sinistro
  const y = height - margine * 0.5 - h; 

  bottoni = [];
  textFont(workSans);
  textSize(h * 0.45);
  textAlign(CENTER, CENTER);

  for (const a of ANNI) { //l'anno non l'etichetta
    const scelto = a.anno === annoScelto;   // confronto con l'anno
    const sopra = mouseX > x && mouseX < x + w && mouseY > y && mouseY < y + h;

    noStroke();
    if (scelto) fill(255);
    else if (sopra) fill("#5c45d2");
    else fill("#281977");
    rect(x, y, w, h, h / 2);

    if (scelto) fill("#281977");
    else fill("#ffffff");
    text(a.etichetta, x + w / 2, y + h / 2);   // mostro il nome della città

    bottoni.push({ anno: a.anno, x, y, w, h }); // salvo solo l'anno
    x += w + spazio;
  }
}
function mousePressed() {
  for (const b of bottoni) {
    if (mouseX > b.x && mouseX < b.x + b.w && mouseY > b.y && mouseY < b.y + b.h) {
      annoScelto = b.anno;
      aggiornaDati();
    }
  }
}

// pagine raggiungibili dai bottoni in alto
const PAGINE = [
  { etichetta: "About Us", link: "aboutUs.html" },
  { etichetta: "About Dataset", link: "aboutDataset.html" },
];
const COLONNE = 5;      // stessa griglia dei bottoni degli anni
let bottoniNav = [];    // posizione dei bottoni in alto
let bottoni = [];       // (spostalo qui dallo sketch, vedi sotto)

function disegnaNav() {
  const margine = min(48, width * 0.025);
  const disponibile = width - 2 * margine;
  const w = disponibile * 0.19;
  const h = w / 5.5;
  const spazio = (disponibile - COLONNE * w) / (COLONNE - 1);

  // allineati a destra, sulle ultime due "colonne" dei bottoni degli anni
  let x = margine + (COLONNE - PAGINE.length) * (w + spazio);
  const y = margine * 0.5;

  bottoniNav = [];
  textFont(workSans);
  textSize(h * 0.45);
  textAlign(CENTER, CENTER);

  for (const p of PAGINE) {
    const attiva = window.location.pathname.endsWith(p.link); // sono già su questa pagina?
    const sopra = mouseX > x && mouseX < x + w && mouseY > y && mouseY < y + h;

    noStroke();
    if (attiva) fill(255);
    else if (sopra) fill("#5c45d2");
    else fill("#281977");
    rect(x, y, w, h, h / 2);

    if (attiva) fill("#281977");
    else fill("#ffffff");
    text(p.etichetta, x + w / 2, y + h / 2);

    bottoniNav.push({ link: p.link, x, y, w, h });
    x += w + spazio;
  }
}

function mousePressed() {
  // bottoni degli anni
  for (const b of bottoni) {
    if (mouseX > b.x && mouseX < b.x + b.w && mouseY > b.y && mouseY < b.y + b.h) {
      annoScelto = b.anno;
      aggiornaDati();
    }
  }
  // bottoni di navigazione
  for (const b of bottoniNav) {
    if (mouseX > b.x && mouseX < b.x + b.w && mouseY > b.y && mouseY < b.y + b.h) {
      window.location.href = b.link; // apre la pagina
    }
  }
}