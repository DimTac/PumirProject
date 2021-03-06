/* ------------------
  FICHIER GERANT LE SCROLL INTERNE DANS LE BLOC DE RESULTATS & DES COMMENTAIRES 
--------------------- */

(function($){
  $(document).ready(function(){
    $("#resultats-restaurants").mCustomScrollbar({
      autoHideScrollbar:true,
      theme:"light-thin",
      advanced:{  
        updateOnBrowserResize:true,   
        updateOnContentResize:true   
      },
      scrollInertia : 0,
      callbacks:{
          onTotalScroll:function(){
            $('#panel-results .scroll-more').fadeOut(0).addClass('off');
          },
          onScroll:function(){
            if($('#panel-results .scroll-more').css('display') == 'none' && $('.scroll-more').hasClass('off') == true){
              $('#panel-results .scroll-more').removeClass('off').stop().fadeIn(0);
            }
          }
      }
    });


  });
})(jQuery);

$('#panel-results .scroll-more').on('click', function(){
  $("#resultats-restaurants").mCustomScrollbar("scrollTo","bottom");
});

var checkIfScrollNeeded = function(){
  $("#bloc-commentaires").mCustomScrollbar("update");
  if($('#details-restaurant .mCSB_container').hasClass('mCS_no_scrollbar') || $('#comments h3').hasClass('no-comment')){
    $('#details-restaurant .scroll-more').fadeOut(0).addClass('off');
  }
  else{
    $('#details-restaurant .scroll-more').fadeIn(0).removeClass('off');
    $('#comments .scroll-more').on('click', function(){
      $("#bloc-commentaires").mCustomScrollbar("scrollTo","bottom");
    });
  }
}