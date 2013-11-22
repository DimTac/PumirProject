var jsonObj = [];

var carte = {

  // Paramètres et callbacks par défaut
  defaults:
  {
    map: "#map",
    recherche:"food",
    zoom: 16,
    center: {latitude:48.857713,longitude:2.347271},
    rechercheOk: function(){}
  },

  // Méthode d'initialisaiton
  init: function(options)
  {
    this.parametres = $.extend(this.defaults,options); 
    console.log('Initialisation de la carte effectuée - coordonnées : '+this.parametres.center.latitude+', '+this.parametres.center.longitude);
  },

  // Méthode de recherche
  getPointsPlaces: function()
  {
    console.log("Recherche des restos a proximité de : "+this.parametres.center.latitude+" avec la recherche = "+this.defaults.recherche);
    
    // Déclaration de la position
    var position = new google.maps.LatLng(
      this.parametres.center.latitude,
      this.parametres.center.longitude
    );

    //Declaration d'un objet carte
    tap = new google.maps.Map(document.getElementById('resultats'));
    
    //Requete
    var request = {
      location: position,
      radius: 200,
      types: [this.parametres.recherche]

    };

    //Declaration de l'objet service
    var serv = new google.maps.places.PlacesService(tap);
    var that = this;
    serv.nearbySearch(
      request, 
      function(data,status)
      {
        // Adaptation des points pour MapBox
        geoJSON = carte.transformationPointsMapBox(data);
        // Envoi du callback OK et du geoJSON +
        carte.parametres.rechercheOk.call(that, geoJSON, carte.parametres.center);                    // ?? appel en .call(this) ?
      }
    );
  },

  // Méthode de transformation du json en geoJSON
  transformationPointsMapBox: function(data)
  {
    for (var i = 0; i < data.length; i++)
    {
      jsonObj.push({
        type:'Feature',
        geometry:
        {
          type:'Point',
           // coordinates here are in longitude, latitude order because
          coordinates: [data[i].geometry.location.lng(),data[i].geometry.location.lat()]
        },
        properties:
        {
          title: data[i].name,
          description: 'Description',
          'marker-size': 'medium',
          'marker-color':'#046380',
          'marker-symbol': 'restaurant'
        }
      });
    }
    return jsonObj;
  },

  // Affichage de la carte et des points
  affichagePointsCarte: function(geoJSON,pos)
  {
    var map = L.mapbox.map(
      this.parametres.map, 
      'examples.map-9ijuk24y'
      )
      .setView(
        [pos.latitude ,pos.longitude], 
        carte.parametres.zoom
      );

    L.mapbox.markerLayer(geoJSON).addTo(map);
  }

};