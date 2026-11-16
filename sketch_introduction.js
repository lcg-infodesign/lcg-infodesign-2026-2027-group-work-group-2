//palette
const BG = "#190A32";
const GREEN = "#00FE93";
const RED = "#FF0051";
const BLUE = "#1600FF";
const YELLOW = "#F2FF00";

//paragrafi
const P1 =
  "Sport migration is a multifaceted social, economic,\n" +
  "and geographical phenomenon involving the relocation of athletes,\n" +
  "coaches, and sports professionals from one country or region\n" +
  "to another driven by sports-related opportunities.";

const P2 =
  "Professor Gijsbert Oonk of Erasmus University Rotterdam created a dataset\n" +
  "on sports migration in the Olympic Games.\n" +
  "Building on his work, our project analyzes this phenomenon across recent\n" +
  "editions of the Olympic Games held between 2008 and 2024.";
  
//font
let workSansBold;

//scroll e hover
let scrollTarget = 0; 
let scrollPos = 0;    // posizione attuale, insegue scrollTarget lentamente
let arrowHover = 0;   
let buttonHover = 0;

//apparizioni
let showArrow = 0;    // visibilità di freccia e bottone 
let showButton = 0;

async function setup() {
  createCanvas(windowWidth, windowHeight);
  workSansBold = await loadFont("assets/WorkSans-Bold.ttf");
}

function draw() {
  background(BG);

  // scroll
  scrollPos = lerp(scrollPos, scrollTarget, 0.05); //lerp(start, stop, amt)
  const s = scrollPos;

  // fasi dello scroll
  const morph = map(s, 0, 0.25, 0, 1, true); // colori -> bianco
  const shrink = map(s, 0.3, 0.6, 0, 1, true); // titolo piccolo in alto
  const showP1 = map(s, 0.5, 0.75, 0, 1, true); // primo paragrafo
  const showP2 = map(s, 0.65, 0.9, 0, 1, true); // secondo paragrafo
  showButton = map(s, 0.9, 1, 0, 1, true); // bottone
  // la freccia appare dopo 1 secondo (1000-1) e scompare quando lo scroll è a 0.35
  showArrow = constrain(millis() / 1000 - 1, 0, 1) * (1 - map(s, 0.25, 0.35, 0, 1, true)); //moltiplico perchè è vera solo quando entrambe sono vere

  drawTitle(morph, shrink);
  drawParagraph(P1, NORMAL, width * 0.02, height * 0.5, showP1);
  drawParagraph(P2, ITALIC, width * 0.02, height * 0.7, showP2);
  drawArrow(showArrow);
  drawButton(showButton);

  if (overArrow(showArrow) || overButton(showButton)) {
  cursor(HAND);
  } else {
  cursor(ARROW);
  }
}

//titolo

function drawTitle(morph, shrink) {
  const size = lerp(width * 0.07, width * 0.04, shrink); // dimensione del testo
  const cy = lerp(height / 2, height * 0.2, shrink); // centro verticale del titolo
  const alpha = lerp(255, 130, shrink); // opacità da 100% a 50%

  textFont(workSansBold);
  textSize(size);
  noStroke();

  // seconda riga
  textAlign(CENTER, BASELINE);
  fill(255, alpha);
  text("Sport Migration?", width / 2, cy + size * 0.95);

  // prima riga: "What is" + "Olympic"
  const y = cy - size * 0.2;
  const x = width / 2 - textWidth("What is Olympic") / 2; //non si può usare text align center perchè sono scritte separatamente
  const olympicX = x + textWidth("What is Olympic") - textWidth("Olympic");

  textAlign(LEFT, BASELINE);
  text("What is", x, y);

  fill(255, alpha * morph); // la scritta bianca appare scrollando
  text("Olympic", olympicX, y);

  if (morph < 1) drawColoredOlympic(olympicX, y, size, morph);
}

// "Olympic" fatto di forme
function drawColoredOlympic(x, y, size, morph) {
  push();
  translate(x, y);
  scale(size); // da qui 1 = dimensione del testo
  noFill();
  strokeWeight(0.125);
  strokeCap(ROUND);

  // O
  pen(GREEN, morph);
  ellipse(0.39, -0.33, 0.52, 0.56);
  // l
  pen(RED, morph);
  line(0.89, -0.66, 0.89, -0.19);
  bezier(0.89, -0.19, 0.89, -0.07, 0.95, -0.04, 1.06, -0.06);
  // y
  pen(BLUE, morph);
  line(1.15, -0.44, 1.32, -0.02);
  pen(YELLOW, morph);
  bezier(1.52, -0.45, 1.42, -0.09, 1.35, 0.14, 1.13, 0.13);
  // m
  pen(RED, morph);
  arc(2.26, -0.27, 0.31, 0.33, PI, TWO_PI);
  line(2.42, -0.27, 2.42, -0.04);
  pen(GREEN, morph);
  arc(1.94, -0.27, 0.32, 0.33, PI + 0.15, TWO_PI);
  line(2.1, -0.27, 2.1, -0.04);
  pen(BLUE, morph);
  line(1.77, -0.44, 1.77, -0.04);
  // p
  pen(BLUE, morph);
  arc(2.9, -0.26, 0.38, 0.31, radians(-165), radians(160));
  pen(YELLOW, morph);
  line(2.71, -0.45, 2.71, 0.16);
  // i
  pen(RED, morph);
  line(3.34, -0.44, 3.34, -0.06);
  pen(GREEN, morph);
  point(3.34, -0.64);
  // c
  pen(YELLOW, morph);
  arc(3.8, -0.27, 0.35, 0.35, radians(40), radians(320));

  pop();
}

// colore del tratto
function pen(col, morph) {
  const c = lerpColor(color(col), color(255), morph); //da colorato a bianco 
  c.setAlpha(255 * 0.9 * (1 - morph));
  stroke(c);
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

//freccia e bottone

function arrowSize() {
  return width * 0.05;
}

function buttonSize() {
  return { w: width * 0.16, h: width * 0.05 };
}

function drawArrow(show) {
  if (show <= 0) return;
  let target;
  if (overArrow(show)) {
  target = 1; // mouse sopra la freccia: ingrandisci
  } else {
  target = 0; // mouse fuori: torna normale
  }
  arrowHover = lerp(arrowHover, target, 0.2);

  const d = arrowSize();

  push();
  translate(width / 2, height * 0.9);
  scale(1 + 0.1 * arrowHover); // hover: si ingrandisce
  noStroke();
  fill(255, 255 * show);
  circle(0, 0, d);

  //disegno freccia
  stroke(25, 10, 50, 255 * show);
  strokeWeight(d * 0.05);
  line(0, -d * 0.17, 0, d * 0.17);
  line(-d * 0.12, d * 0.05, 0, d * 0.17);
  line(d * 0.12, d * 0.05, 0, d * 0.17);
  pop();
}

function drawButton(show) {
  if (show <= 0) return;
  let target;
  if (overButton(show)) {
  target = 1; // mouse sopra il bottone: ingrandisci
  } else {
  target = 0; // mouse fuori: torna normale
  }
  buttonHover = lerp(buttonHover, target, 0.2);
  const b = buttonSize();

  push();
  translate(width / 2, height * 0.9);
  scale(1 + 0.06 * buttonHover); // hover: si ingrandisce
  noStroke();
  fill(255, 255 * show);
  rectMode(CENTER);
  rect(0, 0, b.w, b.h, b.h / 2);

  fill(25, 10, 50, 255 * show);
  textFont(workSansBold);
  textSize(b.h * 0.38);
  textAlign(CENTER, CENTER);
  text("Start exploring", 0, -b.h * 0.03);
  pop();
}

function overArrow(show) {
  return show > 0.5 && dist(mouseX, mouseY, width / 2, height * 0.9) < arrowSize() / 2; //dist(x1, y1, x2, y2) Calculates the distance between two points.
}

function overButton(show) {
  const b = buttonSize();
  return show > 0.5 && //deve essere visibile
    abs(mouseX - width / 2) < b.w / 2 && //il mouse deve essere distante meno della metà della larghezza dal centro
    abs(mouseY - height * 0.9) < b.h / 2; //il mouse deve essere distante meno della metà dell'altezza dal centro
}

//interazione

function mouseScroll(event) {
  scrollTarget = constrain(scrollTarget + event.delta / 3000, 0, 1); //rallenta lo scroll (UTILIZZIAMOLO ANCHE PER GLI ANNI)
  return false; // blocca lo scroll della pagina
}

function mouseClicked() {
  if (overButton(showButton)) window.location.href = "index.html";
  else if (overArrow(showArrow)) scrollTarget = 1; // scorre fino alla fine
}

//ridurre la finestra
/* function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
} */
