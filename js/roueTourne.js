
(function($){
    $.fn.rouetourne = function(options, callback){
        
        //////////// INITIALISATION VARIABLES + PARAMETRES PAR DEFAUT DE L'OBJET ////////////
        var paramsRoue = $.extend({},$.fn.rouetourne.default_options, options), 
        $that = $(this), 
        ctx = null,
        startAngle = 0, 
        arc = Math.PI / 5, 
        tourneTimeout = null, 
        tourneArcStart = 10, 
        tourneTime = 0, 
        modifResto = true,
        tourneTimeTotal = 0, 
        tourneAngleStart = 0, 
        restoLength = 10, 
        resultatRoue = null,
        restoArray = paramsRoue.restoArray;

        if($.isFunction(options)){
            callback = options;
            options = {};
        } 
        
         //////////// DECLARATION METHODES DE L'OBJET ////////////
        var methods = {
            init: function() {
                methods.getContext();
                methods.setup();
                drawroue();                
            },

            /////////////// SET-UP DES EVENEMENTS QUI DECLENCHERONT LES METHODES //////////////// 
            setup: function() {
                //Un click sur "tourneDeclencheur" (voir dans les options) fera tourner la roue
                $(paramsRoue.tourneDeclencheur).bind('click', function(e){
                    e.preventDefault();
                    methods.tourne();
                });
                
                //Un click sur les types de resto ajoutera ou supprimera des quartiers                             
                $(paramsRoue.typeRestoDeclencheur).bind('click', function(e){
                    e.preventDefault();
                    methods.updatePanel(e);
                });
                
                //Un click sur le bouton back lancera la fonction back
                $(paramsRoue.backDeclencheur).bind('click', function(e){
                    e.preventDefault();
                    methods.back();
                });                
            },

            /////////////// RECUPERATION DU CONTEXTE POUR DRAW DANS LE CANVAS ////////////////            
            getContext: function() {  
                if(ctx !== null)
                    return ctx;

                 var canvas = document.getElementById("canvas");
                 var G_vmlCanvasManager;

                if (G_vmlCanvasManager != undefined) { // if IE9
                        G_vmlCanvasManager.initElement(canvas);
                }

                if (canvas.getContext) {
                        ctx = canvas.getContext('2d');
                }   
            },

            /////////////// QUAND ON CLIQUE SUR BACK ////////////////
            back : function(){
                // $("#affichage").animate(
                //     {"margin-left":"80%"},
                //     {
                //       duration:500,
                //     }).animate(
                //     {"width":"20%"},
                //     {
                //       duration:500,
                //     });
                //   $("#panel").css('width', '100%');
                //   $("#map").css('width', '0%');
                //   $("#panel-results").fadeOut(500);
                //   $("#panel-roue").fadeIn(500);
                $("#panel").delay(1000).animate(
                    {"margin-left":"75%"},
                    {duration:500}
                );
                $("#panel-results").delay(1500).fadeOut(500);
                $("#panel-roue").delay(1500).fadeIn(500);
                $('#map').fadeOut(1000);
                  $(paramsRoue.restoResultatDiv+">img").fadeIn(1200);
                  $("#canvas").fadeIn(1000);
                  modifResto=true;
            },
            //Fonction qui fait tourner la roue !
            tourne: function() {
                tourneAngleStart = Math.random() * 10 + 10;
                tourneTime = 0;
                tourneTimeTotal = Math.random() * 3 + 4 * 1000;
                rotateroue();                
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
                        drawroue();
                    }
                    
                    //Sinon on le supprime (sauf si le tableau contient moins de deux éléments, auquel cas on n'enlève pas les deux derniers éléments)
                    else if ((trouve)&&(restoArray.length>2)){
                        $(typeRestoEnCours).toggleClass('selected');
                        restoArray.splice(index, 1);
                        restoLength = restoArray.length;
                        arc = Math.PI / (restoArray.length/2);
                        drawroue();
                    }
                }
            }
        }
        
       var rotateroue = function rotateroue() {
                tourneTime += 30;
                if(tourneTime >= tourneTimeTotal) {
                    stopRotationRoue();
                    return;
                }
                modifResto=false;
                var tourneAngle = tourneAngleStart - easeOut(tourneTime, 0, tourneAngleStart, tourneTimeTotal);
                startAngle += (tourneAngle * Math.PI / 180);
                drawroue();
                tourneTimeout = setTimeout(rotateroue, 30);
        }
        
        /////////// QUAND LA ROUE A FINI DE TOURNER ////////////////////  
        function stopRotationRoue () {
                clearTimeout(tourneTimeout);
                var degrees = startAngle * 180 / Math.PI + 90;
                var arcd = arc * 180 / Math.PI;
                var index = Math.floor((360 - degrees % 360) / arcd);
                ctx.save();
                ctx.font = paramsRoue.resultTextFont;
                resultatRoue = restoArray[index];

                 $(paramsRoue.restoResultatDiv).children().fadeOut(0, function() {
                    $(paramsRoue.restoResultatDiv+">p").text(resultatRoue).fadeIn(100);
                  });

                 $(paramsRoue.restoResultatDiv+">p").fadeOut(0, function() {
                    $.rotation_complete(resultatRoue);
                    $("#canvas").fadeOut(500);
                    ctx.restore();
                  });
            }         
        
        /////////// DESSIN DE LA FLECHE ////////////////////  
        function drawArrow() {
            ctx.fillStyle = paramsRoue.arrowColor;
            ctx.beginPath();
            ctx.moveTo(0 - 4, 250 - (paramsRoue.outterRadius + 15));
            ctx.lineTo(0 + 4, 250 - (paramsRoue.outterRadius + 15));
            ctx.lineTo(0 + 4, 250 - (paramsRoue.outterRadius - 15));
            ctx.lineTo(0 + 9, 250 - (paramsRoue.outterRadius - 15));
            ctx.lineTo(0 + 0, 250 - (paramsRoue.outterRadius - 23));
            ctx.lineTo(0 - 9, 250 - (paramsRoue.outterRadius - 15));
            ctx.lineTo(0 - 4, 250 - (paramsRoue.outterRadius - 15));
            ctx.lineTo(0 - 4, 250 - (paramsRoue.outterRadius + 15));
            ctx.fill();               
        }

        /////////// DESSIN DE LA ROUE ////////////////////      
        function drawroue() {
            ctx.strokeStyle = paramsRoue.roueBorderColor;
            ctx.lineWidth = paramsRoue.roueBorderWidth;
            ctx.font = paramsRoue.roueTextFont;            
            ctx.clearRect(0,0,500,500);
            var text = null, 
            i = 0,
            totalJoiner = restoArray.length;

            for(i = 0; i < totalJoiner; i++) {
                text = restoArray[i];
                //On met le texte/picto qui correspond au type de resto           
                var angle = startAngle + i * arc; 
                //console.log(restoArray[i]+ " angle : "+ angle + " arc : "+ arc+ " startangle "+ startAngle);      

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
                ctx.arc(0, 400, paramsRoue.outterRadius, angle, angle + arc, false);
                ctx.arc(0, 400, paramsRoue.innerRadius, angle + arc, angle, true);
                ctx.stroke();
                ctx.fill();
        
                ctx.save();

                /////////// TRAITEMENT DU TEXTE SUR LA ROUE ////////////////////

                ctx.fillStyle     = paramsRoue.roueTextColor;
                ctx.translate(0 + Math.cos(angle + arc / 2) * paramsRoue.textRadius, 400 + Math.sin(angle + arc / 2) * paramsRoue.textRadius);
                ctx.rotate(angle + arc / 2 + Math.PI / 2);
                
                ctx.fillText(text, -ctx.measureText(text).width / 2, 0);
                ctx.restore();
                ctx.closePath();
            }     
                drawArrow();
        }          

        /////////// ANIMATION DE LA ROUE QUAND ELLE TOURNE ////////////////////  
        function easeOut(t, b, c, d) {
            var ts = (t/=d)*t;
            var tc = ts*t;
            return b+c*(tc + -3*ts + 3*t);
        } 
                
        methods.init.apply(this,[]);
    }
    

     //////////// OPTIONS DE L'UTILISATEUR (UI) DE L'OBJET ////////////
    $.fn.rouetourne.default_options = {
        outterRadius:400, 
        innerRadius:150, 
        textRadius: 300, 
        tourneDeclencheur: '#go', 
        backDeclencheur : '#back',
        roueBorderColor: 'white',
        roueBorderWidth : 30, 
        roueTextFont : '22px sans-serif', 
        roueTextColor: 'white', /*
        roueTextShadowColor : 'none',*/
        resultTextFont : '30px sans-serif', 
        arrowColor :'black',
        typeRestoDeclencheur:'#choix :input',
        restoResultatDiv:'#restoDiv'
    }
})(jQuery);