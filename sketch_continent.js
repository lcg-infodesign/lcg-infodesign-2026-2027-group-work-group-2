const BG = "#190A32";
const COLORI = {
  Americas: "#FF0051",
  Oceania: "#1600FF",
  Africa: "#FFFFFF",
  Asia: "#F2FF00",
  Europe: "#00FE93",
};

const STESSO_PAESE = {
  "Federal Republic of Germany": "Germany",
  "German Democratic Republic": "Germany",
  "Bohemia": "Czech Republic",
  "Unified Team": "Russia",
  "Soviet Union": "Russia",
  "Yugoslavia": "Serbia",
};

const MIN_ATLETI = 2; //i flussi con meno di 2 atleti vengono ignorati
const PX_ATLETA = 0.5; // altezza di 1 atleta


let scorri = 0; //di quanti pixel scende il grafico con la rotella

let tabella;
let workSans;
let montserrat;

let parametri;
let continenteDa; 
let continenteA;

let flussi = {}; // flussi[paeseNascita][paeseGara] = numero di atleti
let paesiSx = [];// paesi di nascita in ordine (dal più grande)
let paesiDx = []; // paesi di gara in ordine
let totSx = {};
let totDx = {};
let totale = 0;
let colonnaSx = {}; // { u1, u2 } per ogni paese a sinistra
let colonnaDx = {};
let nastri = [];


async function setup() {
  parametri = getURLParams();
  continenteDa = parametri.da;
  continenteA = parametri.a;

  createCanvas(windowWidth, windowHeight);
  tabella = await loadTable("assets/olympic.csv", ",", true);
  workSans = await loadFont("assets/WorkSans-Bold.ttf");
  montserrat = await loadFont("assets/MontserratAlternates-Bold.ttf");

  const annoSalvato = sessionStorage.getItem("anno") || parametri.anno;
  if (ANNI.some((a) => a.anno === annoSalvato)) annoScelto = annoSalvato;
  
  calcolaAnniDisattivi();
  // se l'anno scelto è grigio, passo al primo anno che ha dati
  if (anniDisattivi.includes(annoScelto)) {
    const primo = ANNI.find((a) => !anniDisattivi.includes(a.anno));
    if (primo) annoScelto = primo.anno;
  }

  aggiornaDati();
}
// per ogni edizione controllo se esiste almeno una coppia di paesi con minimo 2 atleti
function calcolaAnniDisattivi() {
  anniDisattivi = [];
  if (!continenteDa || !continenteA) return;

  for (const a of ANNI) {
    const conteggio = {};
    let trovato = false;

    for (let i = 0; i < tabella.getRowCount(); i++) {
      if (tabella.getString(i, "year") !== a.anno) continue;
      if (tabella.getString(i, "continent_ origin") !== continenteDa) continue;
      if (tabella.getString(i, "continent_ destination") !== continenteA) continue;

      let paeseNascita = tabella.getString(i, "birth_country_full");
      const paeseGara = tabella.getString(i, "gapminder_countryname");
      if (STESSO_PAESE[paeseNascita]) paeseNascita = STESSO_PAESE[paeseNascita];
      if (paeseNascita === "" || paeseGara === "") continue;
      if (paeseNascita === paeseGara) continue;

      const coppia = paeseNascita + "|" + paeseGara;
      conteggio[coppia] = (conteggio[coppia] || 0) + 1;
      if (conteggio[coppia] >= MIN_ATLETI) {
        trovato = true; // basta una coppia: l'edizione ha dati
        break;
      }
    }

    if (!trovato) anniDisattivi.push(a.anno);
  }
}

// da ricorrenti.js quando clicco un anno
function aggiornaDati() {
  if (!continenteDa || !continenteA) return; //nessun flusso, niente da contare
  contaFlussi();
  scorri = 0; //a ogni cambio di anno il grafico riparte dall'alto
}

function contaFlussi() {
  const conteggio = {}; // "paeseNascita|paeseGara" dà il numero

  //controllo
  for (let i = 0; i < tabella.getRowCount(); i++) {
    if (tabella.getString(i, "year") !== annoScelto) continue;
    if (tabella.getString(i, "continent_ origin") !== continenteDa) continue;
    if (tabella.getString(i, "continent_ destination") !== continenteA) continue;

    let paeseNascita = tabella.getString(i, "birth_country_full");
    const paeseGara = tabella.getString(i, "gapminder_countryname");
    if (STESSO_PAESE[paeseNascita]) paeseNascita = STESSO_PAESE[paeseNascita];
    if (paeseNascita === "" || paeseGara === "") continue;
    if (paeseNascita === paeseGara) continue; // non è migrato

    const coppia = paeseNascita + "|" + paeseGara;
    conteggio[coppia] = (conteggio[coppia] || 0) + 1;
  }

  flussi = {};
  totSx = {};
  totDx = {};
  totale = 0;
  for (const coppia in conteggio) {
    const [sx, dx] = coppia.split("|");
    const valore = conteggio[coppia];
    if (valore < MIN_ATLETI) continue; //salto flussi con solo 1 atleta
    if (!flussi[sx]) flussi[sx] = {};
    flussi[sx][dx] = (flussi[sx][dx] || 0) + valore;
    totSx[sx] = (totSx[sx] || 0) + valore;
    totDx[dx] = (totDx[dx] || 0) + valore;
    totale += valore;
  }

  paesiSx = ordina(totSx);
  paesiDx = ordina(totDx);
}

//dal più grande al più piccolo
function ordina(totali) {
  return Object.keys(totali).sort((a, b) => totali[b] - totali[a]);
}

//ogni paese ha una y di inizio (u1) e di fine (u2) in pixel,
function calcolaColonne(m) {
  colonnaSx = segmenti(paesiSx, totSx, m);
  colonnaDx = segmenti(paesiDx, totDx, m);
}

function segmenti(paesi, totali, m) {
  const risultato = {};
  let u = 0;
  for (const p of paesi) {
    const l = totali[p] * m.pxAtleta;
    risultato[p] = { u1: u, u2: u + l };
    u += l + m.gap;
  }
  return risultato;
}

//altezza totale di una colonna (paesi + spazi), serve per sapere quanto si può scorrere
function altezzaColonna(paesi, m) {
  return totale * m.pxAtleta + max(0, paesi.length - 1) * m.gap;
}

//controllo dove finisce il nastro prima e quello successivo lo scrivo dopo
function calcolaNastri(m) {
  nastri = [];
  const usatoSx = {};
  const usatoDx = {};
  for (const p of paesiSx) usatoSx[p] = colonnaSx[p].u1;
  for (const p of paesiDx) usatoDx[p] = colonnaDx[p].u1;

  for (const sx of paesiSx) {
    for (const dx of paesiDx) {
      const valore = (flussi[sx] && flussi[sx][dx]) || 0;
      if (valore === 0) continue;
      const l = valore * m.pxAtleta; //larghezza del nastro proporzionale agli atleti

      nastri.push({ da: sx, a: dx, valore, u1: usatoSx[sx], u2: usatoSx[sx] + l, v1: usatoDx[dx], v2: usatoDx[dx] + l });

      usatoSx[sx] += l;
      usatoDx[dx] += l;
    }
  }
}

//posizione del grafico
function misure() {
  const r = min(width, height) * 0.35; //serve per la dimensione del testo
  const m = {
    xSx: width * 0.3, // margine di sinistra
    xDx: width * 0.7, // margine di destra
    yTop: height * 0.3,//nizio e fine della "finestra" in cui scorre il grafico
    yBottom: height * 0.84,
    spessore: r * 0.05,//stesso spessore della barra del grafico della visione globale
    distacco: r * 0.025, // stessa distanza nastro-arco del grafico globale
    dimTesto: r * 0.06, //stessa textSize
  };
  m.gap = m.dimTesto * 0.9;//spazio tra un paese e l'altro, in pixel
  m.pxAtleta = height * 0.01; //spessore nastro per un singolo atleta, sempre uguale in ogni grafico 
  return m;
}

function draw() {
  background(BG);
  if (!tabella) return;
  //da ricorrenti.js
  disegnaBottoni();
  disegnaNav();
  disegnaBreadCrumb();// mostro solo nav, breadcrumb e bottoni
  
  /*disegnaTitolo();*/

  const m = misure();

  // nomi dei continenti sopra le colonne
  noStroke();
  fill(255);
  textFont(workSans);
  textSize(griglia().h * 0.45);
  textAlign(CENTER, BOTTOM);
  text(continenteDa, m.xSx, m.yTop - m.dimTesto * 2.5);
  text(continenteA, m.xDx, m.yTop - m.dimTesto * 2.5);

  calcolaColonne(m);
  calcolaNastri(m);

  //per lo scorrimento (aiutati da AI)
  const altezza = max(altezzaColonna(paesiSx, m), altezzaColonna(paesiDx, m)); //altezza grafico
  const scorriMax = max(0, altezza - (m.yBottom - m.yTop)); //quanto l'altezza della colonna sporge dallo spazio a disposizione
  scorri = constrain(scorri, 0, scorriMax); //limite allo scorrimento

  //hover
  const dentroFinestra = mouseY > m.yTop && mouseY < m.yBottom; //verifico che il mouse sia dentro al grafico
  nastroPaeseSopra = null;
  for (const n of nastri) {
    n.punti = puntiNastro(n, m);
    if (dentroFinestra && dentroForma(mouseX, mouseY, n.punti)) nastroPaeseSopra = n; //verifica che sia dentro finestra e dentro forma
  }

  //disegno dentro un riquadro (così non finisce sotto ai bottoni)
  push();
  drawingContext.save();
  drawingContext.beginPath();
  drawingContext.rect(0, m.yTop - m.dimTesto, width, m.yBottom - m.yTop + m.dimTesto * 2); //margine prima dei nomi dei paesi
  drawingContext.clip();

  //opacità hover
  for (const n of nastri) {
    let opacita = 150;
    if (nastroPaeseSopra === n) opacita = 255;
    else if (nastroPaeseSopra) opacita = 100;
    disegnaNastro(n.punti, COLORI[continenteDa], opacita);
  }

  for (const p of paesiSx) disegnaBarra("sinistra", colonnaSx[p], p, m);
  for (const p of paesiDx) disegnaBarra("destra", colonnaDx[p], p, m);

  drawingContext.restore();
  pop();

  if (scorriMax > 0) disegnaBarraScorrimento(m, altezza, scorriMax);

  //etichette e manina
  if (nastroPaeseSopra) {
    disegnaInfo(nastroPaeseSopra, m);
    cursor(HAND);
  } else {
    cursor(ARROW);
  }
}

//scorrimento solo del grafico
function mouseWheel(event) {
  scorri += event.delta;
  return false; //se non c'è niente da scorrere non scorre
}

//barra di scorrimento
function disegnaBarraScorrimento(m, altezza, scorriMax) {
  const x = width * 0.97; //posizione x
  const hFinestra = m.yBottom - m.yTop;
  const hCursore = hFinestra * (hFinestra / altezza);//cursore proporzionale a quanto scorre
  const y = m.yTop + (hFinestra - hCursore) * (scorri / scorriMax);
  noStroke();
  fill(255, 40);//intera barra
  rect(x, m.yTop, 6, hFinestra, 4);
  fill(255, 180);//barra che indica cosa vediamo
  rect(x, y, 6, hCursore, 4);
}

/*
function disegnaTitolo() {
  const { margine, h } = griglia();
  noStroke();
  fill(255);
  textFont(montserrat);
  textSize(h * 1.05);
  textAlign(LEFT, TOP);
  text("Migration flow " + continenteDa + "-" + continenteA, margine, margine * 0.5 + h * 1.3);
}*/

function yColonna(u, m) {
  return m.yTop + u - scorri; //m.yTop da dove partono colonne in altezza; u indica altezza di un paese; scorri è lo scorrimento
}

//rettangoli di partenza e arrivo
function disegnaBarra(lato, seg, nome, m) {
  const y1 = yColonna(seg.u1, m);
  const y2 = yColonna(seg.u2, m);
  noStroke();
  //segmenti dei colori del continente
  fill(lato === "sinistra" ? COLORI[continenteDa] : COLORI[continenteA]);
  if (lato === "sinistra") rect(m.xSx - m.spessore, y1, m.spessore, y2 - y1);
  else rect(m.xDx, y1, m.spessore, y2 - y1);
  fill(255); // nomi de paesi sono bianchi

  // nomi paesi fuori dal rettangolo
  textFont("Trebuchet MS");
  textSize(m.dimTesto);
  const yTesto = (y1 + y2) / 2; //posizione y del testo centrata sul rettangolo del paese
  if (lato === "sinistra") {
    textAlign(RIGHT, CENTER); 
    text(nome, m.xSx - m.spessore - m.dimTesto * 2, yTesto); 
  } else {
    textAlign(LEFT, CENTER);
    text(nome, m.xDx + m.spessore + m.dimTesto * 2, yTesto);
  }
}

// Bézier cubica (4 punti)
function puntoBezier(p0, p1, p2, p3, t) {
  const a = (1 - t) * (1 - t) * (1 - t);
  const b = 3 * (1 - t) * (1 - t) * t;
  const c = 3 * (1 - t) * t * t;
  const d = t * t * t;
  return {
    x: a * p0.x + b * p1.x + c * p2.x + d * p3.x,
    y: a * p0.y + b * p1.y + c * p2.y + d * p3.y,
  };
}

//disegna la curva
function curva(punti, xDa, yDa, xA, yA, passi) { 
  const xMezzo = (xDa + xA) / 2;
  const p0 = { x: xDa, y: yDa };
  const p1 = { x: xMezzo, y: yDa };
  const p2 = { x: xMezzo, y: yA };
  const p3 = { x: xA, y: yA };
  for (let i = 0; i <= passi; i++) punti.push(puntoBezier(p0, p1, p2, p3, i / passi));
}

function puntiNastro(n, m) {
  const passi = 60; //curva morbida
  const punti = [];
  //spazio tra barre e nastri a inizio e fine
  const xInizio = m.xSx + m.distacco;
  const xFine = m.xDx - m.distacco;
  curva(punti, xInizio, yColonna(n.u1, m), xFine, yColonna(n.v1, m), passi);
  curva(punti, xFine, yColonna(n.v2, m), xInizio, yColonna(n.u2, m), passi);
  return punti;
}

function disegnaNastro(punti, colore, opacita) {
  const c = color(colore);
  c.setAlpha(opacita);
  fill(c);
  noStroke();
  beginShape();
  for (const p of punti) vertex(p.x, p.y);
  endShape(CLOSE);
}

// smouse dentro al natro se tracciando una retta da esso questa interseca il natro un numero dispari di volte 
function dentroForma(x, y, punti) {
  let dentro = false;
  for (let i = 0, j = punti.length - 1; i < punti.length; j = i++) {
    const a = punti[i];
    const b = punti[j];
    const attraversa = (a.y > y) !== (b.y > y) && x < ((b.x - a.x) * (y - a.y)) / (b.y - a.y) + a.x;
    if (attraversa) dentro = !dentro;
  }
  return dentro;
}

// tooltip
function disegnaInfo(n, m) {
  const dim = min(width, height) * 0.022;
  const riga1 = "from " + n.da + " to " + n.a;
  const riga2 = n.valore + (n.valore === 1 ? " athlete" : " athletes");

  textFont("Trebuchet MS");
  textSize(dim);
  const w1 = textWidth(riga1);
  textSize(dim);
  const w2 = textWidth(riga2);

  const pad = dim * 0.7;
  const w = max(w1, w2) + pad * 2;
  const h = dim * 2.4 + pad * 2;
  let x = mouseX + dim;
  let y = mouseY + dim;
  if (x + w > width) x = mouseX - dim - w;
  if (y + h > height) y = mouseY - dim - h;

  fill(BG);
  stroke(255);
  strokeWeight(1.5); //DA FARE UGUALE AGLI ALTRI RETTANGOLI
  rect(x, y, w, h, dim * 0.4);

  noStroke();
  textAlign(LEFT, TOP);
  fill(255);
  textSize(dim);
  text(riga1, x + pad, y + pad);
  fill(255);
  textSize(dim);
  text(riga2, x + pad, y + pad + dim * 1.4);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
