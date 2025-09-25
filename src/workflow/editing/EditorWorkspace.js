import $ from 'jquery';

import Selected from '../../components/Selected';

import MicroEvent from '../../utilities/MicroEvent';
import Highlight from '../../utilities/highlight';
import SelectArea from '../../utilities/selectArea';

class EditorWorkspace extends MicroEvent {
	constructor(editorWindow, selectedCell ) {
		super();

		this.selected   = selectedCell;

		var $parent     = $('.editor-inner');
		this.window     = editorWindow;
		
		this.$container = $('<div class="editor-canvas-container"/>');
		this.$canvas    = this.$container.append($(editorWindow.canvas)).append($(editorWindow.grid.canvas));
		this.$canvasBg  = $parent;

		this.highlight  = new Highlight(this.$container);
		this.selectArea = new SelectArea(this.$container, this.$canvas, this.highlight);

        this.selectArea.activate();
		this.$container.appendTo($parent);

		this.selectArea.bind('select', function (clickedRect) {
			const rect = Object.assign({}, clickedRect);
			let index = this.window.grid.find(rect);

            if(index >= 0 && index < this.window.sprites.length){
				let sprite = this.window.sprites[index];
                this.#handleSelectedCell(clickedRect, sprite);
            }else{
                this.unselectAllCells()
            }
		}.bind(this));
	}

	unselectAllCells() {
		if(this.selected.length > 0) {
			this.selected.forEach(cell => cell.unselect());
			this.selected = [];

			this.trigger('editNone');
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
			this.trigger('editNone');
		} else {
			this.unselectAllCells();

			this.selected.push(this.#selectCell(clickedRect, scaledRect));
			this.trigger('editCellChange', sprite);
		}
	}

	#selectCell(clickedRect, cellRect) {
		const bbox = new Highlight(this.$container);
		bbox.setDisplayMode(this.highlight.highVis);
		bbox.moveTo(clickedRect); // move to clicked area so the animation starts from click position

		return new Selected(cellRect, bbox);
	}

}

export default EditorWorkspace;