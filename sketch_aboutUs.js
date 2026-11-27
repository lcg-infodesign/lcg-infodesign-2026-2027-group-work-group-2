let workSans;
let cBlu, cGiallo, cVerde, cRosa, cBianco;
let TEAM = [];

async function setup() {
  createCanvas(windowWidth, windowHeight);
  workSans = await loadFont("assets/WorkSans-Bold.ttf");
  fontTitolo = await loadFont("assets/MontserratAlternates-Bold.ttf");

  strokeCap(ROUND);
  strokeJoin(ROUND);

  // Opacità al 60% (255 * 0.60 = 153)
  let opacita = 153;
  cBlu = color(0x16, 0x00, 0xFF, opacita);
  cGiallo = color(0xF2, 0xFF, 0x00, opacita);
  cVerde = color(0x00, 0xFE, 0x93, opacita);
  cRosa = color(0xFF, 0x00, 0x51, opacita);
  cBianco = color(0xFF, 0xFF, 0xFF, opacita);

  TEAM = [
    { nome: "Maria Giulia\nTumedei", disegno: drawArciere },
    { nome: "Vera\nNicoli", disegno: drawTennista },
    { nome: "Matilde\nSciumè", disegno: drawCiclista },
    { nome: "Alba\nDe Battista", disegno: drawBallerina },
    { nome: "Lavinia\nGiorgis", disegno: drawCorridore },
    { nome: "Lucia\nLizier", disegno: drawNuotatrice }
  ];
}

function draw() {
  background("#190A32");
  if (!workSans) return; // aspetta che il font sia caricato

  //Funzioni chiamate da ricorrenti.js
  disegnaNav();
  disegnaLinkGlobal(); // chiamato dopo disegnaNav() così il link resta in bottoniNav
  disegnaTitolo();

  //I 6 box distribuiti sotto l'header
  const { margine, h } = griglia();
  const yHeader = margine * 0.5 + h;
  disegnaBoxTeam(margine, yHeader + margine * 0.8);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// ==========================================
// DISTRIBUZIONE DEI 6 BOX E DEGLI OMINI
// ==========================================

function disegnaBoxTeam(margine, yInizio) {
  // Passa automaticamente a 2 colonne x 3 righe quando lo schermo è stretto/verticale
  const isMobile = width < 768 || width < height;
  const cols = isMobile ? 2 : 3;
  const rows = isMobile ? 3 : 2;

  const gapX = margine * 0.65;
  const gapY = margine * 0.75;

  const boxW = (width - 2 * margine - gapX * (cols - 1)) / cols;
  const maxBoxH = (height - yInizio - margine - gapY * (rows - 1)) / rows;
  const boxH = min(boxW * 0.52, maxBoxH);

  // Centra verticalmente la griglia nello spazio disponibile sotto il titolo
  const altezzaGriglia = rows * boxH + gapY * (rows - 1);
  const spazioDisponibile = height - yInizio - margine;
  const startY = yInizio + max(0, (spazioDisponibile - altezzaGriglia) * 0.45);

  // Scala proporzionale per mantenere gli omini ben proporzionati dentro ogni box
  const scalaOmino = min(boxW / 380, boxH / 195);

  for (let i = 0; i < TEAM.length; i++) {
    const col = i % cols;
    const row = floor(i / cols);

    const bx = margine + col * (boxW + gapX);
    const by = startY + row * (boxH + gapY);

    // Riquadro con bordo bianco arrotondato
    noFill();
    stroke(255);
    strokeWeight(2);
    rect(bx, by, boxW, boxH, boxH * 0.14);

    // Omino a sinistra nel box
    push();
    translate(bx + boxW * 0.24, by + boxH * 0.5);
    scale(scalaOmino);
    strokeWeight(12);
    noFill();
    TEAM[i].disegno();
    pop();

    // Nome a destra nel box
    fill(255);
    noStroke();
    textFont(workSans);
    textSize(boxH * 0.145);
    textLeading(boxH * 0.185);
    textAlign(LEFT, CENTER);
    text(TEAM[i].nome, bx + boxW * 0.46, by + boxH * 0.5);
  }
}

// ==========================================
// FUNZIONI DEI 6 OMINI
// ==========================================

function drawArciere() {
  stroke(cBlu);
  ellipse(-15, -55, 16, 16);
  stroke(cGiallo);
  line(-15, -35, -15, 10);
  stroke(cBianco);
  line(-32, -20, 22, -20);
  stroke(cRosa);
  arc(5, -20, 65, 85, -HALF_PI + 0.3, HALF_PI - 0.3);
  stroke(cRosa);
  line(-15, 10, -25, 35);
  line(-25, 35, -40, 48);
  stroke(cVerde);
  line(-15, 10, 5, 30);
  line(5, 30, 5, 52);
}

function drawTennista() {
  stroke(cBlu);
  ellipse(-15, -50, 16, 16);
  stroke(cGiallo);
  line(-15, -30, -15, 15);
  stroke(cBianco);
  line(-15, -20, 15, -22);
  stroke(cRosa);
  line(15, -22, 30, -35);
  stroke(cVerde);
  ellipse(38, -42, 16, 16);
  noStroke();
  fill(cBianco);
  ellipse(20, -70, 11, 11);
  noFill();
  stroke(cVerde);
  line(-15, 15, -30, 38);
  line(-30, 38, -32, 60);
  stroke(cRosa);
  line(-15, 15, 2, 42);
  line(2, 42, 22, 55);
}

function drawCiclista() {
  stroke(cBlu);
  ellipse(-42, 25, 42, 42);
  stroke(cGiallo);
  ellipse(32, 25, 42, 42);
  stroke(cBlu);
  ellipse(35, -35, 16, 16);
  stroke(cBianco);
  line(-25, -22, 15, -22);
  stroke(cGiallo);
  line(15, -22, 26, 2);
  stroke(cVerde);
  line(2, -2, -5, 28);
  stroke(cRosa);
  line(-25, -22, 2, -2);
}

function drawBallerina() {
  stroke(cGiallo);
  ellipse(-20, -55, 16, 16);
  stroke(cRosa);
  line(-20, -35, -20, 5);
  stroke(cVerde);
  arc(-20, -45, 65, 45, 0.25, PI - 0.25);
  stroke(cBlu);
  line(-20, 5, -18, 55);
  stroke(cBianco);
  line(-20, 5, 25, -8);
}

function drawCorridore() {
  stroke(cGiallo);
  ellipse(5, -45, 16, 16);
  stroke(cRosa);
  arc(-28, -18, 36, 32, PI, TWO_PI);
  stroke(cVerde);
  arc(6, -22, 32, 28, 0, PI);
  stroke(cBianco);
  line(-10, -22, -62, 32);
  stroke(cBlu);
  arc(-22, 26, 48, 62, -PI + 0.35, 0.35);
}

function drawNuotatrice() {
  stroke(cGiallo);
  ellipse(12, -20, 16, 16);
  stroke(cRosa);
  line(-18, -45, -5, -22);
  stroke(cBianco);
  line(-35, -20, -5, -20);
  stroke(cBlu);
  arc(-35, -5, 30, 30, -HALF_PI, HALF_PI + 0.3);
  stroke(cVerde);
  arc(-48, 32, 42, 42, 0, PI);
  stroke(cBlu);
  arc(-6, 32, 42, 42, 0, PI);
  stroke(cRosa);
  arc(36, 32, 42, 42, 0, PI);
}