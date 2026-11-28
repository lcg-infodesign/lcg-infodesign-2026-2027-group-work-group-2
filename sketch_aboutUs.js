let workSans;

// Palette (trasparenza)
const OPACITA = 150;
const COLORI = {
  blu:    [0x16, 0x00, 0xFF, OPACITA],
  giallo: [0xF2, 0xFF, 0x00, OPACITA],
  verde:  [0x00, 0xFE, 0x93, OPACITA],
  rosa:   [0xFF, 0x00, 0x51, OPACITA],
  bianco: [0xFF, 0xFF, 0xFF, OPACITA]
};

const BG = "#190A32";

// TEAM
const TEAM = [
  { nome: "Maria Giulia\nTumedei", ruolo: "Visual Design and\nData Visualization", disegno: drawArciere },
  { nome: "Vera\nNicoli",          ruolo: "Visual Design",                         disegno: drawTennista },
  { nome: "Matilde\nSciumè",       ruolo: "Coding and\ndebugging",                 disegno: drawCiclista },
  { nome: "Alba\nDe Battista",     ruolo: "Coding",                                disegno: drawBallerina },
  { nome: "Lavinia\nGiorgis",      ruolo: "Animations and\nIllustrations",         disegno: drawCorridore },
  { nome: "Lucia\nLizier",         ruolo: "Coding and\ndebugging",                 disegno: drawNuotatrice }
];

async function setup() {
  createCanvas(windowWidth, windowHeight);
  workSans = await loadFont("assets/WorkSans-Bold.ttf");
  fontTitolo = await loadFont("assets/MontserratAlternates-Bold.ttf"); 
}

function draw() {
  background(BG);

  // Estremità e angoli tondi
  strokeCap(ROUND);
  strokeJoin(ROUND);

  if (!workSans || !fontTitolo) return;

  // da ricorrenti.js
  disegnaNav();
  disegnaLinkGlobal();
  disegnaTitolo();

  // Spazio occupato dall'header 
  const { margine, h } = griglia();
  const yHeader = margine * 0.5 + h;

  // Griglia team sotto l'header
  disegnaTeam(margine, yHeader + margine * 0.8);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

//Griglia team
function disegnaTeam(margine, yInizio) {
  // adaptive (da 3x2 a 2x3)
  const stretto = width < 768 || width < height;
  const cols = stretto ? 2 : 3;
  const rows = stretto ? 3 : 2;

  // Spazi 
  const gapX = margine * 0.65;
  const gapY = margine * 0.75;

  // Dimensioni celle
  const cellW = (width - 2 * margine - gapX * (cols - 1)) / cols;
  const maxCellH = (height - yInizio - margine - gapY * (rows - 1)) / rows;
  const cellH = min(cellW * 0.52, maxCellH);

  // gliglia centrata
  const altezzaGriglia = rows * cellH + gapY * (rows - 1);
  const spazioLibero = height - yInizio - margine;
  const startY = yInizio + max(0, (spazioLibero - altezzaGriglia) * 0.45);

  // scala omini
  const scalaOmino = min(cellW / 380, cellH / 195);

  // disegno per ogni persona del team
  for (let i = 0; i < TEAM.length; i++) {
    const col = i % cols;
    const row = floor(i / cols);

    // Angolo in alto a sinistra della cella
    const x = margine + col * (cellW + gapX);
    const y = startY + row * (cellH + gapY);

    disegnaPersona(TEAM[i], x, y, cellW, cellH, scalaOmino);
  }
}

// team
function disegnaPersona(persona, x, y, w, h, scalaOmino) {
  // omino a sinistra.
  push();
  translate(x + w * 0.2, y + h * 0.5); // sposta l'origine al centro dell'omino
  scale(scalaOmino);
  strokeWeight(12);
  noFill();
  persona.disegno();
  pop();

  // colonna di testo a destra
  const xTesto = x + w * 0.44;
  const larghezzaRiquadro = w * 0.5;

  // nome in alto
  fill(255);
  noStroke();
  textFont(workSans);
  textSize(h * 0.145);
  textLeading(h * 0.185); //interlinea
  textAlign(LEFT, TOP); 
  text(persona.nome, xTesto, y + h * 0.1);

  // riquadro ruolo
  const yRiquadro = y + h * 0.52;
  const hRiquadro = h * 0.34;

  noFill();
  stroke(255);
  strokeWeight(2);
  rect(xTesto, yRiquadro, larghezzaRiquadro, hRiquadro, hRiquadro * 0.2);

  // ruolo
  const padding = h * 0.06; 
  fill(255);
  noStroke();
  textFont("Trebuchet MS");
  textSize(h * 0.07);
  textLeading(h * 0.09);
  textAlign(LEFT, TOP);
  text(persona.ruolo, xTesto + padding, yRiquadro + padding);
}

//omini
// Arciere (Mary)
function drawArciere() {
  stroke(COLORI.blu);
  ellipse(-15, -55, 16, 16); // testa
  stroke(COLORI.giallo);
  line(-15, -35, -15, 10); // busto
  stroke(COLORI.bianco);
  line(-32, -20, 22, -20); // bracci
  stroke(COLORI.rosa);
  arc(5, -20, 65, 85, -HALF_PI + 0.3, HALF_PI - 0.3); // arco
  line(-15, 10, -25, 35); // gambe
  line(-25, 35, -40, 48);
  stroke(COLORI.verde);
  line(-15, 10, 5, 30);
  line(5, 30, 5, 52);
}

// Tennista (Vera)
function drawTennista() {
  stroke(COLORI.blu);
  ellipse(-15, -50, 16, 16); // testa
  stroke(COLORI.giallo);
  line(-15, -30, -15, 15);  // busto
  stroke(COLORI.bianco);
  line(-15, -20, 15, -22); // braccio
  stroke(COLORI.rosa);
  line(15, -22, 30, -35);
  stroke(COLORI.verde);
  ellipse(38, -42, 16, 16);  // racchetta
  noStroke();
  fill(COLORI.bianco);
  ellipse(20, -70, 11, 11); // pallina
  noFill();
  stroke(COLORI.verde);
  line(-15, 15, -30, 38);  // gambe
  line(-30, 38, -32, 60);
  stroke(COLORI.rosa);
  line(-15, 15, 2, 42);  
  line(2, 42, 22, 55);
}

// Ciclista (Mati)
function drawCiclista() {
  stroke(COLORI.blu);
  ellipse(-42, 25, 42, 42); // ruote
  stroke(COLORI.giallo);
  ellipse(32, 25, 42, 42);
  stroke(COLORI.blu);
  ellipse(35, -35, 16, 16); // testa
  stroke(COLORI.bianco);
  line(-25, -22, 15, -22); // busto
  stroke(COLORI.giallo);
  line(15, -22, 26, 2); // braccio
  stroke(COLORI.verde);
  line(2, -2, -5, 28); // gamba
  stroke(COLORI.rosa);
  line(-25, -22, 2, -2);                 
}

// Ballerina (Alba)
function drawBallerina() {
  stroke(COLORI.giallo);
  ellipse(-20, -55, 16, 16); // testa
  stroke(COLORI.rosa);
  line(-20, -35, -20, 5); // busto
  stroke(COLORI.verde);
  arc(-20, -45, 65, 45, 0.25, PI - 0.25); // braccia
  stroke(COLORI.blu);
  line(-20, 5, -18, 55); // gabme
  stroke(COLORI.bianco);
  line(-20, 5, 25, -8); 
}

// Corridore (Lavi)
function drawCorridore() {
  stroke(COLORI.giallo);
  ellipse(5, -45, 16, 16); // testa
  stroke(COLORI.rosa);
  arc(-28, -18, 36, 32, PI, TWO_PI); // busto
  stroke(COLORI.verde);
  arc(6, -22, 32, 28, 0, PI); // braccio
  stroke(COLORI.bianco);
  line(-10, -22, -62, 32); // gambe
  stroke(COLORI.blu);
  arc(-22, 30, 50, 45, -PI + 0.35, 1);
}

// Nuotatrice (Lu)
function drawNuotatrice() {
  stroke(COLORI.giallo);
  ellipse(12, -20, 16, 16);  // testa
  stroke(COLORI.rosa);
  line(-18, -45, -5, -22); // braccio 
  stroke(COLORI.bianco);
  line(-35, -20, -5, -20);// busto
  stroke(COLORI.blu);
  arc(-35, -5, 30, 30, -HALF_PI, HALF_PI + 0.3); // gambe
  stroke(COLORI.verde);
  arc(-48, 32, 42, 42, 0, PI);  // onde
  stroke(COLORI.blu);
  arc(-6, 32, 42, 42, 0, PI);             
  stroke(COLORI.rosa);
  arc(36, 32, 42, 42, 0, PI);            
}