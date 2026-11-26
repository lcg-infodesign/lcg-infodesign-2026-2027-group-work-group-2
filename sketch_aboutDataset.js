async function setup() {
 createCanvas(windowWidth, windowHeight);
 workSans = await loadFont("assets/WorkSans-Bold.ttf");
}


function draw() {
 background("#190A32");
 disegnaBox();


 //da ricorrenti.js
 disegnaNav();
 disegnaLinkGlobal();


 disegnaBottoneSheet();
}


//tre box con testo
function disegnaBox() {
 const { margine, h } = griglia(); //prendo da ricorrenti margine e altezza bottoni
 const gap = margine * 0.7; //spazio tra box
 const bw = (width - 2 * margine - 2 * gap) / 3; //larghezza di un box
 const by = margine * 0.5 + h * 4; //altezza da cui partono box, sotto il titolo della pagina
 const bh = height - margine * 0.5 - h - margine * 0.8 - by; //altezza box, fino a bottone in basso
 const pad = bw * 0.06; //margine interno tra bordo e contenuto
 const tw = (bw - 2 * pad) * 0.96; //larghezza per titolo e testo
 const sizeT = max(20, bw * 0.07); //titoletto, mai sotto 20px


 const testo1 =
   "In 2026 Gijsbert Oonk, professor of Migration, Citizenship, and Identity in a Globalizing World, and Director of Research at the Department of History, Erasmus University Rotterdam, compiled a dataset covering nearly every Olympic participant since Athens 1896.\n" +
   "It records each athlete's birthplace, the nation they represented, and the events they entered, and links this to national context.\n" +
   "The dataset is designed to ask not only who won, but under what conditions athletes are able to participate, compete, and succeed.\n" +
   "It builds on 12 years of Oonk's research on sports migration (in the Olympics and the FIFA World Cup). He hypothesized that migration had grown over time, but found the opposite: it has remained steady at roughly 8-12% throughout.";


 const testo2 =
   "The primary source for the dataset is Olympedia, supplemented by Wikidata, official Olympic Studies Centre records, and newspaper archives accessed through LexisNexis to verify information and fill gaps. The dataset was cleaned and standardized by removing irrelevant columns and records, harmonizing column names, and adding geographical variables, including continents of origin and destination.\n" +
   "Records were limited to Summer Olympic Games from 2008 onwards. Extensive cross-referencing was also carried out to address inconsistencies, account for geopolitical changes, and ensure comparability across countries and over time.";


 const testo3 =
   "Our learning objectives are to recognize the main global migration flows, understanding Europe's central role as both the main country of origin and destination, and the United States as the primary destination in the Americas. We also aim to observe how these flows vary between countries while remaining stable in volume over time.\n" +
   "We also aim to compare country of birth and represented nation in order to identify the economic and social differences between the two countries. In particular, to understand how many people have made this migration and recognize that only slightly more than half of athletes migrate to a wealthier country, while more than half migrate to a less populous country. Finally, to note that slightly more than half of athletes migrate to a country with fewer medals won.";


 //se titolo più lungo va a capo il testo parte più in basso
 textFont(workSans);
 textSize(sizeT);
 let righeTitolo;


 if (textWidth("Knowledge Objectives") > tw) {
 righeTitolo = 2;
 } else {
 righeTitolo = 1;
 }
 const ty = by + pad + sizeT * (1.05 * righeTitolo + 1.15); //da dove parte testo
 const spazio = by + bh - ty - pad; //altezza disponibile per testo


 //dimensione del testo
 let sizeB = 8; //valore di partenza
 for (let s = min(18, bw * 0.04); s >= 8; s -= 0.5) { //provo dimensioni (da più grande a più piccola)
   const righe = max(contaRighe(testo1, tw, s), contaRighe(testo2, tw, s), contaRighe(testo3, tw, s));
   if (righe * s * 1.5 <= spazio) { //se testo con più righe entra nello spazio, ciclo si interrompe: viene scelta dimensione più grande che va bene per tutti e tre
     sizeB = s;
     break;
   }
 }


 //misure comuni ai tre box
 const m = { margine, gap, bw, by, bh, pad, sizeT, ty, spazio, sizeB };
 drawBox(0, m, "About dataset", testo1);
 drawBox(1, m, "Methodology", testo2);
 drawBox(2, m, "Knowledge Objectives", testo3);
}


//un singolo box: i è la colonna (0, 1, 2)
function drawBox(i, m, titolo, testo) {
 const x = m.margine + i * (m.bw + m.gap); //posizione orizzontale box


 //riquadro
 stroke("#ffffff");
 strokeWeight(3);
 fill(25, 10, 50, 160);
 rect(x, m.by, m.bw, m.bh, min(30, m.bw * 0.06)); //min per evitare che angoli diventino troppo arrotondati quando box è grande


 //titolo del box (se è più largo del box va a capo)
 noStroke();
 fill(255);
 textFont(workSans);
 textSize(m.sizeT);
 textLeading(m.sizeT * 1.05); //distanza tra righe del titolo
 textAlign(CENTER, TOP);
 textWrap(WORD); //se testo non entra, va a capo tra una parola e l'altra
 text(titolo, x + m.pad, m.by + m.pad, m.bw - 2 * m.pad); //scrive titolo dentro a box. ultimo valore: larghezza massima


 //testo del box
 textFont("Trebuchet MS");
 textSize(m.sizeB);
 textLeading(m.sizeB * 1.5);
 textAlign(LEFT, TOP);
 text(testo, x + m.pad, m.ty, m.bw - 2 * m.pad, m.spazio + m.sizeB * 1.5);
}


//quante righe occupa un testo
function contaRighe(testo, larghezza, size) {
 textFont("Trebuchet MS");
 textStyle(NORMAL);
 textSize(size);
 let righe = 0; //contatore
 for (const paragrafo of testo.split("\n")) { //testo diviso in paragrafi
   righe++; //ogni paragrafo parte da una riga nuova
   let riga = ""; //riga che si sta costruendo
   for (const parola of paragrafo.split(" ")) {
     let prova = riga;
   if (riga !== "") {
       prova += " ";
     }
     prova += parola;
     if (riga !== "" && textWidth(prova) > larghezza) {
       righe++; //se la parola non entra va a capo
       riga = parola;
     } else {
       riga = prova; //quindi si aggiunge una partola alla volta, per verificare che entri nello spazio disponibile
     }
   }
 }
 return righe;
}


//bottone in basso link a Google Sheets
function disegnaBottoneSheet() {
 const { margine, w, h, spazio } = griglia(); //misura griglia bottoni
 const x = margine + 2 * (w + spazio); //colonna centrale della griglia (ne salta due)
 const y = height - margine * 0.5 - h; //stessa altezza bottoni degli anni


 const sopra = mouseX > x && mouseX < x + w && mouseY > y && mouseY < y + h; //vero se mouse è su bottone


 noStroke();
 if (sopra) fill("#5c45d2");
 else fill("#281977");
 rect(x, y, w, h, h / 2);


 fill("#ffffff");
 textFont(workSans);
 textSize(h * 0.45);
 textAlign(CENTER, CENTER);
 text("Discover the dataset", x + w / 2, y + h / 2);


 //click gestito da mousePressed di ricorrenti.js
 bottoniNav.push({ link: "https://docs.google.com/spreadsheets/d/1bBfkbnhPlMpUxN2Nf1iuXnHpjvYUomeceLQjjU1IGlI/edit?usp=sharing", x, y, w, h });
}


function windowResized() {
 resizeCanvas(windowWidth, windowHeight);
}
