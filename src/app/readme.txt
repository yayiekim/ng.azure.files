how to use:
1. require nimbyx-uploader.
2. inject "nimbyx-uploader" in your app module.
3. 
    a. sample use of dropzone <div n-drop n-files="vm.nDrop(files)" >test drop here</div>
    b. sample use of browse  <input hidden="hidden" id="file-input" type="file" n-input n-files="vm.nInputFile(files)" />
                             <label for="file-input">browse</label>
4. sample uploading function:

      vm.nInputFile = function(file){
            angular.forEach(file,function(key, val) {

                var config = {
                    getSasLink: 'localhost:9090/api/LabDashboard/uploadDraftFile?fileName=',
                    file: key,
                    progress: function(amount) {
                       
                    },
                    complete: function() {

                    },
                    error: function(data, status, err, config) {

                    }
                };

                nService.upload(config);

            });

        };