/*  Code inspired (and translated) from a JQuery Plug-in :
 *  @author Roy Yu | iroy2000 [at] gmail.com 
 *  @description: This jquery plugin will create a tourne wheel and let you to add players at run time. 
 *  http://iroylabs.blogspot.com/2011/06/latest-jquery-plugin.html
 
 *   USES JQUERY OBJECT + CANVAS DRAWING :) 
 */


(function($){
    $.fn.rouetourne = function(options, callback){
        
        //////////// INITIALISATION VARIABLES + PARAMETRES PAR DEFAUT DE L'OBJET ////////////
        var paramsRoue = $.extend({},$.fn.rouetourne.default_options, options), 
        $that = $(this), 
        ctx = null,
        startAngle = 90, 
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
        restoArraySrc = paramsRoue.restoArraySrc;
        restoArraySlogan = paramsRoue.restoArraySlogan;
        var canvas = document.getElementById("canvas");
        var restoArrayBackUp = paramsRoue.restoArray.slice(0);
        var restoArraySloganBackUp = paramsRoue.restoArraySlogan.slice(0);

        if($.isFunction(options)){
            callback = options;
            options = {};
        } 
        
        //////////// DECLARATION METHODES DE L'OBJET ////////////
        var methods = {
            init: function() {
                var children = $("#choix > input");
                for (var i = 0; i < restoArray.length; i++) {
                    children.eq(i).val(restoArray[i]);
                };
                methods.getContext();
                methods.setup();
                drawroue();                
            },

            /////////////// SET-UP DES EVENEMENTS QUI DECLENCHERONT LES METHODES //////////////// 
            setup: function() {

                //Un click sur "tourneDeclencheur" (voir dans les options) fera tourner la roue
                $(paramsRoue.tourneDeclencheur).bind('click', function(e){
                    e.preventDefault();
                    $(this).parent().fadeOut(100);
                    $('#roue').fadeIn(100);
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
                map_globale.removeLayer(trajet);

                $("#details-restaurant").fadeOut(1000);
                $("#panel-results").delay(1000).fadeOut(500);
                $("#switch").delay(1000).fadeOut(500);
                $("#back").delay(1000).fadeOut(500);
                $("#panel-roue").delay(1000).fadeIn(500);
                $('#map').fadeOut(1000);
                  $(paramsRoue.restoResultatDiv).fadeIn(1000);
                  $("#canvas").fadeIn(1000);
                  $("#fleche").fadeIn(750);
                  // $(paramsRoue.logo).fadeIn(500);

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
                    //On récupère le type de resto que l'on souhaite supprimer ou ajouter dans la roue :
                    var typeRestoEnCours = evenement.currentTarget;
                    $restoAjout = typeRestoEnCours.value;
                    //On teste si le type de resto est déjà dans le tableau
                    var index = $.inArray($restoAjout, restoArray);
                    //Le indexTrue ira chercher l'index du tableau de base pour bien replacer le titre du resto, le picto et le slogan dans les tableaux mis à jour
                    var indexTrue = $.inArray($restoAjout, restoArrayBackUp);

                    //L'élément a-t-il été trouvé dans le tableau ?
                    if (index>-1){
                        trouve=true;
                    }

                    //Si le type de resto n'est pas dans le tableau, on l'ajoute, sauf si le tableau est déjà plein
                    if ((!trouve)&&(restoArray.length<10)){
                        //On ajoute la classe "selected" à l'input sur lequel on a cliqué
                        $(typeRestoEnCours).toggleClass('selected');
                        //On ajoute le titre du resto dans restoArray
                         restoArray.splice(indexTrue,0,$restoAjout);
                        var restoMin = $restoAjout.toLowerCase()
                        //On ajoute l'image du resto dans le tableau restoArraySrc
                        restoArraySrc.splice(indexTrue,0,'img/'+restoMin+'.png');
                        //On ajout le slogan
                         restoArraySlogan.splice(indexTrue,0,restoArraySloganBackUp[indexTrue]);
                        restoLength = $restoAjout.length;
                        //Enfin on redessinne la roue pour ajouter le quartier
                        arc = Math.PI / (restoArray.length/2);
                        drawroue();
                    }
                    
                    //Sinon on le supprime (sauf si le tableau contient moins de deux éléments, auquel cas on n'enlève pas les deux derniers éléments)
                    else if ((trouve)&&(restoArray.length>4)){
                        //On remove la classe selected
                        $(typeRestoEnCours).toggleClass('selected');
                        //On enlève le type de resto dans les 3 tableaux (type, picto, slogan)
                        restoArray.splice(index, 1);
                        restoArraySlogan.splice(index, 1);
                        restoArraySrc.splice(index, 1);
                        restoLength = restoArray.length;
                        //On redessine la roue pour enlever le quartier
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
                //Quel type de resto va gagner ?
                var degrees = startAngle * 180 / Math.PI + 90;
                var arcd = arc * 180 / Math.PI;
                var index = Math.floor((360 - degrees % 360) / arcd);
                var chaine = "";
                var radiusPanel = 900;
                modifResto = true
                ctx.save();

                resultatRoue = restoArray[index];
                resultatRoueSlogan = restoArraySlogan[index];
                resultatRoueSrc = restoArraySrc[index];

                if ($('input[value="Avec transport"]').hasClass('selectTransport')){ 
                //Si l'utilisateur a signalé qu'il avait un transport, on étend le périmètre de recherche
                    radiusPanel = 2000;
                }

                $(paramsRoue.restoResultatDiv).empty();
                
                $(paramsRoue.logo).fadeOut(0, function() {
                     chaine += '<div id="resultat">';
                      chaine += '<img class="pictoResultat" src='+resultatRoueSrc+' alt='+resultatRoue+'>';
                      chaine += '<h1>'+resultatRoue+'</h1>';
                      chaine += '<p>'+resultatRoueSlogan+'</p>';
                      chaine += '<button id="relancer">Relancer<img src="img/reload.png" alt="next"></button><button id="bonchoix">Bon choix<img src="img/next.png" alt="next"></button>';
                      chaine += '</div>';                     
                      $(paramsRoue.restoResultatDiv).append(chaine);
                      chaine = '';
                  });

                $("#relancer").bind('click', function(e){
                    e.preventDefault();
                    methods.tourne();
                });

                $("#bonchoix").bind('click', function(e){
                    e.preventDefault();
                    $.rotation_complete(resultatRoue,radiusPanel);
                    $(paramsRoue.restoResultatDiv).fadeOut(500);
                    $("#canvas").fadeOut(500);
                    $("#fleche").fadeOut(500);
                    $("#restoDiv").empty();
                });
             ctx.restore();
            }         
       
        /////////// DESSIN DE LA FLECHE ////////////////////  
     /*   function drawArrow() {
            var posX = ($(canvas).width())-135;
            var posY = ($(canvas).height())-590;
            var fleche=new Image();
            fleche.onload = function() {
                     ctx.drawImage(fleche, posX, posY);
            }
            fleche.src = "img/fleche.png";        
        }*/

        /////////// DESSIN DE LA ROUE ////////////////////      
        function drawroue() {
            ctx.strokeStyle = paramsRoue.roueBorderColor;
            ctx.lineWidth = paramsRoue.roueBorderWidth;            
            ctx.clearRect(0,0,300,300);
          /*  var picto = new Image(); */
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

                var posX=((canvas.width)/2);
                var posY=((canvas.height)/2);

                ctx.beginPath();
                // ** arc(centerX, centerY, radius, startingAngle, endingAngle, antiClockwise);
                ctx.arc(posX, posY, paramsRoue.outterRadius, angle, angle + arc, false);
                ctx.arc(posX, posY, paramsRoue.innerRadius, angle + arc, angle, true);
                ctx.stroke();
                ctx.fill();
        
                ctx.save();

                /////////// TRAITEMENT DU TEXTE SUR LA ROUE ////////////////////

                ctx.fillStyle     = paramsRoue.roueTextColor;
                ctx.translate(posX + Math.cos(angle + arc / 2) * paramsRoue.textRadius, posY + Math.sin(angle + arc / 2) * paramsRoue.textRadius);
                ctx.rotate(angle + arc / 2 + Math.PI / 2);
                ctx.font = paramsRoue.roueTextFont;
                ctx.fillText(text, -ctx.measureText(text).width / 2, 0);                
                ctx.restore();
                ctx.closePath();
            }     
       /*         drawArrow();*/
        }          

        /////////// ANIMATION DE LA ROUE QUAND ELLE TOURNE ////////////////////  
        function easeOut(t, b, c, d) {
            var ts = (t/=d)*t;
            var tc = ts*t;
            return b+c*(tc + -3*ts + 3*t);
        } 

        $('#modale_campagne').on('click', '#fermer_modale', function(e){
            document.getElementById('video_player').pause();
            methods.back();
        });
                
        methods.init.apply(this,[]);
    }
    

     //////////// OPTIONS DE L'UTILISATEUR (UI) DE L'OBJET ////////////
    $.fn.rouetourne.default_options = {
        outterRadius:150, 
        innerRadius:20, 
        textRadius: 120, 
        tourneDeclencheur: '#go', 
        backDeclencheur : '#back',
        roueBorderColor: 'white',
        roueBorderWidth : 10, 
        roueTextFont : '12px "HandOfSean"', 
        roueTextColor: 'white',
        logo: '#logo',
        arrowColor :'black',
        typeRestoDeclencheur:'#choix :input',
        restoResultatDiv:'#restoDiv'
    }
})(jQuery);