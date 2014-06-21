'use strict';

/*global $:false */
/*global Modules:false */
/*global emotify:false */
/*global io:false */
/*global channelReady:false */

Modules.controllers.controller('ChatController', ['$rootScope', '$scope', '$http', '$location', '$filter','$cookies', '$route', 'Session', 'User', 'Mails' , 'ChatUser', 'uploadget', 'isVideoChat',
  function($rootScope, $scope, $http, $location, $filter,$cookies, $route, Session, User, Mails, ChatUser, uploadget, isVideoChat) {
      $scope.getlog = function(){
          $('#firstlight').modal('hide');
          $('#modMain').modal('show');
      };
      if(!$cookies.myshow){
          $cookies.myshow = 'true';
          $('#firstlight').modal('show');
      }
      $scope.newRoom = function(){
          $route.reload();
      };
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

    //<editor-fold desc="Scope emit functions">
    $scope.emitSessionDescription = function(sessionDescription){
      socket.emit('sessionDescription', sessionDescription);
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

      if (isVideoChat){
        $('html').addClass('chat');
        $('html').addClass('video');

      }
      else{
        $('html').addClass('chat');
        $('html').removeClass('video');
      }

      socket.on('connect', onConnect);
      socket.on('message', onMessage);
      socket.on('initialVideo', onInitialVideo);
      socket.on('empty', onEmpty);
      socket.on('showWriting', onShowWriting);
      socket.on('hideWriting', onHideWriting);
      socket.on('updatechat', onUpdateChat);
      socket.on('updateAnonymInfo', onUpdateAnonymInfo);
      socket.on('initialText', onInitialText);

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
                      }
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

      $('#extra-buttons').on('click', '#newVideoChat', function(){
        socket.emit('newVideoChat');
      });

      $('#extra-buttons').on('click', '#exitVideoChat', function(){
        socket.emit('cancelVideoChat');
        setTimeout(function(){socket.emit('cancelPusblish');}, 300);
      });

      $('#conversation').on('click', '#startVideoChat',function(){
        socket.emit('succesNewVideoChat');
      });

      $('#conversation').on('click', '#cancelVideoChat',function(){
        socket.emit('failNewVideoChat');
      });
    };
    //</editor-fold>

    //<editor-fold desc="Socket functions detail">
    function onConnect(){
      $('.alert.alert-danger.down').remove();

      if (isVideoChat){
        onChannelOpened();
      }
      else{
        socket.emit('adduser', 'Anonym', 'text');
      }
    }
    function onInitialText(){
      socket.emit('nextText');
    }
    function onInitialVideo (){
      window.channelReady = true;
      startVideo();
      socket.emit('nextVideo');
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
    function onUpdateChat (username, data, type, user, file , sound, video){
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

            //$('#conversation').append('<div class=\'clear\'></div><div class=\'serverchat\'><i class=\'icon-user\'></i><div><span class=\'muted\'>Me dejaron!</span></div><div class=\'clear\'></div>');

            new PNotify({
              title: 'Woa',
              text: 'Looks like the user left'
            });
            //executeAnimateLoading();
            break;

          case 'connect':
            $('#conversation').empty();
            //$('#conversation').append('<div class=\'serverchat\'><i class=\'icon-user\'></i>' + data + '</div><div class=\'clear\'></div>');

            new PNotify({
              title: 'Welcome',
              text: 'You are now connected to another mitbip!!',
              type: 'success'
            });
            break;

          case 'showMessageVideoMe':
            $('#extra-buttons #newVideoChat').remove();
            $('#extra-buttons').append('<input type="button" id="exitVideoChat" class="btn btn-primary log" value="Cancel video chat">');
            $('#conversation').append('<div class=\'clear\'></div><div class=\'serverchat\'><i class=\'icon-user\'></i><div><span class=\'muted\'>you want to star a videochat</span></div><div class=\'clear\'></div>');
            break;

          case 'showMessageVideoAnonym':
            $('#conversation').append('<div class=\'clear\'></div><div class=\'startChatNow serverchat\'><i class=\'icon-user\'></i><div><span class=\'muted\'>user wants to do video chat</span><input class=\'btn btn-primary log\' type=\'button\' value=\'Accept\' id=\'startVideoChat\' /><input class=\'btn btn-primary log\' type=\'button\' value=\'Cancel\' id=\'cancelVideoChat\' /></div></div><div class=\'clear\'></div>');
            break;

          case 'succesMessageVideoMe':
            $('#conversation .startChatNow').remove();
            //$('#conversation').append('<div class=\'clear\'></div><div class=\'serverchat\'><i class=\'icon-user\'></i><div><span class=\'muted\'>you both are now on Video<span></div><div class=\'clear\'></div>');
              new PNotify({
                  title: 'Success',
                  text: 'You are now both on video'
              });
            break;

          case 'succesMessageVideoAnonym':
            $('#conversation .startChatNow').remove();
            //$('#conversation').append('<div class=\'clear\'></div><div class=\'serverchat\'><i class=\'icon-user\'></i><div><span class=\'muted\'>you both are now on Video</span></div><div class=\'clear\'></div>');
              new PNotify({
                  title: 'Success',
                  text: 'You are now both on video'
              });
            break;

          case 'failMessageVideoMe':
            //$('#conversation').append('<div class=\'clear\'></div><div class=\'serverchat\'><i class=\'icon-user\'></i><div><span class=\'muted\'>Sorry :(</span></div><div class=\'clear\'></div>');
              new PNotify({
                  title: 'Fail',
                  text: 'The video failed to initialize'
              });
            break;

          case 'failMessageVideoAnonym':
            //$('#conversation').append('<div class=\'clear\'></div><div class=\'serverchat\'><i class=\'icon-user\'></i><div><span class=\'muted\'>Perv!</span></div><div class=\'clear\'></div>');
              new PNotify({
                  title: 'Fail',
                  text: 'The video failed to initialize'
              });
            break;

          case 'cancelMessageVideoMe':
            $('#extra-buttons #exitVideoChat').remove();
            $('#extra-buttons').append('<input type="button" id="newVideoChat" class="btn btn-primary log" value="video chat">');
            $('#conversation').append('<div class=\'clear\'></div><div class=\'serverchat\'><i class=\'icon-user\'></i><div><span class=\'muted\'>Sorry :(</span></div><div class=\'clear\'></div>');
            break;

          case 'cancelMessageVideoAnonym':
            $('#extra-buttons #exitVideoChat').remove();
            $('#extra-buttons').append('<input type="button" id="newVideoChat" class="btn btn-primary log" value="video chat">');
            $('#conversation').append('<div class=\'clear\'></div><div class=\'serverchat\'><i class=\'icon-user\'></i><div><span class=\'muted\'>Perv!</span></div><div class=\'clear\'></div>');
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
              else{
                //filterTxt.push(text[i]);
              }
            }
            data = filterTxt.join(" ");
            //end check
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
      //stopAnimateLoading();
    }
    //</editor-fold>

    //<editor-fold desc="User info section">

    $scope.newRoom = function(){
      $route.reload();
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
    $scope.loadInfo = function () {
      //Get the user info by the session
      Session.get(function(response) {
        if ((response !== null ? response._id : void 0) !== null) {
          uploadget.save({username:response.username},function(avatar){
            if(avatar.image){$scope.avatar = avatar.image;}else{$scope.avatar = '/images/uploads/images/avatars/default.jpg';}

            if (response._id !== null && response._id !== undefined){
              $scope.logoutBtn = true;
              //User info and User birth in format (dd/MM/yyyy)
              $scope.userInformation.birth = new Date();
              $scope.userInformation = response;

              //$scope.userInformation.birth = $filter('date')(new Date($scope.userInformation.birth), 'dd/MM/yyyy');
              //Validations
              //-Not a anonym user, just a loged user.
              $scope.validations.anonymUser = false;

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

        /*console.log('entro');


         console.log($scope.userInformation.username);
         socket.emit('adduser', username, 'text');*/

      }, function() {
        //error
      });
    };

    //user delete account
    $scope.deleteAccount = function(){
      User.delete({username : $scope.userInformation._id},
          function(){
            //Exito
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

    $scope.pullDown = function(){
      console.log('push down');
    };

    //When GPS is enable, it will get users location
    $scope.locationBool = function () {
      if(googleBool === false){
        googleBool = true;
        $scope.userInformation.location = document.getElementById('locationgeo').value;
      }else{
        $scope.userInformation.location = '';
        googleBool = false;
      }
    };

    //get other user info
    $scope.otherUser = function (){
      if($scope.userInformation.username !== undefined && $scope.userInformation.username !== ''){
        ChatUser.get({username: $scope.userInformation.username},
            function(response) {
              $scope.validations.anonymOtherUser = false;
              $scope.otherUserInfo = response;

              //Fields and Validation Fields
              if ($scope.otherUserInfo.email === undefined || $scope.otherUserInfo.email === ''){$scope.validations.anonymOtherUserValidationFields.Email = true;}
              if ($scope.otherUserInfo.name === undefined || $scope.otherUserInfo.name === ''){$scope.validations.anonymOtherUserValidationFields.Name = true;}
              if ($scope.otherUserInfo.gender === undefined || $scope.otherUserInfo.gender === ''){$scope.validations.anonymOtherUserValidationFields.Gender = true;}
              if ($scope.otherUserInfo.description === undefined || $scope.otherUserInfo.description === ''){$scope.validations.anonymOtherUserValidationFields.Description = true;}
              if ($scope.otherUserInfo.location === undefined || $scope.otherUserInfo.location === ''){$scope.validations.anonymOtherUserValidationFields.Location = true;}
              if ($scope.otherUserInfo.birth === undefined || $scope.otherUserInfo.birth === '' || $scope.otherUserInfo.birth === null){$scope.validations.anonymOtherUserValidationFields.Birth = true;}

            }, function(response) {
              switch (response.status) {
                case 404:
                  $scope.otherUserInfo.avatar = '/images/uploads/images/avatars/default.jpg';
                  $scope.otherUserInfo.username = 'Anonym';
              }
            });
      }
    };


    //logout
    $scope.logout = function(){
      Session.delete(function() {
        $('.preview-loading').hide();
        $location.path('/');
      });
    };

    //update user info
    $('.FocusAccion').focusout(function() {
      updateUserAll();
    });

    //Here is where the users update function is called when needed
    function updateUserAll(){
      User.update($scope.userInformation,
          function () {
            $scope.alerts = [
              { type: 'success', msg: 'Profile Updated!' }
            ];
          }, function () {
            $scope.alerts = [
              { type: 'danger', msg: 'Error while updating please try again later' }
            ];
          });
    }
    //</editor-fold>

  }]);