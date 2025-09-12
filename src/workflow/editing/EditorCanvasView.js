import $ from 'jquery';

import MicroEvent from '../../utilities/MicroEvent';
import Selected from '../../components/Selected';

import Highlight from '../../components/highlight';
import SelectArea from '../../components/selectArea';

class EditorCanvasView extends MicroEvent {
	constructor(editorCanvas, $appendToElm) {
		super();
		var $container = $('<div class="editor-canvas-container"/>'),
			$canvas = $container.append($(editorCanvas.canvas)).append($(editorCanvas.grid.canvas)),
			// this cannot be $appendToElm, as browsers pick up clicks on scrollbars, some don't pick up mouseup http://code.google.com/p/chromium/issues/detail?id=14204#makechanges
			highlight = new Highlight($container),
			selectArea = new SelectArea($container, $canvas, highlight),
			selectedCells = [];

        selectArea.activate();

		this._$container = $container;
		this._$bgElm = $appendToElm;
		this._highlight = highlight;
		this._selectedCells = selectedCells;
        this._grid = editorCanvas.grid;
        this._editorCanvas = editorCanvas;

		$container.appendTo($appendToElm);

		selectArea.bind('select', function (clickedRect) {
			const rect = Object.assign({}, clickedRect);
			let index = this._grid.find(rect);

            if(index >= 0 && index < this._editorCanvas.sprites.length){
				let sprite = this._editorCanvas.sprites[index];
                this._handleSelectedCell(clickedRect, sprite);
            }else{
                this.unselectAllCells()
            }
		}.bind(this));
	}
}

var EditorCanvasViewProto = EditorCanvasView.prototype;

EditorCanvasViewProto._handleSelectedCell = function(clickedRect, sprite) {
	let scaledRect = sprite.cell.scaled(this._grid.zoomScale);

	const cellSelected = this._selectedCells.findIndex(cell => JSON.stringify(cell.rect) == JSON.stringify(scaledRect));
	if(cellSelected > -1) {
		this._selectedCells[cellSelected].unselect();
		this._selectedCells.splice(cellSelected, 1);
		this.trigger('editNone');
	} else {
		this.unselectAllCells();

		this._selectedCells.push(this._selectCell(clickedRect, scaledRect));
		this.trigger('editCellChange', sprite);
	}
}

EditorCanvasViewProto.resizeSelectedSprite = function(oldRect, newRect){
	const alreadySelectedSpriteIndex = this._selectedCells.findIndex(sprite => JSON.stringify(sprite.rect) == JSON.stringify(oldRect));
	if(alreadySelectedSpriteIndex > -1) {
		this._selectedCells[alreadySelectedSpriteIndex].selectNew(newRect);
	}

	//this.trigger('selectedSpritesChange', this._selectedCells);
}

EditorCanvasViewProto._selectCell = function(clickedRect, cellRect) {
	const highlight = new Highlight(this._$container);
	highlight.moveTo(clickedRect); // move to clicked area so the animation starts from click position

	return new Selected(cellRect, highlight);
}

EditorCanvasViewProto.unselectAllCells = function() {
	if(this._selectedCells.length > 0) {
		this._selectedCells.forEach(cell => cell.unselect());
		this._selectedCells = [];

		this.trigger('editNone');
	}
}

EditorCanvasViewProto.setDarkMode = function(color, anim = true) {
	if ( $.support.transition && anim ) {
		this._$bgElm.transition({ 'background-color': color }, {
			duration: 500
		});								
	}
	else {
		this._$bgElm.css({ 'background-color': color });
	}
	
	this._highlight.setHighVisOnDark( color === '#000' );
};

EditorCanvasViewProto.zoom = function(pct) {
	this.unselectAllCells();
	this._editorCanvas.zoom(pct);
}

export default EditorCanvasView;