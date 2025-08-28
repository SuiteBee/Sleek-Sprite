import $ from 'jquery';

import MicroEvent from '../../utilities/MicroEvent';
import Selected from '../../components/Selected';

import Highlight from '../../components/highlight';
import SelectArea from '../../components/selectArea';

class EditorCanvasView extends MicroEvent {
	constructor(editorCanvas, $appendToElm) {
		super();
		var EditorCanvasView = this,
			$container = $('<div class="sprite-canvas-container"/>'),
			$canvas = $( editorCanvas.canvas ).appendTo( $container ),
			// this cannot be $appendToElm, as browsers pick up clicks on scrollbars, some don't pick up mouseup http://code.google.com/p/chromium/issues/detail?id=14204#makechanges
			highlight = new Highlight($container),
			selectArea = new SelectArea($container, $canvas, highlight),
			selectedCells = [];

        selectArea.activate();

		this._$container = $container;
		this._highlight = highlight;
		this._selectedCells = selectedCells;
        this._grid = editorCanvas.grid;
        this._editorCanvas = editorCanvas;

		$container.appendTo($appendToElm);

		selectArea.bind('select', function (clickedRect) {
			const rect = Object.assign({}, clickedRect);
			var index = this._grid.find(rect);

            if(index >= 0 && index < this._editorCanvas.sprites.length){
                var cellRect = this._editorCanvas.sprites[index].cell;
                EditorCanvasView._handleSelectedSprite(clickedRect, cellRect);
            }else{
                EditorCanvasView.unselectAllCells()
            }
            

		}.bind(this));
	}
}

var EditorCanvasViewProto = EditorCanvasView.prototype;

EditorCanvasViewProto._handleSelectedSprite = function(clickedRect, spriteRect) {
	const alreadySelectedSpriteIndex = this._selectedCells.findIndex(sprite => JSON.stringify(sprite.rect) == JSON.stringify(spriteRect));
	if(alreadySelectedSpriteIndex > -1) {
		this._selectedCells[alreadySelectedSpriteIndex].unselect();
		this._selectedCells.splice(alreadySelectedSpriteIndex, 1);
	} else {
		this._selectedCells.push(this._selectCell(clickedRect, spriteRect));
	}

	//this.trigger('selectedSpritesChange', this._selectedCells);
}

EditorCanvasViewProto.resizeSelectedSprite = function(oldRect, newRect){
	const alreadySelectedSpriteIndex = this._selectedCells.findIndex(sprite => JSON.stringify(sprite.rect) == JSON.stringify(oldRect));
	if(alreadySelectedSpriteIndex > -1) {
		this._selectedCells[alreadySelectedSpriteIndex].reselect(newRect);
	}

	//this.trigger('selectedSpritesChange', this._selectedCells);
}

EditorCanvasViewProto._selectCell = function(clickedRect, spriteRect) {
	const highlight = new Highlight(this._$container);
	highlight.moveTo(clickedRect); // move to clicked area so the animation starts from click position

	return new Selected(spriteRect, highlight);
}

EditorCanvasViewProto.unselectAllCells = function() {
	this._selectedCells.forEach(cell => cell.unselect());
	this._selectedCells = [];
}

export default EditorCanvasView;