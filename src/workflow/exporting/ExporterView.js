import $ from 'jquery';

import Exporter from './Exporter';
import ExportOptions from './components/ExportOptions';
import MicroEvent from '../../utilities/MicroEvent';


class ExporterView extends MicroEvent {

    constructor(editorCanvas, animatorView) {
        super();

        this.exporter            = new Exporter(editorCanvas, animatorView);
		this.$exportContainer    = $('.export-container');
        this.$previewCell        = $('.export-preview-cell');
        this.$optionsCell        = $('.export-options-cell');
        this.editorCanvas        = editorCanvas;

        this.refresh             = false;
        this.options             = new ExportOptions();

        this.#buildExportOptions();
    }

    activeTab() {
        if(this.refresh){
            //Clear previews
            this.$previewCell.empty();
            this.#buildExportPreview();

            $('#export-all').on('click', function() {
                this.exporter.bundleExport(this.options).then(zipped => {
                    this.exporter.downloadBundle(zipped, this.options.exportName);
                });
            }.bind(this));

            $('.download-single').on('click', function(evt) {
                let idx = $(evt.target).data('index');
                let sprite = this.editorCanvas.sprites[idx];

                let tmpCanvas = $(`<canvas style="display:none"/>`)[0];
                let url = this.exporter.getSpriteData(sprite, tmpCanvas);
                this.exporter.download(url, sprite.name, '.png');
            }.bind(this));

            $('#download-all').on('click', function(evt) {            
                let urls = [],   
                    names = [];

                for(let i=0; i<this.editorCanvas.sprites.length; i++){
                    let sprite = this.editorCanvas.sprites[i];

                    let tmpCanvas = $(`<canvas style="display:none"/>`)[0];
                    urls.push(this.exporter.getSpriteData(sprite, tmpCanvas));
                    names.push(sprite.name);
                }

                this.exporter.bundleDownload(urls, names).then(zipped => {
                    this.exporter.downloadBundle(zipped, this.options.exportName);
                });
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

            $('input.export-json[type=checkbox]').on('change', function(evt) {
                let $chkJson = $(evt.target);
                this.options.hasMap = $chkJson.prop('checked');

                //Dependencies
                let $chkSeparate = $('#export-separate');
                $chkSeparate.prop('disabled', !this.options.hasMap);

                let $chkAnim = $('#export-animations');
                $chkAnim.prop('disabled', !this.options.hasMap);

                if(!this.options.hasMap){
                    $chkSeparate.prop('checked', false);
                    $chkAnim.prop('checked', false);
                } 
            }.bind(this));

             $('input.export-separate[type=checkbox]').on('change', function(evt) {
                let $chkSeparate = $(evt.target);
                this.options.isSeparate = $chkSeparate.prop('checked');
            }.bind(this));

            $('input.export-animations[type=checkbox]').on('change', function(evt) {
                let $chkAnim = $(evt.target);
                this.options.hasAnim = $chkAnim.prop('checked');
            }.bind(this));

            this.refresh = false;
        }
    }

    #buildExportPreview() {
        var $previewToolbar = $('<div class="toolbar top"></div>'),
            $lblName = $('<div><h2>Naming</h2></div>'),
            
            $tipName = $('<div class="tooltip tipName"></div>'),
            txtTipName = 'Note: Images here may be stretched. This is for display purposes only. Download and export sprites will remain in perspective.',
            $tipTxt = $(`<div class="tooltipText">${txtTipName}</div>`),
            
            $previewItems   = this.#fillPreview();
            
            $tipName.append($tipTxt);
            $lblName.append($tipName);
            $previewToolbar.append($lblName);

            this.$previewCell.append($previewToolbar);
            this.$previewCell.append($previewItems);
            this.$previewCell.prependTo(this.$exportContainer);
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

        let $btnDownloadSingle = $(`<button class="download-single" id="download-single-${sprite.n}">Download</button>`);
        $btnDownloadSingle.data('index', sprite.n);
        $btnDownloadSingle.appendTo($item);

        return $item;
    }

    #buildExportOptions() {
        var $optionsToolbar   = $('<div class="toolbar top"><h2>Options</h2></div>'),
            $optionsContainer = this.#createExportOptions();

        this.$optionsCell.append($optionsToolbar);
        this.$optionsCell.append($optionsContainer);
        this.$optionsCell.appendTo(this.$exportContainer);
    }

    #createExportOptions() {
        const container = $('<div class="export-options"></div>');

        let $lblExportName = $(`<label>File Name</label>`).css('font-weight', 'bold');
        $lblExportName.appendTo(container);

        let $txtInput = $(`<input type="text" class="export-name" name="export-name" id="export-name"/><hr>`).val(this.options.exportName);
        $txtInput.appendTo(container);

        let $spnJson = $('<span></span>');
        let $chkJson = $(`<input type="checkbox" class="export-json" name="export-json" id="export-json"/>`).prop('checked', true);
        $chkJson.appendTo($spnJson);
        
        let $lblJson = $(`<label>Include JSON</label>`);
        $lblJson.appendTo($spnJson);
        $spnJson.appendTo(container);

        let $spnSeparate = $('<span></span>');
        let $chkSeparate = $(`<input type="checkbox" class="export-separate" name="export-separate" id="export-separate"/>`);
        $chkSeparate.appendTo($spnSeparate);

        let $lblSeparate = $(`<label>Separate Data Directory</label>`);
        $lblSeparate.appendTo($spnSeparate);
        $spnSeparate.appendTo(container);

        let $spanAnimations = $('<span></span>');
        let $chkAnimatinos = $(`<input type="checkbox" class="export-animations" name="export-animations" id="export-animations"/>`);
        $chkAnimatinos.appendTo($spanAnimations);

        let $lblAnimations = $(`<label>Include Animations</label>`);
        $lblAnimations.appendTo($spanAnimations);
        $spanAnimations.appendTo(container);

        let $btnExport = $('<button id="export-all">Export</button>');
        $btnExport.appendTo(container);

        let $lblDownload = $(`<hr><label>Individual Sprites</label>`).css('font-weight', 'bold');
        $lblDownload.appendTo(container);
        
        let $btnDownload = $('<button id="download-all">Download All</button>');
        $btnDownload.appendTo(container);

        return container;
    }
}

export default ExporterView;