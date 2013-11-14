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
        colorCache = [],
        startAngle = 0, 
        arc = Math.PI / 6, 
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
                    console.log($restoAjout);
                    var index = $.inArray($restoAjout, restoArray);
                    if (index>-1){
                            trouve=true;
                        }

                    //Si le type de resto n'est pas dans le tableau, on l'ajoute, sauf si le tableau est déjà plein
                    if ((!trouve)&&(restoArray.length<10)){
                        restoArray.push($restoAjout);
                        arc = 2 * Math.PI / $restoAjout.length;
                        //2pi/r
                        restoLength = $restoAjout.length;
                        drawroue();
                    }
                    //Sinon on le supprime (sauf si le tableau est vide, auquel cas on n'enlève pas le dernier élément)
                    else if ((trouve)&&(restoArray.length>1)){
                        restoArray.splice(index, 1);
/*                        arc = 2 * Math.PI / $restoAjout.length;
*/                      restoLength = restoArray.length;
                        drawroue();
                    }
            }
        }
             
        //Génération des couleurs aléatoires ==> A SUPPR                        
        function genHex(){
            var colors=["0","1","2","3","4","5","6","7","8","9","a","b","c","d","e","f"], color = "", digit = [], i;

            for (i=0;i<6;i++){
                digit[i]=colors[Math.round(Math.random()*14)];             
                color = color+digit[i];     
            }   
            
            if($.inArray(color, colorCache) > -1){
                genHex();
            } else {
                colorCache.push('#'+color);
                return '#'+color;
            }
        }
        
       var rotateroue = function rotateroue() {
                tourneTime += 30;
                if(tourneTime >= tourneTimeTotal) {
                    stopRotateroue();
                    return;
                }

                var tourneAngle = tourneAngleStart - easeOut(tourneTime, 0, tourneAngleStart, tourneTimeTotal);
                startAngle += (tourneAngle * Math.PI / 180);
                drawroue();
                tourneTimeout = setTimeout(rotateroue, 30);
        }
        
        //Quand la roue a fini de tourner :
        function stopRotateroue () {
                $.rotation_complete();
                clearTimeout(tourneTimeout);
                var degrees = startAngle * 180 / Math.PI + 90;
                var arcd = arc * 180 / Math.PI;
                var index = Math.floor((360 - degrees % 360) / arcd);
                ctx.save();
                ctx.font = paramsRoue.resultTextFont;
                var text = restoArray[index];
                $(paramsRoue.restoResultatDiv).html(text).show();
                //ctx.fillText(text, 250 - ctx.measureText(text).width / 2, 250 + 10);
                ctx.restore();
            }         
        
        //Dessin de la flèche
        function drawArrow() {
            ctx.fillStyle = paramsRoue.arrowColor;
            ctx.beginPath();
            ctx.moveTo(250 - 4, 250 - (paramsRoue.outterRadius + 15));
            ctx.lineTo(250 + 4, 250 - (paramsRoue.outterRadius + 15));
            ctx.lineTo(250 + 4, 250 - (paramsRoue.outterRadius - 15));
            ctx.lineTo(250 + 9, 250 - (paramsRoue.outterRadius - 15));
            ctx.lineTo(250 + 0, 250 - (paramsRoue.outterRadius - 23));
            ctx.lineTo(250 - 9, 250 - (paramsRoue.outterRadius - 15));
            ctx.lineTo(250 - 4, 250 - (paramsRoue.outterRadius - 15));
            ctx.lineTo(250 - 4, 250 - (paramsRoue.outterRadius + 15));
            ctx.fill();               
        }

        //Dessin de la roue        
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
/*                console.log(restoArray[i]+ " angle : "+ angle + " arc : "+ arc+ " startangle "+ startAngle);               
*/                ctx.fillStyle = colorCache.length > totalJoiner ? colorCache[i] : genHex();
                
                ctx.beginPath();
                // ** arc(centerX, centerY, radius, startingAngle, endingAngle, antiClockwise);
                ctx.arc(250, 250, paramsRoue.outterRadius, angle, angle + arc, false);
                //ctx.arc(x,y,radius,startAngle,endingAngle,counterclockwise);
                ctx.arc(250, 250, paramsRoue.innerRadius, angle + arc, angle, true);

                ctx.stroke();
                ctx.fill();
        
                ctx.save();
                ctx.shadowOffsetX = -1;
                ctx.shadowOffsetY = -1;
                ctx.shadowBlur    = 1;
                ctx.shadowColor   = paramsRoue.roueTextShadowColor;
                ctx.fillStyle     = paramsRoue.roueTextColor;
                ctx.translate(250 + Math.cos(angle + arc / 2) * paramsRoue.textRadius, 250 + Math.sin(angle + arc / 2) * paramsRoue.textRadius);
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

        //Animation de la roue !
        function easeOut(t, b, c, d) {
            var ts = (t/=d)*t;
            var tc = ts*t;
            return b+c*(tc + -3*ts + 3*t);
        } 
                
        methods.init.apply(this,[]);
    }
    
    /*  ---  please look at the index.html source in order to understand what they do ---
     *  outterRadius : the big circle border
     *  innerRadius  : the inner circle border
     *  textRadius   : How far the the text on the roue locate from the center point
     *  tourneDeclencheur  : the element that Declencheur the tourne action 
     *  roueBorderColor : what is the roue border color
     *  roueBorderWidth : what is the "thickness" of the border of the roue
     *  roueTextFont : what is the style of the text on the roue
     *  roueTextColor : what is the color of the tet on the roue
     *  roueTextShadow : what is the shadow for the text on the roue
     *  resultTextFont : it is not being used currently
     *  arrowColor : what is the color of the arrow on the top
     *  participants : what is the container for participants for the roue
     *  joiner : usually a form input where user can put in their name
     *  typeRestoDeclencheur : what element will Declencheur the add participant
     *  winDiv : the element you want to display the winner
     */
    $.fn.rouetourne.default_options = {
        outterRadius:200, 
        innerRadius:3, 
        textRadius: 160, 
        tourneDeclencheur: '#go', 
        backDeclencheur : '#back',
        roueBorderColor: 'black',
        roueBorderWidth : 3, 
        roueTextFont : 'bold 15px sans-serif', 
        roueTextColor: 'black', 
        roueTextShadowColor : 'rgb(220,220,220)',
        resultTextFont : 'bold 30px sans-serif', 
        arrowColor :'black',
        typeRestoDeclencheur:'#choix :input',
        restoResultatDiv:'#roue-result'
    }
})(jQuery);