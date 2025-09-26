import $ from 'jquery';

import ActiveSprite from '../../components/ActiveSprite';

import MicroEvent from '../../utilities/MicroEvent';
import Highlight from '../../utilities/highlight';
import SelectArea from '../../utilities/selectArea';

class EditorWorkspace extends MicroEvent {
	constructor(editorWindow) {
		super();

		this.selected   = [];
		this.window     = editorWindow;

		var $parent     = $('.editor-inner');

		this.$container = $('<div class="editor-canvas-container"/>');
		this.$canvas    = this.$container.append($(editorWindow.canvas)).append($(editorWindow.grid.canvas));
		this.$canvasBg  = $parent;

		this.highlight  = new Highlight(this.$container);
		this.selectArea = new SelectArea(this.$container, this.$canvas, this.highlight);

        this.selectArea.activate();
		this.$container.appendTo($parent);

		this.selectArea.bind('select', function (clickedRect) {
			const rect = Object.assign({}, clickedRect);
			let idx = this.window.grid.find(rect);
			this.trigger('click-cell', clickedRect, idx);
		}.bind(this));
	}

	selectCell(click, sprite) {
		this.#handleSelectedCell(click, sprite);
	}

	unselectAllCells() {
		if(this.selected.length > 0) {
			this.selected.forEach(cell => cell.unselect());
			this.selected = [];
		}
		this.trigger('editNone');
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
			this.trigger('editNone');
		} else {
			this.unselectAllCells();

			let cell = this.#getActiveCell(clickedRect, scaledRect);
			this.selected.push(cell);
			this.trigger('editCellChange', sprite);
		}
	}

	#getActiveCell(clickedRect, cellRect) {
		const bbox = new Highlight(this.$container);
		bbox.setDisplayMode(this.highlight.highVis);
		bbox.moveTo(clickedRect); // move to clicked area so the animation starts from click position

		return new ActiveSprite(cellRect, bbox);
	}

}

export default EditorWorkspace;