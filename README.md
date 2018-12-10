how to use:
requirements jszip and file-saver
npm install ng.azure.files

1. require ng.azure.files.
2. inject "ng.azure.files" in your app module.
3. 

```HTML
   a. sample use of dropzone 
      <div drop-file file-list-callback="vm.nDrop(files)">test drop here</div>
   b. sample use of browse  
      <input hidden="hidden" id="file-input" type="file" browse-file file-list-callback="vm.nInputFile(files)" />
                             <label for="file-input">browse</label>
```
4. sample uploading function:

      vm.nInputFile = function(file){
            angular.forEach(file,function(key, val) {

                var config = {
                    sasUrl: '',
                    file: key,
                    progress: function(amount) {
                       
                    },
                    complete: function() {

                    },
                    error: function(data, status, err, config) {

                    }
                };

                uploadService.upload(config);

            });

        };
