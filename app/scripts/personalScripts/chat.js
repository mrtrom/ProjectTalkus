$(function(){
	$("#menu-toggle-anonym").click(function(e) {
		e.preventDefault();
		$("#sidebar-wrapper-anonym").toggleClass("active");
		$(".view.ng-scope").toggleClass("slide-left");
	});
  $('#anonym-profile').click(function(){
    $('#anonym-popup').toggle();
    $('#popoverInfoMeModal').css('display','none');
  });
	$("#menu-close-anonym").click(function(e) {
		e.preventDefault();
		$("#sidebar-wrapper-anonym").toggleClass("active");
		$(".view.ng-scope").toggleClass("slide-left");
	});
  $('#menu-close-anonym, #conversation , .navbar .container , .wraper-chat').click(function(){
    $('#popoverInfoMeModal').css('display','none');
    $('#anonym-popup').css('display','none');
  });
  $('#locationapi').geocomplete();
	$('#popoverInfoMe').on('click', function(){
		$('#popoverInfoMeModal').toggle();
    $('#anonym-popup').css('display','none');
	});
});
