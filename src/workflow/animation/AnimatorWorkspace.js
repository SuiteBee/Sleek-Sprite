import $ from 'jquery';

import Rect from '../../components/Rect';
import ActiveSprite from '../../components/ActiveSprite';

import MicroEvent from '../../utilities/MicroEvent';
import Highlight from '../../utilities/highlight';
import SelectArea from '../../utilities/selectArea';

import AnimatorPreview from './AnimatorPreview';

class AnimatorWorkspace extends MicroEvent {
	constructor(animatorWindow) {
		super();
        
		this.selected 		= [];
		this.window   		= animatorWindow;

		var $parent    		= $('.animator-inner'),
            $preview        = this.createPreviewComponent().appendTo($parent),
            previewCanvas   = $preview.find('canvas')[0];

		this.$container 	= $('<div class="animator-canvas-container"/>');
		this.$canvas 		= this.$container.append($(animatorWindow.canvas)).append($(animatorWindow.grid.canvas));
		this.$canvasBg		= $parent;

		this.highlight 		= new Highlight(this.$container);
		this.selectArea 	= new SelectArea(this.$container, this.$canvas, this.highlight);
		this.preview        = new AnimatorPreview(this.window.canvas, previewCanvas);

        this.selectArea.activate();
		this.$container.appendTo($parent);

		this.selectArea.bind('select', function (clickedRect) {
			const rect = Object.assign({}, clickedRect);
			let idx = this.window.grid.find(rect);
			this.trigger('click-cell', clickedRect, idx);
		}.bind(this));
	}

	createPreviewComponent() {
		const container = $('<div class="animation-preview-container"></div>');
		$('<div class="animation-preview-title">Preview</div>').appendTo(container);
		$('<div><canvas id="animation-preview-canvas" class="animation-preview-canvas" width="200" height="200"></canvas></div>').appendTo(container);

		return container;
	}

	selectCell(click, sprite){
		this.#handleSelectedCell(click, sprite);
	}

	unselectAllCells() {
		if(this.selected.length > 0) {
			this.selected.forEach(cell => cell.unselect());
			this.selected = [];
		}

		this.trigger('removeAllFrames', this.selected);
	}
	
	loadAnimation(frames, sprites) {
		this.unselectAllCells()

		for(let i=0; i<frames.length; i++){
			let idx = frames[i];
			let sprite = sprites[idx];

			let scaledRect = sprite.cell.scaled(this.window.grid.scale);
			let cell = this.#loadActiveCell(scaledRect);

			this.selected.push(cell);
			this.trigger('addFrame', sprite);
		}
	}

	setDisplayMode(isDark, anim = true) {
		let color = isDark ? '#000' : '#fff';
		
		if ( $.support.transition && anim ) {
			this.$canvasBg.transition({ 'background-color': color }, {
				duration: 500
			});								
		}
		else {
			this.$canvasBg.css({ 'background-color': color });
		}

		this.highlight.setDisplayMode(isDark);

		for(let i=0; i<this.selected.length; i++){
			this.selected[i].highlight.setDisplayMode(isDark);
		}
	}

	setScale(pct) {
		this.unselectAllCells();
		this.window.zoom(pct);
		this.window.grid.zoom(pct);
	}

	#handleSelectedCell(clickedRect, sprite) {
		let scaledRect = sprite.cell.scaled(this.window.grid.scale);

		const cellSelected = this.selected.findIndex(cell => JSON.stringify(cell.rect) == JSON.stringify(scaledRect));
		if(cellSelected > -1) {
			this.selected[cellSelected].unselect();
			this.selected.splice(cellSelected, 1);
			this.trigger('removeFrame', sprite);
		} else {
			let cell = this.#getActiveCell(clickedRect, scaledRect);
			this.selected.push(cell);
			this.trigger('addFrame', sprite);
		}
	}

	
	#getActiveCell(clickedRect, cellRect) {
		const bbox = new Highlight(this.$container);
		bbox.setDisplayMode(this.highlight.highVis);
		bbox.moveTo(clickedRect); // move to clicked area so the animation starts from click position

		return new ActiveSprite(cellRect, bbox);
	}

	#loadActiveCell(cellRect) {
		const bbox = new Highlight(this.$container);
		const clickedRect = new Rect(cellRect.x, cellRect.y, 1, 1);

		bbox.setDisplayMode(this.highlight.highVis);
		bbox.moveTo(clickedRect, false);

		return new ActiveSprite(cellRect, bbox);
	}
}

export default AnimatorWorkspace;