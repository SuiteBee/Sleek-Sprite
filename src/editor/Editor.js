import $ from 'jquery';
import { drawGrid, initGrid } from './GridTools';
import {Toolbar, ToolbarGroup} from '../spritecow/Toolbar';

import EditorCanvas from './EditorCanvas';
import MockSprite from '../sprite/MockSprite';

class Editor {

    constructor() {
		this.$editorContainer   = $('.adjustment-inner');
		this.editorCanvas       = new EditorCanvas(this.$editorContainer);

        var $editorViewContainer = $('<div class="sprite-canvas-container"/>');
        $( this.editorCanvas.canvas ).appendTo( $editorViewContainer );
        $editorViewContainer.appendTo(this.$editorContainer);

        this.mockup = [];

        var toolbarTop        = new Toolbar('.adjustment-tab', '.toolbar-container');
		var toolbarBottom     = new Toolbar('.adjustment-tab', '.toolbar-bottom-container');
		
		toolbarTop.
			addInput('set-columns', 'Cols:').
			addInput('set-rows', 'Rows:');

		toolbarTop.$container.addClass('top');
		toolbarBottom.$container.addClass('bottom');

        //Event Listeners
        toolbarTop.bind('set-columns', function(n) {
            var cols = $('#set-rows').text();
			this.place(n, cols);
		}.bind(this));

        toolbarTop.bind('set-rows', function(n) {
            var rows = $('#set-columns').text();
			this.place(rows, n);
		}.bind(this));
    }
}

var EditorProto = Editor.prototype;

EditorProto.gather = function(srcCanvas, selectedSprites) {
    var srcContext = srcCanvas.getContext('2d');
    this.mockup = [];
    
    selectedSprites.forEach(function(sprite, i) {
        let rect = sprite.rect;
        let data = srcContext.getImageData(rect.x, rect.y, rect.width, rect.height);
        this.mockup.push(new MockSprite(sprite.rect, data, i));
    }.bind(this)); 
}

EditorProto.place = function(rows, columns) {
    var gInfo = initGrid(this.mockup, rows, columns);
    this.editorCanvas.init(gInfo);

    this.editorCanvas.placeSprites(this.mockup, gInfo.cellSize); 
    drawGrid(this.editorCanvas, gInfo.cellSize);
}

export default Editor;