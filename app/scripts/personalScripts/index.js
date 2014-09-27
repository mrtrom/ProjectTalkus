$(function() {
  //jQuery to collapse the navbar on scroll
    $( ".ui-pnotify-closer" ).click(function() {

    });

	$(".navbar").removeClass("slide-left");
	$(".view.ng-scope").removeClass("slide-left");
  $(window).scroll(function() {
    if ($(".navbar").offset().top > 50) {
      $(".navbar-fixed-top").addClass("top-nav-collapse");
    } else {
      $(".navbar-fixed-top").removeClass("top-nav-collapse");
    }
  });

	$('html').removeClass('chat');
	$('html').removeClass('video');

  $('.page-scroll a').on('click', function(event) {
    var $anchor = $(this);
    $('html, body').stop().animate({
      scrollTop: $($anchor.attr('href')).offset().top
    }, 1500, 'easeInOutExpo');
    event.preventDefault();
  });
});