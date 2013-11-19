var jsonObj = [];
var _map = {};

var carte = {

  // Paramètres et callbacks par défaut
  defaults:
  {
    map: "#map",
    recherche:"food",
    zoom: 16,
    center: {latitude:48.857713,longitude:2.347271},
    rechercheOk: function(){},
  },

  // Méthode d'initialisaiton
  init: function(options)
  {
    this.parametres = $.extend(this.defaults,options); 
  },

  // Méthode de recherche
  getPointsPlaces: function()
  {
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
        console.log('');
        console.log(data);
        console.log('');
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
          adresse : data[i].vicinity,
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

    // Ajout des points de Google Places
    map.markerLayer.setGeoJSON(geoJSON);

    affichageRestaurantsPanel(geoJSON, map.markerLayer, map);  

    map.markerLayer.on('click',function(e){
      selectionRestaurantsPanel(e);
    });
  }

};

function setTableauLayerMarkers(markers){
  var tab = {};
  var cpt = 0;
  for(var marker in markers._layers){
    tab[cpt] = markers._layers[marker];
    cpt++;
  }
  return tab;
}

function sizeOf(tableau){
  var cpt=0;
  for(var marker in tableau){
    cpt++;
  }
  return cpt;
}

function affichageRestaurantsPanel(geoJSON, markers, map){ 
  var tableauMarkers = setTableauLayerMarkers(markers);
  console.log(tableauMarkers);
  var chaine = '';
  for(var i=0; i<sizeOf(tableauMarkers); i++){
    chaine += '<div class="espace" data-leafletId="'+tableauMarkers[i]._leaflet_id+'">';
    chaine += '<h3>'+tableauMarkers[i].feature.properties.title+'</h3>';
    chaine += '<h5>'+tableauMarkers[i].feature.properties.adresse+'</h5><hr />';
    chaine += '</div>';
    $("#panel-results").append(chaine);
    chaine = '';
  }
  $('.espace').each(function(){
    $(this).on('click', function(){
      map._layers[$(this).attr('data-leafletId')].openPopup();
      $("#panel-results div[data-leafletId='"+$(this).attr('data-leafletId')+"']").css('color', 'green');
    });      
  });
}

function selectionRestaurantsPanel(marker){
  $("#panel-results div[data-leafletId='"+marker.layer._leaflet_id+"']").css('color', 'red');
}
