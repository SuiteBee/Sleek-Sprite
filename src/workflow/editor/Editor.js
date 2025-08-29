import $ from 'jquery';
import { Toolbar } from '../../components/Toolbar';
import Selected from '../../components/Selected';

import EditorCanvas from './EditorCanvas';
import EditorCanvasView from './EditorCanvasView';
import EditPreview from './EditPreview';
import MockSprite from './MockSprite';

class Editor {

    constructor(srcCanvas) {
		this.$editorContainer   = $('.adjustment-inner');
		this.editorCanvas       = new EditorCanvas(this.$editorContainer);
        this.editorCanvasView   = new EditorCanvasView( this.editorCanvas, this.$editorContainer );
        this.editPreview        = new EditPreview(this.$editorContainer);

        this.selectorCanvas     = srcCanvas;
        this.selectedSprites    = [];
        
        this.nRows = -1;
        this.nCols = -1;

        this.mockup = [];
        this.saved = [];

        this.toolbarTop         = new Toolbar('.adjustment-tab', '.toolbar-container');
		this.toolbarBottom      = new Toolbar('.adjustment-tab', '.toolbar-bottom-container');
		
        //Editor tools
		this.toolbarTop.
            addDropDown('set-all-align', 'Anchor All:', 'Center', 'Bottom').
			addInput('set-columns', 'Cols:', '3').
			addInput('set-rows', 'Rows:', '3');
            

		this.toolbarTop.$container.addClass('top');
		this.toolbarBottom.$container.addClass('bottom');

        //Toolbar events
        this.toolbarTop.bind('set-columns', function(evt, txt) {
            var cols = Number(txt);
           
            if (isNaN(cols) || cols < 0 || cols > 100) {
                this.toolbarTop.feedback("Columns must be a number between 1-100");
            } else{
                this.nCols = cols;
                this.place();
            }
		}.bind(this));

        this.toolbarTop.bind('set-rows', function(evt, txt) {
            var rows = Number(txt);

            if (isNaN(rows) || rows < 0 || rows > 100) {
                this.toolbarTop.feedback("Rows must be a number between 1-100");
            } else{
                this.nRows = rows;
                this.place();
            }
		}.bind(this));

        this.toolbarTop.bind('set-all-align', function(evt, option) {
            if(this.mockup.length > 0){
                this.align(option);
                this.place();
            }
        }.bind(this));

        //Cell selected
        this.editorCanvasView.bind('editCellChange', function(sprite) {
            this.editing(sprite);
        }.bind(this));

        //Cells unselected
        this.editorCanvasView.bind('editNone', function(){
            this.notEditing();
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

EditorProto.editing = function(sprite){
    var $editName =$('#edit-name');
    var $editX = $('#edit-x');
    var $editY = $('#edit-y');

    if($editName.length){
        $editName.val(sprite.n.toString());
        $editX.val(sprite.rect.x.toString());
        $editY.val(sprite.rect.y.toString());
    } else{
        this.toolbarTop.
        addInput('edit-name', '| Editing     Name:', '20', sprite.n.toString()).
        addInput('edit-x', 'X:', '20', sprite.rect.x.toString()).
        addInput('edit-y', 'Y:', '20', sprite.rect.y.toString());
    }
}

EditorProto.notEditing = function() {
    $('.lbl-edit-name').remove();
    $('.lbl-edit-x').remove();
    $('.lbl-edit-y').remove();
}

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