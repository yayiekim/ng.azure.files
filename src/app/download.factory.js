(function () {
    'use strict';
    var FileSaver = require('file-saver');
    Factory.$inject = ['$q', '$http'];

    function Factory($q, $http) {

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

        return {
            downloadAsFile: downloadAsFile,
            //downlaodAsZip: downlaodAsZip,
            //downloadMutipleAsFiles: downloadMutipleAsFiles,
            //downloadMutipleAsZip: downloadMutipleAsZip,
            //downloadMutipleAsSingleZip: downloadMutipleAsSingleZip,
        }
    };

    module.exports = Factory;
}())