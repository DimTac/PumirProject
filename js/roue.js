var restoArray = {restoArray : ['Chinois','Japonais','Kebab','Brasserie','Pizza','Indien','Crêperie','Sandwich','Bio-tibétain','Chez maman']};

var roue = 
{
    //////////// PARAMETRES PAR DEFAUTS ////////////
    defaults:
    {
        ctx: null,
        startAngle :0, 
        arc :Math.PI / 5, 
        tourneTimeout :null, 
        tourneArcStart :10, 
        tourneTime: 0, 
        modifResto: true,
        tourneTimeTotal: 0, 
        tourneAngleStart: 0, 
        restoLength :10, 
        resultatRoue :null,
        restoArray: restoArray.restoArray,

        // params déclencheur
        tourneDeclencheur: "body",
        typeRestoDeclencheur: "#",
        backDeclencheur: "#",
        roueBorderColor: "red",
        roueBorderWidth: "1px",
        roueTextFont: "Arial",
        outterRadius: "3px",
        innerRadius: "2px",
        roueTextColor: "blue",
        restoResultatDiv: "#resultat",
        resultTextFont: "green",
        arrowColor:"orange"

    },

    //////////// INITIALISATION ////////////
    init: function(options){
        this.params = $.extend(this.defaults,options); 
        roue.getContext();
        roue.setup();
        roue.drawroue(); 
        console.log("Initialisation de la roue");
    },    

    /////////////// SET-UP DES EVENEMENTS QUI DECLENCHERONT LES METHODES //////////////// 
    setup: function() {
        console.log("tournedeclencheur : "+this.params.tourneDeclencheur);
        //Un click sur "tourneDeclencheur" (voir dans les options) fera tourner la roue
        $(this.params.tourneDeclencheur).bind('click', function(e){
            e.preventDefault();
            roue.tourne();
        });
        
        //Un click sur les types de resto ajoutera ou supprimera des quartiers                             
        $(this.params.typeRestoDeclencheur).bind('click', function(e){
            e.preventDefault();
            roue.updatePanel(e);
        });
        
        //Un click sur le bouton back lancera la fonction back
        $(this.params.backDeclencheur).bind('click', function(e){
            e.preventDefault();
            roue.back();
        });                
    },

    /////////////// RECUPERATION DU CONTEXTE POUR DRAW DANS LE CANVAS ////////////////            
    getContext: function() {  
        if(this.params.ctx !== null)
            return this.params.ctx;

         var canvas = document.getElementById("canvas");
         var G_vmlCanvasManager;

        if (G_vmlCanvasManager != undefined) { // if IE9
                G_vmlCanvasManager.initElement(canvas);
        }

        if (canvas.getContext) {
                this.params.ctx = canvas.getContext('2d');
        }   
    },

    /////////////// QUAND ON CLIQUE SUR BACK ////////////////
    back : function(){
        $("#panel").delay(1000).animate(
            {"margin-left":"75%"},
            {duration:500}
        );
        $("#panel-results").delay(1500).fadeOut(500);
        $("#panel-roue").delay(1500).fadeIn(500);
        $('#map').fadeOut(1000);
          $(this.params.restoResultatDiv+">img").fadeIn(1200);
          $("#canvas").fadeIn(1000);
          modifResto=true;
    },

    //Fonction qui fait tourner la roue !
    tourne: function() {
        this.params.tourneAngleStart = Math.random() * 10 + 10;
        tourneTime = 0;
        tourneTimeTotal = Math.random() * 3 + 4 * 1000;
        roue.rotateroue();                
    },

    //Fonction qui met à jour la roue quand on clique sur les types de resto : ajout ou suppression de quartiers
    updatePanel: function(evenement) { 
        if (modifResto){
            //Si la roue n'est pas en train de tourner :
            var trouve=false;

            var typeRestoEnCours = evenement.currentTarget;
            $restoAjout = typeRestoEnCours.value;
            var index = $.inArray($restoAjout, restoArray);
            if (index>-1){
                trouve=true;
            }

            //Si le type de resto n'est pas dans le tableau, on l'ajoute, sauf si le tableau est déjà plein
            if ((!trouve)&&(restoArray.length<10)){
                $(typeRestoEnCours).toggleClass('selected');
                restoArray.push($restoAjout);
                restoLength = $restoAjout.length;
                arc = Math.PI / (restoArray.length/2);
                roue.drawroue();
            }
            
            //Sinon on le supprime (sauf si le tableau contient moins de deux éléments, auquel cas on n'enlève pas les deux derniers éléments)
            else if ((trouve)&&(restoArray.length>2)){
                $(typeRestoEnCours).toggleClass('selected');
                restoArray.splice(index, 1);
                restoLength = restoArray.length;
                arc = Math.PI / (restoArray.length/2);
                roue.drawroue();
            }
        }
    },

    /////////// QUAND LA ROUE A FINI DE TOURNER ////////////////////  
    stopRotationRoue: function () {
        clearTimeout(tourneTimeout);
        var degrees = this.params.startAngle * 180 / Math.PI + 90;
        var arcd = arc * 180 / Math.PI;
        var index = Math.floor((360 - degrees % 360) / arcd);
        this.params.ctx.save();
        this.params.ctx.font = paramsRoue.resultTextFont;
        resultatRoue = restoArray[index];

        $(this.params.restoResultatDiv).children().fadeOut(0, function() {
            $(this.params.restoResultatDiv+">p").text(resultatRoue).fadeIn(100);
          });

        $(this.params.restoResultatDiv+">p").fadeOut(0, function() {
            //$.rotation_complete(resultatRoue);
            $("#canvas").fadeOut(500);
            this.params.ctx.restore();
          });
    },        

    ///////////  QUAND LA ROUE TOURNE //////////////////// 
    rotateroue: function() {
        tourneTime += 30;
        if(tourneTime >= tourneTimeTotal) {
            stopRotationRoue();
            return;
        }
        modifResto=false;
        //var tourneAngle = this.params.tourneAngleStart - roue.easeOut(tourneTime, 0, this.params.tourneAngleStart, tourneTimeTotal);
        //this.params.startAngle += (tourneAngle * Math.PI / 180);
        roue.drawroue();
        tourneTimeout = setTimeout(this.rotateroue, 30);
    },

    /////////// DESSIN DE LA FLECHE ////////////////////  
    drawArrow: function() {
        this.params.ctx.fillStyle = this.params.arrowColor;
        this.params.ctx.beginPath();
        this.params.ctx.moveTo(0 - 4, 250 - (this.params.outterRadius + 15));
        this.params.ctx.lineTo(0 + 4, 250 - (this.params.outterRadius + 15));
        this.params.ctx.lineTo(0 + 4, 250 - (this.params.outterRadius - 15));
        this.params.ctx.lineTo(0 + 9, 250 - (this.params.outterRadius - 15));
        this.params.ctx.lineTo(0 + 0, 250 - (this.params.outterRadius - 23));
        this.params.ctx.lineTo(0 - 9, 250 - (this.params.outterRadius - 15));
        this.params.ctx.lineTo(0 - 4, 250 - (this.params.outterRadius - 15));
        this.params.ctx.lineTo(0 - 4, 250 - (this.params.outterRadius + 15));
        this.params.ctx.fill();               
    },

    /////////// DESSIN DE LA ROUE ////////////////////      
    drawroue: function() {
        
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d"); 

        ctx.strokeStyle = "#C35817";       
        ctx.clearRect(0,0,500,500);
        var text = null, 
        i = 0,
        totalJoiner = restoArray.length;

        for(i = 0; i < totalJoiner; i++) {
            text = restoArray[i];
            //On met le texte/picto qui correspond au type de resto           
            var angle = startAngle + i * arc; 

            /////////// DESSIN DE LA ROUE : COULEUR ////////////////////      
            if (i%2){
            //Quartiers paires d'une certaine couleur
                ctx.fillStyle="#bb5048";
            }
            else{
                ctx.fillStyle="#9c4b47";
            }

            ctx.beginPath();
            // ** arc(centerX, centerY, radius, startingAngle, endingAngle, antiClockwise);
            ctx.arc(0, 400, this.params.outterRadius, angle, angle + arc, false);
            ctx.arc(0, 400, this.params.innerRadius, angle + arc, angle, true);
            ctx.stroke();
            ctx.fill();

            ctx.save();

            /////////// TRAITEMENT DU TEXTE SUR LA ROUE ////////////////////

            ctx.fillStyle     = this.params.roueTextColor;
            ctx.translate(0 + Math.cos(angle + arc / 2) * paramsRoue.textRadius, 400 + Math.sin(angle + arc / 2) * paramsRoue.textRadius);
            ctx.rotate(angle + arc / 2 + Math.PI / 2);
            
            ctx.fillText(text, -ctx.measureText(text).width / 2, 0);
            ctx.restore();
            ctx.closePath();
        }  

        //TEST
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");   
        var data = this.params.restoArray;
        var colors = ["#7E3817", "#C35817", "#EE9A4D", "#A0C544", "#348017", "#307D7E", "#307D7E", "#307D7E", "#307D7E", "#307D7E"];
        var center = [canvas.width / 2, canvas.height / 2];
        var radius = Math.min(canvas.width, canvas.height) / 2;
        var lastPosition = 0, total = 0; 
        for(var i in data) { total += data[i]; }
        for (var i = 0; i < data.length; i++) 
        {
            ctx.fillStyle = colors[i];
            ctx.beginPath();
            ctx.moveTo(center[0],center[1]);
            ctx.arc(center[0],center[1],radius,lastPosition,lastPosition+(Math.PI*2*(data[i]/total)),false);
            ctx.lineTo(center[0],center[1]);
            ctx.fill();
            lastPosition += Math.PI*2*(data[i]/total);
            console.log("dessin");
        }
 
    },          

    /////////// ANIMATION DE LA ROUE ////////////////////  
    easeOut: function(t, b, c, d) {
        var ts = (t/=d)*t;
        var tc = ts*t;
        return b+c*(tc + -3*ts + 3*t);
    } 
                
}
