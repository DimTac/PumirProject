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
