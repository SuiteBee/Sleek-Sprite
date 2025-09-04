import $ from 'jquery';
import { Toolbar, ToolbarGroup } from '../../components/Toolbar';

import EditorCanvas from './EditorCanvas';
import EditorCanvasView from './EditorCanvasView';
import EditPreview from './EditPreview';
import MockSprite from './MockSprite';
import Exporter from '../export/Exporter';

class Editor {

    constructor(srcCanvas, srcTools) {
		this.$editorContainer   = $('.editor-inner');
		this.editorCanvas       = new EditorCanvas(srcCanvas);
        this.editorCanvasView   = new EditorCanvasView( this.editorCanvas, this.$editorContainer );
        //this.editPreview        = new EditPreview(this.$editorContainer);
        this.selectedSprites    = [];
        this.exporter           = new Exporter(this.selectedSprites);
        
        this.nRows = -1;
        this.nCols = -1;

        this.editSelected;
        this.mockup = [];
        this.saved = [];

        this.toolbarTop         = new Toolbar('.editor-tab', '.toolbar-container');
		this.toolbarBottom      = new Toolbar('.editor-tab', '.toolbar-bottom-container');
		
        //Editor tools
		this.toolbarTop.
            addItem(
                new ToolbarGroup('edit-all').
                addDropDown(
                    'set-all-align', 
                    'Anchor All:', 
                    'Will Overwrite Selected Anchor and Y-Nudge', 
                    'Center', 'Bottom')
            ).
            addItem(
                new ToolbarGroup('edit-grid').
                    addInput('set-rows', 'Rows:', '', '3').
                    addInput('set-columns', 'Cols:', '', '3')
            ).
            addItem('invert-bg', 'Toggle Dark Mode', {noLabel: true});

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

        this.toolbarTop.bind('invert-bg', function(event) {
			if ( event.isActive ) {
				this.editorCanvasView.setDarkMode('#fff');
			}
			else {
				this.editorCanvasView.setDarkMode('#000');
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
                
                if(isNaN(newX)){
                    this.toolbarTop.feedback(`X must be a number`);
                }else if(!this.editSelected.validNudgeX(newX)){
                    this.toolbarTop.feedback(`Must be within cell bounds: ${this.editSelected.xRangeStr}`);
                } else{  
                    this.editSelected.nudgeX = newX;
                    this.place();
                }
            }
        }.bind(this));

        this.toolbarTop.bind('edit-y', function(evt, txt) {
            if(this.editSelected){
                var newY = Number(txt);
                
                if(isNaN(newY)){
                    this.toolbarTop.feedback(`Y must be a number`);
                }else if(!this.editSelected.validNudgeY(newY)){
                    this.toolbarTop.feedback(`Must be within cell bounds: ${this.editSelected.yRangeStr}`);
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
        var $editorTabBtn = $('#tabEditor');
        $editorTabBtn.on("click", function() {

			let selectDark = srcTools.isActive('invert-bg');

			if(selectDark){
				this.toolbarTop.activate('invert-bg');
				this.editorCanvasView.setDarkMode('#000', false);
			} else{
				this.toolbarTop.deactivate('invert-bg');
				this.editorCanvasView.setDarkMode('#fff', false);
			}

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

    if(sprite){
        this.toolbarTop.
        addItem(
            new ToolbarGroup('edit-selected').
            addInput('edit-x', 'Nudge |', `Valid X-Range: ${sprite.xRangeStr}`, '5', sprite.nudgeX.toString()).
            addInput('edit-y', '', `Valid Y-Range: ${sprite.yRangeStr}`, '5', sprite.nudgeY.toString())
        ).
        addItem(
            new ToolbarGroup('edit-selected').
            addRadio('edit-anchor', 'anchor-center', 'Center', 'Anchor |', 'Anchor Selected Sprite: Center', sprite.anchor == "Center").
            addRadio('edit-anchor', 'anchor-bottom', 'Bottom', '', 'Anchor Selected Sprite: Bottom', sprite.anchor == "Bottom").
            addRadio('edit-anchor', 'anchor-previous', 'Previous', '', 'Anchor Selected Sprite: Previous', sprite.anchor == "Previous")
        ).
        addItem(
            new ToolbarGroup('edit-selected').
                addCheckbox('edit-flip-x', 'Flip |', 'Flip Sprite on X-Axis', sprite.flipX).
                addCheckbox('edit-flip-y', '', 'Flip Sprite on Y-Axis', sprite.flipY)
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
        sprite.nudgeY = 0;
    }.bind(this)); 
}

//Place sprites from mockup array onto editor canvas and draw a grid
EditorProto.place = function() {
    this.editorCanvas.reset(this.mockup, this.nRows, this.nCols);
    this.editorCanvas.drawSprites(); 
    this.editorCanvas.drawGrid();
}

export default Editor;