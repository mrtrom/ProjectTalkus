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

	$('#popoverInfoMe').on('click', function(){
		var left = $(this).offset().left,
				width = $('#popoverInfoMeModal').width(),
				calcWidth = left - width;

		$('#popoverInfoMeModal').show();
		$('#popoverInfoMeModal').css({
			position: 'absolute',
			left: calcWidth,
			top: '40px'
		});
		$('#locationapi').geocomplete();
	});
});