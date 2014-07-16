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


Modules.controllers.controller('ChatController', ['$rootScope', '$scope', '$http', '$window', '$location', '$filter','$cookies', '$route', 'Session', 'User', 'Mails' , 'ChatUser', 'uploadget', 'isVideoChat',
  function($rootScope, $scope, $http, $window, $location, $filter, $cookies, $route, Session, User, Mails, ChatUser, uploadget, isVideoChat) {

    document.title = "Talkus";

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
        socket = io.connect(hostURL, {port: portURL});
    //</editor-fold>

    //<editor-fold desc="jQuery Variables">
    var jQHtml = $('html'),
        jQExitVideoChat = $('#exitVideoChat');
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
      $('#newVideoChat').hide();
      jQExitVideoChat.show();
      connect();
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
    //</editor-fold>

    //<editor-fold desc="InitChat">
    $scope.initchat = function(){

      setTimeout(function(){
        if (isVideoChat){
          if (!$scope.userHasCamera){
            //Show lightbox showing info (don't have camera)
          }
        }
      }, 1000);

      $('#locationgeo').geocomplete().bind("geocode:result", function(event, result){
        $scope.userInformation.location = result.formatted_address;
      });

      if (isVideoChat){
        jQHtml.addClass('chat');
        jQHtml.addClass('video');
        $('#videoButtons #newVideoChat').hide();
        jQExitVideoChat.hide();
      }
      else{
        jQHtml.addClass('chat');
        jQHtml.removeClass('video');
        $('#videoButtons #newVideoChat').show();
        jQExitVideoChat.hide();
      }

      socket.on('connect', $scope.loadInfo(onConnect));
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

      //Send text chat to room via click
      $('#datasend').on('click', function() {
        var cadenaAEliminar = /(<([^>]+)>)/gi,
            elementoEtiquetas = $('#data'),
            etiquetas = elementoEtiquetas.val(),
            mensaje;

        etiquetas = etiquetas.replace(cadenaAEliminar, '');
        elementoEtiquetas.val(etiquetas);
        mensaje = elementoEtiquetas.val();
        mensaje = emotify(mensaje);

        $('#data').val('');

        socket.emit('sendchat', mensaje);
      });

      //Send text chat to room via enter
      $('#data').keydown(function(e) {
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

      $('#data').keypress(function(e) {
        if (e.keyCode === 13){
          if ($(this).val().length !== 0){
            $(this).blur();
            $('#datasend').focus().click();
            $('#data').focus();
          }
          socket.emit('userNotWriting');
        }
      });

      $('.glyphicon.glyphicon-camera.mycam').click(function(){
        if($('#data').attr('disabled') !== 'disabled'){
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

      $('#videoButtons').on('click', '#connectVideoChat', function(){
        connect();
      });

      $('#videoButtons').on('click', '#newVideoChat', function(){
        socket.emit('newVideoChat', 'text');
      });

      $('#videoButtons').on('click', '#exitVideoChat', function(){
        socket.emit('cancelVideoChat');
        setTimeout(function(){socket.emit('cancelPusblish');}, 300);
      });

      $(document).on('click', '#startVideoChat',function(){
        socket.emit('succesNewVideoChat');
      });

      $(document).on('click', '#cancelVideoChat',function(){
        socket.emit('failNewVideoChat');
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
      if ($('#userTyping').css('display') === 'none'){
        $('#userTyping').show();
        document.title = 'User Typing..';
        $(window).focus(function() {
          document.title = 'Talkus';
        });
      }
    }
    function onHideWriting (){
      if ($('#userTyping').css('display') === 'block'){
        $('#userTyping').hide();
        document.title = 'New Message';
        $(window).focus(function() {
          document.title = 'Talkus';
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
            $('#data').attr('disabled', true);
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

            $('.fieldsetProfile').hide();

            new PNotify({
              title: 'Woa',
              text: 'Looks like the user left',
              remove: true
            });
            break;

          case 'connect':
            $('#conversation').empty();

            if (user === 'text'){
              showAnonymImageHideCamera();
            }
            else{
              hideAnonymImageShowCamera();
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
            break;

          case 'showMessageVideoMe':
            $('#videoButtons #newVideoChat').hide();
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
            new PNotify({
              title: 'Video Chat',
              text: '<div class=\'clear\'></div><div class=\'startChatNow serverchat\'><i class=\'icon-user\'></i><div><span class=\'muted\'>user wants to do video chat</span><input class=\'btn btn-primary log\' type=\'button\' value=\'Accept\' id=\'startVideoChat\' /><input class=\'btn btn-primary log\' type=\'button\' value=\'Cancel\' id=\'cancelVideoChat\' /></div></div><div class=\'clear\'></div>',
              type: 'success',
              remove: true
            });
            break;

          case 'succesMessageVideoMe':
            socket.emit('newVideoChat', 'text', 'Anonym');

            /*new PNotify({
             title: 'Success',
             text: 'Me: You are now both on video',
             remove: true
             });*/
            break;

          case 'succesMessageVideoAnonym':
            hideAnonymImageShowCamera();
            /*new PNotify({
             title: 'Success',
             text: 'Anonym: You are now both on video',
             remove: true
             });*/
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
            $('#newVideoChat').show();
            break;

          case 'cancelMessageVideoAnonym':
            hangUp();
            stopVideo();
            showMyImageHideCamera();
            showAnonymImageHideCamera();
            jQExitVideoChat.hide();
            $('#newVideoChat').show();
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
                $('#conversation').append('<div class=\'me\'><i class=\'icon-user\'></i> <span class=\'text-info\'>'+username + ':</span> <a target="_blank" href="'+ data +'"><img src="' + data + '" alt="image" class="in-image" /></a></div>');
                if (videoExist){
                  onYouTubePlayerAPIReady('390', '640', videoId, countPlayer);
                }
              }else{
                if(sound){
                  $('#conversation').append('<div class=\'me\'><i class=\'icon-user\'></i> <span class=\'text-info\'>'+username + ':</span> <audio controls src="' + data + '" class="in-audio"></audio></div>');
                  if (videoExist){
                    onYouTubePlayerAPIReady('390', '640', videoId, countPlayer);
                  }
                }
                else{
                  $('#conversation').append('<div class=\'me\'><i class=\'icon-user\'></i> <span class=\'text-info\'>'+username + ':</span> ' + data + '</div>');
                  if (videoExist){
                    onYouTubePlayerAPIReady('390', '640', videoId, countPlayer);
                  }

                }
              }

            }
            else{
              if(file){
                $('#conversation').append('<div class=\'anonym\'><i class=\'icon-user\'></i> <span class=\'text-info\'>'+username + ':</span> <a target="_blank" href="'+ data +'"><img src="' + data + '" alt="image" class="in-image" /></a></div>');
                if (videoExist){
                  onYouTubePlayerAPIReady('390', '640', videoId, countPlayer);
                }
              }
              else{
                if(sound){
                  $('#conversation').append('<div class=\'anonym\'><i class=\'icon-user\'></i> <span class=\'text-info\'>'+username + ':</span> <audio controls src="' + data + '" class="in-audio"></audio></div>');
                  if (videoExist){
                    onYouTubePlayerAPIReady('390', '640', videoId, countPlayer);
                  }
                }
                else{
                  $('#conversation').append('<div class=\'anonym\'><i class=\'icon-user\'></i> <span class=\'text-info\'>'+username + ':</span> ' + data + '</div>');
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
      $('#data').attr('disabled', false);
      $('#datasend').attr('disabled', false);
      $('.fieldsetProfile').show();
    }
    function onDisconnectPartner(data, type){
      hideAnonymImageAndCamera();
      jQExitVideoChat.hide();
      $('#newVideoChat').hide();

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
      $('#newVideoChat').hide();

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
    //</editor-fold>

    //<editor-fold desc="User info section">

    $scope.getlog = function(){
      $('#firstlight').modal('hide');
      $('#modMain').modal('show');
    };
    if(!$cookies.myshow){
      $cookies.myshow = 'true';
      $('#firstlight').modal('show');
    }
    $scope.newRoom = function(){
      if (isVideoChat){
        socket.emit('disconnectPartners', 'video');
      }
      else{
        socket.emit('disconnectPartners', 'text');
      }
    };

    $scope.closeAlert = function(index) {
      $scope.alerts.splice(index, 1);
    };

    $scope.changeRoom = function(){
      if (isVideoChat){
        $location.path('/chat');
        //$window.location.reload();
      }
      else{
        if ($scope.userHasCamera){
          $location.path('/video-chat');
          //$window.location.reload();
        }
        else{
          //Show lightbox showing info (don't have camera)
        }
      }
    };

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
    $scope.userHasCamera = hasCamera();

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
      User.delete({username : $scope.userInformation._id},
          function(){
            Session.delete(function() {
              $location.path('/');
              $window.location.reload();
            });
          },
          function(){
            //Error
          });
    };

    //email resend
    $scope.resend = function(){
      Mails.delete(function() {
            //exito
          },
          function () {
            //error
          });
      $scope.newpermit.email = true;
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