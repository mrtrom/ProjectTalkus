'use strict';

/*global $:false */
/*global Modules:false */
/*global emotify:false */
/*global io:false */
/*global onMessage:false */
/*global loadImage:false */
/*global hideMyImageShowCamera:false */
/*global showMyImageHideCamera:false */
/*global startVideo:false */
/*global PNotify:false */
/*global showAnonymImageHideCamera:false */
/*global hideAnonymImageShowCamera:false */
/*global checkURL:false */
/*global checkURLVideo:false */
/*global returnVideoId:false */
/*global onYouTubePlayerAPIReady:false */
/*global hasCamera:false */
/*global hideAnonymImageAndCamera:false */
/*global connect:false*/
/*global stopVideo:false*/
/*global hangUp:false*/
/*global stopStreamingNoCamera:false*/
/*global getBrowser:false*/


Modules.controllers.controller('ChatController', ['$rootScope', '$scope', '$http', '$window', '$location', '$filter','$cookies', '$route', 'Session', 'User', 'Mails' , 'ChatUser', 'uploadget', 'isVideoChat', 'bip', '$translate',
  function($rootScope, $scope, $http, $window, $location, $filter, $cookies, $route, Session, User, Mails, ChatUser, uploadget, isVideoChat, bip, $translate) {
      $scope.lang = function(lang){
          $translate.use(lang);
      };
    document.title = "Mitbip";

    /*window.onbeforeunload = function (e) {
     e = e || window.event;

     // For IE and Firefox prior to version 4
     if (e) {
     e.returnValue = 'Looks like your leaving us';
     }

     // For Safari
     return 'Looks like your leaving us';
     };*/

    //<editor-fold desc="Variables">
    var hostURL = window.location.host.split(':')[0],
        portURL = window.location.host.split(':')[1] !== undefined ? window.location.host.split(':')[1] : 80,
        socket = io.connect(hostURL, {port: portURL}),
        openByModal = false;
    //</editor-fold>

    //<editor-fold desc="jQuery Variables">
    var jQHtml = $('html'),
        jQExitVideoChat = $('#exitVideoChat'),
        jQNewVideoChat = $('#newVideoChat'),
        jQConversation = $('#conversation'),
        jQUserTyping = $('#userTyping'),
        jQVideoButtons = $('#videoButtons'),
        jQDataFalse = $('#dataFalse'),
        jQData = $('#data'),
        jQInputs = $('.wraper-chat'),
        jQLoader = $('div.looking'),
        jQLoaderOther = $('div.otherlooking');
    //</editor-fold>

    //<editor-fold desc="Scope emit functions">
    $scope.emitSessionDescription = function(sessionDescription){
      socket.emit('sessionDescription', sessionDescription);
    };

    $scope.emitSendVideoNotification = function(){
      socket.emit('newVideoChat2');
    };

    $scope.emitVideoStart = function(data){
      socket.emit('nextVideo', data);
    };

    $scope.emitSendVideoNotificationAnonym = function(){
      hideMyImageShowCamera();
      hideAnonymImageShowCamera();
      jQNewVideoChat.hide();
      jQExitVideoChat.show();
      connect();
    };

    $scope.noCameraNotification = function(){
      $('#cameraModal').modal('show');

      socket.emit('userNoCamera');
    };

    $scope.emitAddUser = function(user, type){
      socket.emit('adduser', user, type);
    };

    $scope.emitCandidate = function(data){
      socket.emit('candidate', data);
    };

    $scope.emitHangUp = function(data){
      socket.emit('hangUp', data);
    };
    var videolight = null;
    //</editor-fold>

    //<editor-fold desc="InitChat">
    $scope.initchat = function(){

      setTimeout(function(){

        $scope.userHasCamera = hasCamera();

        if (isVideoChat){
          if (!$scope.userHasCamera){
            $('#camera2Modal').modal('show');
          }
        }
      }, 1000);

      $('#locationgeo').geocomplete().bind("geocode:result", function(event, result){
        $scope.userInformation.location = result.formatted_address;
      });

      if (isVideoChat){
        jQHtml.addClass('chat');
        jQHtml.addClass('video');
      }
      else{
        jQHtml.addClass('chat');
        jQHtml.removeClass('video');
      }

      jQNewVideoChat.hide();
      jQExitVideoChat.hide();

      socket.on('connect', $scope.addUserToChat);
      socket.on('message', onMessage);
      socket.on('initialVideo', onInitialVideo);
      socket.on('empty', onEmpty);
      socket.on('showWriting', onShowWriting);
      socket.on('hideWriting', onHideWriting);
      socket.on('updatechat', onUpdateChat);
      socket.on('updateAnonymInfo', onUpdateAnonymInfo);
      socket.on('initialText', onInitialText);
      socket.on('disconnectPartner', onDisconnectPartner);
      socket.on('disconnectMe', onDisconnectMe);
      socket.on('partnerNoCamera', onPartnerNoCamera);
      socket.on('disconnect', function() {
        jQConversation.append('<div class=\'clear\'></div><div class=\'startChatNow serverchat\'><i class=\'icon-user\'></i><div><span class=\'muted\'>oops, something went wrong, try again</span></div></div><div class=\'clear\'></div>');
      });

      //Send text chat to room via click
      $scope.sendChat = function(){
        var cadenaAEliminar = /(<([^>]+)>)/gi,
            elementoEtiquetas = jQData,
            etiquetas = elementoEtiquetas.val(),
            mensaje;

        if (!jQDataFalse.val()){
          etiquetas = etiquetas.replace(cadenaAEliminar, '');
          elementoEtiquetas.val(etiquetas);
          mensaje = elementoEtiquetas.val();
          mensaje = emotify(mensaje);

          jQData.val('');

          socket.emit('sendchat', mensaje);
        }
        else{
          jQConversation.append('<div class=\'clear\'></div><div class=\'startChatNow serverchat\'><i class=\'icon-user\'></i><div><span class=\'muted\'>Are you a bot? :(</span></div></div><div class=\'clear\'></div>');
        }
      };

      //Send text chat to room via enter
      jQData.keydown(function(e) {
        if(e.keyCode === 8 || e.keyCode === 46){
          if ($(this).val().length <= 1){
            socket.emit('userNotWriting');
          }
        }
        else{
          if (e.keyCode !== 13){
            socket.emit('userWriting');
          }
        }
      });

      jQData.keypress(function(e) {
        if (e.keyCode === 13){
          if ($(this).val().length !== 0){
            $(this).blur();
            $scope.sendChat();
            jQData.focus();
          }
          socket.emit('userNotWriting');
        }
      });

      $('.glyphicon.glyphicon-camera.mycam').click(function(){
        if(jQData.attr('disabled') !== 'disabled'){
          $('#imagefile').click();
        }
      });

      $('#imagefile').bind('change', function(e){
        var data = e.originalEvent.target.files[0];
        var reader = new FileReader();
        reader.onload = function(evt){
          loadImage(
              evt.target.result,
              function (canvas) {
                canvas.toBlob(
                    function (blob) {
                      var readerFinal = new window.FileReader();
                      readerFinal.readAsDataURL(blob);
                      readerFinal.onload = function() {
                        var base64data = readerFinal.result;
                        socket.emit('userImage', base64data);
                      };
                    },
                    'image/jpeg'
                );
              },
              {
                maxWidth: 600,
                crop:true
              }
          );

        };
        reader.readAsDataURL(data);

      });

      jQVideoButtons.on('click', '#connectVideoChat', function(){
        connect();
      });

      jQVideoButtons.on('click', '#newVideoChat', function(){
        socket.emit('newVideoChat', 'text');
      });

      jQVideoButtons.on('click', '#exitVideoChat', function(){
        socket.emit('cancelVideoChat');
        setTimeout(function(){socket.emit('cancelPusblish');}, 300);
      });

      $(document).on('click', '#startVideoChat',function(){
        socket.emit('succesNewVideoChat');
        videolight.remove();
      });

      $(document).on('click', '#cancelVideoChat',function(){
        socket.emit('failNewVideoChat');
        videolight.remove();
      });
    };
    //</editor-fold>

    //<editor-fold desc="Socket functions detail">
    function onConnect(username){

      username = username !== undefined ? username : 'Anonym';

      $('.alert.alert-danger.down').remove();

      if (isVideoChat){
        hideMyImageShowCamera();
        socket.emit('adduser', username, 'video');
      }
      else{
        showMyImageHideCamera();
        socket.emit('adduser', username, 'text');
      }

      hideAnonymImageAndCamera();
      jQExitVideoChat.hide();
    }
    function onInitialText(data){

      socket.emit('nextText', data);

    }
    function onInitialVideo (data, type, user, start){
      window.channelReady = true;

      if (start){
        startVideo(data, user, type);
      }
      else{
        socket.emit('nextVideo', data);
      }
    }
    function onEmpty (){}
    function onShowWriting (){
      if (jQUserTyping.css('display') === 'none'){
        jQUserTyping.show();
        document.title = 'User Typing..';
        $(window).focus(function() {
          document.title = 'Mitbip';
        });
      }
    }
    function onHideWriting (){
      if (jQUserTyping.css('display') === 'block'){
        jQUserTyping.hide();
        document.title = 'New Message';
        $(window).focus(function() {
          document.title = 'Mitbip';
        });
      }
    }
    function onUpdateChat (username, data, type, user, file , sound, typeUser){
      if (type !== undefined){
        var videoExist = false;
        var countPlayer;
        var videoId;
        switch(type){
          case 'leave':
            //Disconect
            jQData.attr('disabled', true);
            $('#datasend').attr('disabled', true);

            $scope.validations.anonymOtherUserValidationFields.Email = true;
            $scope.validations.anonymOtherUserValidationFields.Name = true;
            $scope.validations.anonymOtherUserValidationFields.Gender = true;
            $scope.validations.anonymOtherUserValidationFields.Description = true;
            $scope.validations.anonymOtherUserValidationFields.Location = true;
            $scope.validations.anonymOtherUserValidationFields.Birth = true;

            if ($scope.otherUserInfo !== undefined){
              $scope.otherUserInfo.username = '';
            }

            if (isVideoChat){
              hangUp();
              stopVideo();
              showMyImageHideCamera();
            }

            $('.fieldsetProfile').hide();

            jQExitVideoChat.hide();
            jQNewVideoChat.hide();
            jQLoader.show();
            jQInputs.addClass('hide-inputs');
            jQConversation.empty();
            break;

          case 'connect':

            jQConversation.empty();

            if (user === 'text'){
              showAnonymImageHideCamera();
              jQNewVideoChat.show();
            }
            else{
              hideAnonymImageShowCamera();
              jQExitVideoChat.hide();
              jQNewVideoChat.hide();
            }

            if (typeUser && typeUser === 'me'){
              connect();
            }

            new PNotify({
              title: 'Welcome',
              text: data,
              type: 'success',
              remove: true
            });
              $('.ui-pnotify-closer').on('click', function(event) {
                  $('.ui-pnotify').remove();
              });
            jQLoader.hide();
            jQLoaderOther.hide();
            jQInputs.removeClass('hide-inputs');
            break;

          case 'showMessageVideoMe':
            jQNewVideoChat.hide();
            jQExitVideoChat.show();

            hideMyImageShowCamera();

            /*new PNotify({
             title: 'Video Chat',
             text: 'You want to start a videochat',
             type: 'success',
             remove: true
             });*/
            break;

          case 'showMessageVideoAnonym':
            videolight = new PNotify({
              title: 'Video Chat',
              text: '<div class=\'clear\'></div><div class=\'startChatNow serverchat\'><i class=\'icon-user\'></i><div><span class=\'muted\'>user wants to do video chat</span></br><input class=\'btn log\' type=\'button\' value=\'Accept\' id=\'startVideoChat\' /><input class=\'btn log\' type=\'button\' value=\'Cancel\' id=\'cancelVideoChat\' /></div></div><div class=\'clear\'></div>',
              type: 'success',
              hide: false,
              buttons: {
                closer: false,
                sticker: false
              }
            });
            break;

          case 'succesMessageVideoMe':
            socket.emit('newVideoChat', 'text', 'Anonym');
            break;

          case 'succesMessageVideoAnonym':
            hideAnonymImageShowCamera();
            break;

          case 'failMessageVideoMe':
            hangUp();
            stopVideo();
            showMyImageHideCamera();
            showAnonymImageHideCamera();
            new PNotify({
              title: 'Fail',
              text: 'The video failed to initialize',
              remove: true
            });
            break;

          case 'failMessageVideoAnonym':
            hangUp();
            stopVideo();
            showMyImageHideCamera();
            showAnonymImageHideCamera();
            new PNotify({
              title: 'Fail',
              text: 'The video failed to initialize',
              remove: true
            });
            break;

          case 'cancelMessageVideoMe':
            hangUp();
            stopVideo();
            showMyImageHideCamera();
            showAnonymImageHideCamera();
            jQExitVideoChat.hide();
            jQNewVideoChat.show();
            break;

          case 'cancelMessageVideoAnonym':
            hangUp();
            stopVideo();
            showMyImageHideCamera();
            showAnonymImageHideCamera();
            jQExitVideoChat.hide();
            jQNewVideoChat.show();
            break;

          case 'message':
            //to check if it has an image url
            var a = data,
                text = a.split(' '),
                filterTxt = [];
            for (var i=0; i<text.length; i++)
            {
              if(checkURL(text[i])){
                filterTxt.push('<a target="_blank" href="'+text[i]+'"><img src="'+text[i]+'" alt="img" class="in-image"></a>');
              }
              else{
                filterTxt.push(text[i]);
              }

              if (checkURLVideo(text[i])){
                countPlayer = $('.ytplayer').size() + "ytplayer";
                filterTxt.splice(i, 1);
                filterTxt.push('<div class="ytplayer" id=' + countPlayer + '></div>');
                videoExist = true;
                videoId = returnVideoId(text[i]);

              }
            }
            data = filterTxt.join(" ");

            if(user === 'me'){
              if(file){
                jQConversation.append('<div class=\'me\'><i class=\'icon-user\'></i> <span class=\'text-info\'>'+username + ':</span> <a target="_blank" href="'+ data +'"><img src="' + data + '" alt="image" class="in-image" /></a></div>');
                if (videoExist){
                  onYouTubePlayerAPIReady('390', '640', videoId, countPlayer);
                }
              }else{
                if(sound){
                  jQConversation.append('<div class=\'me\'><i class=\'icon-user\'></i> <span class=\'text-info\'>'+username + ':</span> <audio controls src="' + data + '" class="in-audio"></audio></div>');
                  if (videoExist){
                    onYouTubePlayerAPIReady('390', '640', videoId, countPlayer);
                  }
                }
                else{
                  jQConversation.append('<div class=\'me\'><i class=\'icon-user\'></i> <span class=\'text-info\'>'+username + ':</span> ' + data + '</div>');
                  if (videoExist){
                    onYouTubePlayerAPIReady('390', '640', videoId, countPlayer);
                  }
                }
              }
            }
            else{
              if(file){
                jQConversation.append('<div class=\'anonym\'><i class=\'icon-user\'></i> <span class=\'text-info\'>'+username + ':</span> <a target="_blank" href="'+ data +'"><img src="' + data + '" alt="image" class="in-image" /></a></div>');
                if (videoExist){
                  onYouTubePlayerAPIReady('390', '640', videoId, countPlayer);
                }
              }
              else{
                if(sound){
                  jQConversation.append('<div class=\'anonym\'><i class=\'icon-user\'></i> <span class=\'text-info\'>'+username + ':</span> <audio controls src="' + data + '" class="in-audio"></audio></div>');
                  if (videoExist){
                    onYouTubePlayerAPIReady('390', '640', videoId, countPlayer);
                  }
                }
                else{
                  jQConversation.append('<div class=\'anonym\'><i class=\'icon-user\'></i> <span class=\'text-info\'>'+username + ':</span> ' + data + '</div>');
                  if (videoExist){
                    onYouTubePlayerAPIReady('390', '640', videoId, countPlayer);
                  }
                }
              }
            }
            break;
        }
      }
    }
    function onUpdateAnonymInfo (){
      $('#confirm').click();
      jQData.attr('disabled', false);
      $('#datasend').attr('disabled', false);
      $('.fieldsetProfile').show();
    }
    function onDisconnectPartner(type){
      hideAnonymImageAndCamera();
      jQExitVideoChat.hide();
      jQNewVideoChat.hide();
      jQConversation.empty();
      jQLoader.hide();
      $('#emoticonContainer').css('height', '0');
      jQInputs.addClass('hide-inputs');
      $scope.userstatusbool = false;
      jQLoader.hide();
      jQLoaderOther.show();

      if (type === 'text'){
        showMyImageHideCamera();
      }
      else{
        hangUp();
      }

      //show info "waiting"

    }
    function onDisconnectMe(data, type){
      hideAnonymImageAndCamera();
      jQExitVideoChat.hide();
      jQNewVideoChat.hide();
      jQConversation.empty();
      $('#emoticonContainer').css('height', '0');

      if (type === 'text'){
        hangUp();
        stopVideo();
        showMyImageHideCamera();
        onInitialText(data);
      }
      else{
        hangUp();
        onInitialVideo(data, type, data.username, false);
      }
    }
    function onPartnerNoCamera(){
      stopStreamingNoCamera();
    }
    //</editor-fold>

    //<editor-fold desc="User info section">
    $scope.userstatusbool = true;
    $scope.newRoomValidate = function(){
      if($scope.userstatusbool){
        $scope.userstatusbool = false;
      }
      else{
        $scope.newRoom();
        $scope.userstatusbool = true;
      }
    };
    $(document).keyup(function(e) {
      if (e.which === 27) {
        if($scope.userstatusbool){
          $scope.$apply(function () {
            $scope.userstatusbool = false;
          });
        }
        else{
          $scope.$apply(function () {
            $scope.newRoom();
            $scope.userstatusbool = true;
          });
        }
      }
    });

    $scope.getLog = function(){
      $('#firstlight').modal('hide');
      openByModal = true;
      $('#modMain').modal('show');
    };

    $scope.openTerms = function(){
      $('#firstlight').modal('hide');
      $('#terms').modal('show');
    };

    $scope.chatNow = function(){
      $('#firstlight').modal('hide');
      $scope.loadInfo(onConnect);
    };

    $scope.goChat = function(){
      $location.path('/chat');
    };

    $scope.addUserToChat = function(){

      var browserNameA = getBrowser();

      if (isVideoChat && browserNameA && browserNameA === 'safari'){
        $('#safariModal').modal({
          keyboard: false,
          backdrop: 'static',
          show: true
        });
      }

      if(!$cookies.myshow){
        $cookies.myshow = 'true';
        $('#firstlight').modal({
          keyboard: false,
          backdrop: 'static',
          show: true
        });
      }
      else{
        $scope.loadInfo(onConnect);
      }
    };

    //Modal Events
    $('#terms').on('hide.bs.modal', function () {
      $('#firstlight').modal('show');
    });

    $('#modMain').on('hidden.bs.modal', function () {
      if (openByModal){
        setTimeout(function() {
          $scope.loadInfo(onConnect);
          openByModal = false;
        }, 500);
      }
    });

    $scope.newRoom = function(){
      if (isVideoChat){
        socket.emit('disconnectPartners', 'video');
      }
      else{
        socket.emit('disconnectPartners', 'text');
        jQLoader.show();
          jQInputs.addClass('hide-inputs');
      }
    };

    $scope.closeAlert = function(index) {
      $scope.alerts.splice(index, 1);
    };

    $scope.changeRoom = function(){
      if (isVideoChat){
        $location.path('/chat');
      }
      else{
        if ($scope.userHasCamera){
          $location.path('/video-chat');
        }
        else{
          $('#cameraModal').modal('show');
        }
      }
    };

    $scope.$on('$routeChangeStart', function() {
      $window.location.reload();
    });

    //Calendar
    $scope.today = function() {
      $scope.dt = new Date();
    };
    $scope.today();

    $scope.showWeeks = true;
    $scope.toggleWeeks = function () {
      $scope.showWeeks = ! $scope.showWeeks;
    };

    $scope.toggleMin = function() {
      $scope.minDate = ( $scope.minDate ) ? null : new Date();
    };
    $scope.toggleMin();

    $scope.open = function($event) {
      $event.preventDefault();
      $event.stopPropagation();

      $scope.opened = true;
    };
      $scope.biped = function(){
          bip.save({user:$scope.otherUserInfo},function(suc){
              bip.get({id:$scope.otherUserInfo._id},function(res){
                  $scope.likes = res.likes;
                  $scope.readyLiked = true;
              });
          });
      };
    $scope.format = 'dd/MM/yyyy';

    $scope.newpermit = {
      days: false ,
      email: false
    };

    $scope.validations = {
      anonymUserExist: true,
      anonymUser: true,
      anonymOtherUser: true,
      anonymOtherUserValidationFields: {
        Name: false,
        Birth: false,
        Email: false,
        Location: false,
        Gender: false,
        Description: false
      }
    };

    $scope.userInformation = new User();
    $scope.otherUserInfo = new User();

    var googleBool = false;

    //get user session
    $scope.loadInfo = function (callback) {
      //Get the user info by the session
      Session.get(function(response) {
        if ((response !== null ? response._id : void 0) !== null) {
          uploadget.save({username:response.username},function(avatar){
            if(avatar.image){$scope.avatar = avatar.image;}else{$scope.avatar = '/images/uploads/images/avatars/default.jpg';}

            if (response._id !== null && response._id !== undefined){
              //User info and User birth in format (dd/MM/yyyy)
              $scope.userInformation.birth = new Date();
              $scope.userInformation = response;

              callback($scope.userInformation.username);

              //Validations
              //-Not a anonym user, just a loged user.
              $scope.validations.anonymUser = false;

              socket.emit('getSocketID');

              socket.on('getSocketIDClient', function(socket){
                $scope.userInformation.socketId = socket;
              });

              //Calculate how many days left before profile delete
              if($scope.userInformation.confirmed !== 'true'){

                //Show days left in account
                $scope.newpermit.days = true;

                var createdDate = new Date($scope.userInformation.created), //Account created date
                    realRest = Math.floor((new Date() - createdDate) / 86400000); //days diff between dates

                if(realRest >= 15){}else{
                  //Show adv days left
                  $scope.days = 15 - realRest;
                }
              }
              else{
                //It's a confirmed account, and dont need any action.
              }
            }
            else{
              $scope.validations.anonymUser = true;
              callback('Anonym');
            }

            if($scope.validations.anonymUser === true){
              $('body').addClass('not-login');
            }else{
              $('body').addClass('login');
            }
          });

        }

        if ($scope.userInformation.email === undefined || $scope.userInformation.email === ''){$scope.userInformation.email = '';}
        if ($scope.userInformation.name === undefined || $scope.userInformation.name === ''){$scope.userInformation.name = $scope.userInformation.username;}
        if ($scope.userInformation.gender === undefined || $scope.userInformation.gender === ''){$scope.userInformation.gender = '';}
        if ($scope.userInformation.description === undefined || $scope.userInformation.description === ''){$scope.userInformation.description = '';}
        if ($scope.userInformation.location === undefined || $scope.userInformation.location === ''){$scope.userInformation.location = '';}
        if ($scope.userInformation.birth === undefined || $scope.userInformation.birth === ''){$scope.userInformation.birth = '';}

      }, function() {
        //lightbox error
      });
    };

    //user delete account
    $scope.deleteAccount = function(){
        Mails.delete(
            {id:$scope.userInformation._id},
            function() {
                Session.delete(function() {
                    $location.path('/');
                    $window.location.reload();
                });
            },
            function () {
                //error
            });
    };

    //email resend
    $scope.resend = function(){
        var user = $scope.userInformation;
        Mails.update({user:user},
            function(){
                $scope.newpermit.email = true;
        });

    };


    //general update function
    $scope.updateUsers = function () {
      updateUserAll();
    };

    //When GPS is enable, it will get users location
    $scope.locationBool = function () {
      if(googleBool === false){
        googleBool = true;
        $scope.userInformation.location = document.getElementById('locationgeo').value;
      }
      else{
        $scope.userInformation.location = '';
        googleBool = false;
      }
    };

    //get other user info
    $scope.otherUser = function (){
      if($scope.userInformation.username !== undefined && $scope.userInformation.username !== ''){
        ChatUser.get({username: $scope.userInformation.socketId},
            function(response) {
              bip.get({id:response._id},function(res){
                  $scope.likes = res.likes;
              });
              $scope.validations.anonymOtherUser = false;
              $scope.otherUserInfo.birth = new Date();
              $scope.otherUserInfo = response;

              $scope.validations.anonymOtherUserValidationFields = {};

              //Fields and Validation Fields
              if ($scope.otherUserInfo.email === undefined || $scope.otherUserInfo.email === ''){$scope.validations.anonymOtherUserValidationFields.Email = true;}
              if ($scope.otherUserInfo.name === undefined || $scope.otherUserInfo.name === ''){$scope.validations.anonymOtherUserValidationFields.Name = true;}
              if ($scope.otherUserInfo.gender === undefined || $scope.otherUserInfo.gender === ''){$scope.validations.anonymOtherUserValidationFields.Gender = true;}
              if ($scope.otherUserInfo.description === undefined || $scope.otherUserInfo.description === ''){$scope.validations.anonymOtherUserValidationFields.Description = true;}
              if ($scope.otherUserInfo.location === undefined || $scope.otherUserInfo.location === ''){$scope.validations.anonymOtherUserValidationFields.Location = true;}
              if ($scope.otherUserInfo.birth === undefined || $scope.otherUserInfo.birth === '' || $scope.otherUserInfo.birth === null){$scope.validations.anonymOtherUserValidationFields.Birth = true;}

              if (!$scope.otherUserInfo.username){
                $scope.otherUserInfo.avatar = '/images/uploads/images/avatars/default.jpg';
                $scope.otherUserInfo.username = 'Anonym';
              }
              else{
                uploadget.save({username:$scope.otherUserInfo.username},
                    function(avatar) {
                      if (avatar.image) {
                        $scope.otherUserInfo.avatar = avatar.image;
                      } else {
                        $scope.otherUserInfo.avatar = '/images/uploads/images/avatars/default.jpg';
                      }
                    },
                    function(){
                      $scope.otherUserInfo.avatar = '/images/uploads/images/avatars/default.jpg';
                    });
              }

            }, function(response) {
              switch (response.status) {
                case 404:
                  $scope.otherUserInfo.avatar = '/images/uploads/images/avatars/default.jpg';
                  $scope.otherUserInfo.username = 'Anonym';
              }
            });
      }
      else{

        $scope.validations.anonymOtherUserValidationFields = {};

        //Fields and Validation Fields
        if ($scope.otherUserInfo.email === undefined || $scope.otherUserInfo.email === ''){$scope.validations.anonymOtherUserValidationFields.Email = true;}
        if ($scope.otherUserInfo.name === undefined || $scope.otherUserInfo.name === ''){$scope.validations.anonymOtherUserValidationFields.Name = true;}
        if ($scope.otherUserInfo.gender === undefined || $scope.otherUserInfo.gender === ''){$scope.validations.anonymOtherUserValidationFields.Gender = true;}
        if ($scope.otherUserInfo.description === undefined || $scope.otherUserInfo.description === ''){$scope.validations.anonymOtherUserValidationFields.Description = true;}
        if ($scope.otherUserInfo.location === undefined || $scope.otherUserInfo.location === ''){$scope.validations.anonymOtherUserValidationFields.Location = true;}
        if ($scope.otherUserInfo.birth === undefined || $scope.otherUserInfo.birth === '' || $scope.otherUserInfo.birth === null){$scope.validations.anonymOtherUserValidationFields.Birth = true;}

        $scope.otherUserInfo.avatar = '/images/uploads/images/avatars/default.jpg';
        $scope.otherUserInfo.username = 'Anonym';
      }
    };

    //Here is where the users update function is called when needed
    function updateUserAll(){
      User.update($scope.userInformation,
          function () {
            Session.update({userObject: $scope.userInformation},
                function(){
                  $scope.alerts = [
                    { type: 'success', msg: 'Profile Updated!' }
                  ];
                },
                function(){
                  $scope.alerts = [
                    { type: 'danger', msg: 'Error while updating please try again later' }
                  ];
                });
          }, function () {
            $scope.alerts = [
              { type: 'danger', msg: 'Error while updating please try again later' }
            ];
          });
    }
    //</editor-fold>

  }]);