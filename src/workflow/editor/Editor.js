import $ from 'jquery';
import { drawGrid, initGrid } from './GridTools';
import { Toolbar } from '../../components/Toolbar';

import EditorCanvas from './EditorCanvas';
import MockSprite from './MockSprite';

class Editor {

    constructor() {
		this.$editorContainer   = $('.adjustment-inner');
		this.editorCanvas       = new EditorCanvas(this.$editorContainer);
        
        var $editorViewContainer = $('<div class="sprite-canvas-container"/>');
        $( this.editorCanvas.canvas ).appendTo( $editorViewContainer );
        $editorViewContainer.appendTo(this.$editorContainer);

        this.nRows = -1;
        this.nCols = -1;

        this.mockup = [];
        this.saved = [];

        var toolbarTop        = new Toolbar('.adjustment-tab', '.toolbar-container');
		var toolbarBottom     = new Toolbar('.adjustment-tab', '.toolbar-bottom-container');
		
        //Editor tools
		toolbarTop.
			addInput('set-columns', 'Cols:').
			addInput('set-rows', 'Rows:');

		toolbarTop.$container.addClass('top');
		toolbarBottom.$container.addClass('bottom');

        //Toolbar events
        toolbarTop.bind('set-columns', function(evt, txt) {
            var cols = Number(txt);
           
            if (isNaN(cols) || cols < 0 || cols > 100) {
                toolbarTop.feedback("Columns must be a number between 1-100");
            } else{
                this.nCols = cols;
                this.place();
            }
		}.bind(this));

        toolbarTop.bind('set-rows', function(evt, txt) {
            var rows = Number(txt);

            if (isNaN(rows) || rows < 0 || rows > 100) {
                toolbarTop.feedback("Rows must be a number between 1-100");
            } else{
                this.nRows = rows;
                this.place();
            }
		}.bind(this));

        //Editor tab activated
        var $editorTabBtn = $('#tabAdjustment');
        $editorTabBtn.on("click", function() {
            var defRows = 1, defCols = this.mockup.length;

            if(this.nRows <= 0 || this.nCols <= 0){
                 $('#set-rows').val(defRows.toString());
                 $('#set-columns').val(defCols.toString());

                 this.nRows = defRows;
                 this.nCols = defCols;
            }

            if(this.mockup.length > 0){
                this.place();
            }
            
        }.bind(this));
        

        
    }
}

var EditorProto = Editor.prototype;

//Pack selected sprites into an array
EditorProto.gather = function(srcCanvas, selectedSprites) {
    var srcContext = srcCanvas.getContext('2d');
    this.mockup = [];
    
    selectedSprites.forEach(function(sprite, i) {
        let rect = sprite.rect;
        let data = srcContext.getImageData(rect.x, rect.y, rect.width, rect.height);
        this.mockup.push(new MockSprite(sprite.rect, data, i));
    }.bind(this)); 
}

//Place sprites from mockup array onto editor canvas and draw a grid
EditorProto.place = function() {
    var gInfo = initGrid(this.mockup, this.nRows, this.nCols);
    this.editorCanvas.init(gInfo);

    this.editorCanvas.drawSprites(this.mockup, gInfo.cellSize, this.nRows, this.nCols); 
    drawGrid(this.editorCanvas, gInfo.cellSize);
}

EditorProto.find = function(mousePos) {
    if(mousePos.x <= this.editorCanvas.width && mousePos.y <= this.editorCanvas.height){
        var found = this.mockup.find(sprite => 
            (mousePos.x > sprite.cell.x) && 
            (mousePos.x < sprite.cell.x + sprite.cell.width) &&
            (mousePos.y > sprite.cell.y) &&
            (mousePos.y < sprite.cell.y + sprite.cell.height)
        )

        if(found){
            //Display properties
        }
    }
    
}

export default Editor;