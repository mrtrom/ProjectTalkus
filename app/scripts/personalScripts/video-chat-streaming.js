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

//Set local video
function startVideo() {

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
      } catch(e) {
        //Error setting video
      }
    }
  }
  function errorCallback(error) {
    //Error error.code
    return;
  }
}

//Stop local video
function stopVideo() {
  if (sourcevid.mozSrcObject) {
    sourcevid.mozSrcObject.stop();
    sourcevid.src = null;
  } else {
    sourcevid.src = "";
    localStream.stop();
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
  if (!started && localStream && channelReady) {
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
  peerConn.close();
  peerConn = null;
  started = false;
}

function onChannelOpened(evt) {
  var scope = angular.element($('.view.ng-scope')).scope();

  scope.$apply(function(){
    scope.emitAddUser('Anonym', 'video');
  });
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