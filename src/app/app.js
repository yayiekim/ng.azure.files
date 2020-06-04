(function () {
    'use strict';

    require('angular');
    var MODULE_NAME = 'ng.azure.files';

    const uploadService = require('./upload.factory.js');
    const downloadService = require('./download.factory.js');
    const zipService = require('./zip.factory.js');
    const supportedImageFormats = ["jpeg", "jpg", "gif", "png", "tiff", "bmp"];
    angular.module(MODULE_NAME, [])
        .service('uploadService', uploadService)
        .service('downloadService', downloadService)
        .service('zipService', zipService)
        .directive('browseFile', function () {
            return {
                template: '<input style="display: none;" id="{{input + $id}}" multiple type="file"/><label for="{{input + $id}}"><span ng-if="!innerLabel">Browse</span><span ng-if="innerLabel" ng-bind-html="innerLabel"></span></label>',
                scope: {
                    fileListCallback: "&",
                    imageOnly: "&",
                    innerLabel: "<"
                },
                link: function (scope, element, attributes) {

                    element.bind("change", function (e) {

                        var fileList = [];
                        var files = e.target.files;

                        if (files.length > 0) {

                            for (var i = 0; i < files.length; i++) {
                                if (scope.imageOnly()) {
                                    var extension = files[i].name.split(".").pop();

                                    var isImage = false;
                                    angular.forEach(supportedImageFormats, function (value, key) {
                                        if (value.toUpperCase() === extension.toUpperCase()) {
                                            isImage = true;
                                        }
                                    });

                                    if (isImage) {
                                        fileList.push(files[i]);
                                    }
                                }
                                else {
                                    fileList.push(files[i]);
                                }
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
                    fileListCallback: "&",
                    imageOnly: "&"
                },
                link: function (scope, element, attributes) {

                    element.bind("dragover", function (e) {
 
                        e.stopPropagation(); 
                        e.preventDefault(); 

                        if(e.dataTransfer){
                            e.dataTransfer.dropEffect = 'copy';
                        }else{
                            e.originalEvent.dataTransfer.dropEffect = 'copy';
                        }
                       
                    });

                    element.bind("drop", function (e) {
                        e.stopPropagation();
                        e.preventDefault();

                        var fileList = [];
                        var zipPromises = [];
                        var files = [];

                        if(e.dataTransfer){
                             files = e.dataTransfer.files
                        }else if(e.originalEvent.dataTransfer){
                             files = e.originalEvent.dataTransfer
                        }
                        else{
                             files = e.target.files;
                        }


                        if (files.length > 0) {

                            for (var i = 0; i < files.length; i++) {

                                if (typeof (e.originalEvent) !== 'undefined') {
                                    var entry = e.originalEvent.dataTransfer.items[i].webkitGetAsEntry();
                                    if (scope.imageOnly()) {
                                        var extension = files[i].name.split(".").pop();

                                        var isImage = false;
                                        angular.forEach(supportedImageFormats, function (value, key) {
                                            if (value.toUpperCase() === extension.toUpperCase()) {
                                                isImage = true;
                                            }
                                        });

                                        if (isImage) {
                                            fileList.push(files[i]);
                                        }
                                    }
                                    else {
                                        if (entry.isFile) {
                                            fileList.push(files[i]);
                                        } else if (entry.isDirectory) {
                                            zipPromises.push(zipService.zipFolder(entry));
                                        }   
                                    }                             
                                }else if(typeof (e.dataTransfer) !== 'undefined'){
                                    var entry = e.dataTransfer.items[i].webkitGetAsEntry();
                                    if (scope.imageOnly()) {
                                        var extension = files[i].name.split(".").pop();

                                        var isImage = false;
                                        angular.forEach(supportedImageFormats, function (value, key) {
                                            if (value.toUpperCase() === extension.toUpperCase()) {
                                                isImage = true;
                                            }
                                        });

                                        if (isImage) {
                                            fileList.push(files[i]);
                                        }
                                    }
                                    else {
                                        if (entry.isFile) {
                                            fileList.push(files[i]);
                                        } else if (entry.isDirectory) {
                                            zipPromises.push(zipService.zipFolder(entry));
                                        }   
                                    }                             
                                } else {
                                    var entry = e.target.items[i].webkitGetAsEntry();
                                    if (scope.imageOnly()) {
                                        var extension = files[i].name.split(".").pop();

                                        var isImage = false;
                                        angular.forEach(supportedImageFormats, function (value, key) {
                                            if (value.toUpperCase() === extension.toUpperCase()) {
                                                isImage = true;
                                            }
                                        });

                                        if (isImage) {
                                            fileList.push(files[i]);
                                        }
                                    }
                                    else {
                                        if (entry.isFile) {
                                            fileList.push(files[i]);
                                        } else if (entry.isDirectory) {
                                            zipPromises.push(zipService.zipFolder(entry));
                                        }   
                                    }                             
                                }                    
                            }
                        }

                        $q.all(zipPromises).then(function (res) {
                            angular.forEach(res, function (value, key) {
                                fileList.push(value);
                            });
                            scope.fileListCallback({ files: fileList });
                            zipPromises = [];
                        });
                  
                    });
                }
            };

        }]);

    module.exports = MODULE_NAME;

})();