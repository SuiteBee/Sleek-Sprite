import $ from 'jquery';
import JSZip from 'jszip';

import ExportSprite from './ExportSprite';
import MicroEvent from '../../utilities/MicroEvent';
import ExportData from './ExportData';

class ExporterView extends MicroEvent {

    constructor(editorCanvas) {
        super();
		this.$exportContainer    = $('.export-container');
        this.$previewCell        = $('.export-preview-cell');
        this.$optionsCell        = $('.export-options-cell');
        this.editorCanvas        = editorCanvas;

        this.refresh             = false;
        this.exportName          = 'texture';
    }

    activeTab() {
        if(this.refresh){
            this.$previewCell.empty();
            this.$optionsCell.empty();

            this.$previewContainer = this.#fillPreview();
            this.$preview = this.$previewCell.append(this.$previewContainer).appendTo(this.$exportContainer);

            this.$optionsContainer = this.#createExportOptions();
            this.$options = this.$optionsCell.append(this.$optionsContainer).appendTo(this.$exportContainer);

            $('#export-all').on('click', function() {
                this.#bundleExport().then(zipped => {
                    this.#downloadBundle(zipped);
                });
            }.bind(this));

            $('.export-single').on('click', function(evt) {
                let idx = $(evt.target).data('index');
                let sprite = this.editorCanvas.sprites[idx];

                let url = this.#getSpriteDat(sprite);
                this.#download(url, sprite.name, '.png');
            }.bind(this));

            $('input.item-name[type=text]').on('input', function(evt) {
                let $txtInput = $(evt.target);
                let idx = $txtInput.data('index');

                let sprite = this.editorCanvas.sprites[idx];
                sprite.name = $txtInput.val();
            }.bind(this));

            $('input.export-name[type=text]').on('input', function(evt) {
                let $txtInput = $(evt.target);
                this.exportName = $txtInput.val();
            }.bind(this));

            this.refresh = false;
        }
    }

    #fillPreview(){
        const container = $('<div class="export-items"></div>');

        let sprites = [...this.editorCanvas.sprites];
        for(let i=0; i<sprites.length; i++){
            let sprite = sprites[i];
            let $item = this.#createPreviewItem(sprite);
            $item.appendTo(container);
        }

        return container;
    }

    #createPreviewItem(sprite){
        let $item = $('<div class="export-item"></div>');
            
        let $smallPreview = $('<canvas width="100" height="100"></canvas>');
        let smallContext = $smallPreview[0].getContext('2d');

        //Disable aliasing (has to be done on each resize or pixels get murdered)
        smallContext.imageSmoothingEnabled = false;

        let pos = sprite.pos;
        smallContext.drawImage(
            this.editorCanvas.canvas, pos.x, pos.y, pos.width, pos.height,
            0, 0, 100, 100
        );
        $smallPreview.addClass('small-preview').appendTo($item);

        let $txtInput = $(`<input type="text" class="item-name" name="export-item-${sprite.n}" id="export-item-${sprite.n}"/>`).val(sprite.name);
        $txtInput.data('index', sprite.n);
        $txtInput.appendTo($item);

        let $btnExportSingle = $(`<button class="export-single" id="export-single-${sprite.n}">Download</button>`);
        $btnExportSingle.data('index', sprite.n);
        $btnExportSingle.appendTo($item);

        return $item;
    }

    #createExportOptions() {
        const container = $('<div class="export-options"></div>');

        let $lblExportName = $(`<label>File Name</label>`);
        $lblExportName.appendTo(container);

        let $txtInput = $(`<input type="text" class="export-name" name="export-name" id="export-name"/>`).val(this.exportName);
        $txtInput.appendTo(container);

        var $btnExport = $('<button id="export-all">Export</button>');
        $btnExport.appendTo(container);
        
        return container;
    }

    #getJson(sprites) {
        let exSprites = [];

        for(let i=0; i<sprites.length; i++){
            let exSprite = new ExportSprite(sprites[i], sprites[i].name);
            exSprites.push(exSprite);
        }

        let dat = new ExportData(exSprites);
        return JSON.stringify(dat, null, 2);
    }

    #getJsonUrl(jString){
        let content = new Blob([jString], {type: "application/json" });
        return URL.createObjectURL(content);
    }

    #getSpriteDat(sprite) {
        let tmpCanvas = $(`<canvas style="display:none"/>`)[0];
        let tmpContext = tmpCanvas.getContext('2d');

        tmpContext.clearRect(0, 0, tmpCanvas.width, tmpCanvas.height);
        tmpCanvas.width = sprite.rect.width;
        tmpCanvas.height = sprite.rect.height;

        //Disable aliasing (has to be done on each resize or pixels get murdered)
        tmpContext.imageSmoothingEnabled = false;

        let pos = sprite.pos;
        tmpContext.drawImage(
            this.editorCanvas.canvas, pos.x, pos.y, pos.width, pos.height,
            0, 0, tmpCanvas.width, tmpCanvas.height
        );

        return tmpCanvas.toDataURL("image/png");
    }

    #getEditorDat() {
        return this.editorCanvas.canvas.toDataURL("image/png");
    }

    #download(url, fileName, ext) {
        var link = document.createElement('a');
        link.download = fileName + ext;
        link.href = url;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    #bundleExport() {
        var zip = new JSZip();

        let imgName = this.exportName + '.png';
        let imgData = this.#getEditorDat();
        let imgBase64 = imgData.split(';base64,')[1];
        zip.file(imgName, imgBase64, {base64: true});

        let jsonName = this.exportName + '.json';
        let jsonData = this.#getJson(this.editorCanvas.sprites);
        let jsonBase64 = btoa(jsonData);
        zip.file(jsonName, jsonBase64, {base64: true});

        return zip.generateAsync({type:"base64"});
    }

    #downloadBundle(zipped) {
        const dataUrl = "data:application/zip;base64," + zipped;
        this.#download(dataUrl, this.exportName, '.zip');
    }
}

export default ExporterView;