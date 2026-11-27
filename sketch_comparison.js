let tabella;
let paeseDa;
let paeseA;

async function setup() {
  createCanvas(windowWidth, windowHeight);
  workSans = await loadFont("assets/WorkSans-Bold.ttf");
  fontTitolo = await loadFont("assets/MontserratAlternates-Bold.ttf");
  tabella = await loadTable("assets/olympic.csv", ",", true);
  calcolaRigheUniche(tabella);

  const parametri = getURLParams();
  if (parametri.da) paeseDa = decodeURIComponent(parametri.da);
  if (parametri.a) paeseA = decodeURIComponent(parametri.a);

  // stesso anno della pagina da cui arrivo
  const annoSalvato = sessionStorage.getItem("anno");
  if (ANNI.some((a) => a.anno === annoSalvato)) annoScelto = annoSalvato;
}

function draw() {
  background("#190A32");

  //da ricorrenti.js
  disegnaNav();
  disegnaBreadCrumb();
  disegnaBottoni();
  disegnaTitolo();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}