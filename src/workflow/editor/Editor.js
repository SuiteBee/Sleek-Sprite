import $ from 'jquery';
import { Toolbar } from '../../components/Toolbar';
import Selected from '../../components/Selected';

import EditorCanvas from './EditorCanvas';
import EditorCanvasView from './EditorCanvasView';
import MockSprite from './MockSprite';

class Editor {

    constructor(srcCanvas) {
		this.$editorContainer   = $('.adjustment-inner');
		this.editorCanvas       = new EditorCanvas(this.$editorContainer);
        this.selectorCanvas     = srcCanvas;
        this.selectedSprites    = [];
        this.editorCanvas.canvas.width=1000;
        this.editorCanvas.canvas.height=1000;
        this.editorCanvasView   = new EditorCanvasView( this.editorCanvas, this.$editorContainer );

        this.nRows = -1;
        this.nCols = -1;

        this.mockup = [];
        this.saved = [];

        var toolbarTop        = new Toolbar('.adjustment-tab', '.toolbar-container');
		var toolbarBottom     = new Toolbar('.adjustment-tab', '.toolbar-bottom-container');
		
        //Editor tools
		toolbarTop.
            addDropDown('set-all-align', 'Anchor All:', 'Center', 'Bottom').
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

        toolbarTop.bind('set-all-align', function(evt, option) {
            if(this.mockup.length > 0){
                this.align(option);
                this.place();
            }
        }.bind(this));

        //Editor tab activated
        var $editorTabBtn = $('#tabAdjustment');
        $editorTabBtn.on("click", function() {

            //Unselect all highlighted cells in editor
            this.editorCanvasView.unselectAllCells();

            //Pack any selected sprites into mockup[]
            if(this.selectedSprites.length > 0){
                this.pack();
            }

            //Default rows/cols setting on editor
            var defRows = 1, defCols = this.mockup.length;
            if(this.nRows <= 0 || this.nCols <= 0){
                 $('#set-rows').val(defRows.toString());
                 $('#set-columns').val(defCols.toString());

                 this.nRows = defRows;
                 this.nCols = defCols;
            }

            //Draw sliced sprites in editor
            if(this.mockup.length > 0){
                this.place();
            }
            
        }.bind(this));

    }
}

var EditorProto = Editor.prototype;

//Update sprites from selector
EditorProto.gather = function(selectedSprites) {
    this.selectedSprites = selectedSprites;
}

//Pack selected sprites into an object array
EditorProto.pack = function() {
    var srcContext = this.selectorCanvas.canvas.getContext('2d');
    this.mockup = [];
    
    this.selectedSprites.forEach(function(sprite, i) {
        let rect = sprite.rect;
        let data = srcContext.getImageData(rect.x, rect.y, rect.width, rect.height);
        this.mockup.push(new MockSprite(sprite.rect, data, i));
    }.bind(this)); 
}

EditorProto.align = function(alignOption) {
    this.mockup.forEach(function(sprite, i) {
        sprite.align = alignOption;
    }.bind(this)); 
}

//Place sprites from mockup array onto editor canvas and draw a grid
EditorProto.place = function() {
    this.editorCanvas.reset(this.mockup, this.nRows, this.nCols);
    this.editorCanvas.drawSprites(); 
    this.editorCanvas.drawGrid();
}

export default Editor;