import JSZip from 'jszip';

import ExportSprite from './components/ExportSprite';
import ExportAnim from './components/ExportAnim';
import ExportData from './components/ExportData';

class ExporterController {
    constructor(editor, animator) {
        this.editor = editor;
        this.animator = animator;
    }

    get sprites() {
        return this.editor.edited;
    }

    get animations() {
        return this.animator.animations;
    }

    get srcCanvas() {
        return this.editor.window.canvas;
    }

    updateSpriteName(idx, name) {
        let sprite = this.sprites[idx];
        sprite.name = name;
    }

    //////////////////////////////////////////////////
    //JSON
    //////////////////////////////////////////////////

    getJson(fileName, includeAnimations) {
        let exSprites = [];

        //Sprite frames
        for(let i=0; i<this.sprites.length; i++){
            let exSprite = new ExportSprite(this.sprites[i], this.sprites[i].name);
            exSprites.push(exSprite);
        }

        //Json Object
        let dat = new ExportData(exSprites, fileName, this.editor.window.width, this.editor.window.height);

        if(includeAnimations) {
            let exAnims = [];

            for(let j=0; j<this.animations.length; j++){
                let exAnim = new ExportAnim(this.animations[j], this.sprites);
                exAnims.push(exAnim);
            }

            dat.AddAnimations(exAnims);
        }

        return JSON.stringify(dat, null, 2);
    }

    getJsonUrl(jString){
        let content = new Blob([jString], {type: "application/json" });
        return URL.createObjectURL(content);
    }

    //////////////////////////////////////////////////
    //Image to URL 
    //////////////////////////////////////////////////

    getSpriteData(sprite, canvas) {
        let tmpContext = canvas.getContext('2d');

        tmpContext.clearRect(0, 0, canvas.width, canvas.height);
        canvas.width = sprite.rect.width;
        canvas.height = sprite.rect.height;

        //Disable aliasing (has to be done on each resize or pixels get murdered)
        tmpContext.imageSmoothingEnabled = false;

        let pos = sprite.pos;
        tmpContext.drawImage(
            this.srcCanvas, pos.x, pos.y, pos.width, pos.height,
            0, 0, canvas.width, canvas.height
        );

        return canvas.toDataURL("image/png");
    }

    getEditorData() {
        return this.srcCanvas.toDataURL("image/png");
    }

    //////////////////////////////////////////////////
    //Archive
    //////////////////////////////////////////////////

    bundleDownload(urls, names) {
        var zip = new JSZip();

        for(let i=0; i<urls.length; i++){
            let imgName = names[i] + '.png';
            let imgData = urls[i];
            let imgBase64 = imgData.split(';base64,')[1];
            zip.file(imgName, imgBase64, {base64: true});
        }

        return zip.generateAsync({type:"base64"});
    }

    bundleExport(options) {
        var zip = new JSZip();

        let imgName = options.exportName + '.png';
        let imgData = this.getEditorData();
        let imgBase64 = imgData.split(';base64,')[1];
        zip.file(imgName, imgBase64, {base64: true});

        if(options.hasMap) {
            let jsonPath = options.exportName + '.json';
            let jsonData = this.getJson(imgName, options.hasAnim);
            let jsonBase64 = btoa(jsonData);

            if(options.isSeparate){
                jsonPath = 'data/' + jsonPath;
            }

            zip.file(jsonPath, jsonBase64, {base64: true});
        }

        return zip.generateAsync({type:"base64"});
    }

    //////////////////////////////////////////////////
    //Download
    //////////////////////////////////////////////////

    download(url, fileName, ext) {
        var link = document.createElement('a');
        link.download = fileName + ext;
        link.href = url;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    downloadSingle(idx) {
        let sprite = this.sprites[idx];

        let tmpCanvas = document.createElement('canvas');
        tmpCanvas.style.display = 'none';

        let url = this.getSpriteData(sprite, tmpCanvas);
        this.download(url, sprite.name, '.png');
    }

    downloadAll(options) {
        let urls  = [],   
            names = [];

        for(let i=0; i<this.sprites.length; i++){
            let sprite = this.sprites[i];

            let tmpCanvas = document.createElement('canvas');
            tmpCanvas.style.display = 'none';

            let url = this.getSpriteData(sprite, tmpCanvas);

            urls.push(url);
            names.push(sprite.name);
        }

        this.bundleDownload(urls, names).then(zipped => {
            this.downloadBundle(zipped, options.exportName);
        });
    }

    downloadBundle(zipped, fileName) {
        const dataUrl = "data:application/zip;base64," + zipped;
        this.download(dataUrl, fileName, '.zip');
    }

    export(options) {
        this.bundleExport(options).then(zipped => {
            this.downloadBundle(zipped, options.exportName);
        });
    }
}

export default ExporterController;