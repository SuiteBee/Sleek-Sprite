import $ from 'jquery';
import Rect from '../spritecow/Rect';
import { drawGrid, getGridInfo } from './GridTools';

import EditorCanvas from './EditorCanvas';

class Editor {

    constructor(spriteCanvas) {
		this.$editorContainer   = $('.adjustment-inner');
		this.editorCanvas      = new EditorCanvas(this.$editorContainer);

        var $editorViewContainer = $('<div class="sprite-canvas-container"/>')
        $( this.editorCanvas.canvas ).appendTo( $editorViewContainer );
        $editorViewContainer.appendTo(this.$editorContainer);

        var $container = $('<div class="adjustment-panel"></div>').appendTo(this.$editorContainer);
        this.$properties = this.createPropertiesComponent().appendTo($container);
        this.$settings = this.createSettingsComponent().appendTo($container);

        this.$spriteCanvas = spriteCanvas;
        this.selectedSprites = [];
    }

    createPropertiesComponent() {
        const container = $('<div class="adjustment-props"></div>');

        $('<div class="panel-title">Properties</div>').appendTo(container);
        $('<div>Top Left</div>').appendTo(container);
        $('<div><span><input id="topX"/> , <input id="topY"/></span></div>').appendTo(container);
        $('<div>Dimensions</div>').appendTo(container);
        $('<div><span><input id="width"/> x <input id="height"/></span></div>').appendTo(container);
        
        return container;
    }

    createSettingsComponent() {
        const container = $('<div></div>');

        $('<div class="panel-title">Export</div>').appendTo(container);
        $('<div>File Name: <span id="fileName" data-inline-edit="file-name"/></div>').appendTo(container);
        $('<div><span id="selectedSpritesCount">0</span> sprite(s) selected!</div>').appendTo(container);
        $('<div><input id="exportButton" type="button" value="Export" title="Export as JSON"></div>').appendTo(container);
        return container;
    }

    reset = () => {
        var gInfo = getGridInfo(this.selectedSprites);
        this.editorCanvas.canvas.width = gInfo.gridWidth;
        this.editorCanvas.canvas.height = gInfo.gridHeight;

        drawGrid(this.editorCanvas, gInfo.cellSize);

        this.editorCanvas.setSprites(this.$spriteCanvas.canvas, this.selectedSprites, gInfo.cellSize);
    }

    draw = (canvas, rect) => {
        // the preview canvas has a fixed size and the sprite is resized to fit the preview panel
        const context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(
            this.$spriteCanvas, rect.x, rect.y, rect.width, rect.height,
             0, 0, canvas.width, canvas.height
            //0, 0, rect.width, rect.height 
        );
    };
}

export default Editor;