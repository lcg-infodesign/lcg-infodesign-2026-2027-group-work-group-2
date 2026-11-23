//palette
const BG = "#190A32";

//paragrafi
const P1 =
  "Sport migration is a multifaceted social, economic,\n" + //da risolvere responsiveness del testo
  "and geographical phenomenon involving the relocation of athletes,\n" +
  "coaches, and sports professionals from one country or region\n" +
  "to another driven by sports-related opportunities.";

const P2 =
  "Professor Gijsbert Oonk of Erasmus University Rotterdam created a dataset\n" +
  "on sports migration in the Olympic Games.\n" +
  "Building on his work, our project analyzes this phenomenon across recent\n" +
  "editions of the Olympic Games held between 2008 and 2024.";

//font
let montserratAlt; //titolo
let workSans; //bottoni

//scroll
let scrollTarget = 0;
let scrollPos = 0; //posizione, insegue scrollTarget lentamente

//apparizioni
let showArrow = 0; //visibilità di freccia e bottone
let showButton = 0;

//bottoni di navigazione
let bottoniNav = []; //posizione dei bottoni cliccabili

async function setup() {
  createCanvas(windowWidth, windowHeight);
  montserratAlt = await loadFont("assets/MontserratAlternates-Bold.ttf");
  workSans = await loadFont("assets/WorkSans-Bold.ttf");
}

function draw() {
  background(BG);

  //scroll
  scrollPos = lerp(scrollPos, scrollTarget, 0.03); //lerp(start, stop, amt): più basso = più lento
  const s = scrollPos;

  //fasi dello scroll
  const shrink = map(s, 0, 0.4, 0, 1, true); //titolo rimpicciolisce e sale mentre scroll da 0 a 0.4
  const showP1 = map(s, 0.35, 0.5, 0, 1, true); //primo paragrafo compare tra 0.35 e 0.5
  const showP2 = map(s, 0.6, 0.7, 0, 1, true); //secondo paragrafo compare tra 0.6 e 0.7
  showButton = map(s, 0.85, 1, 0, 1, true); //bottone compare tra 0.85 e 1
  //la freccia appare dopo 0.3 secondi (in 0.5 secondi) e scompare appena inizia lo scroll
  showArrow = constrain((millis() / 1000 - 0.3) / 0.5, 0, 1) * (1 - map(s, 0, 0.1, 0, 1, true));

  drawTitle(shrink);
  drawParagraph(P1, NORMAL, width * 0.0175, height * 0.5, showP1);
  drawParagraph(P2, ITALIC, width * 0.0175, height * 0.7, showP2);
  drawArrow(showArrow);
  drawButton(showButton);

  if (overArrow(showArrow) || overButton(showButton)) { //|| significano oppure: basta che una delle due sia vera perché venga eseguito il blocco
    cursor(HAND);
  } else {
    cursor(ARROW);
  }
}

//titolo
function drawTitle(shrink) {
  const size = lerp(width * 0.07, width * 0.05, shrink); //dimensione del testo
  const cy = lerp(height / 2, height * 0.17, shrink); //centro verticale del titolo
  const alpha = lerp(255, 130, shrink); //opacità 

  textFont(montserratAlt);
  textSize(size);
  noStroke();
  fill(255, alpha);
  textAlign(CENTER, BASELINE);

  // seconda riga
  text("Sport Migration?", width / 2, cy + size * 0.95);

  // prima riga
  text("What is Olympic", width / 2, cy - size * 0.2);
}

//paragrafi
function drawParagraph(txt, style, size, y, show) {
  if (show <= 0) return;
  noStroke();
  fill(255, 255 * show);
  textFont("Trebuchet MS");
  textStyle(style);
  textSize(size);
  textLeading(size * 1.2); //interlinea
  textAlign(CENTER, CENTER);
  text(txt, width / 2, y + (1 - show) * 30); //la x è sempre centrata, la y aumenta e il testo sale
  textStyle(NORMAL);
}

//misure del bottone
function buttonLayout() {
  const margine = min(48, width * 0.025);
  const disponibile = width - 2 * margine;
  const w = disponibile * 0.19;
  const h = w / 5.5;
  const x = width / 2 - w / 2; //centrato orizzontalmente
  const y = height - margine * 0.5 - h; //angolo in alto a sinistra
  return { x, y, w, h };
}

//freccia: diametro e posizione verticale
function arrowSize() {
  return buttonLayout().h * 1.5;
}

function arrowY() {
  const b = buttonLayout();
  return b.y + b.h / 2 - height * 0.13;
}

//colori dei bottoni
function buttonColors(over, show) {
  let bg;
  let fg;
  if (over && mouseIsPressed) {
    bg = color("#ffffff"); //premuto
    fg = color("#281977");
  } else if (over) {
    bg = color("#5c45d2"); //mouse sopra
    fg = color("#ffffff");
  } else {
    bg = color("#281977"); //normale
    fg = color("#ffffff");
  }
  bg.setAlpha(255 * show);
  fg.setAlpha(255 * show);
  return { bg, fg };
}

function drawArrow(show) {
  if (show <= 0) return;
  const d = arrowSize();
  const c = buttonColors(overArrow(show), show);

  push();
  translate(width / 2, arrowY());
  noStroke();
  fill(c.bg);
  circle(0, 0, d);

  //disegno freccia
  stroke(c.fg);
  strokeWeight(d * 0.05); //d è diametro cerchio
  line(0, -d * 0.17, 0, d * 0.17);
  line(-d * 0.12, d * 0.05, 0, d * 0.17);
  line(d * 0.12, d * 0.05, 0, d * 0.17);
  pop();
}

function drawButton(show) {
  bottoniNav = []; //si svuota a ogni frame: il bottone è cliccabile solo quando è visibile
  if (show <= 0) return;
  const b = buttonLayout();
  if (show > 0.5) bottoniNav.push({ link: "index.html", x: b.x, y: b.y, w: b.w, h: b.h });
  const c = buttonColors(overButton(show), show);

  noStroke();
  fill(c.bg);
  rect(b.x, b.y, b.w, b.h, b.h / 2);

  fill(c.fg);
  textFont(workSans);
  textSize(b.h * 0.45);
  textAlign(CENTER, CENTER);
  text("Start exploring", b.x + b.w / 2, b.y + b.h / 2);
}

function overArrow(show) {
  return show > 0.5 && dist(mouseX, mouseY, width / 2, arrowY()) < arrowSize() / 2;
}

function overButton(show) {
  const b = buttonLayout();
  return show > 0.5 && //visibilità bottone
    mouseX > b.x && mouseX < b.x + b.w &&
    mouseY > b.y && mouseY < b.y + b.h;
}

//interazione
function mouseScroll(event) {
  scrollTarget = constrain(scrollTarget + event.delta / 3000, 0, 1); //rallenta lo scroll
  return false; //blocca lo scroll della pagina
}

function mousePressed() {
  //bottoni di navigazione
  for (const b of bottoniNav) {
    if (mouseX > b.x && mouseX < b.x + b.w && mouseY > b.y && mouseY < b.y + b.h) {
      window.location.href = b.link; //apre la pagina
    }
  }

  // freccia
  if (overArrow(showArrow)) scrollTarget = 1; //scorre fino alla fine
}

//ridurre la finestra
 function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
} 