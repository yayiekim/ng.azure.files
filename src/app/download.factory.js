(function () {
    'use strict';
    var FileSaver = require('file-saver');
    Factory.$inject = ['$q', '$http', 'zipService'];

    function Factory($q, $http, zipService) {

        function downloadAsFile(config) {
            var defer = $q.defer();

            $http.get(config.sasUrl, {
                cache: false,
                responseType: "arraybuffer",
                eventHandlers: {
                    progress: function (event) {
                        config.progress((event.loaded / event.total) * 100);
                    }
                },
                headers: {
                    "Content-Type": "application/octet-stream; charset=utf-8"
                },
                requestComingFromUploaderService: true
            }).then(function (response) {
                var octetStreamMime = "application/octet-stream";


                var contentType = response.headers["content-type"] || octetStreamMime;

                var blob = new Blob([response.data], { type: contentType });
                FileSaver.saveAs(blob, config.filename);
                defer.resolve();

            }, function (response) {
                defer.reject(response);

            });


            return defer.promise;
        }

        function downloadAsFileStream(config) {
            var defer = $q.defer();

            $http.get(config.sasUrl, {
                cache: false,
                responseType: "arraybuffer",
                eventHandlers: {
                    progress: function (event) {
                        config.progress((event.loaded / event.total) * 100);
                    }
                },
                headers: {
                    "Content-Type": "application/octet-stream; charset=utf-8"
                },
                requestComingFromUploaderService: true
            }).then(function (response) {
                var octetStreamMime = "application/octet-stream";


                var contentType = response.headers["content-type"] || octetStreamMime;

                var file = new File([response.data], config.filename, { type: contentType });
                defer.resolve(file);

            }, function (response) {
                defer.reject(response);

            });

            return defer.promise;
        }

        function downloadAsZip(configs, callback, fileName) {
            var defer = $q.defer();

            var deferredPromises = [];
            var files = [];        

            var progress = [];   


            angular.forEach(configs, function (value) {
                var fileInProgress = {
                    "progress": 0,
                    "filename": value.filename,
                    "id": value.id
                };

                progress.push(fileInProgress);
            })

            var totalPerFile = 100/ configs.length;

            angular.forEach(configs, function(value) {
                deferredPromises.push(downloadEachFile(value, callback, files, totalPerFile, progress));
            })

            $q.all(deferredPromises)
                .then(function(result) {
                    zipService.zipMultipleBlobs(files, fileName)
                        .then(function (response) {
                            FileSaver.saveAs(response, fileName);
                            defer.resolve();
                        }, function(error) {
                            defer.reject(error);
                        })
                })            

            return defer.promise;
        }

        function downloadEachFile(config, callback, files, totalPerFile, progress) {   

                 
            return $http.get(config.sasUrl, {
                cache: false,
                responseType: "arraybuffer",
                eventHandlers: {
                    progress: function (event) {
                       var getProgress = progress.find(item => item.id === config.id);
                       var currentProgress = angular.copy(getProgress.progress);
                       getProgress.progress += ((event.loaded/event.total) * totalPerFile) - currentProgress;

                       callback(calculateAggregateProgress(progress));
                    }
                },
                headers: {
                    "Content-Type": "application/octet-stream; charset=utf-8"
                },
                requestComingFromUploaderService: true
            }).then(function (response) {
                var octetStreamMime = "application/octet-stream";

                var contentType = response.headers["content-type"] || octetStreamMime;

                var blob = new Blob([response.data], { type: contentType });

                var file = {
                    "blob": blob,
                    "filename": config.filename
                };
                files.push(file);

            }, function (response) {

            });
        }

        function calculateAggregateProgress(progresses) {
            var total = 0;

            angular.forEach(progresses, function (value) {
                total += value.progress;
            })

            return total;
        }

        return {
            downloadAsFile: downloadAsFile,
            downloadAsZip: downloadAsZip,
            downloadAsFileStream: downloadAsFileStream
            //downloadMutipleAsFiles: downloadMutipleAsFiles,
            //downloadMutipleAsZip: downloadMutipleAsZip,
            //downloadMutipleAsSingleZip: downloadMutipleAsSingleZip,
        }
    };

    module.exports = Factory;
}())