(function () {
    'use strict';

    Factory.$inject = ['$http'];

    function Factory($http) {
        var DefaultBlockSize = 80000 * 32;

        var upload = function (config) {

            initializeState(config).then(function (state) {

                var reader = new FileReader();
                reader.onloadend = function (evt) {
                    if (evt.target.readyState === FileReader.DONE && !state.cancelled) { // DONE == 2
                        var uri = state.fileUrl + '&comp=block&blockid=' + state.blockIds[state.blockIds.length - 1];
                        var requestData = new Uint8Array(evt.target.result);

                        $http.put(uri, requestData,
                            {
                                headers: {
                                    'x-ms-blob-type': 'BlockBlob',
                                    'Content-Type': state.file.type,
                                },
                                requestComingFromUploaderService: true,
                                transformRequest: [],

                            }).then(function (response) {

                                if (!state.cancelled) {
                                    state.bytesUploaded += requestData.length;

                                    var percentComplete = ((parseFloat(state.bytesUploaded) / parseFloat(state.file.size)) * 100).toFixed(2);
                                    if (state.progress) state.progress(percentComplete, response.data, response.status, response.headers, response.config);

                                    uploadFileInBlocks(reader, state);
                                }

                            }, function (response) {

                                if (state.error) state.error(response.data, response.status, response.headers, response.config);
                            });
                    }
                };

                uploadFileInBlocks(reader, state);

                return {
                    cancel: function () {
                        state.cancelled = true;
                    }
                };

            });


        };

        var initializeState = function (config) {

            return $http.get(config.getSasLink + encodeURIComponent(config.file.name))
                .then(function (response) {

                    var blockSize = DefaultBlockSize;

                    var maxBlockSize = blockSize; // Default Block Size
                    var numberOfBlocks = 1;

                    var file = config.file;

                    var fileSize = file.size;
                    if (fileSize < blockSize) {
                        maxBlockSize = fileSize;

                    }

                    if (fileSize % maxBlockSize == 0) {
                        numberOfBlocks = fileSize / maxBlockSize;
                    } else {
                        numberOfBlocks = parseInt(fileSize / maxBlockSize, 10) + 1;
                    }


                    return {
                        maxBlockSize: maxBlockSize, //Each file will be split in 256 KB.
                        numberOfBlocks: numberOfBlocks,
                        totalBytesRemaining: fileSize,
                        currentFilePointer: 0,
                        blockIds: new Array(),
                        blockIdPrefix: 'block-',
                        bytesUploaded: 0,
                        submitUri: null,
                        file: file,
                        fileUrl: response.data.data.blob.data.blobBase + response.data.data.blob.data.blobUrl + response.data.data.blob.data.blobSASToken,
                        progress: config.progress,
                        complete: config.complete,
                        error: config.error,
                        cancelled: false
                    };

                }, function (err) {


                });


        };

        var uploadFileInBlocks = function (reader, state) {
            if (!state.cancelled) {
                if (state.totalBytesRemaining > 0) {

                    var fileContent = state.file.slice(state.currentFilePointer, state.currentFilePointer + state.maxBlockSize);
                    var blockId = state.blockIdPrefix + pad(state.blockIds.length, 6);

                    state.blockIds.push(btoa(blockId));
                    reader.readAsArrayBuffer(fileContent);

                    state.currentFilePointer += state.maxBlockSize;
                    state.totalBytesRemaining -= state.maxBlockSize;
                    if (state.totalBytesRemaining < state.maxBlockSize) {
                        state.maxBlockSize = state.totalBytesRemaining;
                    }
                } else {
                    commitBlockList(state);
                }
            }
        };

        var commitBlockList = function (state) {
            var uri = state.fileUrl + '&comp=blocklist';

            var requestBody = '<?xml version="1.0" encoding="utf-8"?><BlockList>';
            for (var i = 0; i < state.blockIds.length; i++) {
                requestBody += '<Latest>' + state.blockIds[i] + '</Latest>';
            }
            requestBody += '</BlockList>';

            $http.put(uri, requestBody,
                {
                    headers: {
                        'x-ms-blob-content-type': state.file.type,
                    },
                    requestComingFromUploaderService: true,
                }).then(function (response) {

                    if (state.complete) state.complete(response.data, response.status, response.headers, response.config);
                }, function (response) {

                    if (state.error) state.error(response.data, response.status, response.headers, response.config);
                });
        };

        var pad = function (number, length) {
            var str = '' + number;
            while (str.length < length) {
                str = '0' + str;
            }
            return str;
        };

        return {
            upload: upload,
            //uploadAsZip: uploadAsZip
        }
    };

    module.exports = Factory;
}())