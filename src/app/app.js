(function () {
    'use strict';var MODULE_NAME = 'ng.azure.files';

const uploadService = require('./upload.factory.js');
const downloadService = require('./download.factory.js');

angular.module(MODULE_NAME, [])
.service('uploadService', uploadService)
.service('downloadService', downloadService)
.directive('browseFile', function (){
    return {
        template: '<input style="display: none;" id="file-input" type="file"/><label for="file-input">browse</label>',
        scope: {
            fileListCallback: "&",
        },
        link: function (scope, element, attributes) {
            element.bind("change", function (e) {
                
                var fileList = [];
                var files = e.target.files;
    
                if (files.length > 0) {
    
                    for (var i = 0; i < files.length; i++) {
                        fileList.push(files[i]);
                    }
                }
                scope.fileListCallback({ files: fileList });

            });
        }
    };

})
.directive('dropFile', function (){
    return {
        scope: {
            fileListCallback: "&"
        },
        link: function (scope, element, attributes) {

            element.bind("dragover", function (e) {
                e.stopPropagation(); e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; 
            });

            element.bind("drop", function (e) {
                e.stopPropagation();
                e.preventDefault();

                var fileList = [];
                var files = e.dataTransfer ? e.dataTransfer.files: e.target.files;
    
                if (files.length > 0) {
    
                    for (var i = 0; i < files.length; i++) {
                        fileList.push(files[i]);
                    }
                }
                scope.fileListCallback({ files: fileList });
            });
        }
    };

});
  
module.exports = MODULE_NAME;

})();