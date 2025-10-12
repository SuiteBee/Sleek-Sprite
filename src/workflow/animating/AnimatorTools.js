import $ from 'jquery';
import { Toolbar, ToolbarGroup } from '../../components/Toolbar';

import MicroEvent from '../../utilities/MicroEvent';

class AnimatorTools extends MicroEvent {
    constructor(workspace) {
        super();

        this.workspace          = workspace;

        this.toolbarTop         = new Toolbar('.animator-tab', '.toolbar-container');
		this.toolbarBottom      = new Toolbar('.animator-tab', '.toolbar-bottom-container');

         //Animator tools
		this.toolbarTop.
            addItem('save-anim', 'Save Current Animation', {noLabel: true}).
            addItem('delete-anim', 'Delete Saved Animation', {noLabel: true}).
            addItem('select-none', 'Unselect All', {noLabel: true}).
            addItem('dupe-frame', 'Copy Frame', {noLabel: true}).
            addItem(
				new ToolbarGroup('animate-settings').
					addInput('animate-fps', 'FPS:', '', '3', '5').
                    addInput('animate-name', 'Name:', '', '10', 'new0')
			).
            addItem(
                new ToolbarGroup('animations').
                addDropDown(
                    'saved-animations', 
                    'Animations:',
                    ''
                )
            ).
            addItem('invert-bg', 'Toggle Dark Mode', {noLabel: true});

        this.toolbarBottom.
            addSlider('animate-zoom', '0', '500', '100').
            addSlider('animate-preview-zoom', '0', '1000', '100');

        this.toolbarTop.$container.addClass('top');
		this.toolbarBottom.$container.addClass('bottom');

        //////////////////////////////////////////////////
		//Workspace Events
		//////////////////////////////////////////////////

        //Cell Click
        this.workspace.bind('addFrame', function(sprite) {
			this.trigger('add-frame', sprite);
		}.bind(this));

        //Cell Click (when highlighted)
        this.workspace.bind('removeFrame', function(sprite) {
			this.trigger('remove-frame', sprite);
		}.bind(this));

        //Unselect All Frames
        this.workspace.bind('removeAllFrames', function() {
			this.trigger('remove-all');
		}.bind(this));

        //////////////////////////////////////////////////
		//Toolbar Events
		//////////////////////////////////////////////////

        //BTN Set Dark Mode
        this.toolbarTop.bind('invert-bg', function(evt) {
			this.setDisplayMode(!evt.isActive);
			this.trigger('viewMode', !evt.isActive);
		}.bind(this));

        //BTN Unselect All Frames
        this.toolbarTop.bind('select-none', function(event) {
			this.workspace.unselectAllFrames();
			event.preventDefault();
		}.bind(this));

        //BTN Copy Frame Enable/Disable
        this.toolbarTop.bind('dupe-frame', function(event) {
            this.trigger('enable-copy', !event.isActive);
        }.bind(this));

        //BTN Save Current Animation
        this.toolbarTop.bind('save-anim', function(event) {
            event.preventDefault();
            this.trigger('save-anim');
		}.bind(this));

        //BTN Delete Current Animation
        this.toolbarTop.bind('delete-anim', function(event) {
			this.trigger('delete-anim');
			event.preventDefault();
		}.bind(this));

        //DDL Animation Selected
        this.toolbarTop.bind('saved-animations', function(evt, option) {
            this.trigger('load-anim', option);
        }.bind(this));

        //TXT Animation Speed Changed
        this.toolbarTop.bind('animate-fps', function(evt, txt) {
            var newFps = Number(txt);
            
            if(isNaN(newFps)){
                this.toolbarTop.feedback(`FPS must be a number`);
            } else{  
                this.trigger('set-fps', newFps);
            }
        }.bind(this));

        //TXT Animation Name Changed
        this.toolbarTop.bind('animate-name', function(evt, txt) {
            this.trigger('set-name', txt);
        }.bind(this));

        //SLD Update Canvas Scale 
        this.toolbarBottom.bind('animate-zoom', function(evt, pct){
            this.trigger('zoomStart', pct);
        }.bind(this));

        //SLD Canvas Scale Set
        this.toolbarBottom.bind('animate-zoom-end', function(evt){
            this.trigger('zoomEnd');
        }.bind(this));

        //SLD Update Preview Scale
        this.toolbarBottom.bind('animate-preview-zoom', function(evt, pct){
            this.workspace.preview.zoom(pct, 'top right');
        }.bind(this));
    }

    updateAnimations(options, currentSelection) {
        let $ddlAnimations = $('#saved-animations');
        $ddlAnimations.empty();

        for(let i=0; i<options.length;i++){
			let $option = $(`<option value="${options[i]}">${options[i]}</option>`);
			$option.appendTo($ddlAnimations);
		}

        if(currentSelection){
            $ddlAnimations.val(currentSelection);
        } 

        if(options.length == 0) {
            $ddlAnimations.prop('disabled', true);
        } else{
            $ddlAnimations.prop('disabled', false);
        }
    }

    setAnimation(selected){
        $('#animate-name').val(selected.name);
        $('#animate-fps').val(selected.fps);
    }

    setDisplayMode(isDark){
		if(isDark){
			this.toolbarTop.activate('invert-bg');
		} else{
			this.toolbarTop.deactivate('invert-bg');
		}
	}

    updateScale(pct) {
        const slider = document.getElementById('animate-zoom');
        slider.value = pct;
    }
}
        
export default AnimatorTools