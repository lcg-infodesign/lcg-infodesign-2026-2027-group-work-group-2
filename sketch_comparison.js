async function setup() {
  createCanvas(windowWidth, windowHeight);
  workSans = await loadFont("assets/WorkSans-Bold.ttf");
  calcolaRigheUniche(tabella);
}

const parametri = getURLParams();
paeseDa = decodeURIComponent(parametri.da);
paeseA = decodeURIComponent(parametri.a);

function draw() {
  background("#190A32");
  
  //da ricorrenti.js
  disegnaNav();
  disegnaBreadCrumb();
  disegnaBottoni();
}