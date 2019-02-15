!function(e){var t={};function n(o){if(t[o])return t[o].exports;var r=t[o]={i:o,l:!1,exports:{}};return e[o].call(r.exports,r,r.exports,n),r.l=!0,r.exports}n.m=e,n.c=t,n.d=function(e,t,o){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:o})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var o=Object.create(null);if(n.r(o),Object.defineProperty(o,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var r in e)n.d(o,r,function(t){return e[t]}.bind(null,r));return o},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=0)}([function(e,t,n){!function(){"use strict";var t=n(1),o=n(2);angular.module("ng.azure.files",[]).service("uploadService",t).service("downloadService",o).directive("browseFile",function(){return{template:'<input style="display: none;" id="{{input + $id}}" multiple type="file"/><label for="{{input + $id}}">browse</label>',scope:{fileListCallback:"&"},link:function(e,t,n){t.bind("change",function(t){var n=[],o=t.target.files;if(o.length>0)for(var r=0;r<o.length;r++)n.push(o[r]);e.fileListCallback({files:n}),this.value=null})}}}).directive("dropFile",function(){return{scope:{fileListCallback:"&"},link:function(e,t,n){t.bind("dragover",function(e){e.stopPropagation(),e.preventDefault(),e.dataTransfer.dropEffect="copy"}),t.bind("drop",function(t){t.stopPropagation(),t.preventDefault();var n=[],o=t.dataTransfer?t.dataTransfer.files:t.target.files;if(o.length>0)for(var r=0;r<o.length;r++)n.push(o[r]);e.fileListCallback({files:n})})}}}),e.exports="ng.azure.files"}()},function(e,t){!function(){"use strict";function t(e){var t=function(e){var t=256e4,n=e.file,o=n.size;return o<256e4&&(t=o),{maxBlockSize:t,numberOfBlocks:o%t==0?o/t:parseInt(o/t,10)+1,totalBytesRemaining:o,currentFilePointer:0,blockIds:new Array,blockIdPrefix:"block-",bytesUploaded:0,submitUri:null,file:n,fileUrl:e.sasUrl,progress:e.progress,complete:e.complete,error:e.error,cancelled:!1}},n=function(e,t){if(!t.cancelled)if(t.totalBytesRemaining>0){var n=t.file.slice(t.currentFilePointer,t.currentFilePointer+t.maxBlockSize),i=t.blockIdPrefix+r(t.blockIds.length,6);t.blockIds.push(btoa(i)),e.readAsArrayBuffer(n),t.currentFilePointer+=t.maxBlockSize,t.totalBytesRemaining-=t.maxBlockSize,t.totalBytesRemaining<t.maxBlockSize&&(t.maxBlockSize=t.totalBytesRemaining)}else o(t)},o=function(t){for(var n=t.fileUrl+"&comp=blocklist",o='<?xml version="1.0" encoding="utf-8"?><BlockList>',r=0;r<t.blockIds.length;r++)o+="<Latest>"+t.blockIds[r]+"</Latest>";o+="</BlockList>",e.put(n,o,{headers:{"x-ms-blob-content-type":t.file.type},requestComingFromUploaderService:!0}).then(function(e){t.complete&&t.complete(e.data,e.status,e.headers,e.config)},function(e){t.error&&t.error(e.data,e.status,e.headers,e.config)})},r=function(e,t){for(var n=""+e;n.length<t;)n="0"+n;return n};return{upload:function(o){var r=t(o),i=new FileReader;return i.onloadend=function(t){if(t.target.readyState===FileReader.DONE&&!r.cancelled){var o=r.fileUrl+"&comp=block&blockid="+r.blockIds[r.blockIds.length-1],a=new Uint8Array(t.target.result);e.put(o,a,{headers:{"x-ms-blob-type":"BlockBlob","Content-Type":r.file.type},requestComingFromUploaderService:!0,transformRequest:[]}).then(function(e){if(!r.cancelled){r.bytesUploaded+=a.length;var t=(parseFloat(r.bytesUploaded)/parseFloat(r.file.size)*100).toFixed(2);r.progress&&r.progress(t,e.data,e.status,e.headers,e.config),n(i,r)}},function(e){r.error&&r.error(e.data,e.status,e.headers,e.config)})}},n(i,r),{cancel:function(){r.cancelled=!0}}}}}t.$inject=["$http"],e.exports=t}()},function(e,t,n){!function(){"use strict";var t=n(3);function o(e,n){var o=e.defer();return{downloadAsFile:function(e){return n.get(e.sasUrl,{cache:!1,responseType:"arraybuffer",eventHandlers:{progress:function(t){e.progress(t.loaded/t.total*100)}},headers:{"Content-Type":"application/octet-stream; charset=utf-8"},requestComingFromUploaderService:!0}).then(function(n){var r=n.headers["content-type"]||"application/octet-stream",i=new Blob([n.data],{type:r});t.saveAs(i,e.filename),o.resolve()},function(e){o.reject(e)}),o.promise}}}o.$inject=["$q","$http"],e.exports=o}()},function(e,t,n){(function(n){var o,r,i;r=[],void 0===(i="function"==typeof(o=function(){"use strict";function t(e,t,n){var o=new XMLHttpRequest;o.open("GET",e),o.responseType="blob",o.onload=function(){a(o.response,t,n)},o.onerror=function(){console.error("could not download file")},o.send()}function o(e){var t=new XMLHttpRequest;return t.open("HEAD",e,!1),t.send(),200<=t.status&&299>=t.status}function r(e){try{e.dispatchEvent(new MouseEvent("click"))}catch(n){var t=document.createEvent("MouseEvents");t.initMouseEvent("click",!0,!0,window,0,0,0,80,20,!1,!1,!1,!1,0,null),e.dispatchEvent(t)}}var i="object"==typeof window&&window.window===window?window:"object"==typeof self&&self.self===self?self:"object"==typeof n&&n.global===n?n:void 0,a=i.saveAs||"object"!=typeof window||window!==i?function(){}:"download"in HTMLAnchorElement.prototype?function(e,n,a){var l=i.URL||i.webkitURL,c=document.createElement("a");n=n||e.name||"download",c.download=n,c.rel="noopener","string"==typeof e?(c.href=e,c.origin===location.origin?r(c):o(c.href)?t(e,n,a):r(c,c.target="_blank")):(c.href=l.createObjectURL(e),setTimeout(function(){l.revokeObjectURL(c.href)},4e4),setTimeout(function(){r(c)},0))}:"msSaveOrOpenBlob"in navigator?function(e,n,i){if(n=n||e.name||"download","string"!=typeof e)navigator.msSaveOrOpenBlob(function(e,t){return void 0===t?t={autoBom:!1}:"object"!=typeof t&&(console.warn("Depricated: Expected third argument to be a object"),t={autoBom:!t}),t.autoBom&&/^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(e.type)?new Blob(["\ufeff",e],{type:e.type}):e}(e,i),n);else if(o(e))t(e,n,i);else{var a=document.createElement("a");a.href=e,a.target="_blank",setTimeout(function(){r(a)})}}:function(e,n,o,r){if((r=r||open("","_blank"))&&(r.document.title=r.document.body.innerText="downloading..."),"string"==typeof e)return t(e,n,o);var a="application/octet-stream"===e.type,l=/constructor/i.test(i.HTMLElement)||i.safari,c=/CriOS\/[\d]+/.test(navigator.userAgent);if((c||a&&l)&&"object"==typeof FileReader){var s=new FileReader;s.onloadend=function(){var e=s.result;e=c?e:e.replace(/^data:[^;]*;/,"data:attachment/file;"),r?r.location.href=e:location=e,r=null},s.readAsDataURL(e)}else{var u=i.URL||i.webkitURL,f=u.createObjectURL(e);r?r.location=f:location.href=f,r=null,setTimeout(function(){u.revokeObjectURL(f)},4e4)}};i.saveAs=a.saveAs=a,e.exports=a})?o.apply(t,r):o)||(e.exports=i)}).call(this,n(4))},function(e,t){var n;n=function(){return this}();try{n=n||new Function("return this")()}catch(e){"object"==typeof window&&(n=window)}e.exports=n}]);