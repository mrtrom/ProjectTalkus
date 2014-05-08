'use strict';

/*global Modules:false */

Modules.controllers.controller('UploadChat', ['$rootScope', '$scope', 'upload',
    function($rootScope, $scope, upload) {
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
                                    upload.save({profile:base64data} , function(allimg){
                                       console.log(allimg);
                                        $scope.userInformation.avatar = allimg.imagefull;
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
