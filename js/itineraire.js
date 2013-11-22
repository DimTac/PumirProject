var Itineraire = {

	params: {
		carte: {},
		url: 'http://maps.googleapis.com/maps/api/directions/json?sensor=false',
		coordsA: {},
		coordsB: {},
		steps: {},
		retourItineraire: function(){}
	},

	init: function(options){
		this.parametres = $.extend(this.params, options);
	},

	merge_url: function(){
		var that = this.parametres;
		that.url += '&origin='+that.coordsA.latitude+','+that.coordsA.longitude+'&destination='+that.coordsB.ob+','+that.coordsB.pb;
	},

	urlToString: function(){
		return this.parametres.url;
	},

	getJsonDirection: function(){
		var directionsService = new google.maps.DirectionsService();
		var that              = this.parametres;
		var request = {
		    origin: that.coordsA.latitude+','+that.coordsA.longitude,
		    destination: that.coordsB.latitude+','+that.coordsB.longitude,
		    travelMode: google.maps.TravelMode.WALKING
		};
	    directionsService.route(request, function(result, status) {
	      if (status == google.maps.DirectionsStatus.OK){
	      	that.steps = result.routes[0].legs[0].steps;	// Etapes du trajet
	        that.retourItineraire.call(that, that.steps);	// Callback utilisateur
	      }else
		    console.log('Erreur de reception de l\itineraire');
	  	});
	}

};