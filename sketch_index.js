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

const MIN_ATLETI = 2; //i flussi con meno di 2 atleti vengono ignorati
const GAP_CENTRO = 0.20; // vuoto in alto e in basso tra i due semicerchi (radianti)
const GAP_CONTINENTI = 0.03; // spazio tra un continente e l'altro (arco)
const SOGLIA = 1.2; // se la finestra è più stretta di 1.2 volte la sua altezza, il cerchio si centra in alto

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
  calcolaRigheUniche(tabella);
  workSans = await loadFont("assets/WorkSans-Bold.ttf");
  fontTitolo = await loadFont("assets/MontserratAlternates-Bold.ttf");

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
  // matrice 5x5 piena di zeri (5 come i continenti di partenza e di arrivo)
  for (const provenienza of CONTINENTI) {
    flussi[provenienza] = {};
    for (const arrivo of CONTINENTI) flussi[provenienza][arrivo] = 0;
    totNascita[provenienza] = 0;
    totRappresentato[provenienza] = 0;
  }
  totale = 0;

  //conto gli atleti che migrano
  const conteggio = {};
  for (const i of righeUniche) {
    if (tabella.getString(i, "year") !== annoScelto) continue;
    const provenienza = tabella.getString(i, "continent_ origin");
    const arrivo = tabella.getString(i, "continent_ destination");
    if (!CONTINENTI.includes(provenienza) || !CONTINENTI.includes(arrivo)) continue;

    //verifico di contare flussi migratori tra paesi di almeno due atleti
    let paeseNascita = tabella.getString(i, "birth_country_full");
    const paeseGara = tabella.getString(i, "gapminder_countryname");
    if (STESSO_PAESE[paeseNascita]) paeseNascita = STESSO_PAESE[paeseNascita]; 
    if (paeseNascita === "" || paeseGara === "") continue;
    if (paeseNascita === paeseGara) continue; // non è migrato

    const coppia = provenienza + "|" + arrivo + "|" + paeseNascita + "|" + paeseGara;
    conteggio[coppia] = (conteggio[coppia] || 0) + 1;
  }

  //sommo gli atleti che effettuano migrazione di ogni paese all'interno del continente
  for (const coppia in conteggio) {
    const [provenienza, arrivo] = coppia.split("|"); // mi servono solo i primi due pezzi
    const valore = conteggio[coppia];
    if (valore < MIN_ATLETI) continue; // salto flussi con solo 1 atleta

    flussi[provenienza][arrivo] += valore;
    totNascita[provenienza] += valore;
    totRappresentato[arrivo] += valore;
    totale += valore;
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
  disegnaBottoni();
  disegnaNav();
  disegnaBreadCrumb();
  disegnaTitolo();

  //posizione e grandezza del cerchio e dei box, tutto da disposizione()
  const L = disposizione();
  const r = L.r;
  const { h } = griglia(); // serve per la dimensione di Departure/Arrival

  //hover nastri: mouse misurato dallo stesso centro del translate
  const mx = mouseX - L.cx;
  const my = mouseY - L.cy;
  nastroSopra = null;
  for (const n of nastri) {
    n.punti = puntiNastro(n.u1, n.u2, n.v1, n.v2, r * 0.95);
    if (dentroForma(mx, my, n.punti)) nastroSopra = n;
  }

  translate(L.cx, L.cy);

  for (const n of nastri) {
    let opacita = 150;
    if (nastroSopra === n) opacita = 255;
    else if (nastroSopra) opacita = 100;
    disegnaNastro(n.punti, COLORI[n.da], opacita);
  }

  //Departure e Arrival
  noStroke();
  fill(255);
  textFont(workSans);
  textSize(h * 0.45);
  textAlign(CENTER, CENTER);

  push();
  translate(-r * 1.5, 0);
  rotate(-HALF_PI);
  text("Departure", 0, 0);
  pop();

  push();
  translate(r * 1.5, 0);
  rotate(HALF_PI);
  text("Arrival", 0, 0);
  pop();

  for (const c of CONTINENTI) {
    disegnaArco("sinistra", archiSx[c].u1, archiSx[c].u2, r, COLORI[c]);
    disegnaArco("destra", archiDx[c].u1, archiDx[c].u2, r, COLORI[c]);
    disegnaEtichetta("sinistra", (archiSx[c].u1 + archiSx[c].u2) / 2, r, c);
    disegnaEtichetta("destra", (archiDx[c].u1 + archiDx[c].u2) / 2, r, c);
  }

  resetMatrix(); // torno alle coordinate normali (annulla il translate)
  disegnaBox(L); // i box: dopo resetMatrix e dopo aver creato L

  //riquadro info e manina sopra i box, così non vengono coperti
  if (nastroSopra) {
    disegnaInfo(nastroSopra);
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
  const passi = 60; // i passi suddividono la curva in un numero di linee rette. più passi = curva più morbida
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
function disegnaInfo(n) {
  const dim = min(width, height) * 0.022;
  const riga1 = "from " + n.da + " to " + n.a;
  const riga2 = n.valore + " athletes"; 

  textFont("Trebuchet MS");
  textSize(dim);
  const w1 = textWidth(riga1);
  textSize(dim);
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
  stroke(255);
  strokeWeight(1.5);
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

//contenuto dei due box
const BOX_ANNO = {
  "2008": [
    { titolo: "Beijing 2008", testo: "In Beijing, intercontinental flows reflect a sharp economic divide, drawing African and post-Soviet talent toward wealthier nations while Chinese-born athletes increasingly represent teams abroad." },
    { titolo: "Titolo box 2", testo: "Swimming saw the biggest rise in athletes competing outside their birth continent: 44, up from 24 at the previous Games, with scattered routes across Europe, Asia, Africa and the Americas." },
  ],
  "2012": [
    { titolo: "London 2012", testo: "In London, athletic migration mirrors postcolonial ties and fast-tracked naturalizations, with Europe and the Americas acting as major hubs for foreign-born competitors from the Global South." },
    { titolo: "...", testo: "Basketball saw the biggest rise in athletes competing outside their birth continent: 31, up from 13 at the previous Games. The top route: US-born players representing Nigeria (9 athletes)." },
  ],
  "2016": [
    { titolo: "Rio de Janeiro 2016", testo: "In Rio, forced displacement reshapes the Olympic map with the debut of the Refugee Olympic Team, highlighting how geopolitical crises drive intercontinental mobility alongside economic" },
    { titolo: "...", testo: "Athletics saw the biggest rise in athletes competing outside their birth continent: 171, up from 120. Main route: Africa to Asia (Kenya- and Nigeria-born athletes for Bahrain and Turkey)." },
  ],
  "2020": [
    { titolo: "Tokyo 2020", testo: "In Tokyo, pandemic disruptions slow global movement yet confirm a resilient pattern: intercontinental talent continues to converge on high-GDP delegations while dual-citizenship rosters diversify." },
    { titolo: "...", testo: "Baseball saw the biggest rise in athletes competing outside their birth continent: 21, after returning to the Games. Of these, 20 were US-born players representing Israel." },
  ],
  "2024": [
    { titolo: "Paris 2024", testo: "In Paris, intercontinental migration highlights an increasingly multipolar landscape, where historic hubs in Europe and North America compete with emerging Gulf and Asian nations for global talent." },
    { titolo: "...", testo: "Football saw the biggest rise in athletes competing outside their birth continent: 49, up from 19. Top routes: France-born players for Mali and Guinea, Spain-born for the Dominican Republic." },
  ],
};

//posizione del cerchio e dei box
function disposizione() {
  const { margine, h } = griglia();
  const alto = margine * 0.5 + h * 2;
  const basso = height - margine * 0.5 - h - margine;
  const gap = margine * 0.7; //spazio tra i due box

  if (width / height >= SOGLIA) {
    // finestra larga: cerchio a sinistra, box uno sotto l'altro a destra
    const r = min(width, height) * 0.32;
    const cx = width / 3;
    const cy = height / 1.9;
    const x = cx + r * 1.5 + h; // i box partono dopo la scritta "Arrival"
    const w = width - margine - x; // fino al margine destro
    const hBox = (basso - alto - gap) / 2;
    return {
      r, cx, cy,
      box: [
        { x, y: alto, w, h: hBox },
        { x, y: alto + hBox + gap, w, h: hBox },
      ],
    };
  } else {
    // finestra stretta: cerchio centrato in alto, box sotto, uno sotto l'altro
    const r = min(width * 0.28, (basso - alto) * 0.25);
    const cx = width / 2;
    const cy = alto + r * 1.3;
    const y = cy + r * 1.3 + gap;
    const w = width - margine * 2;
    const hBox = (basso - y - gap) / 2;
    return {
      r, cx, cy,
      box: [
        { x: margine, y, w, h: hBox },
        { x: margine, y: y + hBox + gap, w, h: hBox },
      ],
    };
  }
}

//box
function disegnaBox(L) {
  const BOX = BOX_ANNO[annoScelto]; // i due box dell'edizione selezionata
  const { margine, h } = griglia();
  const size = L.r * 0.05; 
  const interlinea = size * 1.5;
  const pad = size * 1.2; // margine interno
  const gap = margine * 0.7; // spazio tra i due box
  const w = L.box[0].w * 0.7; //larghezza box
  const tw = w - pad * 2; // larghezza testo

  // altezza di ogni box dipendeo testo
  textFont("Trebuchet MS");
  const altezze = BOX.map((b) => contaRighe(b.testo, tw, size) * interlinea + pad * 2);
  const totaleAltezze = altezze[0] + gap + altezze[1];

  // adaptive
  let y = L.stretto ? L.box[0].y : L.cy - totaleAltezze / 2;
  const x = L.stretto ? (width - w) / 2 : width - margine - w;

  for (let i = 0; i < BOX.length; i++) {
    // box
    stroke(255);
    strokeWeight(3);
    fill(BG);
    rect(x, y, w, altezze[i], h * 0.3);

    // testo
    noStroke();
    fill(255);
    textAlign(LEFT, TOP);
    textFont("Trebuchet MS");
    textSize(size);
    textLeading(interlinea);
    text(BOX[i].testo, x + pad, y + pad, tw);

    y += altezze[i] + gap; // il box successivo parte sotto
  }
}

//gestione a capi
function contaRighe(testo, larghezza, size) {
  textSize(size);
  let righe = 0;
  for (const paragrafo of testo.split("\n")) {
    righe++;
    let riga = "";
    for (const parola of paragrafo.split(" ")) {
      const prova = riga === "" ? parola : riga + " " + parola;
      if (textWidth(prova) > larghezza && riga !== "") {
        righe++; // la parola non ci sta: va a capo
        riga = parola;
      } else {
        riga = prova;
      }
    }
  }
  return righe;
}