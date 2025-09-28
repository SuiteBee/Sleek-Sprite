import $ from 'jquery';

import Workspace from '../../components/Workspace';

import Highlight from '../../utilities/highlight';
import SelectArea from '../../utilities/selectArea';

import AnimatorPreview from './AnimatorPreview';

class AnimatorWorkspace extends Workspace {
	constructor(animatorWindow) {
		super(animatorWindow);

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
		$('<div><canvas id="animation-preview-canvas" class="animation-preview-canvas" width="200" height="200"></canvas></div>').appendTo(container);

		return container;
	}

	selectCell(click, sprite){
		this.#handleClick(click, sprite);
	}
	
	loadAnimation(frames, sprites) {
		this.unselectAllFrames()

		for(let i=0; i<frames.length; i++){
			let idx = frames[i];
			let sprite = sprites[idx];

			let scaledRect = sprite.cell.scaled(this.window.grid.scale);
			let cell = this.loadActive(scaledRect);

			this.activeSelections.push(cell);
			this.trigger('addFrame', sprite);
		}
	}

	setScale(pct) {
		this.unselectAllFrames();
		this.window.zoom(pct);
		this.window.grid.zoom(pct);
	}

	#handleClick(clickedRect, sprite) {
		let scaledRect = sprite.cell.scaled(this.window.grid.scale);

		const cellSelected = this.activeSelections.findIndex(cell => JSON.stringify(cell.rect) == JSON.stringify(scaledRect));
		if(cellSelected > -1) {
			this.activeSelections[cellSelected].unselect();
			this.activeSelections.splice(cellSelected, 1);
			this.trigger('removeFrame', sprite);
		} else {
			let cell = this.getActive(clickedRect, scaledRect);
			this.activeSelections.push(cell);
			this.trigger('addFrame', sprite);
		}
	}
}

export default AnimatorWorkspace;