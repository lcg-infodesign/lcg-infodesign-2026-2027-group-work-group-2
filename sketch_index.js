const BG = "#190A32";

// ordine dall'alto verso il basso (uguale su entrambi i lati)
const CONTINENTI = ["Americas", "Oceania", "Africa", "Asia", "Europe"];
// nomi storici che oggi corrispondono a un altro paese:
const STESSO_PAESE = {
  "Federal Republic of Germany": "Germany",
  "German Democratic Republic": "Germany",
  "Bohemia": "Czech Republic",
  "Unified Team": "Russia",
  "Soviet Union": "Russia",
  "Yugoslavia": "Serbia",
};

//palette
const COLORI = {
  Americas: "#FF0051",
  Oceania: "#1600FF",
  Africa: "#FFFFFF",
  Asia: "#F2FF00",
  Europe: "#00FE93",
};

const GAP_CENTRO = 0.20; // vuoto in alto e in basso tra i due semicerchi (radianti)
const GAP_CONTINENTI = 0.03; // spazio tra un continente e l'altro (arco)
const ANNI = [
  { anno: "2008", etichetta: "Beijing 2008" },
  { anno: "2012", etichetta: "London 2012" },
  { anno: "2016", etichetta: "Rio de Janeiro 2016" },
  { anno: "2020", etichetta: "Tokyo 2020" },
  { anno: "2024", etichetta: "Paris 2024" },
];

let tabella;
let flussi = {};         
let totNascita = {}; // totale per continente a sinistra
let totRappresentato = {}; // totale per continente a destra
let totale = 0; //per mantenere proporzione dei flussi
let archiSx = {}; 
let archiDx = {};
let nastri = []; 

let annoScelto = "2008"; //quando apre sito si parte a vedere dati del 2008

async function setup() {
  createCanvas(windowWidth, windowHeight);
  tabella = await loadTable("assets/olympic.csv", ",", true);
  workSans = await loadFont("assets/WorkSans-Bold.ttf");
  aggiornaDati();
}

//DA METTERE NELLA MASTRO
// ricalcola tutto per l'anno scelto: all'avvio e a ogni click
function aggiornaDati() { //ogni volta che utente filtra gli anni si aggiornano i dati
  contaFlussi();
  calcolaArchi();
  calcolaNastri();
}
//FINO A QUI

function contaFlussi() {
  // matrice 5x5 (numero dei continenti di partenza x numero dei continenti di arrivo) piena di zeri
  for (const provenienza of CONTINENTI) {
    flussi[provenienza] = {};
    for (const arrivo of CONTINENTI) flussi[provenienza][arrivo] = 0;
    totNascita[provenienza] = 0;
    totRappresentato[provenienza] = 0;
  }
  totale = 0; // altrimenti a ogni click si somma al totale vecchio

  // viene letto il dataset riga per riga
  for (let i = 0; i < tabella.getRowCount(); i++) {
    const provenienza = tabella.getString(i, "continent_ origin");
    const arrivo = tabella.getString(i, "continent_ destination");
    // salta le righe di altri anni
    if (tabella.getString(i, "year") !== annoScelto) continue;
    // salta le righe senza continente o con "Altro"
    if (!CONTINENTI.includes(provenienza) || !CONTINENTI.includes(arrivo)) continue;
    // conta solo chi gareggia per un paese diverso da quello in cui è nato
    let paeseNascita = tabella.getString(i, "birth_country_full");
    const paeseGara = tabella.getString(i, "gapminder_countryname");
    if (STESSO_PAESE[paeseNascita]) paeseNascita = STESSO_PAESE[paeseNascita]; // traduco i nomi storici
    if (paeseNascita === paeseGara) continue; // stesso paese = non è migrato, salto

    //aumenta il conteggio del numero di atleti per ogni riga in cui si sofferma
    flussi[provenienza][arrivo]++;
    totNascita[provenienza]++;
    totRappresentato[arrivo]++;
    totale++;
  }
}

function calcolaArchi() {
  // l'arco totale meno i vuoti tra i continenti
  const spazioUtile = 1 - (CONTINENTI.length - 1) * GAP_CONTINENTI;
  let uSx = 0;
  let uDx = 0;
  for (const c of CONTINENTI) {
    const lSx = (totNascita[c] / totale) * spazioUtile;
    const lDx = (totRappresentato[c] / totale) * spazioUtile;
    archiSx[c] = { u1: uSx, u2: uSx + lSx }; //u1 indica il punto di inizio dell'arco e u2 il punto di fine 
    archiDx[c] = { u1: uDx, u2: uDx + lDx }; 
    uSx += lSx + GAP_CONTINENTI; // += per indicare che si parte da quello che c'è già
    uDx += lDx + GAP_CONTINENTI; // il prossimo parte dopo questo arco + il vuoto 
  }
}

function calcolaNastri() {
  nastri = [];
  const spazioUtile = 1 - (CONTINENTI.length - 1) * GAP_CONTINENTI;

  // segnalibri: fin dove è già occupato ogni arco (partono dall'inizio dell'arco)
  const usatoSx = {};
  const usatoDx = {};
  for (const c of CONTINENTI) {
    usatoSx[c] = archiSx[c].u1;
    usatoDx[c] = archiDx[c].u1;
  }

  for (const provenienza of CONTINENTI) {
    for (const arrivo of CONTINENTI) {
      const valore = flussi[provenienza][arrivo];
      if (valore === 0) continue;
      const l = (valore / totale) * spazioUtile; // larghezza del nastro

      nastri.push({ da: provenienza, a: arrivo, valore, u1: usatoSx[provenienza], u2: usatoSx[provenienza] + l, v1: usatoDx[arrivo], v2: usatoDx[arrivo] + l,}); //push per scrivere infondo alla lista queste informazioni

      usatoSx[provenienza] += l; // sposto in giù il segnalibro a sinistra
      usatoDx[arrivo] += l;      // e quello a destra
    }
  }
}

function draw() {
  background(BG);
  if (!tabella) return; // il csv si sta ancora caricando

  //da ricorrenti.js
  disegnaBottoni(); // prima del translate: usa le coordinate normali
  disegnaNav();
  disegnaBreadCrumb();

  //posizione del grafico
  const r = min(width, height) * 0.35; //dermino raggio del cerchio //AL MOMENTO ADAPTIVE
  translate(width / 2, height * 0.5); 

  for (const n of nastri) {
    disegnaNastro(n.u1, n.u2, n.v1, n.v2, r * 0.95, COLORI[n.da]);
  }

  for (const c of CONTINENTI) {
    disegnaArco("sinistra", archiSx[c].u1, archiSx[c].u2, r, COLORI[c]); //"" metto la stringa, la differenzio da un valore
    disegnaArco("destra", archiDx[c].u1, archiDx[c].u2, r, COLORI[c]); //u1 indica punto di inizio e u2 punto di fine
    disegnaEtichetta("sinistra", (archiSx[c].u1 + archiSx[c].u2) / 2, r, c);
    disegnaEtichetta("destra", (archiDx[c].u1 + archiDx[c].u2) / 2, r, c);
  }
}

//p5 usa circonferenza goniometrica in senso orario (negativi sopra)
//u indica di quanto ci si sposta nell'arco con un intervallo da 0 a 1 (0 in alto, 1 in basso)
function angolo(lato, u) {
  const ampiezza = PI - 2 * GAP_CENTRO; // lunghezza di un semicerchio
  if (lato === "destra") {
    return -HALF_PI + GAP_CENTRO + u * ampiezza; // scende a destra
  } else {
    return PI + HALF_PI - GAP_CENTRO - u * ampiezza; // scende a sinistra
  }
}

function disegnaArco(lato, u1, u2, r, colore) {
  let a1 = angolo(lato, u1);
  let a2 = angolo(lato, u2);
 if (a1 > a2) { //per l'arco di sinistra devo disegnare in senso anti-orario
  const tmp = a1;
  a1 = a2;
  a2 = tmp; //per scambiarsi hanno bisogno di un contenitore vuoto
}

  noFill();
  stroke(colore);
  strokeWeight(r * 0.05);
  strokeCap(SQUARE);
  arc(0, 0, r * 2, r * 2, a1, a2);
}

function disegnaEtichetta(lato, u, r, testo) {
  const a = angolo(lato, u);
  const rTesto = r * 1.18; //valore + del raggio, etichetta sta fuori dal cerchio
  noStroke();
  fill(255);
  textFont("Trebuchet MS");
  textSize(r * 0.06);
  textAlign(CENTER, CENTER); //rispetto a text() della stringa successiva
  text(testo, cos(a) * rTesto, sin(a) * rTesto);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

//per individuare tutti i punti di partenza e di arrivo dei nastri
function puntoSulCerchio(lato, u, r) {
  const a = angolo(lato, u);
  return { x: cos(a) * r, y: sin(a) * r };
}

// Bézier quadratica (3 punti)
function puntoBezier(p0, p1, p2, t) {
  const a = (1 - t) * (1 - t); //polinomi associati ai punti della curva
  const b = 2 * (1 - t) * t;
  const c = t * t;
  return {
    x: a * p0.x + b * p1.x + c * p2.x,
    y: a * p0.y + b * p1.y + c * p2.y,
  };
}

function disegnaNastro(u1, u2, v1, v2, r, colore) {
  const centro = { x: 0, y: 0 };
  const passi = 40; // i passi suddividono la curva in un numero di linee rette. più passi = curva più morbida

  const c = color(colore);
  c.setAlpha(150); // opacità del 60%
  fill(c);
  noStroke();

  beginShape(); //traccia il contorno dei nastri e i 4 vertici
  // 1. arco a sinistra (scende)
  for (let i = 0; i <= passi; i++) {
    const p = puntoSulCerchio("sinistra", lerp(u1, u2, i / passi), r); //lerp(start, stop, amt). Calculates a number between two numbers at a specific increment.
    vertex(p.x, p.y);
  }
  // 2. curva verso destra
  const provenienza = puntoSulCerchio("sinistra", u2, r);
  const arrivo = puntoSulCerchio("destra", v2, r);
  for (let i = 1; i <= passi; i++) {
    const p = puntoBezier(provenienza, centro, arrivo, i / passi);
    vertex(p.x, p.y);
  }
  // 3. arco a destra (al contrario: sale)
  for (let i = 1; i <= passi; i++) {
    const p = puntoSulCerchio("destra", lerp(v2, v1, i / passi), r);
    vertex(p.x, p.y);
  }
  // 4. curva di ritorno verso sinistra
  const provenzienza2 = puntoSulCerchio("destra", v1, r);
  const arrivo2 = puntoSulCerchio("sinistra", u1, r);
  for (let i = 1; i < passi; i++) {
    const p = puntoBezier(provenzienza2, centro, arrivo2, i / passi);
    vertex(p.x, p.y);
  }
  endShape(CLOSE);
}

