$(function(){
  var intr;
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
	$('#popoverInfoMe').on('click', function(){
		$('#popoverInfoMeModal').toggle();
    $('#anonym-popup').css('display','none');
	});
  $('#conversation').bind('scroll', function()
  {
    window.clearInterval(intr);
    if($(this).scrollTop() +
        $(this).innerHeight()
        >= $(this)[0].scrollHeight)
    {
      intr = setInterval(function(){
        $('#conversation').scrollTop($('#conversation')[0].scrollHeight);
      },350);
    }else{
      window.clearInterval(intr);
    }
  })
});
