var couleurs = ["#E1EBED", "#B0CDD8", "#7FA2B0", "#607588",
             "#B0CDD8", "#E1EBED", "#B0CDD8", "#7FA2B0",
             "#607588", "#B0CDD8", "#E1EBED", "#B0CDD8"];
var typeRestos = ["Italien", "Chinois", "Indien", "Japonais",
                   "Crêperie", "Fast food", "Sandwich", "Pâtes",
                   "Kébab", "Brasserie","Coucou","Coucou2"];

var startAngle = 0;
var arc = Math.PI / 6;
var vitesseRotationFin = null;

var spinArcStart = 10;
var vitesseRotation = 0;
var vitesseRotationTotal = 0;

var canvasContext;

function dessinRoue() {
  var canvas = document.getElementById("canvas");
  if (canvas.getContext) {
    var extAngle = 200;
    var texteAngle = 150;
    var intAngle = 10;

    canvasContext = canvas.getContext("2d");
    canvasContext.clearRect(0,0,500,500);

    //Contour de la roue :
    canvasContext.strokeStyle = "black";
    canvasContext.lineWidth = 2;
    //Style des noms des restos :
    canvasContext.font = 'bold 12px Helvetica, Arial';

    for(var i = 0; i < 12; i++) {
      //On veut dessiner 12 quartiers, donc on fait une boucle de 12 itérations
      var angle = startAngle + i * arc;
      canvasContext.fillStyle = couleurs[i];

      //Début du dessin des quartiers
      canvasContext.beginPath();
      canvasContext.arc(250, 250, extAngle, angle, angle + arc, false);
      canvasContext.arc(250, 250, intAngle, angle + arc, angle, true);
      canvasContext.stroke();
      //Remplissage des quartiers par les couleurs définies ci dessus
      canvasContext.fill();
      //Sauvegarde du contexte
      canvasContext.save();

      //On écrit en noir sur la roue
      canvasContext.fillStyle = "black";
      //Définition de la translation de la roue
      canvasContext.translate(250 + Math.cos(angle + arc / 2) * texteAngle, 
                    250 + Math.sin(angle + arc / 2) * texteAngle);
      //Définition de la rotation de la roue
      canvasContext.rotate(angle + arc / 2 + Math.PI / 2);

      //Remplissage avec les noms des restos
      var texte = typeRestos[i];
      canvasContext.fillText(texte, -canvasContext.measureText(texte).width / 2, 0);
      canvasContext.restore();
    } 

    //Flèche
    canvasContext.fillStyle = "black";
    canvasContext.beginPath();
    canvasContext.moveTo(250 - 4, 250 - (extAngle + 5));
    canvasContext.lineTo(250 + 4, 250 - (extAngle + 5));
    canvasContext.lineTo(250 + 4, 250 - (extAngle - 5));
    canvasContext.lineTo(250 + 9, 250 - (extAngle - 5));
    canvasContext.lineTo(250 + 0, 250 - (extAngle - 13));
    canvasContext.lineTo(250 - 9, 250 - (extAngle - 5));
    canvasContext.lineTo(250 - 4, 250 - (extAngle - 5));
    canvasContext.lineTo(250 - 4, 250 - (extAngle + 5));
    canvasContext.fill();
  }
}

function spin() {
  spinAngleStart = Math.random() * 10 + 10;
  vitesseRotation = 0;
  vitesseRotationTotal = Math.random() * 3 + 4 * 1500;
  rotationRoue();
}

function rotationRoue() {
  vitesseRotation += 200;
  if(vitesseRotation >= vitesseRotationTotal) {
    stoprotationRoue();
    return;
  }
  var spinAngle = spinAngleStart - easeOut(vitesseRotation, 0, spinAngleStart, vitesseRotationTotal);
  startAngle += (spinAngle * Math.PI / 180);
  dessinRoue();
  vitesseRotationFin = setTimeout('rotationRoue()', 10);
}

function stoprotationRoue() {
  clearTimeout(vitesseRotationFin);
  var degrees = startAngle * 180 / Math.PI + 90;
  var arcd = arc * 180 / Math.PI;
  var index = Math.floor((360 - degrees % 360) / arcd);
  canvasContext.save();
  canvasContext.font = 'bold 30px Helvetica, Arial';
  var text = typeRestos[index]
  canvasContext.fillText(text, 250 - canvasContext.measureText(text).width / 2, 250 + 10);
  canvasContext.restore();

  $("#affichage").css('width', '100%').delay(1000).animate(
    {"margin-left":"0%"},
    {
      duration:500,

    });
  $("#panel").css('width', '20%');
  $("#map").css("width", "80%");
  $("#panel-roue").delay(1000).fadeOut(500);
  $("#panel-results").delay(1000).fadeIn(500);
}

function back(){
  $("#affichage").animate(
    {"margin-left":"80%"},
    {
      duration:500,
    }).animate(
    {"width":"20%"},
    {
      duration:500,
    });;
  $("#panel").css('width', '100%');
  $("#map").animate(
    {"width":"0%"},
    {
      duration:500,
    });
  $("#panel-results").fadeOut(500);
  $("#panel-roue").fadeIn(500);
}

function easeOut(t, b, c, d) {
  var ts = (t/=d)*t;
  var tc = ts*t;
  return b+c*(tc + -3*ts + 3*t);
}

dessinRoue();