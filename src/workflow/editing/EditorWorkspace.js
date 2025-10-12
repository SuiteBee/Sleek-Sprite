import $ from 'jquery';

import Workspace from '../../components/Workspace';

import Highlight from '../../utilities/highlight';
import SelectArea from '../../utilities/selectArea';

class EditorWorkspace extends Workspace {
	constructor(editorWindow) {
		super(editorWindow);

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
		this.#handleClick(click, sprite);
	}

	updateScale(pct) {
		this.unselectAllCells();
		this.window.zoom(pct);
        this.window.grid.clear();
	}
	
	#handleClick(clickedRect, sprite) {
		let scaledRect = sprite.cell.scaled(this.window.scale);

		const cellSelected = this.activeSelections.findIndex(cell => JSON.stringify(cell.rect) == JSON.stringify(scaledRect));
		if(cellSelected > -1) {
			this.activeSelections[cellSelected].unselect();
			this.activeSelections.splice(cellSelected, 1);
			this.trigger('editNone');
		} else {
			this.unselectAllCells();

			let cell = this.getActive(clickedRect, scaledRect);
			this.activeSelections.push(cell);
			this.trigger('editCellChange', sprite);
		}
	}
}

export default EditorWorkspace;