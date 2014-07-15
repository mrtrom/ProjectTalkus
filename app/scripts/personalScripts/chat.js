// Load an Adium Emoticonset.
function emo_set_load( emoticon_set, callback ) {
  var emoticons_base = '../images/emoticons/' + emoticon_set + '/',
      obj = {};

  // For some reason, jQuery's :contains doesn't seem to work when parsing XML in IE.
  function contains( text ) {
    return function() {
      return ( this.textContent || this.text || '' ).indexOf( text ) !== -1;
    }
  };

  //dataType: The web server must be configured to serve .plist files as text/xml
  //url: The XML file that defines the Adium Emoticonset.
  //success: Parse Adium Emoticonset .plist file.
  $.ajax({
    dataType: 'xml',
    url: emoticons_base + 'Emoticons.plist',
    success: function( data, textStatus ){
      $(data).find( 'plist > dict > dict > key' ).each(function(){
        var that = $(this),
            image = that.text(),
            equivalents = that.next().children().filter( contains('Equivalents') ).next().children(),
            name = that.next().children( 'key' ).filter( contains('Name') ).next().text(),
            text,
            arr = [];

        //console.log( image, equivalents.length, name );

        equivalents.each(function(){
          text = $(this).text();
          text && arr.push( text );
        });
        obj[ arr.shift() ] = [ emoticons_base + image, name ].concat( arr );
      });
      // Overwrite all current emoticons with those in the Emoticonset.
      callback( emotify.emoticons( true, obj ) );
    },
    // Oops?
    error: function() {
      callback( false );
    }
  });
};

// When an Adium Emoticonset is loaded, update the page.
function emo_set_onload( emoticons ) {
  if ( !emoticons ) {
    console.log( 'Error loading emoticons!' );
    return;
  }

  var html = '',
      cols = 7,
      i = 0;

  $.each(emotify.emoticons(), function(key,val){
    html += i % cols == 0 ? "<tr>" : "";
    html += "<td> <img src='" + val[0] + "' alt='"  + val[1] + "' title='" + val[2] + "' />";
    html += i % cols == cols -1 ? "</tr>" : "";
    i++;
  });

  $(".chatwrap").append("<div id='emoticonContainer'><table id='emoticonTable'>" + html + "</table></div>");

};

$(function(){
  var intr;
  $("#menu-toggle-anonym").click(function(e) {
    e.preventDefault();
    $("#sidebar-wrapper-anonym").toggleClass("active");
    $(".view.ng-scope").toggleClass("slide-left");
  });
  $(document).on('click', '.anonym-profileClass', function(){
    $('.popoverInfoMeModal.other').css('width',$('#sidebar-wrapper-anonym').width() + 'px');
  });
  $("#menu-close-anonym").click(function(e) {
    e.preventDefault();
    $("#sidebar-wrapper-anonym").toggleClass("active");
    $(".view.ng-scope").toggleClass("slide-left");
  });
  $('#menu-close-anonym, #conversation , .navbar .container , .wraper-chat , .infomodel a').click(function(){
    $('.popoverInfoMeModal').css('width','0');
  });
  $(document).on('click', '.popoverInfoMeClass', function(){
    $('.popoverInfoMeModal.me').css('width',$('#sidebar-wrapper-anonym').width() + 'px');
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
  });

  // Load the IFrame Player API code asynchronously.
  var tag = document.createElement('script');
  tag.src = "https://www.youtube.com/player_api";
  var firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

  emo_set_load('simple', emo_set_onload);

  setTimeout(function(){
    $('html').click(function() {
      //$( "#emoticonContainer" ).css('height' , '0px');
    });

    $('#emoticonContainer').click(function(event){
      event.stopPropagation();
    });

    $("#btnEmoticon").click(function(event) {
      var disAttr = $('#data').attr('disabled');
      if (disAttr != 'disabled'){
        if($('#emoticonContainer').css('height') == '0px'){
          $( "#emoticonContainer" ).css('height' , '160px');
        }
        else{
          $( "#emoticonContainer" ).css('height' , '0px');
        }
        event.stopPropagation();
      }
    });

    $('#emoticonContainer img').click(function() {
      var text = $(this).attr('title');
      $('#data').val( $('#data').val() + ' ' + text );
      $('#data').focus();
    });
  }, 1000);
});
//to check if it has an image url
function checkURL(url) {
  if(url.match(/\.(jpeg|jpg|gif|png)$/) !== null){
    return url;
  }
  else{
    return false;
  }
}

function checkURLVideo(url){
  if (url.match(/www.youtube.com/) !== null){
    return url;
  }
  else{
    return false;
  }
}

function returnVideoId(url){
  var splitedUrl = url.split('v=');
  return splitedUrl[1];
}

var player;
function onYouTubePlayerAPIReady(height, width, videoId, ytPlayerId) {
  player = new YT.Player(ytPlayerId, {
    height: height,
    width: width,
    videoId: videoId
  });
}

function hideMyImageShowCamera(){
  //Hide image
  $('#popoverInfoMe').hide();

  //Hide upload option
  $('#sidebar-wrapper-anonym div.profile div.inside form fieldset ul').hide();

  //Show camera
  $('#webrtc-sourcevid').show();
}

function showMyImageHideCamera(){
  //Show image
  $('#popoverInfoMe').show();

  //Show upload option
  $('#sidebar-wrapper-anonym div.profile div.inside form fieldset ul').show();

  //Hide camera
  $('#webrtc-sourcevid').hide();
}

function hideAnonymImageShowCamera(){
  //Hide image
  $('#anonym-profile').hide();

  //Show camera
  $('#webrtc-remotevid').show();
}

function showAnonymImageHideCamera(){
  //Show image
  $('#anonym-profile').show();

  //Hide camera
  $('#webrtc-remotevid').hide();
}

function hideAnonymImageAndCamera(){
  //Hide image
  $('#anonym-profile').hide();

  //Hide camera
  $('#webrtc-remotevid').hide();
}