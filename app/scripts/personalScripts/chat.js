$(function(){
	$("#menu-toggle-anonym").click(function(e) {
		e.preventDefault();
		$("#sidebar-wrapper-anonym").toggleClass("active");
		$(".view.ng-scope").toggleClass("slide-left");
	});

	$("#menu-close-anonym").click(function(e) {
		e.preventDefault();
		$("#sidebar-wrapper-anonym").toggleClass("active");
		$(".view.ng-scope").toggleClass("slide-left");
	});
  $('#menu-close-anonym, #conversation , .navbar .container , .wraper-chat').click(function(){
    $('#popoverInfoMeModal').css('display','none');
  });
  $('#locationapi').geocomplete();
	$('#popoverInfoMe').on('click', function(){
		$('#popoverInfoMeModal').toggle();
	});
});