import $ from 'jquery';
import { Toolbar, ToolbarGroup } from '../../components/Toolbar';

import EditorCanvas from './EditorCanvas';
import EditorCanvasView from './EditorCanvasView';
import EditPreview from './EditPreview';
import MockSprite from './MockSprite';

class Editor {

    constructor(srcCanvas) {
		this.$editorContainer   = $('.adjustment-inner');
		this.editorCanvas       = new EditorCanvas(srcCanvas);
        this.editorCanvasView   = new EditorCanvasView( this.editorCanvas, this.$editorContainer );
        this.editPreview        = new EditPreview(this.$editorContainer);

        this.selectedSprites    = [];
        
        this.nRows = -1;
        this.nCols = -1;

        this.editSelected;
        this.mockup = [];
        this.saved = [];

        this.toolbarTop         = new Toolbar('.adjustment-tab', '.toolbar-container');
		this.toolbarBottom      = new Toolbar('.adjustment-tab', '.toolbar-bottom-container');
		
        //Editor tools
		this.toolbarTop.
            addItem(
                new ToolbarGroup('edit-all').
                addDropDown('set-all-align', 'Anchor All:', 'Center', 'Bottom')
            ).
            addItem(
                new ToolbarGroup('edit-grid').
                    addInput('set-columns', 'Cols:', '3').
			        addInput('set-rows', 'Rows:', '3')
            );

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
                this.anchorAll(option);
                this.place();
                this.editorCanvasView.unselectAllCells();
            }
        }.bind(this));

        this.toolbarTop.bind('edit-anchor', function(evt, option) {
            if(this.editSelected){
                this.editSelected.anchor = option;
                this.place();
            }
        }.bind(this));

        this.toolbarTop.bind('edit-x', function(evt, txt) {
            if(this.editSelected){
                var newX = Number(txt);
                
                var minX = this.editSelected.cell.x - this.editSelected.rect.x;
                var maxX = this.editSelected.rect.x - this.editSelected.cell.x;
                
                if(isNaN(newX)){
                    this.toolbarTop.feedback(`X must be a number`);
                }else if(newX < minX || newX > maxX){
                    this.toolbarTop.feedback(`Must be within cell bounds: ${minX}-${maxX}`);
                } else{  
                    this.editSelected.nudgeX = newX;
                    this.place();
                }
            }
        }.bind(this));

        this.toolbarTop.bind('edit-y', function(evt, txt) {
            if(this.editSelected){
                var newY = Number(txt);

                var minY = this.editSelected.cell.y - this.editSelected.rect.y;
                var maxY = this.editSelected.rect.y - this.editSelected.cell.y;

                if(this.editSelected.anchor == "Bottom"){
                    maxY = 0;
                }
                
                if(isNaN(newY)){
                    this.toolbarTop.feedback(`Y must be a number`);
                }else if(newY < minY || newY > maxY){
                    this.toolbarTop.feedback(`Must be within cell bounds: ${minY}-${maxY}`);
                } else{
                    this.editSelected.nudgeY = newY;
                    this.place();
                }
            }
        }.bind(this));

        this.toolbarTop.bind('edit-flip-x', function(evt, chk) {
            if(this.editSelected){
                this.editSelected.flipX = chk;
                this.place();
            }
        }.bind(this));

        this.toolbarTop.bind('edit-flip-y', function(evt, chk) {
            if(this.editSelected){
                this.editSelected.flipY = chk;
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
            this.pack();

            //Default rows/cols setting on editor
            var defRows = 1, defCols = this.mockup.length;
            if(this.nRows <= 0 || this.nCols <= 0){
                 $('#set-rows').val(defRows.toString());
                 $('#set-columns').val(defCols.toString());

                 this.nRows = defRows;
                 this.nCols = defCols;
            }

            //Draw sliced sprites in editor
            this.place();
            
        }.bind(this));

    }
}

var EditorProto = Editor.prototype;

EditorProto.editing = function(sprite){
    this.editSelected = sprite;

    var $editX = $('#edit-x');
    var $editY = $('#edit-y');
    var $editAnchorCenter = $('#anchor-center');
    var $editAnchorBottom = $('#anchor-bottom');
    var $editAnchorPrevious = $('#anchor-previous');
    var $editFlipX = $('#edit-flip-x');
    var $editFlipY = $('#edit-flip-y');

    if($editX.length){
        $editX.val(sprite.nudgeX.toString());
        $editY.val(sprite.nudgeY.toString());

        $editAnchorCenter.prop('checked', sprite.anchor == "Center");
        $editAnchorBottom.prop('checked', sprite.anchor == "Bottom");
        $editAnchorPrevious.prop('checked', sprite.anchor == "Previous");

        $editFlipX.prop('checked', sprite.flipX);
        $editFlipY.prop('checked', sprite.flipY);

    } else{
        this.toolbarTop.
        addItem(
            new ToolbarGroup('edit-selected').
            addInput('edit-x', '| Nudge   X:', '5', sprite.nudgeX.toString()).
            addInput('edit-y', 'Y:', '5', sprite.nudgeY.toString())
        ).
        addItem(
            new ToolbarGroup('edit-selected').
            addRadio('edit-anchor', 'anchor-center', 'Center', '| Anchor   Center:', sprite.anchor == "Center").
            addRadio('edit-anchor', 'anchor-bottom', 'Bottom', 'Bottom:', sprite.anchor == "Bottom").
            addRadio('edit-anchor', 'anchor-previous', 'Previous', 'Previous:', sprite.anchor == "Previous")
        ).
        addItem(
            new ToolbarGroup('edit-selected').
                addCheckbox('edit-flip-x', 'X:', sprite.flipX).
                addCheckbox('edit-flip-y', 'Y:', sprite.flipY)
        );
    }
}

EditorProto.notEditing = function() {
    this.editSelected = null;

    $('.lbl-edit-x').remove();
    $('.lbl-edit-y').remove();
    $('.edit-selected').remove();
}

//Update sprites from selector
EditorProto.gather = function(selectedSprites) {
    this.selectedSprites = selectedSprites;
}

//Pack selected sprites into an object array
EditorProto.pack = function() {
    this.mockup = [];
    
    this.selectedSprites.forEach(function(sprite, i) {
        this.mockup.push(new MockSprite(sprite.rect, i));
    }.bind(this)); 
}

EditorProto.anchorAll = function(anchorPos) {
    this.mockup.forEach(function(sprite) {
        sprite.anchor = anchorPos;
    }.bind(this)); 
}

//Place sprites from mockup array onto editor canvas and draw a grid
EditorProto.place = function() {
    this.editorCanvas.reset(this.mockup, this.nRows, this.nCols);
    this.editorCanvas.drawSprites(); 
    this.editorCanvas.drawGrid();
}

export default Editor;