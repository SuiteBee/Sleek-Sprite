import $ from 'jquery';

import ExportOptions from './components/ExportOptions';

import MicroEvent from '../../utilities/MicroEvent';

class ExporterView extends MicroEvent {

    constructor(controller) {
        super();

        this.controller          = controller;
        this.options             = new ExportOptions();

		this.$exportContainer    = $('.export-container');
        this.$previewCell        = $('.export-preview-cell');
        this.$optionsCell        = $('.export-options-cell');

        this.#buildExportOptions();
    }

    init() {
        //Clear previews
        this.$previewCell.empty();
        this.#buildExportPreview();

        $('#export-all').on('click', function() {
            this.controller.export(this.options);
        }.bind(this));

        $('.download-single').on('click', function(evt) {
            let idx = $(evt.target).data('index');
            this.controller.downloadSingle(idx);
        }.bind(this));

        $('#download-all').on('click', function(evt) {            
            this.controller.downloadAll(this.options);
        }.bind(this));

        $('input.item-name[type=text]').on('input', function(evt) {
            let $txtInput = $(evt.target);
            let idx = $txtInput.data('index');

            this.controller.updateSpriteName(idx, $txtInput.val());
        }.bind(this));

        $('input.export-name[type=text]').on('input', function(evt) {
            let $txtInput = $(evt.target);
            this.options.exportName = $txtInput.val();
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
    }

    #buildExportPreview() {
        var $previewToolbar = $('<div class="toolbar top"></div>'),
            $lblName = $('<div class="export-label-name"><h2>Naming</h2></div>'),
            
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

        let sprites = [...this.controller.sprites];
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
            this.controller.srcCanvas, pos.x, pos.y, pos.width, pos.height,
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