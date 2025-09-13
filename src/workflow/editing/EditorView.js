import $ from 'jquery';
import { Toolbar, ToolbarGroup } from '../../components/Toolbar';

import EditorCanvas from './EditorCanvas';
import EditorCanvasView from './EditorCanvasView';
import EditSprite from './EditSprite';
import MicroEvent from '../../utilities/MicroEvent';

class EditorView extends MicroEvent {

    constructor(srcCanvas) {
        super();
		var $editorContainer    = $('.editor-inner');
		
        this.editorCanvas       = new EditorCanvas(srcCanvas);
        this.editorCanvasView   = new EditorCanvasView( this.editorCanvas, $editorContainer );

        this.refresh            = false;

        this.nRows              = -1;
        this.nCols              = -1;

        this.selectedSprites    = [];
        this.editSelected;
        this.editedSprites      = [];

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

        this.toolbarBottom.
            addSlider('zoom', '0', '200', '100');

        //Selected Tools
        this.toolbarTop.
            addItem(
                new ToolbarGroup('edit-selected').
                addInput('edit-x', 'Nudge |', '', '5', '').
                addInput('edit-y', '', '', '5', '')
            ).
            addItem(
                new ToolbarGroup('edit-selected').
                addRadio('edit-anchor', 'anchor-center', 'Center', 'Anchor |', 'Anchor Selected Sprite: Center', true).
                addRadio('edit-anchor', 'anchor-bottom', 'Bottom', '', 'Anchor Selected Sprite: Bottom', false).
                addRadio('edit-anchor', 'anchor-previous', 'Previous', '', 'Anchor Selected Sprite: Previous', false)
            ).
            addItem(
                new ToolbarGroup('edit-selected').
                addCheckbox('edit-flip-x', 'Flip |', 'Flip Sprite on X-Axis', false).
                addCheckbox('edit-flip-y', '', 'Flip Sprite on Y-Axis', false));

		this.toolbarTop.$container.addClass('top');
		this.toolbarBottom.$container.addClass('bottom');

        //Toolbar events
        this.toolbarTop.bind('set-columns', function(evt, txt) {
            var cols = Number(txt);
           
            if (isNaN(cols) || cols < 0 || cols > 100) {
                this.toolbarTop.feedback("Columns must be a number between 1-100");
            } else{
                this.nCols = cols;
                this.#place();
            }
		}.bind(this));

        this.toolbarTop.bind('set-rows', function(evt, txt) {
            var rows = Number(txt);

            if (isNaN(rows) || rows < 0 || rows > 100) {
                this.toolbarTop.feedback("Rows must be a number between 1-100");
            } else{
                this.nRows = rows;
                this.#place();
            }
		}.bind(this));

        this.toolbarTop.bind('set-all-align', function(evt, option) {
            if(this.editedSprites.length > 0){
                this.#anchorAll(option);
                this.#place();
                this.editorCanvasView.unselectAllCells();
            }
        }.bind(this));

        this.toolbarTop.bind('invert-bg', function(evt) {
			this.setMode(!evt.isActive, true);
			this.trigger('modeChange', !evt.isActive);
		}.bind(this));

        //Selected Events
        this.toolbarTop.bind('edit-anchor', function(evt, option) {
            if(this.editSelected){
                this.editSelected.anchor = option;
                this.#placeSingle(this.editSelected.n);
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
                    this.#placeSingle(this.editSelected.n);
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
                    this.#placeSingle(this.editSelected.n);
                }
            }
        }.bind(this));

        this.toolbarTop.bind('edit-flip-x', function(evt, chk) {
            if(this.editSelected){
                this.editSelected.flipX = chk;
                this.#placeSingle(this.editSelected.n);
            }
        }.bind(this));

        this.toolbarTop.bind('edit-flip-y', function(evt, chk) {
            if(this.editSelected){
                this.editSelected.flipY = chk;
                this.#placeSingle(this.editSelected.n);
            }
        }.bind(this));

        //Cell selected
        this.editorCanvasView.bind('editCellChange', function(sprite) {
            this.#editing(sprite);
        }.bind(this));

        //Cells unselected
        this.editorCanvasView.bind('editNone', function(){
            this.#notEditing();
        }.bind(this));

        //Zoom 
        this.toolbarBottom.bind('zoom', function(evt, pct){
            this.editorCanvasView.zoom(pct);
        }.bind(this));
    }

    activeTab(){
        //Unselect all highlighted cells in editor
        this.editorCanvasView.unselectAllCells();
        this.#notEditing();

        //Don't redraw grid unless sprite selection changed
        if(this.refresh){
            //Pack any selected sprites into editedSprites[]
            this.#pack();

            //Set automatic grid dimensions
            if(this.editedSprites.length > 0){
                let nearestRoot = Math.sqrt(this.editedSprites.length);
                let nearestSquare = Math.ceil(nearestRoot);

                $('#set-rows').val(nearestSquare.toString());
                $('#set-columns').val(nearestSquare.toString());

                this.nRows = nearestSquare;
                this.nCols = nearestSquare;
            }

            //Draw sliced sprites in editor
            this.#place();
            this.refresh = false;
        }
    }

    setMode(dark, anim){
		if(dark){
			this.toolbarTop.activate('invert-bg');
			this.editorCanvasView.setDarkMode('#000', anim);
		} else{
			this.toolbarTop.deactivate('invert-bg');
			this.editorCanvasView.setDarkMode('#fff', anim);
		}
	};

    //Update sprites from selector
    gather(selectedSprites) {
        this.selectedSprites = selectedSprites;
    }

    #editing(sprite){
        this.editSelected = sprite;
        
        if(sprite){
            $('#edit-x').data('hint', `Valid X-Range: ${sprite.xRangeStr}`).val(sprite.nudgeX.toString());
            $('#edit-y').data('hint', `Valid Y-Range: ${sprite.yRangeStr}`).val(sprite.nudgeY.toString());
            
            $('#anchor-center').prop('checked', sprite.anchor == "Center");
            $('#anchor-bottom').prop('checked', sprite.anchor == "Bottom");
            $('#anchor-previous').prop('checked', sprite.anchor == "Previous");

            $('#edit-flip-x').prop('checked', sprite.flipX);
            $('#edit-flip-y').prop('checked', sprite.flipY);
        }
        $('.edit-selected').show();
    }

    #notEditing(){
        this.editSelected = null;
        $('.edit-selected').hide();
    }

    //Pack selected sprites into an object array
    #pack() {
        this.editedSprites = [];
        
        this.selectedSprites.forEach(function(sprite, i) {
            this.editedSprites.push(new EditSprite(sprite.rect, i));
        }.bind(this)); 
    }

    //Place sprites from editedSprites array onto editor canvas and draw a grid
    #place() {
        this.editorCanvas.reset(this.editedSprites, this.nRows, this.nCols);
        this.editorCanvas.drawAll(true); 
    }

    #placeSingle(index) {
        this.editorCanvas.drawSingle(index);
    }

    #anchorAll(anchorPos) {
        this.editedSprites.forEach(function(sprite) {
            sprite.anchor = anchorPos;
            sprite.nudgeY = 0;
        }.bind(this)); 
    }
}

export default EditorView;