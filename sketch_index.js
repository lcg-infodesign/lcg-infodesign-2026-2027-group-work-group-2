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

let tabella;
let flussi = {};         
let totNascita = {}; // totale per continente a sinistra
let totRappresentato = {}; // totale per continente a destra
let totale = 0; //per mantenere proporzione dei flussi
let archiSx = {}; 
let archiDx = {};
let nastri = []; 

async function setup() {
  createCanvas(windowWidth, windowHeight);
  tabella = await loadTable("assets/olympic.csv", ",", true);
  workSans = await loadFont("assets/WorkSans-Bold.ttf");

  // se torno qui dalla pagina di un nastro, ritorno all'anno che stavo visualizzando (salvato in ricorrenti.js)
  const annoSalvato = sessionStorage.getItem("anno");
  if (ANNI.some((a) => a.anno === annoSalvato)) annoScelto = annoSalvato;

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

  //hover nastri, controllo che il mouse sia sopra il grafico
  const mx = mouseX - width / 2;
  const my = mouseY - height / 2;
  nastroSopra = null; // (la variabile è in ricorrenti.js, perché il click è lì)
  for (const n of nastri) {
    n.punti = puntiNastro(n.u1, n.u2, n.v1, n.v2, r * 0.95);
    // i nastri si sovrappongono: tengo l'ultimo trovato, cioè quello disegnato più in alto
    if (dentroForma(mx, my, n.punti)) nastroSopra = n;
  }

  translate(width / 2, height / 2); 

  for (const n of nastri) {
    //opacità diversa a seconda dell'hover
    let opacita = 150; // normale (circa 60%)
    if (nastroSopra === n) opacita = 255; // il nastro sotto il mouse: pieno
    else if (nastroSopra) opacita = 100; // gli altri, mentre ne guardo uno, diventano ancora più opachi per contrasto
    disegnaNastro(n.punti, COLORI[n.da], opacita);
  }

  for (const c of CONTINENTI) {
    disegnaArco("sinistra", archiSx[c].u1, archiSx[c].u2, r, COLORI[c]); //"" metto la stringa, la differenzio da un valore
    disegnaArco("destra", archiDx[c].u1, archiDx[c].u2, r, COLORI[c]); //u1 indica punto di inizio e u2 punto di fine
    disegnaEtichetta("sinistra", (archiSx[c].u1 + archiSx[c].u2) / 2, r, c);
    disegnaEtichetta("destra", (archiDx[c].u1 + archiDx[c].u2) / 2, r, c);
  }

  //etichetta vicino al mouse e "manina" quando sono sopra un nastro
  resetMatrix(); // torno alle coordinate normali (annulla il translate)
  if (nastroSopra) {
    /disegnaInfo(nastroSopra);/
    cursor(HAND);
  } else {
    cursor(ARROW);
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

//serve sia per disegnare il nastro sia per capire se il mouse ci è dentro.
function puntiNastro(u1, u2, v1, v2, r) {
  const centro = { x: 0, y: 0 };
  const passi = 40; // i passi suddividono la curva in un numero di linee rette. più passi = curva più morbida
  const punti = [];

  // 1. arco a sinistra (scende)
  for (let i = 0; i <= passi; i++) {
    punti.push(puntoSulCerchio("sinistra", lerp(u1, u2, i / passi), r));
  }
  // 2. curva verso destra
  const inizioCurva = puntoSulCerchio("sinistra", u2, r);
  const fineCurva = puntoSulCerchio("destra", v2, r);
  for (let i = 1; i <= passi; i++) {
    punti.push(puntoBezier(inizioCurva, centro, fineCurva, i / passi));
  }
  // 3. arco a destra (al contrario: sale)
  for (let i = 1; i <= passi; i++) {
    punti.push(puntoSulCerchio("destra", lerp(v2, v1, i / passi), r));
  }
  // 4. curva di ritorno verso sinistra
  const inizioCurva2 = puntoSulCerchio("destra", v1, r);
  const fineCurva2 = puntoSulCerchio("sinistra", u1, r);
  for (let i = 1; i < passi; i++) {
    punti.push(puntoBezier(inizioCurva2, centro, fineCurva2, i / passi));
  }
  return punti;
}

// disegnaNastro unisce i punti già calcolati
function disegnaNastro(punti, colore, opacita) {
  const c = color(colore);
  c.setAlpha(opacita);
  fill(c);
  noStroke();
  beginShape(); //traccia il contorno del nastro
  for (const p of punti) vertex(p.x, p.y);
  endShape(CLOSE);
}

//verifica posizione
//da (x, y) tiro una linea orizzontale verso destra e conto quante volte attraversa il contorno. Dispari = sono dentro, pari = sono fuori.
function dentroForma(x, y, punti) {
  let dentro = false; //parto considerando che sono fuori
  for (let i = 0, j = punti.length - 1; i < punti.length; j = i++) {
    const a = punti[i];
    const b = punti[j]; // j è il punto prima di i: insieme formano un lato del contorno
    const attraversa = (a.y > y) !== (b.y > y) && x < ((b.x - a.x) * (y - a.y)) / (b.y - a.y) + a.x; //se la y di a è > della y del mouse allora y di b deve essere minore
    if (attraversa) dentro = !dentro; //ogni attraversamento ribalta lo stato 
  }
  return dentro;
}

//riquadro con flusso indicato e il numero di atleti, vicino al mouse
/* function disegnaInfo(n) {
  const dim = min(width, height) * 0.022;
  const riga1 = n.da + " → " + n.a;
  const riga2 = n.valore + " athletes · click to explore"; 

  textFont(workSans);
  textSize(dim);
  const w1 = textWidth(riga1);
  textSize(dim * 0.75);
  const w2 = textWidth(riga2);

  const pad = dim * 0.7;
  const w = max(w1, w2) + pad * 2;
  const h = dim * 2.3 + pad * 2;
  // il riquadro sta in basso a destra del mouse, ma se esce dallo schermo lo sposto
  let x = mouseX + dim;
  let y = mouseY + dim;
  if (x + w > width) x = mouseX - dim - w;
  if (y + h > height) y = mouseY - dim - h;

  fill(BG);
  stroke(COLORI[n.da]);
  strokeWeight(1.5);
  rect(x, y, w, h, dim * 0.4);

  noStroke();
  textAlign(LEFT, TOP);
  fill(255);
  textSize(dim);
  text(riga1, x + pad, y + pad);
  fill(255, 170);
  textSize(dim * 0.75);
  text(riga2, x + pad, y + pad + dim * 1.4);
}*/