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

$(document).ready(function(){

	var userLocation    = {longitude : '', latitude : ''};
	var json_foursquare = {};

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
	$.rotation_complete = function(resultatRoue){
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
			init_map(resultatRoue);
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
	 * @see  afficher_carte()
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
	function init_map(resultatRoue){
		if(userLocation.longitude!='' && userLocation.latitude!=''){
			var params = {
				//radius: perimetreCarte,
			    zoom : 17,
			    map : "map",
			    keyword : resultatRoue,
			 /*   recherche : "restaurant",*/
			    center : {
			      latitude : userLocation.latitude,
			      longitude : userLocation.longitude
			    },
			    rechercheOk : function(geoJSON, pos){					      
			      carte.affichagePointsCarte(geoJSON, pos);	// On affiche les points sur la carte 
			    }
			  };
			carte.init(params);
			carte.getPointsPlaces();
		}
	}

	/**
	 * Affiche la carte MapBox et active les animations UI
	 * qui feront disparaître la roue et le formulaire au profit
	 * de la carte en elle-même.
	 * 
	 * @return {rien} Pas de retour
	 */
	function transition_carte(){
		$('#map').fadeIn(1000);
		$("#panel").delay(1000).animate(
		    {"margin-left":"0%"},
		    {duration:500}
	    );
	    $("#panel-roue").delay(1500).fadeOut(500);
	    $("#panel-results").delay(1500).fadeIn(500);
	}

	/**
	 * Si l'utilisateur n'a pas de restaurants à proximité,
	 * on ouvre une fenêtre modale lui proposant de cuisiner
	 * lui-même un plat en rapport avec le mot-clef trouvé par la roue.
	 * On utilise un timeout de façon à laisser les animations
	 * CSS se faire avant d'afficher la modale.
	 * 
	 * @param  {String} mot_clef Le mot-clef retourné par la roue
	 * @return {rien}          Pas de retour
	 */
	function afficher_modale(mot_clef){
	  var chaine = '';
	  setTimeout(function(){
	    $.getJSON( "recettes.json", function( data ) {
	          chaine += '<div class="modal fade" id="modaleRecette">';
	          chaine += '<div class="modal-dialog">';
	          chaine += '<div class="modal-content">';
	            chaine += '<div class="modal-header">';
	              chaine += '<h4 class="modal-title">Aucun restaurant '+mot_clef+' trouvé à proximité...</h4>';
	            chaine += '</div>';
	            chaine += '<div class="modal-body">';
	              chaine += '<h4>Il va falloir cuisiner par vous-même cette <a href="'+data.chinois.url+'">recette de '+data.chinois.nom+'</a> !</h4>';
	              chaine += '<div id="recette">';
	                //chaine += '<img src="'+data.chinois.image+'" alt="'+data.chinois.nom+'"/>';
	                chaine += '<br />'+data.chinois.url_video;
	                //chaine += '<video id="our-video" width="500" height="315" controls><source src="http://www.youtube.com/watch?v=DBnmUHm9n9g"></video>';
	               chaine += '</div>';
	            chaine += '</div>';
	            chaine += '<div class="modal-footer">';
	              chaine += '<button type="button" class="btn btn-default" data-dismiss="modal">Non merci !</button>';
	            chaine += '</div>';
	          chaine += '</div>';
	          chaine += '</div>';
	          chaine += '</div>';
	          $("#panel-results").append(chaine);
	          $('#modaleRecette').modal();
	      });
	  }, 1000);
	}	

});