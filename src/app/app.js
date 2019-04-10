(function () {
    'use strict';

    require('angular');
    var MODULE_NAME = 'ng.azure.files';

    const uploadService = require('./upload.factory.js');
    const downloadService = require('./download.factory.js');
    const zipService = require('./zip.factory.js');

    angular.module(MODULE_NAME, [])
        .service('uploadService', uploadService)
        .service('downloadService', downloadService)
        .service('zipService', zipService)
        .directive('browseFile', function () {
            return {
                template: '<input style="display: none;" id="{{input + $id}}" multiple type="file"/><label for="{{input + $id}}">browse</label>',
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
                        console.log('not cleared', files);
                        scope.fileListCallback({ files: fileList });
                        this.value = null
                        console.log('cleared', files);
                    });
                }
            };

        })
        .directive('dropFile', ['$q', 'zipService', function ($q, zipService) {
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
                        var zipPromises = [];
                        var files = e.dataTransfer ? e.dataTransfer.files : e.target.files;

                        if (files.length > 0) {

                            for (var i = 0; i < files.length; i++) {

                                if (typeof (e.dataTransfer.items) !== 'undefined') {
                                    var entry = e.dataTransfer.items[i].webkitGetAsEntry();
                                    if (entry.isFile) {
                                        fileList.push(files[i]);
                                    } else if (entry.isDirectory) {
                                        zipPromises.push(zipService.zipFolder(entry));
                                    }                                
                                }                 
                            }
                        }

                        $q.all(zipPromises).then(function (res) {
                            angular.forEach(res, function (value, key) {
                                fileList.push(value);
                            });
                            //console.log('result', res);
                            scope.fileListCallback({ files: fileList });
                            zipPromises = [];
                        });
                  
                    });
                }
            };

        }]);

    module.exports = MODULE_NAME;

})();