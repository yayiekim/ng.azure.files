(function () {
    'use strict'

    var JSZip = require("jszip");

    Factory.$inject = ['$q', '$http'];

    function Factory($q, $http) {

        function zipFolder(dataTransferItems) {

            function traverseFileTreePromise(item, path) {

                var deferred = $q.defer();
                if (item.isFile) {
                    item.file(function (file) {
                        file.filepath = path + file.name;
                        files.push(file);
                        deferred.resolve(file);
                    });
                } else if (item.isDirectory) {
                    var dirReader = item.createReader();
                    dirReader.readEntries(function (entries) {
                        var entriesPromises = [];
                        angular.forEach(entries, function (value, key) {
                            entriesPromises.push(traverseFileTreePromise(value, path + item.name + "/"));
                        });

                        deferred.resolve($q.all(entriesPromises));
                    });
                }
                return deferred.promise;
            }


            var deferred = $q.defer();
            var files = [];

            var zip = new JSZip();
            var entriesPromises = [];
            entriesPromises.push(traverseFileTreePromise(dataTransferItems, ''));
            $q.all(entriesPromises)
                .then(function (entries) {
                    var mainDirectoryName = files[0].filepath.substr(0, files[0].filepath.indexOf('/'));
                    angular.forEach(files, function (value, key) {
                        zip.file(value.filepath, value);
                    });

                    zip.generateAsync({ type: "blob", compression: "STORE" })
                        .then(function (content) {

                            var formData = new FormData();
                            formData.append('zipFile', content, mainDirectoryName + '.zip');
                            deferred.resolve(formData.get('zipFile'));

                        });
                });
            return deferred.promise;
        }


        function _unzip(zippedFile) {

            var promises = [];

            return JSZip.loadAsync(zippedFile).then(function (zip) {

                var blobs = [];

                angular.forEach(zip.files, function (value, key) {

                    var deffered = $q.defer();

                    zip.files[value.name].async('arrayBuffer').then(function (fileData) {

                        var myBlob = new Blob([fileData], { type: value.name });

                        var blob = {
                            dir: value.dir,
                            file: myBlob
                        };

                        blobs.push(blob);
                        deffered.resolve();

                    });

                    promises.push(deffered.promise);

                });

                return $q.all(promises).then(function (res) {
                    return blobs;
                });


            });
        }

        function zipMultipleFiles(files, filename) {
            var zip = new JSZip();

            var deffered = $q.defer();
            angular.forEach(files, function (value, key) {
                zip.file(value.name, value.file);
            });

            zip.generateAsync({ type: "blob", compression: "STORE", })
                .then(function (content) {

                    var fileEntry = angular.copy(content);
                    fileEntry.name = filename + '.zip';
                    fileEntry.lastModifiedDate = new Date();
                    deffered.resolve(fileEntry);

                });

            return deffered.promise;

        }

        function zipMultipleBlobs(blobs, filename) {
            var zip = new JSZip();

            var deffered = $q.defer();
            angular.forEach(blobs, function (value, key) {

                zip.file(value.name, value);

            });

            zip.generateAsync({ type: "blob", compression: "STORE", })
                .then(function (content) {

                    var fileEntry = angular.copy(content);
                    fileEntry.name = filename + '.zip';
                    fileEntry.lastModifiedDate = new Date();
                    deffered.resolve(fileEntry);

                });

            return deffered.promise;

        }


        return {
            unzip: _unzip,
            zipMultipleFiles: zipMultipleFiles,
            zipFolder: zipFolder,
            zipMultipleBlobs: zipMultipleBlobs
        };


    }

    module.exports = Factory;
})();