const columnsNumber = 12;
const gutter = 32;
let workSans; 
let workSansBold; 
let colW;


async function setup() {
  createCanvas(windowWidth, windowHeight);
  workSans = await loadFont("assets/WorkSans-Regular.ttf");
  workSansBold = await loadFont("assets/WorkSans-Bold.ttf");
  grid();
}


function grid() {
  colW = (width - (columnsNumber + 1)* gutter) / columnsNumber; //calcolo la larghezza della singola colonna 
}

const colX = i => gutter + i * (colW + gutter);

function draw() {
  background("#190A32");
  textHeader();
  textBody();
  breadCrumb();
  updateCursor();
  //drawGuides(); //la rendo un commento quando non mi serve vederla
}

function textHeader() {
  noStroke();
  fill(255);
  textFont(workSansBold);

  textSize(48);
  text("Olympic", colX(0), 66);

  textSize(24);
  text("Sports Migration", colX(0), 94);

  text("About dataset", colX(10) + colW/3, 67);
  fill("#8E8E8E"); 
  text("About us", colX(8) + colW / 2, 67);
  
}

function textBody() {
  fill(255); 
  textFont(workSansBold);
  textSize(36);
  text("About us", colX(0), height-380, 3 * colW + 2 * gutter);

  textFont("Trebuchet MS");
  textStyle(BOLD);
  textSize(16);
  text(
    "We are six Communication Design students from Politecnico di Milano working together in the Laboratorio di Computer Grafica per l'Information Design (C2).",
    colX(0), height-350, 3 * colW + 2 * gutter);
}

function breadCrumb() {
  textFont(workSansBold);
  textSize(24);
  text("Introduction", colX(0), height-37);
  fill("#8E8E8E"); 
  text(" < About us", colX(0)+textWidth("Introduction"), height-37);
}

//per rendere la griglia visibile
/*function drawGuides() {
  noStroke();
  fill(255, 30);
  for (let i = 0; i < columnsNumber ; i++) {
    rect(colX(i), 0, colW, height);
  }
} */

function getHoveredLink() {
  textFont(workSansBold);
  textSize(24);

  const x1 = colX(8) + colW / 2;
  const x2 = colX(10) + colW / 3;

  // Controllo fascia in alto (About us e About dataset)
  if (mouseX >= x2 && mouseX <= x2 + textWidth("About dataset")) return "aboutDataset.html";

  // Controllo fascia in basso (Introduction)
  if (mouseX >= colX(0) && mouseX <= colX(0) + textWidth("Introduction") && mouseY >= height - 70 && mouseY<= height - 35) return "introduction.html";
  return null;
}

function updateCursor() {
  if (getHoveredLink() !== null) {
    cursor(HAND);
  } else {
    cursor(ARROW);
  }
}

function mouseClicked() {
  const targetUrl = getHoveredLink();
  if (targetUrl !== null) {
    location.href = targetUrl;
  }
}