var sourcevid = document.getElementById('webrtc-sourcevid');
var remotevid = document.getElementById('webrtc-remotevid');
var localStream = null;
var peerConn = null;
var started = false;
window.channelReady = false;
var mediaConstraints = {'mandatory': {
  'OfferToReceiveAudio':true,
  'OfferToReceiveVideo':true }};
var RTCPeerConnection;
var RTCSessionDescription;

function getBrowser(){
  if (navigator.userAgent.toLowerCase().indexOf('opr') > -1){
    return 'opera';
  }
  else{
    if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1){
      return 'firefox';
    }
    else{
      if (navigator.userAgent.toLowerCase().indexOf('chrome') > -1){
        return 'chrome';
      }
      else{
        if (navigator.userAgent.toLowerCase().indexOf('safari') > -1){
          return 'safari';
        }
        else{
          return 'ie';
        }
      }
    }
  }
}

//Camera status
function hasCamera(){

  var browserName = getBrowser();
  var scope = angular.element($('.view.ng-scope')).scope();

  if (browserName && browserName === 'chrome') {

    if (!MediaStreamTrack) {
      scope.$apply(function () {
        scope.userHasCamera = false;
      });
      $('#newVideoChat').attr("disabled", "disabled");
    }
    else {
      var videoSources = [];

      MediaStreamTrack.getSources(function (media_sources) {
        if (media_sources.length > 0) {
          media_sources.forEach(function (media_source) {
            if (media_source.kind === 'video') {
              videoSources.push(media_source);
            }
          });
          if (videoSources.length > 0) {
            scope.$apply(function () {
              scope.userHasCamera = true;
            });
            $('#newVideoChat').removeAttr("disabled");
          }
          else {
            //No tiene sources de video
            scope.$apply(function () {
              scope.userHasCamera = false;
            });
            $('#newVideoChat').attr("disabled", "disabled");
          }
        }
        else {
          //No tiene sources
          scope.$apply(function () {
            scope.userHasCamera = false;
          });
          $('#newVideoChat').attr("disabled", "disabled");
        }
      });
    }
  }
  else{
    if (browserName && browserName === 'safari'){
      scope.$apply(function () {
        scope.userHasCamera = false;
      });
      $('#newVideoChat').attr("disabled", "disabled");
    }
    else{
      //We put true, because we are gonna validate the camera in the Video Chat button too.
      scope.$apply(function () {
        scope.userHasCamera = true;
      });
      $('#newVideoChat').removeAttr("disabled");
    }
  }
}

//Set local video
function startVideo(data, user, type) {

  //Choose kind of browser
  if (navigator.getUserMedia){
    navigator.getUserMedia = navigator.getUserMedia;
    RTCPeerConnection = RTCPeerConnection;
    RTCSessionDescription = RTCSessionDescription;
    window.URL = window.URL;
  }
  else {
    if (navigator.webkitGetUserMedia) {
      navigator.getUserMedia = navigator.webkitGetUserMedia;
      RTCPeerConnection = webkitRTCPeerConnection;
      RTCSessionDescription = RTCSessionDescription;
      window.URL = window.URL || window.webkitURL;
    }
    else {
      if (navigator.mozGetUserMedia) {
        navigator.getUserMedia = navigator.mozGetUserMedia;
        RTCPeerConnection = mozRTCPeerConnection;
        RTCSessionDescription = mozRTCSessionDescription;
        window.URL = window.URL;
      }
      else {
        navigator.getUserMedia = navigator.msGetUserMedia;
        RTCPeerConnection = RTCPeerConnection;
        RTCSessionDescription = RTCSessionDescription;
        window.URL = window.URL;
      }
    }
  }

  //Get local video working
  navigator.getUserMedia({video: true, audio: true}, successCallback, errorCallback);
  function successCallback(stream) {
    localStream = stream;
    if (sourcevid.mozSrcObject) {
      sourcevid.mozSrcObject = stream;
      sourcevid.play();
    } else {
      try {
        sourcevid.src = window.URL.createObjectURL(stream);
        sourcevid.play();

        var scope = angular.element($('.view.ng-scope')).scope();

        $('#sidebar-wrapper-anonym').css('width', '370px');
        $('#sidebar-wrapper-anonym').css('margin-right', '-370px');

        if (type && type === 'text'){
          if (!user){
            scope.$apply(function(){
              scope.emitSendVideoNotification();
            });
          }
          else{
            scope.$apply(function(){
              scope.emitSendVideoNotificationAnonym();
            });
          }
        }
        else{
          scope.$apply(function(){
            scope.emitVideoStart(data);
          });
        }

      } catch(e) {
        //Error setting video
      }
    }
  }
  function errorCallback(error) {
    var scope = angular.element($('.view.ng-scope')).scope();

    scope.$apply(function () {
      scope.userHasCamera = false;
      scope.noCameraNotification();
    });

    $('#newVideoChat').attr("disabled", "disabled");

    //Error error.code
    return;
  }
}

//Stop local video
function stopVideo() {
  if (sourcevid.mozSrcObject) {
    sourcevid.mozSrcObject.stop();
    sourcevid.src = null;

    $('#sidebar-wrapper-anonym').css('width', '250px');
    $('#sidebar-wrapper-anonym').css('margin-right', '-250px');
  } else {
    if (localStream){
      localStream.stop();
      sourcevid.src = "";

      $('#sidebar-wrapper-anonym').css('width', '250px');
      $('#sidebar-wrapper-anonym').css('margin-right', '-250px');
    }
  }
}

//Stop local video
function stopStreamingNoCamera() {
  if (sourcevid.mozSrcObject) {
    sourcevid.mozSrcObject.stop();
    sourcevid.src = null;

    $('#sidebar-wrapper-anonym').css('width', '250px');
    $('#sidebar-wrapper-anonym').css('margin-right', '-250px');

    new PNotify({
      title: 'Fail',
      text: "User doesn't have a camera",
      remove: true
    });
  } else {
    if (localStream){
      localStream.stop();
      sourcevid.src = "";

      $('#sidebar-wrapper-anonym').css('width', '250px');
      $('#sidebar-wrapper-anonym').css('margin-right', '-250px');

      new PNotify({
        title: 'Fail',
        text: "User doesn't have a camera",
        remove: true
      });
    }
  }
}

//Send description to socket
function setLocalAndSendMessage(sessionDescription) {
  peerConn.setLocalDescription(sessionDescription);

  var scope = angular.element($('.view.ng-scope')).scope();

  scope.$apply(function(){
    scope.emitSessionDescription(sessionDescription);
  });
}

function createOfferFailed() {
  console.log("Create Answer failed");
}

//Start connection between users
function connect() {
  if (!started && localStream && window.channelReady) {
    createPeerConnection();
    started = true;
    peerConn.createOffer(setLocalAndSendMessage, createOfferFailed, mediaConstraints);
  } else {
    //Local stream not running
  }
}

//Stop streaming between users
function hangUp() {
  var scope = angular.element($('.view.ng-scope')).scope();

  scope.$apply(function(){
    scope.emitHangUp({type: "bye"});
  });
  stop();
}

function stop() {
  if (peerConn){
    peerConn.close();
  }
  peerConn = null;
  started = false;
}

function createAnswerFailed() {
  //Create answer failed
}

//Messages
function onMessage(evt) {
  if (evt.type === 'offer') {
    if (!started) {
      createPeerConnection();
      started = true;
    }
    peerConn.setRemoteDescription(new RTCSessionDescription(evt));
    peerConn.createAnswer(setLocalAndSendMessage, createAnswerFailed, mediaConstraints);

  } else if (evt.type === 'answer' && started) {
    peerConn.setRemoteDescription(new RTCSessionDescription(evt));

  } else if (evt.type === 'candidate' && started) {
    var candidate = new RTCIceCandidate({sdpMLineIndex:evt.sdpMLineIndex, sdpMid:evt.sdpMid, candidate:evt.candidate});
    peerConn.addIceCandidate(candidate);

  } else if (evt.type === 'bye' && started) {
    stop();
  }
}

function createPeerConnection() {
  var pc_config = {"iceServers":[]};
  var pc_config = {"iceServers": [{"url": "stun:stun.l.google.com:19302"},
    {"url":"turn:mitbip@<54.191.113.177>", "credential":"0x3529034b209c3c7e04a83c94cdcf1299"}]};

  try {
    peerConn = new RTCPeerConnection(pc_config);
  } catch (e) {
    //Failed to create PeerConnection
  }

  //Send candidates to the other peer (socket)
  peerConn.onicecandidate = function (evt) {
    if (event.candidate) {

      var scope = angular.element($('.view.ng-scope')).scope();

      scope.$apply(function(){
        scope.emitCandidate({type: "candidate",
          sdpMLineIndex: evt.candidate.sdpMLineIndex,
          sdpMid: evt.candidate.sdpMid,
          candidate: evt.candidate.candidate})
      });
    }
  };

  //Adding local stream
  peerConn.addStream(localStream);

  peerConn.addEventListener("addstream", onRemoteStreamAdded, false);
  peerConn.addEventListener("removestream", onRemoteStreamRemoved, false)

  //Setting local element when remote adds a stream
  function onRemoteStreamAdded(event) {
    remotevid.src = window.URL.createObjectURL(event.stream);
  }

  //Removes element
  function onRemoteStreamRemoved(event) {
    remotevid.src = "";
  }
}