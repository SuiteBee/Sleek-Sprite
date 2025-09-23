import $ from 'jquery';

import MicroEvent from '../../utilities/MicroEvent';

import Rect from '../../components/Rect';
import Selected from '../../components/Selected';

import Highlight from '../../utilities/highlight';
import SelectArea from '../../utilities/selectArea';

class AnimatorCanvasView extends MicroEvent {
	constructor(animatorCanvas, $appendToElm) {
		super();
        
		var $container = $('<div class="animator-canvas-container"/>'),
			$canvas = $container.append($(animatorCanvas.canvas)).append($(animatorCanvas.gridCanvas)),
			// this cannot be $appendToElm, as browsers pick up clicks on scrollbars, some don't pick up mouseup http://code.google.com/p/chromium/issues/detail?id=14204#makechanges
			highlight = new Highlight($container),
			selectArea = new SelectArea($container, $canvas, highlight),
			selectedCells = [];

        selectArea.activate();

		this._$container = $container;
		this._$bgElm = $appendToElm;
		this._highlight = highlight;
		this._selectedCells = selectedCells;
        this._grid = animatorCanvas.srcGrid;
        this._animatorCanvas = animatorCanvas;

		$container.appendTo($appendToElm);

		selectArea.bind('select', function (clickedRect) {
			const rect = Object.assign({}, clickedRect);
			let index = this._grid.find(rect);

            if(index >= 0 && index < this._animatorCanvas.sprites.length){
				let sprite = this._animatorCanvas.sprites[index];
                this._handleSelectedCell(clickedRect, sprite);
            }else{
                this.unselectAllCells()
            }
		}.bind(this));
	}
}

var AnimatorCanvasViewProto = AnimatorCanvasView.prototype;

AnimatorCanvasViewProto.loadAnimation = function(frames) {
	this.unselectAllCells()

	for(let i=0; i<frames.length; i++){
		let index = frames[i];
		let sprite = this._animatorCanvas.sprites[index];

		let scaledRect = sprite.cell.scaled(this._grid.zoomScale);
		this._selectedCells.push(this._loadCell(scaledRect));
		this.trigger('addFrame', sprite);
	}
}

AnimatorCanvasViewProto.unselectAllCells = function() {
	if(this._selectedCells.length > 0) {
		this._selectedCells.forEach(cell => cell.unselect());
		this._selectedCells = [];
	}

	this.trigger('removeAllFrames', this._selectedCells);
}

AnimatorCanvasViewProto.setDarkMode = function(color, anim = true) {
	if ( $.support.transition && anim ) {
		this._$bgElm.transition({ 'background-color': color }, {
			duration: 500
		});								
	}
	else {
		this._$bgElm.css({ 'background-color': color });
	}
	
	this._highlight.setDisplayMode( color === '#000' );
};

AnimatorCanvasViewProto.zoom = function(pct) {
	this.unselectAllCells();
	this._animatorCanvas.zoom(pct);
}

AnimatorCanvasViewProto._handleSelectedCell = function(clickedRect, sprite) {
	let scaledRect = sprite.cell.scaled(this._grid.zoomScale);

	const cellSelected = this._selectedCells.findIndex(cell => JSON.stringify(cell.rect) == JSON.stringify(scaledRect));
	if(cellSelected > -1) {
		this._selectedCells[cellSelected].unselect();
		this._selectedCells.splice(cellSelected, 1);
		this.trigger('removeFrame', sprite);
	} else {
		this._selectedCells.push(this._selectCell(clickedRect, scaledRect));
		this.trigger('addFrame', sprite);
	}
}

AnimatorCanvasViewProto._selectCell = function(clickedRect, cellRect) {
	const highlight = new Highlight(this._$container);
	highlight.moveTo(clickedRect); // move to clicked area so the animation starts from click position

	return new Selected(cellRect, highlight);
}

AnimatorCanvasViewProto._loadCell = function(cellRect) {
	const highlight = new Highlight(this._$container);
	const clickedRect = new Rect(cellRect.x, cellRect.y, 1, 1);
	highlight.moveTo(clickedRect, false);

	return new Selected(cellRect, highlight);
}

export default AnimatorCanvasView;