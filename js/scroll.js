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
            $('.scroll-more').fadeOut(0).addClass('off');
          },
          onScroll:function(){
            if($('.scroll-more').css('display') == 'none' && $('.scroll-more').hasClass('off') == true){
              console.log('ok');
              $('.scroll-more').removeClass('off').stop().fadeIn(0);
            }
          }
      }
    });
  });
})(jQuery);

$('.scroll-more').on('click', function(){
  $("#resultats-restaurants").mCustomScrollbar("scrollTo","bottom");
});