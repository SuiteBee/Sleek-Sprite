import JSZip from 'jszip';

import ExportSprite from './components/ExportSprite';
import ExportData from './components/ExportData';

export default (function() {

    function Exporter(src) {
        this.src = src;
    }
    
    var ExporterProto = Exporter.prototype;

    ExporterProto.getJson = function(sprites) {
        let exSprites = [];

        for(let i=0; i<sprites.length; i++){
            let exSprite = new ExportSprite(sprites[i], sprites[i].name);
            exSprites.push(exSprite);
        }

        let dat = new ExportData(exSprites);
        return JSON.stringify(dat, null, 2);
    }

    ExporterProto.getJsonUrl = function(jString){
        let content = new Blob([jString], {type: "application/json" });
        return URL.createObjectURL(content);
    }

    ExporterProto.getSpriteData = function(sprite, canvas) {
        let tmpContext = canvas.getContext('2d');

        tmpContext.clearRect(0, 0, canvas.width, canvas.height);
        canvas.width = sprite.rect.width;
        canvas.height = sprite.rect.height;

        //Disable aliasing (has to be done on each resize or pixels get murdered)
        tmpContext.imageSmoothingEnabled = false;

        let pos = sprite.pos;
        tmpContext.drawImage(
            this.src.canvas, pos.x, pos.y, pos.width, pos.height,
            0, 0, canvas.width, canvas.height
        );

        return canvas.toDataURL("image/png");
    }

     ExporterProto.getEditorData = function() {
        return this.src.canvas.toDataURL("image/png");
    }

    ExporterProto.download = function(url, fileName, ext) {
        var link = document.createElement('a');
        link.download = fileName + ext;
        link.href = url;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    ExporterProto.bundleDownload = function(urls, names) {
        var zip = new JSZip();

        for(let i=0; i<urls.length; i++){
            let imgName = names[i] + '.png';
            let imgData = urls[i];
            let imgBase64 = imgData.split(';base64,')[1];
            zip.file(imgName, imgBase64, {base64: true});
        }

        return zip.generateAsync({type:"base64"});
    }

    ExporterProto.bundleExport = function(name, hasMap, isSeparate) {
        var zip = new JSZip();

        let imgName = name + '.png';
        let imgData = this.getEditorData();
        let imgBase64 = imgData.split(';base64,')[1];
        zip.file(imgName, imgBase64, {base64: true});

        if(hasMap) {
            let jsonPath = name + '.json';
            let jsonData = this.getJson(this.src.sprites);
            let jsonBase64 = btoa(jsonData);

            if(isSeparate){
                jsonPath = 'data/' + jsonPath;
            }

            zip.file(jsonPath, jsonBase64, {base64: true});
        }

        return zip.generateAsync({type:"base64"});
    }

    ExporterProto.downloadBundle = function(zipped, fileName) {
        const dataUrl = "data:application/zip;base64," + zipped;
        this.download(dataUrl, fileName, '.zip');
    }

    return Exporter;
})();