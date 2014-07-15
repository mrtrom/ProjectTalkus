'use strict';

/*global Modules:false */
/*global $:false */
/*global loadImage:false */

Modules.controllers.controller('UploadController', ['$rootScope', '$scope', 'upload',
  function($rootScope, $scope, upload) {

    function canvasToBlob(canvas){
      canvas.toBlob(
          function (blob) {
            var readerFinal = new window.FileReader();
            readerFinal.readAsDataURL(blob);
            readerFinal.onload = function() {
              var base64data = readerFinal.result;
              upload.save({photo:base64data , username:$scope.userInformation.username} , function(allimg){
                $scope.avatar = allimg.imagefull;
              });
            };
          },
          'image/jpeg'
      );
    }

    $scope.uploadClick = function(){
      $('input.upload-file').click();
    };
    $scope.deletePhoto = function(){
      upload.save({photo:false , username:$scope.userInformation.username} , function(allimg){
        $scope.avatar = allimg.imagefull;
      });
    };
    $scope.onFileSelect = function($files) {
      //$files: an array of files selected, each file has name, size, and type.
      for (var i = 0; i < $files.length; i++) {
        var $file = $files[i];
        loadImage(
            $file,
            canvasToBlob,
            {
              maxWidth: 600,
              crop:true
            }
        );
      }
    };
  }]);