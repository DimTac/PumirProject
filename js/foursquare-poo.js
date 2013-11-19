/**
 * @date: 04/11/2013
 * @auteur: P. GUILHOU - HETIC P2016
 * @version: 1.4
 * @project: WheeLunch
 * 
 * Tutos utilisés :
 * 	  https://developer.foursquare.com/overview/tutorial
 * 	  https://developer.foursquare.com/overview/auth#code
 * 	  https://developer.foursquare.com/docs/users/friends
 * 	  https://developer.foursquare.com/docs/checkins/recent
 * URL appli perso (données appli):
 * 	  https://fr.foursquare.com/developers/app/1LZQR0XMLY0L0XQ5JA44HQ2QTG15GHBKUQ4CE5K2TOA1UH0Z
 *
 * Identifiants foursquare de l'application :
 *    Client_id : 1LZQR0XMLY0L0XQ5JA44HQ2QTG15GHBKUQ4CE5K2TOA1UH0Z
 *    Secret    : YNEV10LLQZT1VOHLTFWAYWZQ5WREYX31ATVS0THGOU34CNR4    
 */

	var Foursquare = {

		params : {
			client_id   : '',
			secret      : '',
			token       : '',
			position    : '',
			url         : '',
			search      : '',
			version     : '',
			callback_oauth   : function(){},
			callback_request : function(){}
		},

		/**
		 * Initialise tous les paramètres de l'objet
		 * @param  {Object} options La liste des paramètres envoyés
		 * @return {rien}         Ne retourne rien
		 */
		init : function(options){
			this.property = $.extend(this.params, options);
		},

		/**
		 * Initialise les coordonnées GPS de l'utilisateur
		 * s'il accepte la géolocalisation
		 * @return {callback} Renvoie le callback utilisateur avec les coordonnées
		 */
		goGetLocation : function(){
			var that = this;	// Pour les fonctions de callback
			if(navigator.geolocation){
				navigator.geolocation.getCurrentPosition(
					function(pos){
						that.property.position = pos.coords.latitude+","+pos.coords.longitude;
						that.property.callback_geolocation.call(that, that);
					}, 
					function(error){
						switch(error.code){
					      case error.PERMISSION_DENIED:
					        alert("Vous avez refuse l\'acces a la geolocalisation.");
					        break;
					      case error.POSITION_UNAVAILABLE:
					        alert("Les informations de geolocalisation sont indisponibles.");
					        break;
					      case error.TIMEOUT:
					        alert("Le temps de reponse de la requete est trop long - arret.");
					        break;
					      case error.UNKNOWN_ERROR:
					      default:
					        alert("Une erreur inconnue s\'est produite.");
					        break;
					    }
						that.property.position = '48.859068,2.352249';	// Paris, par défaut
					},
					{enableHighAccuracy : true}
				);
			}
		},

		/**
		 * Lance l'authentification OAuth afin de récupérer
		 * des informations personnelles Foursquare relatives
		 * à l'utilisateur et sa communauté sur le site.
		 * @return {rien} Ne retourne rien
		 */
		launchOAuth : function(){
			console.log('Oauth lancé');
			this.property.callback_oauth.call(this, this);
		},

		/**
		 * Renvoie l'attribut position
		 * @return {String} La position GPS
		 */
		getLocation : function(){
			return this.property.position;
		},

		/**
		 * Initialise la position géographique
		 * de l'utilisateur avec l'objet userLocation obtenu
		 * grace à la géolocalisation
		 * @param  {Object} userLocation L'objet contenant la géoposition
		 * @return {rien}              Pas de retour
		 */
		setPosition : function(userLocation){
			if(typeof userLocation === 'object')	// Si l'utilisateur a accepté la géolocalisation
				this.property.position = userLocation.latitude+','+userLocation.longitude;
		},

		/**
		 * Initialise la date / version demandée par Foursquare
		 * @return {rien} Ne renvoit rien
		 */
		generateVersion : function(){
			var d     = new Date();
			var year  = d.getFullYear();
			var month = d.getMonth()+1;
			var day   = d.getDate();

            if(month <10)
                month = "0"+month;
            if(day <10)
                day = "0"+day;
            this.property.version = year+''+month+''+day;
		},

		/**
		 * Fonction qui envoie la requete ajax à foursquare après
		 * avoir récupéré les coordonnées GPS de l'utilisateur,
		 * afin de cibler les évènements/avis de ses amis à proximité
		 * 
		 * @return {JSON} Le json renvoyé par foursquare
		 */
		envoi_requete_foursquare : function(){
			var that = this;
			$.ajax({
					url: this.property.url,
					dataType: "json",
				    success: function(json) {
				    	that.property.callback_request.call(this, that, json);	// On appelle la fonction utilisateur
				    	return;
					},
					error: function(){
						console.log('Erreur dans la requete ajax Fourquare')
						alert('La requete Foursquare a echoue...');
						return null;
					}
			});
		},

		/**
		 * Construit l'URL qui va chercher les informations
		 * sur la plateforme Foursquare selon le token
		 * et d'autres paramètres variables
		 * @return {rien} Ne retourne rien
		 */
		setURL_Foursquare : function(){
			var obj = this.property;
			//obj.url = "https://api.foursquare.com/v2/users/self/friends?oauth_token="+obj.token+"&v="+obj.version;
			//obj.url = "https://api.foursquare.com/v2/venues/earch?ll="+obj.position+"&query=kebab&oauth_token="+obj.token+"&v="+obj.version;
			obj.url = "https://api.foursquare.com/v2/venues/explore?ll="+obj.position+"&oauth_token="+obj.token+"&section=food&limit=10&friendVisits=visited"+"&v="+obj.version;
		},

		/**
		 * Permet d'initialiser une requête de phase 
		 * de test ( version simplifiée sans paramètres )
		 * @param  {String} url L'url voulue
		 * @return {rien}     Ne retourne rien (setter)
		 */
		setURL_Foursquare_perso : function(url){
			this.property.url = url;
		},

		/**
		 * Getter associé au token Foursquare
		 * présent dans l'url
		 * @return {String} Token
		 */
		getToken : function(){
			return this.property.token;
		},

		/**
		 * Getter associé au token Foursquare
		 * présent dans l'url
		 * @return {String} Token
		 */
		getTokenURL : function(){
			var parser = document.createElement('a');
			parser.href = document.location.href;
			return parser.hash.substr(14);
		},

		/**
		 * Récupère le token dans l'url renvoyé par Foursquare,
		 * puis initialise le token de l'objet
		 * @return {rien} Ne retourne rien
		 */
		setToken : function(){
			var parser = document.createElement('a');
			parser.href = document.location.href;
			this.property.token = parser.hash.substr(14);
		},

		/**
		 * Méthode OAuth 2 :
		 * Va chercher le token sur la plateforme Foursquare
		 * en demandant à l'utilisteur de s'identifier.
		 * @return {[type]} Ne retourne rien; une fois l'authentification
		 *                  effectuée, l'utilisateur est renvoyé sur le site;
		 */
		goGetToken : function(){
			window.location.replace("https://foursquare.com/oauth2/authenticate?client_id="+this.property.client_id+"&response_type=token&redirect_uri=http://wheelunch.fr/panel-roue.html");
			// &display=webpopup
		},

		/**
		 * Setter du token
		 * @param  {String} token Le token à initialiser
		 * @return {rien}       Pas de retour
		 */
		settingToken : function(token){
			this.property.token = token;
		},

		/**
		 * Renvoie l'url de feed foursquare de l'objet
		 * @return {String} L'url
		 */
		getURL : function(){
			return this.property.url;
		},

		/**
		 * Initialise l'URL de feed voulue,
		 * selon le type de données à aller chercher
		 * @param  {String} url L'url
		 * @return {rien}     Ne retourne rien
		 */
		setURL : function(url){
			this.property.url = url;
		},

		/**
		 * Initialise le mot clef de feed voulu,
		 * par exemple un nom de restaurant, une catégorie etc...
		 * @param  {String} search Le mot-clef demandé
		 * @return {rien}     Ne retourne rien
		 */
		setSearch : function(search){
			this.search = search;
		},

		/**
		 * Initialise le code client de l'application
		 * @param  {String} id L'id du client
		 * @return {rien}     Ne retourne rien
		 */
		setClientId : function(id){
			this.property.client_id = id;
		},

		/**
		 * Initialise le code secret de l'application
		 * @param  {String} secret Le secret du client
		 * @return {rien}     Ne retourne rien
		 */
		setSecret : function(secret){
			this.property.secret = secret;
		},

		/**
		 * Retourne la version courante de l'objet
		 * si elle existe
		 * @return {String} La version générée
		 */
		getVersion : function(){
			return this.property.version;
		},

		/**
		 * Fonction qui détruit l'objet et ses paramètres
		 * @return {rien} Ne renvoit rien
		 */
		finalize : function(){
			this.property = $.extend(this.params, null);	
		}

	};