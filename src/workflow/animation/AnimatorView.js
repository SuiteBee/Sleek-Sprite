import $ from 'jquery';
import { Toolbar, ToolbarGroup } from '../../components/Toolbar';

import AnimatorCanvas from './AnimatorCanvas';
import AnimatorCanvasView from './AnimatorCanvasView';
import MicroEvent from '../../utilities/MicroEvent';

import Animator from './Animator';

class AnimatorView extends MicroEvent {
    constructor(srcCanvas) {
        super();
		var $animatorContainer    = $('.animator-inner');
        this.$preview             = createPreviewComponent().appendTo($animatorContainer);

        this.animatorCanvas       = new AnimatorCanvas(srcCanvas, srcCanvas.grid);
        this.animatorCanvasView   = new AnimatorCanvasView( this.animatorCanvas, $animatorContainer );

        this.fps = 5;
        this.frames = [];
        this.animation = new Animator(this.$preview);

        this.toolbarTop         = new Toolbar('.animator-tab', '.toolbar-container');
		this.toolbarBottom      = new Toolbar('.animator-tab', '.toolbar-bottom-container');

        function createPreviewComponent() {
            const container = $('<div class="edit-preview-container"></div>');
            $('<div class="panel-title">Preview</div>').appendTo(container);
            $('<div><canvas id="edit-preview-canvas" class="panel-sprite-selected" width="200" height="200"></canvas></div>').appendTo(container);

            return container;
        }
    }

    activeTab(){
        //Unselect all 
        //Refresh animatorCanvas to match editor
        this.animatorCanvas.reset();
    }

    setMode(dark, anim){
		if(dark){
			this.toolbarTop.activate('invert-bg');
			this.animatorCanvasView.setDarkMode('#000', anim);
		} else{
			this.toolbarTop.deactivate('invert-bg');
			this.animatorCanvasView.setDarkMode('#fff', anim);
		}
	};
}
        
export default AnimatorView