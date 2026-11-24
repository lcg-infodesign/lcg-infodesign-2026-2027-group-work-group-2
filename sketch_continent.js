async function setup() {
  createCanvas(windowWidth, windowHeight);
  workSans = await loadFont("assets/WorkSans-Bold.ttf");
  const annoSalvato = sessionStorage.getItem("anno");
  if(ANNI.some((a) => a.anno === annoSalvato)) annoScelto = annoSalvato;
}

function draw() {
  background("#190A32");

  //da ricorrenti.js
  disegnaNav();
  disegnaBreadCrumb();
  disegnaBottoni();
}