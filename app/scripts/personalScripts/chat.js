$(function(){
	$("#menu-toggle-anonym").click(function(e) {
		e.preventDefault();
		$("#sidebar-wrapper-anonym").toggleClass("active");
	});

	$("#menu-close-anonym").click(function(e) {
		e.preventDefault();
		$("#sidebar-wrapper-anonym").toggleClass("active");
	});

	$("#menu-toggle-personal").click(function(e) {
		e.preventDefault();
		$("#sidebar-wrapper-personal").toggleClass("active");
	});

	$("#menu-close-personal").click(function(e) {
		e.preventDefault();
		$("#sidebar-wrapper-personal").toggleClass("active");
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