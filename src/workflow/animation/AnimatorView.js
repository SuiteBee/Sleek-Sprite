import $ from 'jquery';
import { Toolbar, ToolbarGroup } from '../../components/Toolbar';

import AnimatorCanvas from './AnimatorCanvas';
import AnimatorCanvasView from './AnimatorCanvasView';
import MicroEvent from '../../utilities/MicroEvent';

import Animator from './components/Animator';

class AnimatorView extends MicroEvent {
    constructor(srcCanvas) {
        super();
		var $animatorContainer    = $('.animator-inner'),
            $preview              = createPreviewComponent().appendTo($animatorContainer),
            previewCanvas         = $preview.find('canvas')[0];
            

        this.grid                 = srcCanvas.grid;
        this.animatorCanvas       = new AnimatorCanvas(srcCanvas, srcCanvas.grid);
        this.animatorCanvasView   = new AnimatorCanvasView( this.animatorCanvas, $animatorContainer );

        this.fps                = 5;
        this.sprites            = [];
        this.animation          = new Animator(this.animatorCanvas.canvas, previewCanvas);

        this.toolbarTop         = new Toolbar('.animator-tab', '.toolbar-container');
		this.toolbarBottom      = new Toolbar('.animator-tab', '.toolbar-bottom-container');
        
        this.toolbarTop.$container.addClass('top');
		this.toolbarBottom.$container.addClass('bottom');

         //Animator tools
		this.toolbarTop.
            addItem('select-none', 'Unselect All', {noLabel: true}).
            addItem('save-anim', 'Save Current Animation', {noLabel: true}).
            addItem(
				new ToolbarGroup('animate-settings').
					addInput('animate-fps', 'FPS:', '', '3', '5').
                    addInput('animate-name', 'Name:', '', '10', 'anim')
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
            addSlider('animate-zoom', '0', '200', '100').
            addSlider('animate-preview-zoom', '0', '500', '100');

        function createPreviewComponent() {
            const container = $('<div class="animation-preview-container"></div>');
            $('<div class="animation-preview-title">Preview</div>').appendTo(container);
            $('<div><canvas id="animation-preview-canvas" class="animation-preview-canvas" width="200" height="200"></canvas></div>').appendTo(container);

            return container;
        }

        this.toolbarTop.bind('invert-bg', function(evt) {
			this.setMode(!evt.isActive, true);
			this.trigger('modeChange', !evt.isActive);
		}.bind(this));

        this.toolbarBottom.bind('animate-zoom', function(evt, pct){
            this.trigger('zoomChange', pct);
        }.bind(this));

        this.toolbarBottom.bind('animate-preview-zoom', function(evt, pct){
            this.animation.zoom(pct);
        }.bind(this));

        this.toolbarTop.bind('select-none', function(event) {
			this.animatorCanvasView.unselectAllCells();
			event.preventDefault();
		}.bind(this));

        this.animatorCanvasView.bind('addFrame', function(sprite) {
			this.sprites.push(sprite);
            this.animate();
		}.bind(this));

        this.animatorCanvasView.bind('removeFrame', function(sprite) {
			this.sprites = this.sprites.filter(f => f.n != sprite.n);
            this.animate();
		}.bind(this));

        this.animatorCanvasView.bind('removeAllFrames', function(sprite) {
			this.sprites = [];
            this.animate();
		}.bind(this));

        this.toolbarTop.bind('animate-fps', function(evt, txt) {
            var newFps = Number(txt);
            
            if(isNaN(newFps)){
                this.toolbarTop.feedback(`FPS must be a number`);
            } else{  
                this.fps = newFps;
                this.animation.Update(this.fps);
            }
        }.bind(this));
    }

    animate() {
        if(this.sprites.length == 0) {
            this.animation.Stop();
        } else {
            this.animation.Queue(this.sprites, this.fps);
            this.animation.Start();
        }
    }

    activeTab(scale){
        const slider = document.getElementById('animate-zoom');
        slider.value = scale;
        this.setScale(scale);

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

    setScale(pct) {
        this.animatorCanvasView.zoom(pct);
    }
}
        
export default AnimatorView