async function setup() {
  createCanvas(windowWidth, windowHeight);
  workSans = await loadFont("assets/WorkSans-Bold.ttf");
}

function draw() {
  background("#190A32");
  disegnaNav();
}