/*  Code inspired from a JQuery Plug-in :
 *  @author Roy Yu | iroy2000 [at] gmail.com 
 *  @description: This jquery plugin will create a tourne roue and let you to add players at run time. 
 *  http://iroylabs.blogspot.com/2011/06/latest-jquery-plugin.html
 */


(function($){
    $.fn.rouetourne = function(options, callback){
        
        var paramsRoue = $.extend({},$.fn.rouetourne.default_options, options), 
        $that = $(this), 
        ctx = null,
        startAngle = 0, 
        arc = Math.PI / 5, 
        tourneTimeout = null, 
        tourneArcStart = 10, 
        tourneTime = 0, 
        tourneTimeTotal = 0, 
        tourneAngleStart = 0, 
        restoLength = 10, 
        restoArray = paramsRoue.restoArray;

        if($.isFunction(options)){
            callback = options;
            options = {};
        } 
        
        var methods = {
            init: function() {
                methods.getContext();
                methods.setup();
                drawroue();                
            },
            //Setup des événements click et appel des méthodes    
            setup: function() {
                $(paramsRoue.tourneDeclencheur).bind('click', function(e){
                    e.preventDefault();
                    methods.tourne();
                });
                                              
                $(paramsRoue.typeRestoDeclencheur).bind('click', function(e){
                    e.preventDefault();
                    methods.updatePanel(e);
                });
                
                $(paramsRoue.backDeclencheur).bind('click', function(e){
                    e.preventDefault();
                    methods.back();
                });                
            },            
            getContext: function() {         
                if(ctx !== null)
                    return ctx;

                var canvas = $that[0];
                ctx = canvas.getContext("2d");          
            },
            //Fonction quand on clique sur "back", il faudra refaire ça, je trouve ça assez sale la façon dont c'est fait
            back : function(){
                $("#affichage").animate(
                    {"margin-left":"80%"},
                    {
                      duration:500,
                    }).animate(
                    {"width":"20%"},
                    {
                      duration:500,
                    });
                  $("#panel").css('width', '100%');
                  $("#map").css('width', '0%');
                  $("#panel-results").fadeOut(500);
                  $("#panel-roue").fadeIn(500);
                  $(paramsRoue.restoResultatDiv+">img").fadeIn(1200);
                  $("#canvas").fadeIn(1000);
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
                var trouve=false;
                    $restoAjout = evenement.currentTarget.value;
                    var index = $.inArray($restoAjout, restoArray);
                    if (index>-1){
                            trouve=true;

                        }

                    //Si le type de resto n'est pas dans le tableau, on l'ajoute, sauf si le tableau est déjà plein
                    if ((!trouve)&&(restoArray.length<10)){
                        restoArray.push($restoAjout);
                        restoLength = $restoAjout.length;
                        arc = Math.PI / (restoArray.length/2);
                        drawroue();
                    }
                    //Sinon on le supprime (sauf si le tableau est vide, auquel cas on n'enlève pas le dernier élément)
                    else if ((trouve)&&(restoArray.length>2)){
                        restoArray.splice(index, 1);
                        restoLength = restoArray.length;
                        arc = Math.PI / (restoArray.length/2);
                        drawroue();
                    }
            }
        }
        
       var rotateroue = function rotateroue() {
                tourneTime += 30;
                if(tourneTime >= tourneTimeTotal) {
                    stopRotationRoue();
                    return;
                }

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
                var text = restoArray[index];

                 $(paramsRoue.restoResultatDiv).children().fadeOut( "slow", function() {
                    $(paramsRoue.restoResultatDiv+">p").text(text).show();
                  });

                 $(paramsRoue.restoResultatDiv+">p").fadeOut(1000, function() {
                    $.rotation_complete();
                    $("#canvas").fadeOut(1000);
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
            
            if (restoArray.length!=0){
                //La flèche     
                drawArrow();
            }
        }          

        /////////// ANIMATION DE LA ROUE QUAND ELLE TOURNE ////////////////////  
        function easeOut(t, b, c, d) {
            var ts = (t/=d)*t;
            var tc = ts*t;
            return b+c*(tc + -3*ts + 3*t);
        } 
                
        methods.init.apply(this,[]);
    }
    
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