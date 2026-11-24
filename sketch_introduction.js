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
  background("#190A32");

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
  drawParagraph1(showP1);
  drawParagraph2(showP2);
  drawArrow(showArrow);
  drawButton(showButton);

  if (overArrow(showArrow) || overButton(showButton)) { //|| significano oppure: basta che una delle due sia vera perché venga eseguito il blocco
    cursor(HAND);
  } else {
    cursor(ARROW);
  }
}

//titolo: dimensione e posizione (anche per disporre paragrafi)
function titleSize(shrink) {
  let size = max(lerp(width * 0.07, width * 0.05, shrink), 48); //mai sotto 48px
  textFont(montserratAlt);
  textSize(size);
  size *= min(1, (width * 0.9) / textWidth("Sport Migration?")); //se non ci sta in larghezza, si riduce
  return size;
}

function titleCy(shrink) {
  return lerp(height / 2, height * 0.17, shrink); //centro verticale del titolo
}

function drawTitle(shrink) {
  const size = titleSize(shrink);
  const cy = titleCy(shrink);
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

//paragrafi centrati in un punto dello spazio tra titolo e bottone
function drawParagraph(txt, style, pos, show) {
  if (show <= 0) return;

  const top = titleCy(1) + titleSize(1) * 1.15; //fondo del titolo rimpicciolito
  const bottom = buttonLayout().y; //inizio del bottone
  const y = lerp(top, bottom, pos); //pos: 0 = sotto il titolo, 1 = sopra il bottone

  const size = max(18, min(width * 0.0175, height * 0.032)); //mai meno di 18px 
  const w = max(width * 0.6, min(width * 0.9, 400)); //larghezza del blocco
  const h = size * 8; //altezza del riquadro

  noStroke();
  fill(255, 255 * show);
  textFont("Trebuchet MS");
  textStyle(style);
  textSize(size);
  textLeading(size * 1.2); //interlinea
  textAlign(CENTER, CENTER);
  textWrap(WORD); //va a capo tra una parola e l'altra
  text(txt, width / 2 - w / 2, y - h / 2 + (1 - show) * 30, w, h);
  textStyle(NORMAL);
}

function drawParagraph1(show) {
  drawParagraph("Sport migration is a multifaceted social, economic, and geographical phenomenon involving the relocation of athletes, coaches, and sports professionals from one country or region to another driven by sports-related opportunities.", NORMAL, 0.33, show);
}

function drawParagraph2(show) {
  drawParagraph("Professor Gijsbert Oonk of Erasmus University Rotterdam created a dataset on sports migration in the Olympic Games. Building on his work, our project analyzes this phenomenon across recent editions of the Olympic Games held between 2008 and 2024.", ITALIC, 0.67, show);
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

function drawArrow(show) {
  if (show <= 0) return;
  const d = arrowSize();
  const over = overArrow(show);
  const alpha = hex(round(255 * show), 2);

  push();
  translate(width / 2, arrowY());
  noStroke();

  //sfondo cerchio
  if (over && mouseIsPressed)  {
    fill("#ffffff" + alpha); 
  } else if (over) {
    fill ("#5c45d2" + alpha); 
  } else {
    fill("#281977" + alpha); 
  }
  circle(0, 0, d);

  //disegno freccia
  if (over && mouseIsPressed)  {
    stroke ("#281977" + alpha); 
  } else if (over) {
    stroke ("#ffffff" + alpha); 
  } else {
    stroke ("#ffffff" + alpha); 
  }
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
  const over = overButton(show);
  const alpha = hex(round(255 * show), 2);

  noStroke();
  if (over && mouseIsPressed)  {
    fill("#ffffff" + alpha); 
  } else if (over) {
    fill ("#5c45d2" + alpha); 
  } else {
    fill("#281977" + alpha); 
  }
  rect(b.x, b.y, b.w, b.h, b.h / 2);

  if (over && mouseIsPressed)  {
    fill ("#281977" + alpha); 
  } else if (over) {
    fill ("#ffffff" + alpha); 
  } else {
    fill ("#ffffff" + alpha); 
  }
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