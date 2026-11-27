async function setup() {
  createCanvas(windowWidth, windowHeight);
  workSans = await loadFont("assets/WorkSans-Bold.ttf");
}

function draw() {
  background("#190A32");
  disegnaBox();

  //da ricorrenti.js
  disegnaNav();
  disegnaLinkGlobal();

  disegnaBottoneSheet();
}

//tre box con testo
function disegnaBox() {
  const { margine, h } = griglia(); //prendo da ricorrenti margine e altezza bottoni
  const impilati = width < 1000 || width < height; //con finestra stretta i box si mettono uno sotto l'altro
  const gap = margine * 0.7; //spazio tra box
  const by = margine * 0.5 + h * 4; //altezza da cui partono box, sotto il titolo della pagina
  const bh = height - margine * 0.5 - h - margine * 0.8 - by; //spazio per i box, fino a bottone in basso

  //misure che cambiano tra box affiancati e box impilati
  let bw; //larghezza box
  let pad; //margine interno tra bordo e contenuto
  let wt; //larghezza area testo
  let tt; //larghezza area titolo
  let sizeT; //titoletto
  let inter; //interlinea testo

  if (impilati) {
    bw = width - 2 * margine;
    pad = min(bw * 0.06, 24); //nei box larghi resta piccolo per lasciare spazio a testo
    wt = (bw - 3 * pad) * 0.7; //spazio per testo
    tt = (bw - 3 * pad) * 0.3; //spazio per titolo
    sizeT = constrain(bh * 0.04, 18, 26); //constrain limita risultato
    inter = 1.35; //più stretta per fare entrare più righe
  } else {
    bw = (width - 2 * margine - 2 * gap) / 3;
    pad = bw * 0.06;
    wt = bw - 2 * pad;
    tt = bw - 2 * pad;
    sizeT = max(20, bw * 0.07); //mai sotto 20px
    inter = 1.5;
  }
  const tw = wt * 0.96; //larghezza per contare righe occupate da testo (con margine di sicurezza)

  const testo1 =
    "In 2026 Gijsbert Oonk, professor of Migration, Citizenship, and Identity in a Globalizing World, and Director of Research at the Department of History, Erasmus University Rotterdam, compiled a dataset covering nearly every Olympic participant since Athens 1896.\n" +
    "It records each athlete's birthplace, the nation they represented, and the events they entered, and links this to national context.\n" +
    "The dataset is designed to ask not only who won, but under what conditions athletes are able to participate, compete, and succeed.\n" +
    "It builds on 12 years of Oonk's research on sports migration (in the Olympics and the FIFA World Cup). He hypothesized that migration had grown over time, but found the opposite: it has remained steady at roughly 8-12% throughout.";

  const testo2 =
    "The primary source for the dataset is Olympedia, supplemented by Wikidata, official Olympic Studies Centre records, and newspaper archives accessed through LexisNexis to verify information and fill gaps. The dataset was cleaned and standardized by removing irrelevant columns and records, harmonizing column names, and adding geographical variables, including continents of origin and destination.\n" +
    "Records were limited to Summer Olympic Games from 2008 onwards. Extensive cross-referencing was also carried out to address inconsistencies, account for geopolitical changes, and ensure comparability across countries and over time.";

  const testo3 =
    "Our learning objectives are to recognize the main global migration flows, understanding Europe's central role as both the main country of origin and destination, and the United States as the primary destination in the Americas. We also aim to observe how these flows vary between countries while remaining stable in volume over time.\n" +
    "We also aim to compare country of birth and represented nation in order to identify the economic and social differences between the two countries. In particular, to understand how many people have made this migration and recognize that only slightly more than half of athletes migrate to a wealthier country, while more than half migrate to a less populous country. Finally, to note that slightly more than half of athletes migrate to a country with fewer medals won.";


  //se titolo più lungo va a capo il testo parte più in basso
  textFont(workSans);
  textSize(sizeT);
  let righeTitolo;

  if (textWidth("Knowledge Objectives") > tt * 0.96) {
    righeTitolo = 2;
  } else {
    righeTitolo = 1;
  }

  let zonaT; //spazio sopra il testo occupato dal titolo
  if (impilati) {
    zonaT = 0; //il titolo sta a sinistra, non sopra il testo
  } else {
    zonaT = sizeT * (1.05 * righeTitolo + 1.15);
  }

  //dimensione del testo: la più grande che entra in tutti e tre i box
  let sizeB = 8; //valore di partenza
  for (let s = min(22, bw * 0.075); s >= 8; s -= 0.5) { //provo dimensioni testo da più grande a più piccola
    const r1 = contaRighe(testo1, tw, s);
    const r2 = contaRighe(testo2, tw, s);
    const r3 = contaRighe(testo3, tw, s);

    let entra;
    if (impilati) {
      //tre box uno sotto l'altro: somma altezze deve entrare nello spazio
      entra = 3 * (2 * pad + zonaT) + (r1 + r2 + r3) * s * inter + 2 * gap <= bh;
    } else {
      //tre box affiancati, entra testo più lungo
      entra = max(r1, r2, r3) * s * inter <= bh - 2 * pad - zonaT;
    }

    if (entra) { //scelta dimensione più grande, che va bene per tutti e tre
      sizeB = s;
      break;
    }
  }

  //altezza e posizione dei box
  const r1 = contaRighe(testo1, tw, sizeB);
  const r2 = contaRighe(testo2, tw, sizeB);
  const r3 = contaRighe(testo3, tw, sizeB);
  const base = (r) => 2 * pad + zonaT + r * sizeB * inter; //altezza che serve a testo di r righe

  const y1 = by;
  let y2;
  let y3;
  let h1;
  let h2;
  let h3;
  let passoX; //di quanto ogni box è spostato a destra rispetto al precedente

  if (impilati) {
    //ogni box alto quanto il suo testo, spazio che avanza si divide in parti uguali
    const extra = max(0, (bh - 2 * gap - base(r1) - base(r2) - base(r3)) / 3);
    h1 = base(r1) + extra;
    h2 = base(r2) + extra;
    h3 = base(r3) + extra;
    y2 = y1 + h1 + gap;
    y3 = y2 + h2 + gap;
    passoX = 0;
  } else {
    //box affiancati: tutti alti uguale, sulla stessa riga
    h1 = bh;
    h2 = bh;
    h3 = bh;
    y2 = by;
    y3 = by;
    passoX = bw + gap;
  }

  //misure comuni a tre box
  const m = { bw, pad, sizeT, zonaT, sizeB, inter, impilati, tt, wt };
  drawBox(margine, y1, h1, m, "About dataset", testo1);
  drawBox(margine + passoX, y2, h2, m, "Methodology", testo2);
  drawBox(margine + 2 * passoX, y3, h3, m, "Knowledge Objectives", testo3);
}

//nel singolo box: x, y e h sono la sua posizione e altezza
function drawBox(x, y, h, m, titolo, testo) {
  //riquadro
  stroke("#ffffff");
  strokeWeight(3);
  fill(25, 10, 50, 160);
  rect(x, y, m.bw, h, min(30, m.bw * 0.06, h * 0.2)); //min per evitare che angoli diventino troppo arrotondati

  //titolo box (se è più largo dello spazio va a capo)
  noStroke();
  fill(255);
  textFont(workSans);
  textSize(m.sizeT);
  textLeading(m.sizeT * 1.05); //distanza tra righe titolo
  textWrap(WORD); //se testo non entra, va a capo tra una parola e l'altra
  if (m.impilati) {
    textAlign(CENTER, CENTER); //titolo a sinistra, centrato in altezza
    text(titolo, x + m.pad, y, m.tt, h);
  } else {
    textAlign(CENTER, TOP);
    text(titolo, x + m.pad, y + m.pad, m.tt);
  }

  //testo del box
  textFont("Trebuchet MS");
  textSize(m.sizeB);
  textLeading(m.sizeB * m.inter);
  if (m.impilati) {
    textAlign(LEFT, CENTER); //testo a destra, centrato in altezza
    text(testo, x + 2 * m.pad + m.tt, y + m.pad, m.wt, h - 2 * m.pad);
  } else {
    textAlign(LEFT, TOP);
    const ty = y + m.pad + m.zonaT; //da dove parte il testo
    text(testo, x + m.pad, ty, m.wt, y + h - m.pad - ty + m.sizeB * m.inter);
  }
}

//quante righe occupa un testo
function contaRighe(testo, larghezza, size) {
  textFont("Trebuchet MS");
  textStyle(NORMAL);
  textSize(size);
  let righe = 0; //contatore
  for (const paragrafo of testo.split("\n")) { //testo diviso paragrafi
    righe++; //ogni paragrafo parte da una riga nuova
    let riga = ""; //riga che si sta costruendo, variabile vuota che verrà riempita da parole testo
    for (const parola of paragrafo.split(" ")) { //testo diviso in parole singole
      let prova = riga;
      if (riga !== "") { //controlla che riga non sia vuota
        prova += " "; //aggiunge spazio
      }
      prova += parola; //aggiunge parola successiva
      if (riga !== "" && textWidth(prova) > larghezza) {
        righe++; //se la parola non entra va a capo
        riga = parola;
      } else {
        riga = prova; //si aggiunge una parola alla volta per verificare che entri nello spazio disponibile
      }
    }
  }
  return righe;
}

//bottone in basso link a Google Sheets
function disegnaBottoneSheet() {
  const { margine, w, h, spazio } = griglia(); //misura griglia bottoni
  const x = margine + 2 * (w + spazio); //colonna centrale della griglia 
  const y = height - margine * 0.5 - h; //stessa altezza bottoni degli anni

  const sopra = mouseX > x && mouseX < x + w && mouseY > y && mouseY < y + h; //vero se mouse è su bottone

  noStroke();
  if (sopra) fill("#5c45d2");
  else fill("#281977");
  rect(x, y, w, h, h / 2);

  fill("#ffffff");
  textFont(workSans);
  textSize(h * 0.45);
  textAlign(CENTER, CENTER);
  text("Discover the dataset", x + w / 2, y + h / 2);

  //click gestito da mousePressed di ricorrenti.js
  bottoniNav.push({ link: "https://docs.google.com/spreadsheets/d/1bBfkbnhPlMpUxN2Nf1iuXnHpjvYUomeceLQjjU1IGlI/edit?usp=sharing", x, y, w, h });
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}