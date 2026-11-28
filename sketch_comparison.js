let tabella;
let workSans;
const MIN_ATLETI = 2;

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

let conteggi = {};
let continenteDi = {};
let totale = 0;
let nMigrati = 0;
let paeseDa, paeseA;
let colA, colDa;

async function setup() {
  createCanvas(windowWidth, windowHeight);
  tabella = await loadTable("assets/olympic.csv", ",", true);
  calcolaRigheUniche(tabella);
  workSans = await loadFont("assets/WorkSans-Bold.ttf");
  fontTitolo = await loadFont("assets/MontserratAlternates-Bold.ttf"); // font del titolo (ricorrenti.js)
  const parametri = getURLParams();
  paeseDa = decodeURIComponent(parametri.da);
  paeseA = decodeURIComponent(parametri.a);

  conteggio(); 
  calcolaAnniDisattivi();
  const annoSalvato = parametri.anno;
  annoScelto = annoSalvato;
  aggiornaDati(); 
}

function conteggio() {
  conteggi = {};
  continenteDi = {};

  for (const r of righeUniche) {
    const anno = tabella.getString(r, "year");
    const partecipazione = tabella.getString(r, "gapminder_countryname");
    let nascita = tabella.getString(r, "birth_country_full");

    if (STESSO_PAESE[nascita]) nascita = STESSO_PAESE[nascita];

    const contGara = tabella.getString(r, "continent_ destination");
    const contNascita = tabella.getString(r, "continent_ origin");
    if (partecipazione !== "" && contGara !== "") continenteDi[partecipazione] = contGara;
    if (nascita !== "" && contNascita !== "") continenteDi[nascita] = contNascita;

    if (partecipazione !== "") {
      if (!conteggi[anno]) conteggi[anno] = {};
      if (!conteggi[anno][partecipazione]) {
        conteggi[anno][partecipazione] = { totale: 0, migrati: 0 }; //se vuoto metto a 0 sia totale che migrati 
      }
      conteggi[anno][partecipazione].totale++; //incremento totale per quel paese e quell'edizione

      if (nascita !== "" && nascita !== partecipazione && nascita === paeseDa) {
        conteggi[anno][partecipazione].migrati++; //incremento migrati per quel paese e quell'edizione
      }
    }
  }
}

function calcolaAnniDisattivi() {
  anniDisattivi = ANNI.map((x) => x.anno).filter((anno) => {
    const c = conteggi[anno] && conteggi[anno][paeseA];
    return !c || c.migrati < MIN_ATLETI;
  });
}

function aggiornaDati() {
  const c = (conteggi[annoScelto] && conteggi[annoScelto][paeseA]) || { totale: 0, migrati: 0 };
  totale = c.totale;
  nMigrati = c.migrati;

  colA = COLORI[continenteDi[paeseA]];
  colDa = COLORI[continenteDi[paeseDa]];

  console.log(totale); 
  console.log(nMigrati); 
}

function disegnaPallini () {
  const COLONNE_PALLINI = 30;
  const RIGHE_MAX = 21;    
  const { margine, h } = griglia();
  const x0 = margine; //partenza da sinistra
  const y0 = height * 0.30; //partenza dall'alto
  const larghezza = width * 0.5;
  const altezza = (height - h - margine) - y0;   // spazio fino ai bottoni degli anni
  const passo = min(larghezza / COLONNE_PALLINI, altezza / RIGHE_MAX);
  const diametro = passo * 0.75;


  for (let i=0; i < totale; i++) {
    const colonna = i % COLONNE_PALLINI;
    const riga = floor(i / COLONNE_PALLINI); 

    const cx = x0 + colonna * passo + passo / 2; //centro pallino x
    const cy = y0 + riga * passo + passo / 2; //centro pallino y
    
    const eMigrato = i < nMigrati;
    let c;
    if (eMigrato) {
      c = color(colDa);
    } else {
      c = color(colA);
      c.setAlpha(150);
    }

    fill(c);
    circle(cx, cy, diametro);

  }

}

function draw() {
  background(BG);
  if (!tabella) return;
  
  //da ricorrenti.js
  disegnaNav();
  disegnaBreadCrumb();
  disegnaTitolo(); // "Migration flow" + paesi cliccati (ricorrenti.js)
  disegnaBottoni();

  disegnaPallini(); 
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}