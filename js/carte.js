var jsonObj       = [];
var carte_globale = {}; // points places globale
var map_globale   = {}; // carte mapbox globale
var detail_json   = {}; // json contenant le détail d'un resto

var carte = {

  // Paramètres et callbacks par défaut
  defaults:
  {
    map: "#map",
    recherche:"restaurant",
    keyword:"pizza",
    zoom: 16,
    radius: 900,
    center: {latitude:48.857713,longitude:2.347271},
    rechercheOk: function(){},
    pasDeResto: function(){}
  },

  // Méthode d'initialisaiton
  init: function(options)
  {
    this.parametres = $.extend(this.defaults,options); 
    console.log('Initialisation de la carte effectuée - coordonnées : '+this.parametres.center.latitude+', '+this.parametres.center.longitude);
  },

  init_map: function(pos){
    var map = L.mapbox.map(
      this.parametres.map, 
      'examples.map-9ijuk24y'
      )
      .setView(
        [pos.latitude ,pos.longitude], 
        carte.parametres.zoom
    );
    new L.Control.Zoom({ position: 'topright' }).addTo(map);
    map_globale = map;
  },

  // Méthode de recherche
  getPointsPlaces: function()
  {
    console.log("Recherche des restos a proximité de : "+this.parametres.center.latitude+" avec la recherche = "+this.defaults.keyword+" dans un périmètre de "+this.defaults.radius+"m");
    
    if(!parametre_existe('dev')){
      // Déclaration de la position
      var position = new google.maps.LatLng(
        this.parametres.center.latitude,
        this.parametres.center.longitude
      );
    }else{
      console.log('Mode développement en campagne activé');
      var position = new google.maps.LatLng('49.255704','-0.37244');  // Mathieu pour test dev
    }

    //Declaration d'un objet carte
    tap = new google.maps.Map(document.getElementById('resultats'));
    
    //Initialisation la variable globale contenant les résultats de Google Places 
    carte_globale = tap;

    //Requete
    var request = {
      location: position,
      radius: [this.parametres.radius],
      types: [this.parametres.recherche],
      keyword: [this.parametres.keyword]
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
        carte.parametres.rechercheOk.call(that, geoJSON, carte.parametres.center);
      }
    );
  },

  // Méthode de transformation du json en geoJSON
  transformationPointsMapBox: function(data)
  {
    /* remise à zero du json si on redemande la roue plus tard
    pour ne pas cumuler tous les points */
    jsonObj = [];
    for (var i = 0; i < data.length; i++){
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
          ref_photo : data[i].reference,
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
    // Ajout des points de Google Places
    map_globale.markerLayer.setGeoJSON(geoJSON);

    affichageRestaurantsPanel(geoJSON, map_globale.markerLayer, map_globale);  

    map_globale.markerLayer.on('click',function(e){
      map_globale.removeLayer(trajet);
      selectionRestaurantsPanel(e);
    });
  }

};

/**
 * Vérifie qu'un paramètre entré existe dans l'url,
 * ici utilisé pour vérifier que le mode dev est activé
 * 
 * @param  {String} parametre Le parametre à trouver
 * @return {booléen}          La valeur, vraie ou fausse
 */
function parametre_existe(parametre){
  var params = location.search.substr(1, location.search.length).split('&');
  var tmp    = '';
  for(var i=0; i<params.length; i++){
    tmp = params[i].split('=');
    if(tmp[0] == parametre) // Nom du paramètre
      return true;
  }
  return false;
}

/**
 * Initialise un tableau ordonné contenant
 * les informations reçues du JSON de base
 * (inutilisable car l'index de l'élément est 
 * inutilisable tel quel)
 * 
 * @param {Marker} markers La liste des points de la carte
 */
function setTableauLayerMarkers(markers){
  var tab = {};
  var cpt = 0;
  for(var marker in markers._layers){
    tab[cpt] = markers._layers[marker];
    cpt++;
  }
  return tab;
}

/**
 * Retourna la taille de l'objet selon le nombre
 * d'éléments. != de la méthode .length
 * 
 * @param  {Object} tableau L'objet/tableau envoyé
 * @return {int}         L nombre d'éléments
 */
function sizeOf(tableau){
  var cpt=0;
  for(var marker in tableau){
    cpt++;
  }
  return cpt;
}

/**
 * Affiche la liste des restaurants issus du JSON
 * envoyé par Places, sur le pannel de gauche. Ensuite,
 * chacun des éléments de cette liste va être associé à un
 * évènement au clic. Chacun de ces clics entrainera deux choses:
 *   - L'ouverture de la popup de détail sur la carte en elle-même 
 *   - L'affichage du détail du restaurant sélectionné en bas
 *
 * @see  setTableauLayerMarkers()
 * @see  recherche_details()
 * @see  carte.parametres.pasDeResto()
 * @param  {JSON} geoJSON Le géojson contenant les places
 * @param  {Object} markers La liste des markers de la carte
 * @param  {Object} map     La carte en elle-même
 * @return {rien}           Pas de return
 */
function affichageRestaurantsPanel(geoJSON, markers, map){ 
  var tableauMarkers = setTableauLayerMarkers(markers); // retourne un tableau formaté
  var chaine         = '';
  var point          = {};

  if(sizeOf(tableauMarkers) > 0){
    console.log('Nombre d\'éléments trouvés:'+sizeOf(tableauMarkers));
    $("#content").html('');
    $('#resultats-restaurants .espace').remove();
    for(var i=0; i<sizeOf(tableauMarkers); i++){
      chaine += '<div class="espace" data-leafletId="'+tableauMarkers[i]._leaflet_id+'">';
      chaine += '<h3>'+tableauMarkers[i].feature.properties.title+'</h3>';
      chaine += '<h4>'+tableauMarkers[i].feature.properties.adresse+'</h4><hr />';
      chaine += '</div>';
      $("#panel-results .mCustomScrollBox .mCSB_container").append(chaine); // Ajoute les restos au panel de gauche
      chaine = '';
    }
    
    $('.espace').each(function(){
      var that=$(this);
      $(this).on('click', function(){
        $('.espace').removeClass('resto-select');
        that.toggleClass('resto-select');
        map_globale.removeLayer(trajet);
        point = map_globale._layers[$(this).attr('data-leafletId')];
        point.openPopup();
        map_globale.panTo(point.getLatLng());
        detail_json = geoJSON[$('.mCSB_container div').index($(this))];
        recherche_details(detail_json.properties.ref_photo);    // Envoie une requete pour recevoir des détails
        $("#details-restaurant").delay(100).fadeIn(100);      
      });      
    });
  }else{
    console.log('Aucun resto trouvé à proximité...');
    // On est sorti de l'objet on ne peut donc pas appeler this.keyword 
    carte.parametres.pasDeResto.call(this, carte.parametres.keyword);  // Renvoie la main si aucun resto trouvé
  }
}

/**
 * Utilise l'API Places pour aller chercher le détail
 * d'un restaurant en partiuculier. Il faut lui envoyer
 * se référence pour que l'API le revoie.
 * 
 * @param  {String} ref_detail La référence du restaurant
 * @return {function}          Pas de return - callback
 */
function recherche_details(ref_detail){
  var request = {
    reference: ref_detail,
    language: 'fr'
  };
  service = new google.maps.places.PlacesService(carte_globale);
  service.getDetails(request, callback_details);
}

/**
 * A partir du json de détail récupéré par Places,
 * on peut afficher l'ensemble des détails fournis.
 * En l'occurence, on affiche L'image si elle existe (sinon
 * une par défaut), l'adresse complète, la distance relative, 
 * mais aussi les avis des clients qui ont mangé là-bas 
 * (commentaire, auteur+compte Google+, note et date)
 *
 * @see  distance_vol_oiseau()
 * @see  getDateFormatee()
 * @see  afficher_etoiles()
 * @param  {json} json_detail Le json contenant le détail
 * @param  {String} status      Le statut renvoyé par la requête
 * @return {rien}               Pas de return
 */
function callback_details(json_detail, status){
  var url_image       = (typeof json_detail.photos === 'undefined') ? 'img/resto.png' : json_detail.photos[0].getUrl({'maxWidth': 135, 'maxHeight': 127});
  var comments        = (typeof json_detail.reviews === 'undefined') ? null : json_detail.reviews;
  var rating          = (typeof json_detail.rating === 'undefined') ? null : json_detail.rating;
  var tel             = (typeof json_detail.formatted_phone_number === 'undefined') ? null : json_detail.formatted_phone_number;
  var site_web        = (typeof json_detail.website === 'undefined') ? null : json_detail.website;
  var ouvert          = (typeof json_detail.opening_hours === 'undefined') ? null : (json_detail.opening_hours.open_now==true) ? 'Oui' : 'Non';
  var add             = json_detail.address_components;
  var chaine          = '';
  var compte_google   = '';
  var date_comment    = '';
  var chaine_comments = '';

  if(status=='OK'){
      chaine += '<div id="resto">';
        chaine += '<p><input type="button" id="itineraire" value="Calculer l\'itinéraire" data-aLong="'+carte.parametres.center.longitude+'" data-aLat="'+carte.parametres.center.latitude+'" data-bLong="'+json_detail.geometry.location.pb+'" data-bLat="'+json_detail.geometry.location.ob+'">';
        chaine += '<img src="img/ping.png" alt="ping" class="ping">'+distance_vol_oiseau(carte.parametres.center, json_detail.geometry.location)+'</p>';
        chaine += '<img class="imgResto" src="'+url_image+'" alt="'+json_detail.name+'" >';
<<<<<<< HEAD
=======
        chaine += '<input type="button" id="itineraire" value="Itinéraire" data-aLong="'+carte.parametres.center.longitude+'" data-aLat="'+carte.parametres.center.latitude+'" data-bLong="'+json_detail.geometry.location.pb+'" data-bLat="'+json_detail.geometry.location.ob+'">';
>>>>>>> 22056721887ee51b01a3246917c062fdf8c9fa39
        chaine += '<h2>'+json_detail.name+'</h2>';
        chaine += '<p>'+add[0].long_name+' '+add[1].long_name+'<br>'+add[4].long_name+' '+add[2].long_name.toUpperCase()+'<br />';
        chaine += (tel!=null) ? 'Téléphone : '+tel : '';
        chaine += (site_web!=null) ? '<br />Site internet : <a target="_blank" rel="nofollow" href="'+site_web+'">'+site_web+'</a>' : '';
        /*chaine += (ouvert!=null) ? '<br />Ouvert maintenant : '+ouvert : '';*/
        chaine += (ouvert!=null) ? '<br />Ouvert en ce moment': '';
        chaine += (rating!=null) ? '<br />Note globale : '+afficher_etoiles(rating) : '';
        chaine+= '</p>';

      chaine += '</div>';
        chaine += '<div id="comments">';
        if(comments != null){
          chaine += '<div id="bloc-commentaires">'
          for(var i=0; i<comments.length; i++){
            compte_google = (typeof comments[i].author_url !== 'undefined') ? comments[i].author_url : null;
            date_comment  = getDateFormatee(new Date(comments[i].time * 1000));
            chaine_comments += '<div class="comment">';
              chaine_comments += '<p class="date_comment">'+date_comment+'</p>';
              chaine_comments += '<p class="auteur">';
                chaine_comments += (compte_google!=null) ? ('De <a target="_blank" rel="nofollow" href="'+comments[i].author_url+'">@'+comments[i].author_name+'</a>') : ('De '+comments[i].author_name);
              chaine_comments += '</p>';
              chaine_comments += '<p class="note">'+afficher_etoiles(parseInt(comments[i].rating))+'</p>';
              chaine_comments += '<p class="text_comment">'+comments[i].text+'</p>';
            chaine_comments += '</div><hr />';
          }
          chaine += chaine_comments;
          chaine += '</div>'
        }else{
          chaine += '<h3 class="no-comment">Pas de commentaires postés sur ce restaurant</h3>';
        }
      //   chaine += '<div>';
      // chaine += '</div>';
          chaine += '<div class="scroll-more">&or;</div>';
  }else{
    chaine += '<h3>Impossible de charger le détail du restaurant.</h3>';
  }
  $('#content').html(chaine);
  $("#bloc-commentaires").mCustomScrollbar({
    autoHideScrollbar:true,
    theme:"light-thin",
    advanced:{  
      updateOnBrowserResize:true,   
      updateOnContentResize:true   
    },
    scrollInertia : 0,
    callbacks:{
        onTotalScroll:function(){
          $('#details-restaurant .scroll-more').fadeOut(0).addClass('off');
        },
        onScroll:function(){
          if($('#details-restaurant .scroll-more').css('display') == 'none' && $('.scroll-more').hasClass('off') == true){
            $('#details-restaurant .scroll-more').removeClass('off').stop().fadeIn(0);
          }
        }
    }
  });
  checkIfScrollNeeded();


}

/**
 * Renvoie la date formatée jj/mm/aaaa selon
 * la date instanciée grace au timestamp récupéré
 * pour un commentaire.
 * 
 * @param  {Date} date L'objet Date
 * @return {String}    La date formatée
 */
function getDateFormatee(date){
  return (date.getDate()<10?'0'+date.getDate():date.getDate())+'/'+((date.getMonth()+1)<10?'0'+(date.getMonth()+1):(date.getMonth()+1))+'/'+date.getFullYear()
}

/**
 * Affiche la note que l'internaute à mise pour
 * ce restaurant, sous forme d'étoiles
 * 
 * @param  {int} nb La note/nb d'étoiles à afficher
 * @return {String}    La chaine contenant les étoiles
 */
function afficher_etoiles(nb){
  chaine = '';
  for(var i=1; i<=nb; i++){
    // chaine += '☆';
    chaine += '<img src="img/etoile-vote.png" alt="'+i+'" title="'+nb+'">';
  }
  for (var i = 0; i < 5-nb; i++) {
    chaine += '<img src="img/etoile-novote.png" alt="" title="'+nb+'">';
  }
  return chaine;
}

/**
 * Sélectionne le restaurant cliqué sur la carte et l'affiche
 * sur le panel de gauche. 
 * 
 * @param  {[type]} marker L'ID du marker (leaflet_id)
 * @return {rien}        Par de return
 */
function selectionRestaurantsPanel(marker){
  $("#resultats-restaurants div").removeClass('resto-select');
  $("#details-restaurant").show();
  $("#resultats-restaurants div[data-leafletId='"+marker.layer._leaflet_id+"']").toggleClass('resto-select');
  map_globale.panTo(marker.latlng);
  recherche_details(marker.layer.feature.properties.ref_photo);
  $("#resultats-restaurants").mCustomScrollbar("scrollTo",".resto-select");
}

/**
 * Affiche la distance selon le nombre de mètres (km/m)
 * ainsi que l'arrondi s'il y a plus d'un km.
 * 
 * @param  {Object} coordA Les coordonnées de l'utilisateur (JSON)
 * @param  {Object} coordB Les coordonnées du resto (Places)
 * @return {String}        La distance formatée
 */
function distance_vol_oiseau(coordA, coordB){
  var dist = Math.floor(distance(coordA.latitude, coordA.longitude, coordB.ob, coordB.pb));
  return (dist>=1000) ? Math.floor(dist/1000, 2)+'km' : dist+'m'; 
}
 
/**
 * Calcule la distance relative entre deux
 * points sur la carte. Cette distance est à vol-d'oiseau
 *
 * @see  convertRad()
 * @param  {float} lat_a_degre La lattitude du point A
 * @param  {float} lon_a_degre La longitude du point A
 * @param  {float} lat_b_degre La lattitude du point B
 * @param  {float} lon_b_degre La longitude du point B
 * @return {float}             La distance calculée
 */
function distance(lat_a_degre, lon_a_degre, lat_b_degre, lon_b_degre){
  var R     = 6378000; //Rayon de la terre en mètres
  var lat_a = convertRad(lat_a_degre);
  var lon_a = convertRad(lon_a_degre);
  var lat_b = convertRad(lat_b_degre);
  var lon_b = convertRad(lon_b_degre);
  return R * (Math.PI/2 - Math.asin( Math.sin(lat_b) * Math.sin(lat_a) + Math.cos(lon_b - lon_a) * Math.cos(lat_b) * Math.cos(lat_a)));
}

/**
 * Convertit la coordonnée entrée en radians
 * 
 * @param  {float} input La coordonnée GPS (lat ou long)
 * @return {?}       Le radian associé
 */
function convertRad(input){
  return (Math.PI * input)/180;
}
