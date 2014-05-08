'use strict';

/*global Modules:false */

Modules.controllers.controller('UploadChat', ['$rootScope', '$scope', 'upload','User','uploadget',
    function($rootScope, $scope, upload, User, uploadget) {
        $scope.onFileSelect = function($files) {
            //$files: an array of files selected, each file has name, size, and type.
            for (var i = 0; i < $files.length; i++) {
                var $file = $files[i];
                loadImage(
                    $file,
                    function (canvas) {
                        canvas.toBlob(
                            function (blob) {
                                var readerFinal = new window.FileReader();
                                readerFinal.readAsDataURL(blob);
                                readerFinal.onload = function() {
                                    var base64data = readerFinal.result;
                                    upload.save({photo:base64data , username:$scope.userInformation.username} , function(allimg){
                                        $scope.avatar = allimg.imagefull;
                                    });
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
            }
        }
    }]);
