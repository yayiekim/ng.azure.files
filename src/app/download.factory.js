(function () {
    'use strict';
    var FileSaver = require('file-saver');
    Factory.$inject = ['$q', '$http', 'zipService'];

    function Factory($q, $http, zipService) {

        var defer = $q.defer();
       
        

        function downloadAsFile(config) {

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

        function downlaodAsZip(configs, callback, fileName) {
            var deferredPromises = [];
            var files = [];        

            var progress = [];   


            angular.forEach(configs, function (value) {
                var fileInProgress = {
                    "progress": 0,
                    "filename": value.filename
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
                       var getProgress = progress.find(item => item.filename === config.filename);
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
            downlaodAsZip: downlaodAsZip
            //downloadMutipleAsFiles: downloadMutipleAsFiles,
            //downloadMutipleAsZip: downloadMutipleAsZip,
            //downloadMutipleAsSingleZip: downloadMutipleAsSingleZip,
        }
    };

    module.exports = Factory;
}())