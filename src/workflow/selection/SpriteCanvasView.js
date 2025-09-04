import $ from 'jquery';

import MicroEvent from '../../utilities/MicroEvent';
import Selected from '../../components/Selected';

import Highlight from '../../components/highlight';
import SelectArea from '../../components/selectArea';
import SelectColor from '../../components/selectColor';
import Rect from '../../utilities/Rect';

class SpriteCanvasView extends MicroEvent {
	constructor(spriteCanvas, $appendToElm) {
		super();
		var spriteCanvasView = this,
			$container = $('<div class="sprite-canvas-container"/>'),
			$canvas = $( spriteCanvas.canvas ).appendTo( $container ),

			highlight = new Highlight($container),
			selectArea = new SelectArea($container, $canvas, highlight),
			selectColor = new SelectColor($canvas, $canvas),
			selectedSprites = [];

		this._$container = $container;
		this._$bgElm = $appendToElm;
		this._spriteCanvas = spriteCanvas;
		this._highlight = highlight;
		this._selectArea = selectArea;
		this._selectColor = selectColor;
		this._selectedSprites = selectedSprites;
		this._history = [];

		$container.appendTo($appendToElm);

		selectArea.bind('select', function (clickedRect) {
			const rect = Object.assign({}, clickedRect);

			var spriteRect = spriteCanvas.trimBg(rect);
			if (spriteRect.width && spriteRect.height) {
				spriteRect = spriteCanvas.expandToSpriteBoundry(rect);
				
				spriteCanvasView._handleSelectedSprite(clickedRect, spriteRect, true);
			} 
			else {
				//Clicked background clears selections
				//spriteCanvasView.unselectAllSprites();
			}
		});

		selectColor.bind('select', function (color) {
			spriteCanvasView.trigger('bgColorSelect', color);
			spriteCanvasView._history.push(spriteCanvas.getBg());
			spriteCanvas.setBg(color);
		});

		selectColor.bind('move', function (color) {
			spriteCanvasView.trigger('bgColorHover', color);
		});
	}
}

var SpriteCanvasViewProto = SpriteCanvasView.prototype;

SpriteCanvasViewProto._handleSelectedSprite = function(clickedRect, spriteRect, isHistoric = false) {
	//Store previous state in history
	if(isHistoric) {
		this._history.push([...this._selectedSprites]);
	}

	const alreadySelectedSpriteIndex = this._selectedSprites.findIndex(sprite => JSON.stringify(sprite.rect) == JSON.stringify(spriteRect));
	if(alreadySelectedSpriteIndex > -1) {
		this._selectedSprites[alreadySelectedSpriteIndex].unselect();
		this._selectedSprites.splice(alreadySelectedSpriteIndex, 1);
	} else {
		this._selectedSprites.push(this._selectSprite(clickedRect, spriteRect));
	}

	this.trigger('selectedSpritesChange', this._selectedSprites);
}

SpriteCanvasViewProto.resizeSelectedSprite = function(oldRect, newRect){
	const alreadySelectedSpriteIndex = this._selectedSprites.findIndex(sprite => JSON.stringify(sprite.rect) == JSON.stringify(oldRect));
	if(alreadySelectedSpriteIndex > -1) {
		this._selectedSprites[alreadySelectedSpriteIndex].selectNew(newRect);
	}

	this.trigger('selectedSpritesChange', this._selectedSprites);
}

SpriteCanvasViewProto._selectSprite = function(clickedRect, spriteRect) {
	const highlight = new Highlight(this._$container);
	highlight.moveTo(clickedRect); // move to clicked area so the animation starts from click position

	return new Selected(spriteRect, highlight);
}

SpriteCanvasViewProto.findAllSprites = function(spriteGap) {
	this._history.push([...this._selectedSprites]);

	//Find all sprite bounds excluding current selections from search
	let currentSelections = this._selectedSprites.map(current => current.rect);
	let selectable = this._spriteCanvas.findAllBounds(Array.from(currentSelections), spriteGap);

	//Filter out the current selections for next step
	selectable = selectable.filter(existing => !currentSelections.includes(existing));

	//Highlight and add to selected
	selectable.forEach(spriteRect => {
		let clickedRect = new Rect(spriteRect.x, spriteRect.y, 1, 1);
		this._selectedSprites.push(this._selectSprite(clickedRect, spriteRect));
	});
}

SpriteCanvasViewProto.unselectAllSprites = function(isHistoric = false) {
	//Store previous state in history
	if(isHistoric){
		this._history.push([...this._selectedSprites]);
	}

	this._selectedSprites.forEach(sprite => sprite.unselect());
	this._selectedSprites = [];

	this.trigger('selectedSpritesChange', this._selectedSprites);
}

SpriteCanvasViewProto.setTool = function(mode) {
	var selectArea = this._selectArea,
		selectColor = this._selectColor;
	
	selectArea.deactivate();
	selectColor.deactivate();
	
	switch (mode) {
		case 'select-sprite':
			selectArea.activate();
			break;
		case 'select-bg':
			selectColor.activate();
			break;
	}
};

SpriteCanvasViewProto.setDarkMode = function(color, anim = true) {
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

SpriteCanvasViewProto.clearBg = function() {
	//Store previous state in history before destructive operation
	let currentState = this._spriteCanvas.getCurrentState();
	this._history.push(currentState);

	this._spriteCanvas.pixelsToAlpha();
}

SpriteCanvasViewProto.clearRect = function() {
	//Store previous state in history before destructive operation
	let currentState = this._spriteCanvas.getCurrentState();
	this._history.push(currentState);

	this._spriteCanvas.pixelsToBg(this._selectedSprites);
	this.unselectAllSprites();
}

SpriteCanvasViewProto.undo = function() {
	const lastState = this._history.pop();

	if (lastState) {
		if(lastState instanceof ImageData) {
			this._spriteCanvas.undoPixels(lastState);
		} else if(lastState.length == 4 && !(lastState[0] instanceof Selected)){
			this._spriteCanvas.setBg(lastState);
			this.trigger('bgColorSelect', lastState);
		} else {
			this.unselectAllSprites();
			this._selectedSprites = lastState;

			for(let i=0; i<this._selectedSprites.length; i++){
				this._selectedSprites[i].reselect(this._$container);
			}

			return this._selectedSprites;
		} 
	}
}

export default SpriteCanvasView;