'use strict';

/*global Modules:false */

Modules.controllers.controller('UploadChat', ['$rootScope', '$scope', '$upload',
    function($rootScope, $scope, $upload) {
        $scope.onFileSelect = function($files) {
            //$files: an array of files selected, each file has name, size, and type.
            for (var i = 0; i < $files.length; i++) {
                var $file = $files[i];
                $upload.upload({
                    url: '/API/upload/photo',
                    file: $file,
                    progress: function(e){}
                }).then(function(data, status, headers, config) {
                    // file is uploaded successfully
                    console.log(data);
                });
            }
        }
    }]);
