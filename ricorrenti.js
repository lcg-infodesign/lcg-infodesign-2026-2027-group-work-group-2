const ANNI = [
  { anno: "2008", etichetta: "Beijing 2008" },
  { anno: "2012", etichetta: "London 2012" },
  { anno: "2016", etichetta: "Rio de Janeiro 2016" },
  { anno: "2020", etichetta: "Tokyo 2020" },
  { anno: "2024", etichetta: "Paris 2024" },
];

let annoScelto = "2008"; //quando apre sito si parte a vedere dati del 2008
let anniDisattivi = [];


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
    const disattivo = anniDisattivi.includes(a.anno);
    const sopra = mouseX > x && mouseX < x + w && mouseY > y && mouseY < y + h;

    noStroke();
    if (disattivo) fill("#24203C"); //grigio
    else if (scelto) fill(255);
    else if (sopra) fill("#5c45d2");
    else fill("#281977");
    rect(x, y, w, h, h / 2);

    if (disattivo) fill("#7E7E7E");
    else if (scelto) fill("#281977");
    else fill(255);
    text(a.etichetta, x + w / 2, y + h / 2);   // mostro il nome della città

     bottoni.push({ anno: a.anno, x, y, w, h, disattivo }); // salvo solo l'anno
    x += w + spazio;
  }
}


// pagine raggiungibili dai bottoni in alto
const PAGINE = [
  { etichetta: "About Us", link: "aboutUs.html" },
  { etichetta: "About Dataset", link: "aboutDataset.html" },
];
const COLONNE = 5;// stessa griglia dei bottoni degli anni
let bottoniNav = [];// posizione dei bottoni in alto
let bottoni = [];// (spostalo qui dallo sketch, vedi sotto)
let nastroSopra = null; // il nastro del chord sotto il mouse
let nastroPaeseSopra = null; // il nastro del sankey (pagina continent) sotto il mouse

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
    if (b.disattivo) continue; // bottone grigio: il click non fa niente
    if (mouseX > b.x && mouseX < b.x + b.w && mouseY > b.y && mouseY < b.y + b.h) {
      annoScelto = b.anno;
       sessionStorage.setItem("anno", annoScelto); // l'anno scelto vale per tutte le pagine
      if (typeof aggiornaDati === "function") aggiornaDati(); // solo se la pagina ha aggiornaDati
    }
  }

  // click su un nastro del chord apro la pagina di quel flusso
  // encodeURIComponent scrive i nomi in modo sicuro dentro l'indirizzo
  if (nastroSopra) {
    sessionStorage.setItem("anno", annoScelto); // per ritrovare lo stesso anno tornando indietro
    window.location.href =
      "continent.html?da=" + encodeURIComponent(nastroSopra.da) + "&a=" + encodeURIComponent(nastroSopra.a) + "&anno=" + annoScelto;
    return;
  }
   
  // click su un nastro del sankey apro la pagina comparison di quei due paesi
  if (nastroPaeseSopra) {
    sessionStorage.setItem("anno", annoScelto);
    window.location.href =
      "comparison.html?da=" + encodeURIComponent(nastroPaeseSopra.da) +
      "&a=" + encodeURIComponent(nastroPaeseSopra.a) +
      "&anno=" + annoScelto;
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

const PAGINE_SITO = {
  "introduction.html": "Introduction",
  "index.html": "Global",
  "continent.html": "Continents",
  "comparison.html": "Comparison",
  "aboutUs.html": "About Us",
  "aboutDataset.html": "About Dataset",
};

const PAGINE_ESCLUSE_BREADCRUMB = ["aboutUs.html", "aboutDataset.html"]; //le due pagine About non compaiono mai nel breadcrumb, all'interno delle pagine compare solo "Global"
let percorso = []; // file visitati in ordine
let bottoniBreadcrumb = []; // posizione delle voci cliccabili

//pagina corrente
function fileCorrente() {
  const file = window.location.pathname.split("/").pop(); //spiegato da Claude per segnare il percorso
  return file === "" ? "index.html" : file;
}

// ripulisce l'array tenendo solo pagine valide ed escludendo aboutUs e aboutDataset
function filtraPercorso(lista) {
  if (!Array.isArray(lista)) return []; // se non è un array ritorna vuoto
  return lista.filter(p => PAGINE_SITO[p] && !PAGINE_ESCLUSE_BREADCRUMB.includes(p)); // rimuove pagine non censite o escluse
}

// mette sempre "Introduction" come prima voce del breadcrumb 
function assicuraIntroductionInTesta(lista) {
  const senzaIntro = lista.filter(p => p !== "introduction.html"); //evita duplicati
  return ["introduction.html", ...senzaIntro]; //inserisce introduction all'inizio
}

// aggiorna il percorso all'apertura della pagina
function aggiornaPercorso() {
  const file = fileCorrente();
  if (!PAGINE_SITO[file]) return;

  if (PAGINE_ESCLUSE_BREADCRUMB.includes(file)) { //su aboutUs e aboutDataset non compare Introduction
    percorso = []; // azzera il percorso locale
    return; // non modifica il percorso salvato in sessionStorage
  }

  try {
    percorso = filtraPercorso(JSON.parse(sessionStorage.getItem("percorso")) || []); //spiegato da Claude per selezionare il percorso
  } catch (e) {
    percorso = [];
  }

  percorso = assicuraIntroductionInTesta(percorso); // assicura che Introduction sia sempre la prima voce

  const i = percorso.indexOf(file);
  if (i !== -1) percorso = percorso.slice(0, i + 1); //pagina già visitata o se torno in dietro, la pagina viene rimossa
  else percorso.push(file); //se è una pagina nuova viene aggiunta in fondo

  try {
    sessionStorage.setItem("percorso", JSON.stringify(percorso));
  } catch (e) {}
}
aggiornaPercorso(); //al caricamento della pagina

window.addEventListener("pageshow", () => { //riallinea quando si torna indietro con la freccia del browser
  aggiornaPercorso(); // aggiorna e ripulisce il percorso anche da cache
});

function disegnaVoceBreadcrumb(testo, link, x, y, h, dimensione, cliccabile, grigia) { //disegna una voce del breadcrumb e gestisce il click
  const sopra = mouseX > x && mouseX < x + textWidth(testo) && mouseY > y - h / 2 && mouseY < y + h / 2; //controlla se il mouse è sopra il testo

  if (grigia) fill(150); //se è la pagina corrente usa il grigio
  else if (sopra) fill("#5c45d2"); //se c'è il mouse sopra usa il colore hover
  else fill(255); //altrimenti usa il bianco

  textSize(dimensione); //imposta la dimensione del carattere
  text(testo, x, y); //disegna la stringa nella posizione indicata

  if (cliccabile) { //registra l'area cliccabile solo se la voce può aprire una pagina
    bottoniBreadcrumb.push({ link, x, y: y - h / 2, w: textWidth(testo), h }); //salva coordinate e link per mousePressed
  }

  return textWidth(testo); //restituisce la larghezza disegnata per spostare la x successiva
}

function disegnaBreadCrumb() {
  const file = fileCorrente(); // egge la pagina aperta

  if (PAGINE_ESCLUSE_BREADCRUMB.includes(file)) { //in aboutUs e aboutDataset viene mostrato sempre e solo Global
    disegnaLinkGlobal(); //disegna il link verso Index
    return; //esce prima di disegnare il breadcrumb
  }

  percorso = assicuraIntroductionInTesta(filtraPercorso(percorso)); //doppia sicurezza contro residui di pagine escluse

  const { margine, h } = griglia();
  let x = margine;
  const y = margine * 0.5 + h / 2; //come About
  const dimensione = h * 0.45; 
  const gap = dimensione * 0.6; //spazio prima e dopo il >

  bottoniBreadcrumb = [];
  textFont(workSans);
  textAlign(LEFT, CENTER);
  noStroke();

  for (let i = 0; i < percorso.length; i++) {
    const nome = PAGINE_SITO[percorso[i]];
    const ultima = i === percorso.length - 1;

    if (i > 0) { // per tutte le voci dopo la prima disegna la freccia separatrice
      fill(ultima ? 150 : 255); // colora la freccia come la voce corrente o precedente
      textSize(dimensione); // imposta la dimensione della freccia
      text(">", x, y); // disegna il carattere separatore
      x += textWidth(">") + gap; // sposta x oltre la freccia e lo spazio
    }

    const wNome = disegnaVoceBreadcrumb(nome, percorso[i], x, y, h, dimensione, !ultima, ultima); // disegna il nome della pagina e ottiene la larghezza
    x += wNome + gap; // spazio prima della voce successiva
  }
}

function disegnaLinkGlobal() {
  const { margine, h } = griglia();
  let x = margine;
  const y = margine * 0.5 + h / 2; //come About
  const dimensione = h * 0.45;
  const nome = "Global";

  bottoniBreadcrumb = [];
  textFont(workSans);
  textAlign(LEFT, CENTER);
  noStroke();

  disegnaVoceBreadcrumb(nome, "index.html", x, y, h, dimensione, true, false); //disegna Global sempre cliccabile e bianco
}

let righeUniche = [];
function calcolaRigheUniche(t) {
  righeUniche = [];
  const visti = {};
  for (let r = 0; r < t.getRowCount(); r++) {
    const verifica =
      t.getString(r, "year") + "|" +
      t.getString(r, "gapminder_countryname") + "|" +
      t.getString(r, "used_name");

      if (visti[verifica]) continue;
      visti[verifica] = true;
      righeUniche.push(r);  
  }

}

//titoli
//array con i continenti
const CONTINENTI_TITOLO = ["Americas", "Oceania", "Africa", "Asia", "Europe"];

let fontTitolo;

const TITOLO_FISSO = "Migration flow"; // prima parte, uguale in tutte le pagine
const SEPARATORE = " → "; // tra partenza e arrivo (per tornare al trattino: " - ")

// legge dall'indirizzo il flusso cliccato: continent.html?da=Europe&a=Americas
// restituisce null se manca o se i nomi non sono continenti veri
function flussoDaIndirizzo() {
  const parametri = new URLSearchParams(window.location.search);
  const da = parametri.get("da");
  const a = parametri.get("a");
  if (!CONTINENTI_TITOLO.includes(da) || !CONTINENTI_TITOLO.includes(a)) return null;
  return { da, a };
}

// seconda parte del titolo: cambia in base alla pagina e al flusso cliccato
function sottotitolo() {
  const file = fileCorrente();

  if (file === "continent.html") {
    const flusso = flussoDaIndirizzo();
    if (!flusso) return ""; // indirizzo senza flusso valido: resta solo "Migration flow"
    return flusso.da + SEPARATORE + flusso.a; // es. Europe → Americas, anche Europe → Europe
  }

  if (file === "index.html") return "global overview";

  return ""; 
}

// titolo completo, "Migration flow Europe to Americas"
function testoTitolo() {
  const resto = sottotitolo();
  return resto === "" ? TITOLO_FISSO : TITOLO_FISSO + " " + resto;
}

// disegna il titolo sotto il breadcrumb, allineato al margine sinistro
function disegnaTitolo() {
  if (!fontTitolo) return; // il font si sta ancora caricando

  const { margine, w, h } = griglia();
  const x = margine;
  const y = margine * 0.5 + h * 1.2; // subito sotto il breadcrumb

  textFont(fontTitolo);
  let dimensione = h * 0.95;
  textSize(dimensione);

  // se il titolo è troppo lungo per lo spazio a sinistra della colonna di destra, si rimpicciolisce
  //const spazioMax = width - 2 * margine - w - margine;
  //const larghezza = textWidth(testoTitolo());
  //if (larghezza > spazioMax) dimensione *= spazioMax / larghezza;

  noStroke();
  fill(255);
  textSize(dimensione);
  textAlign(LEFT, TOP);
  text(testoTitolo(), x, y);
}