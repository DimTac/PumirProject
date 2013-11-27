/**
 * @date: 10/11/2013
 * @auteur: P. GUILHOU - HETIC P2016
 * @version: 1.6
 * @project: WheeLunch
 *
 * Note: Deux cas pratiques à relever :
 *  - Algo sans Foursquare
 *  - Algo avec Foursquare 
 *  	-> Récupération du token
 *  	-> Envoi requête ajax
 *  	-> Réception JSON
 */

var userLocation      = {longitude : '', latitude : ''};
var json_foursquare   = {};
var trajet            = {};
var carte_initialisee = false;
var avec_transport    = false;
var categorie_prix    = 0; 

$(document).ready(function(){

	/* 
	 * S'il n'y a pas de token dans l'url, c'est que
	 * l'utilisateur a choisi de ne pas prendre Foursquare,
	 * on initialise don simplement la géolocalisation
	 *
	 * @see  getTokenUrl()
	 * @see  GeoLocation.init()
	 * @see  GeoLocation.getLocation()
	 */
	if(getTokenUrl()==''){
		GeoLocation.init({
			callback_user : function(pos){
				userLocation.longitude = pos.longitude;
				userLocation.latitude  = pos.latitude;
			}
		});
		GeoLocation.getLocation();
	}

	/* 
	 * Suite d'actions réalisées au clic sur le bouton Go : 
	 * - On fait tourner la roue
	 * - Si Fourquare a été demandé, on instancie l'objet Foursquare
	 * - Sinon, on affiche simplement la carte mapBox selon
	 *   les restaurants spécifiés et selon la position de l'utilisateur
	 *
	 * @see  init_Foursquare()
	 * @see  afficher_carte()
	 * @see  init_map()
	 */
	$.rotation_complete = function(resultatRoue, radiusPanel){
		if(getTokenUrl()!=''){	
			// Si le token n'existe pas en localstorage, on l'enregistre pour la prochaine fois
			if(localStorage.getItem('token_foursquare') == null){
				console.log('Le token n\'existe pas en localStorage - enregistrement...');
				localStorage.setItem('token_foursquare', getTokenUrl());
			}else{
				console.log('Le token existe en localStorage !');
			}
			init_Foursquare();
		}else{
			transition_carte();
			init_map(resultatRoue, radiusPanel);
		}
	};

	/**
	 * Récupère le token présent dans l'url
	 * s'il est présent. pattern ~url#token_renvoyé
	 *
	 * @return {rien} Pas de retour
	 */
	function getTokenUrl(){
		var parser = document.createElement('a');
		parser.href = document.location.href;
		return parser.hash.substr(14);
	}

	/**
	 * Fonction qui lance tout le procédé
	 * menant à l'acquisition des données
	 * provenant de Foursquare
	 * 
	 * @see  Foursquare.init()
	 * @see  Foursquare.generateVersion()
	 * @see  Foursquare.setToken()
	 * @see  Foursquare.getToken()
	 * @see  setGolocation()
	 * @return {rien} Pas de retour
	 */
	function init_Foursquare(){
		var params = {
			client_id        : '1LZQR0XMLY0L0XQ5JA44HQ2QTG15GHBKUQ4CE5K2TOA1UH0Z',
			secret           : 'YNEV10LLQZT1VOHLTFWAYWZQ5WREYX31ATVS0THGOU34CNR4',
			callback_request : retour_requete_foursquare
		};
		Foursquare.init(params);			// Initialise l'objet
		Foursquare.generateVersion();		// Génère la version slon la date du jour formatée
		Foursquare.setToken();				// Initialise le token de l'objet selon celui récupéré en url
		console.log('Token Foursquare récupéré : '+Foursquare.getToken());
		setGeolocation();
	}

	/**
	 * Va rechercher la géolocalisation de l'utilisateur
	 * en faisant appel à l'objet Geolocation. Une fois cette 
	 * géolocalisation obtenue, on appelle la fonction de callback
	 * callback_user qui renvoie vers retour_geolocalisation.
	 *
	 * @see  Geolocation.init()
	 * @see  Geolocation.getLocation()
	 * @see  Foursquare.setPosition(pos);
	 * @see  retour_geolocation();
	 * @return {rien} Ne retourne rien
	 */
	function setGeolocation(){
		GeoLocation.init({
			callback_user : function(pos){
				userLocation.longitude = pos.longitude;
				userLocation.latitude  = pos.latitude;
				Foursquare.setPosition(pos);	// Initialisation des coordonnées
				retour_geolocation();			// Suite de l'algo
			}
		});
		GeoLocation.getLocation();	// Demande la géolocalisation
	}

	/**
	 * Prépare et envoie la requête voulue
	 * à Foursquare par ajax. Une fois la requête envoyée,
	 * Foursquare nous renvoie un json, qui va être récupéré
	 * grace à la fonction de callback retour_requete_foursquare
	 *
	 * @see  Foursquare.getLocation()
	 * @see  Foursquare.setURL_Foursquare()
	 * @see  Foursquare.getURL()
	 * @see  Foursquare.envoi_requete_foursquare()
	 * @return {rien} Pas de retour
	 */
	function retour_geolocation(){
		console.log('Localisation de l\'utilisateur trouvée : '+Foursquare.getLocation());
		Foursquare.setURL_Foursquare();	// Construit la requête
		console.log('URL demandée : '+Foursquare.getURL());
		Foursquare.envoi_requete_foursquare();
	}

	/**
	 * Fonction de callback appellée à la réception de la requete ajax
	 * provenant de Foursquare. On y récupère l'objet utilisé ainsi que
	 * le JSON obtenu lors de cette requête. Ensuite, on a plus
	 * qu'à afficher la carte mapBox en UI.
	 *
	 * @see  transition_carte();
	 * @see  init_map()
	 * @param  {Object} Foursquare L'objet Foursquare
	 * @param  {JSON} json       Le JSON obtenu par la requête
	 * @return {rien}            Ne retourne rien
	 */
	function retour_requete_foursquare(Foursquare, json){
		console.log('JSON Foursquare reçu');
		console.log(json);
		json_foursquare = json;
		transition_carte();
		init_map();
	}

	/**
	 * Initialise la carte MapBox ainsi que les points
	 * que l'on va mettre dessus.
	 * 
	 * @see  carte.init()
	 * @see  carte.affichagePointsCarte()
	 * @see  carte.getPointsPlaces()
	 * @return {rien} Pas de renvoi
	 */
	function init_map(resultatRoue,radiusPanel){
		if(userLocation.longitude!='' && userLocation.latitude!=''){
			var params = {
			    zoom : 17,
			    map : "map",
			    keyword : (resultatRoue=='Asiatique') ? 'japonais|chinois' : resultatRoue,
			    transport : avec_transport,
			    prix : window.compteur,
			    radius : (avec_transport==false) ? 900 : 2000,
			    center : {
			      latitude : userLocation.latitude,
			      longitude : userLocation.longitude
			    },
			    rechercheOk : function(geoJSON, pos){	
			      if(carte_initialisee==false){
				   	carte.init_map(pos);
				   	carte_initialisee = true;
				  }
			      carte.affichagePointsCarte(geoJSON, pos);	// On affiche les points sur la carte
			    },
			    pasDeResto : afficher_modale
			  };
			carte.init(params);
			carte.getPointsPlaces();
		}
	}

	/**
	 * Fonction lancée au clic sur l'image du détail
	 * d'un restaurant. Ceci permet d'aller chercher
	 * l'itinéraire entre notre point et ce resto.
	 *
	 * @see  Itineraire.init()
	 * @see  Itineraire.getJsonDirection()
	 * @param  {Event} e L'évènement au clic
	 * @return {rien}   Pas de return
	 */
	$('#details-restaurant').on('click', '#itineraire', function(e){
	  e.preventDefault();
	  var A_longitude = $(this).attr('data-aLong');
	  var A_latitude  = $(this).attr('data-aLat');
	  var B_longitude = $(this).attr('data-bLong');
	  var B_latitude  = $(this).attr('data-bLat');
	  var A = {latitude:A_latitude, longitude: A_longitude};
	  var B = {latitude:B_latitude, longitude: B_longitude};
	  console.log(A_latitude+','+A_longitude+' - '+B_latitude+','+B_longitude);	  
	  
	  Itineraire.init({coordsA:A, coordsB:B, retourItineraire:itineraire_recu});
	  Itineraire.getJsonDirection();
	});

	/**
	 * Callback lancé à la récpetion du json
	 * de l'itinéraire. Construit l'itinéraire
	 * sur la carte mabox trait par trait, selon les
	 * étapes de cet itinéraire (coordonnées GPS)
	 *
	 * @see  map_globale.removeLayer()
	 * @param  {Object} etapes Le json des étapes du trajet
	 * @return {rien}          Pas de return
	 */
	function itineraire_recu(etapes){
		var line_points      = [];
		var polyline         = {};
		var polyline_options = {
	        color: '#000'
	    };
	    map_globale.removeLayer(trajet);
	    trajet = L.featureGroup().addTo(map_globale);

		for(var i=0; i<etapes.length; i++){
			if(i<(etapes.length-2))
				line_points[i] = [etapes[i].start_point.ob, etapes[i].start_point.pb];
			else
				line_points[i] = [etapes[i].end_point.ob, etapes[i].end_point.pb];
		}
		polyline = L.polyline(line_points, polyline_options).addTo(trajet);
	}

	/**
	 * Affiche la carte MapBox et active les animations UI
	 * qui feront disparaître la roue et le formulaire au profit
	 * de la carte en elle-même.
	 * 
	 * @return {rien} Pas de retour
	 */
	function transition_carte(){
		var imgs = $("#map > img").not(function() { return this.complete; });
		var count = imgs.length;

		//Si la carte n'est pas encore chargée, on affiche le loader :
		if (count) {
			$(".wrapperloading").show();
		    imgs.load(function() {
		        count--;

		        //Puis on cache le loader et on affiche la map :
		        if (!count) {
		        	$(".wrapperloading").fadeOut(500);
		            $('#map').fadeIn(1000);
		            alert('all done');
		        }
		    });
		//Si elle l'est déjà, on l'affiche sans loader
		} else {
		    $('#map').fadeIn(1000);
				$("#panel").delay(1000).animate(
				    {"margin-left":"0%"},
				    {duration:500}
			    );

			    $("#panel-results").delay(1500).fadeIn(500);
			    $("#panel-roue").delay(1500).fadeOut(500);
			    $("#resultats-restaurants").mCustomScrollbar("update");
			    if($('#panel-results .mCSB_container').hasClass('mCS_no_scrollbar')){
			      $('#panel-results .scroll-more').fadeOut(0).addClass('off');
			    }
		}
	}

	/**
	 * Si l'utilisateur n'a pas de restaurants à proximité,
	 * on ouvre une fenêtre modale lui proposant de cuisiner
	 * lui-même un plat en rapport avec le mot-clef trouvé par la roue.
	 * On utilise un timeout de façon à laisser les animations
	 * CSS se faire avant d'afficher la modale.
	 *
	 * @see  get_json_mot_clef()
	 * @param  {String} mot_clef Le mot-clef retourné par la roue
	 * @return {rien}          Pas de retour
	 */
	function afficher_modale(mot_clef){
	  var chaine = '';
	  var json = {};
	  setTimeout(function(){
	    $.getJSON( "recettes.json", function( data ) {
	    	$("#modale_campagne").html('');
	    	$("#content").html('');
    		$('#resultats-restaurants .espace').remove();
	    	json = get_json_mot_clef(mot_clef, data);
	          chaine += '<div class="modal fade" id="modaleRecette">';
	          chaine += '<div class="modal-dialog">';
	          chaine += '<div class="modal-content">';
	            chaine += '<div class="modal-header" style="background-color:#be4c46;color:white;">';
	              chaine += '<h4 class="modal-title">Aucun restaurant '+mot_clef+' trouvé à proximité...</h4>';
	            chaine += '</div>';
	            chaine += '<div class="modal-body">';
	              chaine += '<h4>Il va falloir cuisiner par vous-même cette <a href="'+json.url+'">recette de '+json.nom+'</a> !</h4>';
	              chaine += '<div id="recette">';
	                chaine += '<video id="video_player" style="margin:0 auto;" width="550" height="240" controls="controls">';
	                chaine += '<source src="assets/'+json.url_video+'" type="video/mp4" />';
	                chaine += '<source src="assets/'+json.url_video_webm+'" type="video/webm" />';
	                chaine += '<source src="assets/'+json.url_video_ogg+'" type="video/ogg" />'+mot_clef+'</video>';
	               chaine += '</div>';
	            chaine += '</div>';
	            chaine += '<div class="modal-footer" style="background-color:#be4c46;">';
	              chaine += '<button type="button" id="fermer_modale" class="btn btn-default" data-dismiss="modal">Non merci !</button>';
	            chaine += '</div>';
	          chaine += '</div>';
	          chaine += '</div>';
	          chaine += '</div>';
	          $("#modale_campagne").append(chaine);
	          $('#modaleRecette').modal();
	          $('.modal-backdrop').css('display', 'none');
	      });
	  }, 1000);
	}	

	/**
	 * Renvoie l'élément du JSON des recettes/vidéos
	 * de cuisine correspondant au mot-clef trouvé 
	 * par la roue
	 * 
	 * @param  {String} mot_clef Le mot-clef trouvé
	 * @param  {Object} data     Le json contenant les recettes
	 * @return {Object}          Le 'sous-json' correspondant
	 */
	function get_json_mot_clef(mot_clef, data){
		if(mot_clef=='Japonais') return data.japonais;
		else if(mot_clef=='Chinois') return data.chinois;
		else if(mot_clef=='Asiatique') return data.asiatique;
		else if(mot_clef=='Salade') return data.salade;
		else if(mot_clef=='Pizza') return data.pizza;
		else if(mot_clef=='Sandwich') return data.sandwitch;
		else if(mot_clef=='Viande') return data.viande;
		else if(mot_clef=='Poisson') return data.poisson;
		else if(mot_clef=='Kebab') return data.kebab;
		else if(mot_clef=='Crêperie') return data.creperie;
		else if(mot_clef=='Brasserie') return data.brasserie;
		else if(mot_clef=='Indien') return data.indien;
		else if(mot_clef=='Fast-Food') return data.fastfood;
		else if(mot_clef=='Brasserie') return data.brasserie;
		else return data.japonais;
	}

});


/* -------------------- 
	FONCTIONS GENERALES RELATIVES AU SITE (ANIMATIONS ET REDIRECTION MOBILE PAR EX) 
--------------------- */

var isMobile = function() {
           //console.log("Navigator: " + navigator.userAgent);
           return /(iphone|ipod|ipad|android|blackberry|windows ce|palm|symbian)/i.test(navigator.userAgent);
         };
        if(isMobile()) {
               window.location.href = "http://www.wheelunch.fr/mobile/panel-roue.html";
        }

$(document).ready(function(){
	$("#total").delay(400).fadeIn(1500);

	$('input[value="Avec transport"]').bind('click', function(evt){
             $('input[value="Sans transport"]').toggleClass('selectTransport');
             $(this).toggleClass('selectTransport');
        });

        $('input[value="Sans transport"]').bind('click', function(evt){
             $('input[value="Avec transport"]').toggleClass('selectTransport');
             $(this).toggleClass('selectTransport');
        });

        window.compteur = 0;
        $('#moins').bind('click', function(evt){
          evt.preventDefault();
          if(window.compteur == 0){
            $('#moins').css('cursor', 'default');
            return;
          }
          else{
            window.compteur--;
            $('#moins').css('cursor', 'pointer');
            $('#budget div').empty();
            $('#budget div').removeClass().addClass("budget"+window.compteur);   
          }
        });

        $('#plus').bind('click', function(evt){
          evt.preventDefault();
          if(window.compteur == 4){
            $('#plus').css('cursor', 'default');
            return;
          }
          else{
            window.compteur++;
            $('#plus').css('cursor', 'pointer');
             $('#budget div').empty();
            $('#budget div').removeClass().addClass("budget"+window.compteur);   
          }
        });

         $('#close').on('click', function(evt){
          evt.preventDefault();
          $("#details-restaurant").hide();
        });


});