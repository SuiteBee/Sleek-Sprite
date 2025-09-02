import $ from 'jquery';

import MicroEvent from '../../utilities/MicroEvent';
import Selected from '../../components/Selected';

import Highlight from '../../components/highlight';
import SelectArea from '../../components/selectArea';
import SelectColor from '../../components/selectColor';

class SpriteCanvasView extends MicroEvent {
	constructor(spriteCanvas, $appendToElm) {
		super();
		var spriteCanvasView = this,
			$container = $('<div class="sprite-canvas-container"/>'),
			$canvas = $( spriteCanvas.canvas ).appendTo( $container ),
			// this cannot be $appendToElm, as browsers pick up clicks on scrollbars, some don't pick up mouseup http://code.google.com/p/chromium/issues/detail?id=14204#makechanges
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

		$container.appendTo($appendToElm);

		selectArea.bind('select', function (clickedRect) {
			const rect = Object.assign({}, clickedRect);

			var spriteRect = spriteCanvas.trimBg(rect);
			if (spriteRect.width && spriteRect.height) {
				spriteRect = spriteCanvas.expandToSpriteBoundry(rect);
				
				spriteCanvasView._handleSelectedSprite(clickedRect, spriteRect);
			} 
			//Clicked background
			else {
				//spriteCanvasView.unselectAllSprites();
			}
		});

		selectColor.bind('select', function (color) {
			spriteCanvasView.trigger('bgColorSelect', color);
			spriteCanvas.setBg(color);
		});

		selectColor.bind('move', function (color) {
			spriteCanvasView.trigger('bgColorHover', color);
		});
	}
}

var SpriteCanvasViewProto = SpriteCanvasView.prototype;

SpriteCanvasViewProto._handleSelectedSprite = function(clickedRect, spriteRect) {
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
		this._selectedSprites[alreadySelectedSpriteIndex].reselect(newRect);
	}

	this.trigger('selectedSpritesChange', this._selectedSprites);
}

SpriteCanvasViewProto._selectSprite = function(clickedRect, spriteRect) {
	const highlight = new Highlight(this._$container);
	highlight.moveTo(clickedRect); // move to clicked area so the animation starts from click position

	return new Selected(spriteRect, highlight);
}

SpriteCanvasViewProto.unselectAllSprites = function() {
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

SpriteCanvasViewProto.setBg = function(color, anim = true) {
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

export default SpriteCanvasView;