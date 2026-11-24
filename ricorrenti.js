const ANNI = [
  { anno: "2008", etichetta: "Beijing 2008" },
  { anno: "2012", etichetta: "London 2012" },
  { anno: "2016", etichetta: "Rio de Janeiro 2016" },
  { anno: "2020", etichetta: "Tokyo 2020" },
  { anno: "2024", etichetta: "Paris 2024" },
];

let annoScelto = "2008"; //quando apre sito si parte a vedere dati del 2008


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


// pagine raggiungibili dai bottoni in alto
const PAGINE = [
  { etichetta: "About Us", link: "aboutUs.html" },
  { etichetta: "About Dataset", link: "aboutDataset.html" },
];
const COLONNE = 5;      // stessa griglia dei bottoni degli anni
let bottoniNav = [];    // posizione dei bottoni in alto
let bottoni = [];       // (spostalo qui dallo sketch, vedi sotto)
let nastroSopra = null; // il nastro del chord sotto il mouse

// misure comuni a tutti i bottoni, ricalcolate a ogni frame
function griglia() {
  const margine = min(48, width * 0.025);
  const disponibile = width - 2 * margine;
  const w = disponibile * 0.19;
  const h = w / 5.5;
  const spazio = (disponibile - COLONNE * w) / (COLONNE - 1);
  return { margine, w, h, spazio };
}

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
       sessionStorage.setItem("anno", annoScelto); // l'anno scelto vale per tutte le pagine
      if (typeof aggiornaDati === "function") aggiornaDati(); // solo se la pagina ha aggiornaDati
    }
  }

  // click su un nastro del chord → apro la pagina di quel flusso
  // encodeURIComponent scrive i nomi in modo sicuro dentro l'indirizzo
  if (nastroSopra) {
    sessionStorage.setItem("anno", annoScelto); // per ritrovare lo stesso anno tornando indietro
    window.location.href =
      "continent.html?da=" + encodeURIComponent(nastroSopra.da) + "&a=" + encodeURIComponent(nastroSopra.a) + "&anno=" + annoScelto;
    return;
  }

  // bottoni di navigazione
  for (const b of bottoniNav) {
    if (mouseX > b.x && mouseX < b.x + b.w && mouseY > b.y && mouseY < b.y + b.h) {
      window.location.href = b.link; // apre la pagina
    }
  }

  // breadcrumb
  for (const b of bottoniBreadcrumb) {
    if (mouseX > b.x && mouseX < b.x + b.w && mouseY > b.y && mouseY < b.y + b.h) {
      window.location.href = b.link;
    }
  }
}

// nome del file ed etichette nome mostrato nel breadcrumb
const PAGINE_SITO = {
  "introduction.html": "Introduction",
  "index.html": "Global",
  "continent.html": "Continents",
  "comparison.html": "Comparison",
  "aboutUs.html": "About Us",
  "aboutDataset.html": "About Dataset",
};

let percorso = []; // file visitati in ordine
let bottoniBreadcrumb = []; // posizione delle voci cliccabili

// nome del file della pagina aperta (es. "global.html")
function fileCorrente() {
  const file = window.location.pathname.split("/").pop(); //spiegato da Claude per segnare il percorso
  return file === "" ? "index.html" : file;
}

// aggiorna il percorso all'apertura della pagina
function aggiornaPercorso() {
  const file = fileCorrente();
  if (!PAGINE_SITO[file]) return;

  try {
    percorso = JSON.parse(sessionStorage.getItem("percorso")) || []; //spiegato da Claude per selezionare il percorso
  } catch (e) {
    percorso = [];
  }

  const i = percorso.indexOf(file);
  if (i !== -1) percorso = percorso.slice(0, i + 1); // già visitata/se torno in dietro: la tolgo
  else percorso.push(file); // nuova: la aggiungo in fondo

  try {
    sessionStorage.setItem("percorso", JSON.stringify(percorso));
  } catch (e) {}
}
aggiornaPercorso(); // al caricamento della pagina

function disegnaBreadCrumb() {
  const { margine, h } = griglia();
  let x = margine;
  const y = margine * 0.5 + h / 2; // come About
  const dimensione = h * 0.45; 
  const gap = dimensione * 0.6; // spazio prima e dopo il >

  bottoniBreadcrumb = [];
  textFont(workSans);
  textSize(dimensione);
  textAlign(LEFT, CENTER);
  noStroke();

  for (let i = 0; i < percorso.length; i++) {
    const nome = PAGINE_SITO[percorso[i]];
    const ultima = i === percorso.length - 1;
    const conFreccia = i > 0; // la prima voce non ha la freccia davanti

    // larghezza totale della voce: > + nome
    const wFreccia = conFreccia ? textWidth(">") + gap : 0;
    const wVoce = wFreccia + textWidth(nome);

    const sopra = mouseX > x && mouseX < x + wVoce && mouseY > y - h / 2 && mouseY < y + h / 2;

    // colore unico per freccia e parola
    if (ultima) fill(150); // pagina corrente: grigia
    else if (sopra) fill("#5c45d2");  // hover
    else fill(255); // pagina passata: bianca

    if (conFreccia) text(">", x, y);
    text(nome, x + wFreccia, y);

    // cliccabile solo se non è la pagina corrente
    if (!ultima) bottoniBreadcrumb.push({ link: percorso[i], x, y: y - h / 2, w: wVoce, h });

    x += wVoce + gap; // spazio prima della voce successiva
  }
}