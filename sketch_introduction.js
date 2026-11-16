//palette
const bg = "#190A32"
const green = "#00FE93"
const red = "#FF0051"
const blue = "#1600ff"
const yellow = "#F2FF00"
let workSans; 
let workSansBold;


async function setup() {
  createCanvas(windowWidth, windowHeight);
  workSans = await loadFont("assets/WorkSans-Regular.ttf");
  workSansBold = await loadFont("assets/WorkSans-Bold.ttf");
  noLoop();
}

function draw() {
    background(bg);
    
    //testo
    push();
    fill(255);
    textAlign(CENTER, TOP);
    textFont(workSansBold);
    textSize(80);                    
    text("What is Olympic", width / 2, height / 2);
    text("Sports Migration?", width / 2, height / 2 + 100);
    pop();
}