import $ from 'jquery';

import MicroEvent from '../../utilities/MicroEvent';

class Exporter extends MicroEvent {

    constructor(selectorCanvas, editorCanvas) {
        super();
		this.$exportContainer   = $('.export-container');
        this.$exportCell        = $('.export-cell');
        this.editorCanvas = editorCanvas;
    }

    activeTab() {
        $('.export-items').remove();
        $('.export-options').remove();

        this.$tableContainer = this.$exportCell.append(this.createFlexContainer()).appendTo(this.$exportContainer);
        this.$options = this.createExportOptions().appendTo(this.$exportContainer);
    }

    createFlexContainer(){
        const container = $('<div class="export-items"></div>');

        let sprites = [...this.editorCanvas.sprites];
        for(let i=0; i<sprites.length; i++){
            let sprite = sprites[i];
            let $item = this.createFlexItem(sprite);
            $item.appendTo(container);
        }

        return container;
    }

    createFlexItem(sprite){
        let $item = $('<div class="export-item"></div>');
            
        let $smallPreview = $('<canvas width="100" height="100"></canvas>');
        let smallContext = $smallPreview[0].getContext('2d');
        smallContext.drawImage(
            this.editorCanvas.canvas, sprite.rect.x, sprite.rect.y, sprite.rect.width, sprite.rect.height,
            0, 0, 100, 100
        );
        $smallPreview.addClass('small-preview').appendTo($item);

        let $txtInput = $(`<input type="text" name="export-item-${sprite.n}" id="export-item-${sprite.n}"/>`).val(sprite.n);
        $txtInput.appendTo($item);

        return $item;
    }

    createExportOptions() {
        const container = $('<div class="export-options"></div>');
        var $btnExport = $('<button>Export</button>');
        $btnExport.appendTo(container);
        
        return container;
    }
}

export default Exporter;