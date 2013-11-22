var GeoLocation = {

	params : {
		callback_user : function(){} 
	},

	init : function(options){
		this.property = $.extend(this.params, options);
	},

	getLocation : function(){
		var that = this;	// Pour les fonctions de callback
		if(navigator.geolocation){
			navigator.geolocation.getCurrentPosition(
				function(pos){
					that.property.callback_user.call(this, pos.coords);
				}, 
				function(error){
					console.log('Erreur de géolocalisation : ');
					switch(error.code){
				      case error.PERMISSION_DENIED:
				        console.log("Vous avez refuse l\'acces a la geolocalisation.");
				        break;
				      case error.POSITION_UNAVAILABLE:
				        console.log("Les informations de geolocalisation sont indisponibles.");
				        break;
				      case error.TIMEOUT:
				        console.log("Le temps de reponse de la requete est trop long - arret.");
				        break;
				      case error.UNKNOWN_ERROR:
				      default:
				        console.log("Une erreur inconnue s\'est produite.");
				        break;
				    }
					that.property.callback_user.call(this, {longitude : '48.859068', latitude : '2.352249'});	// Paris, par défaut
				},
				{enableHighAccuracy : true}
			);
		}
	}

};