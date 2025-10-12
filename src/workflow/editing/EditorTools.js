import $ from 'jquery';
import { Toolbar, ToolbarGroup } from '../../components/Toolbar';

import MicroEvent from '../../utilities/MicroEvent';

class EditorTools extends MicroEvent {

    constructor(workspace) {
        super();

        this.workspace          = workspace;
        this.editSelected       = null;

        this.toolbarTop         = new Toolbar('.editor-tab', '.toolbar-container');
		this.toolbarBottom      = new Toolbar('.editor-tab', '.toolbar-bottom-container');
		
        //Editor tools
		this.toolbarTop.
            addItem(
                new ToolbarGroup('edit-ticks').
                addCheckbox('edit-show-ticks', 'Ticks: ', 'Show Tick Marks', false)
            ).
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
            addSlider('editor-zoom', '0', '500', '100');

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

        //////////////////////////////////////////////////
		//Workspace Events
		//////////////////////////////////////////////////

        //Cell Selected
        this.workspace.bind('editCellChange', function(sprite) {
            this.#editing(sprite);
        }.bind(this));

        //Cells Unselected
        this.workspace.bind('editNone', function(){
            this.clearSelection();
        }.bind(this));

        //////////////////////////////////////////////////
		//Toolbar Events (All Cells)
		//////////////////////////////////////////////////

        //CHK Ticks
        this.toolbarTop.bind('edit-show-ticks', function(evt, chk) {
            this.trigger('show-ticks', chk);
        }.bind(this));

        //TXT Columns Changed
        this.toolbarTop.bind('set-columns', function(evt, txt) {
            var cols = Number(txt);
           
            if (isNaN(cols) || cols < 0 || cols > 100) {
                this.toolbarTop.feedback("Columns must be a number between 1-100");
            } else{
                this.trigger('set-columns', cols);
                this.trigger('place-all');
            }
		}.bind(this));

        //TXT Rows Changed
        this.toolbarTop.bind('set-rows', function(evt, txt) {
            var rows = Number(txt);

            if (isNaN(rows) || rows < 0 || rows > 100) {
                this.toolbarTop.feedback("Rows must be a number between 1-100");
            } else{
                this.trigger('set-rows', rows);
                this.trigger('place-all');
            }
		}.bind(this));

        //DDL Anchor Changed
        this.toolbarTop.bind('set-all-align', function(evt, option) {
            this.trigger('set-anchor', option);
            this.trigger('place-all');
        }.bind(this));

        //BTN Set Dark Mode
        this.toolbarTop.bind('invert-bg', function(evt) {
			this.setDisplayMode(!evt.isActive);
			this.trigger('viewMode', !evt.isActive);
		}.bind(this));

        //RAD Single Anchor Change 
        this.toolbarTop.bind('edit-anchor', function(evt, option) {
            if(this.editSelected){
                this.editSelected.anchor = option;
                this.trigger('place-single', this.editSelected.n);
            }
        }.bind(this));

        //SLD Update Canvas Scale 
        this.toolbarBottom.bind('editor-zoom', function(evt, pct){
            this.trigger('zoomStart', Number(pct));
        }.bind(this));

        //SLD Canvas Scale Set
        this.toolbarBottom.bind('editor-zoom-end', function(evt){
            this.trigger('zoomEnd');
        }.bind(this));

        //////////////////////////////////////////////////
		//Toolbar Events (Selected Cell)
		//////////////////////////////////////////////////

        //TXT X Nudge Pos Changed
        this.toolbarTop.bind('edit-x', function(evt, txt) {
            if(this.editSelected){
                var newX = Number(txt);
                
                if(isNaN(newX)){
                    this.toolbarTop.feedback(`X must be a number`);
                }else if(!this.editSelected.validNudgeX(newX)){
                    this.toolbarTop.feedback(`Must be within cell bounds: ${this.editSelected.xRangeStr}`);
                } else{  
                    this.editSelected.nudgeX = newX;
                    this.trigger('place-single', this.editSelected.n);
                }
            }
        }.bind(this));

        //TXT Y Nudge Pos Changed
        this.toolbarTop.bind('edit-y', function(evt, txt) {
            if(this.editSelected){
                var newY = Number(txt);
                
                if(isNaN(newY)){
                    this.toolbarTop.feedback(`Y must be a number`);
                }else if(!this.editSelected.validNudgeY(newY)){
                    this.toolbarTop.feedback(`Must be within cell bounds: ${this.editSelected.yRangeStr}`);
                } else{
                    this.editSelected.nudgeY = newY;
                    this.trigger('place-single', this.editSelected.n);
                }
            }
        }.bind(this));

        //CHK Flip X-Axis
        this.toolbarTop.bind('edit-flip-x', function(evt, chk) {
            if(this.editSelected){
                this.editSelected.flipX = chk;
                this.trigger('place-single', this.editSelected.n);
            }
        }.bind(this));

        //CHK Flip Y-Axis
        this.toolbarTop.bind('edit-flip-y', function(evt, chk) {
            if(this.editSelected){
                this.editSelected.flipY = chk;
                this.trigger('place-single', this.editSelected.n);
            }
        }.bind(this));
    }

    init(nearestSquare){
        let anchorPos = $('#set-all-align').val();
        this.trigger('set-anchor', anchorPos);

        //Set automatic grid dimensions
        if(nearestSquare > 0){
            $('#set-rows').val(nearestSquare.toString());
            $('#set-columns').val(nearestSquare.toString());

            this.trigger('set-rows', nearestSquare);
            this.trigger('set-columns', nearestSquare);
        }
    }

    updateScale(pct) {
        const slider = document.getElementById('editor-zoom');
        slider.value = pct;
    }

    setDisplayMode(isDark){
		if(isDark){
			this.toolbarTop.activate('invert-bg');
		} else{
			this.toolbarTop.deactivate('invert-bg');
		}
	}

    clearSelection(){
        this.editSelected = null;
        $('.edit-selected').hide();
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
}

export default EditorTools;