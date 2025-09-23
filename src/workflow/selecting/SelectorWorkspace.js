import $ from 'jquery';

import MicroEvent from '../../utilities/MicroEvent';
import ImgInput from '../../utilities/ImgInput';

import Selected from '../../components/Selected';
import Rect from '../../components/Rect';

import Highlight from '../../utilities/highlight';
import SelectArea from '../../utilities/selectArea';
import SelectColor from '../../utilities/selectColor';

class SelectorWorkspace extends MicroEvent {
	constructor(selectorWindow, model) {
		super();

		this.selectedSprites = model.selectedSprites;
		this.history 		 = model.history;

		var $parent   		 = $('.selection-inner');
		this.window 		 = selectorWindow;

		this.$container 	 = $('<div class="selector-canvas-container"/>');
		this.$canvas 		 = $( selectorWindow.canvas ).appendTo( this.$container );
		this.$canvasBg  	 = $parent;

		this.imgInput        = new ImgInput( $parent, $parent);
		this.highlight 		 = new Highlight(this.$container);
		this.selectArea 	 = new SelectArea(this.$container, this.$canvas, this.highlight);
		this.selectColor 	 = new SelectColor(this.$canvas, this.$canvas);

		this.$container.appendTo($parent);	

		//Open/Drop Image File
		this.imgInput.bind('load', function(img) {
			this.trigger('load', img);
		}.bind(this));

		this.selectArea.bind('select', function (clickedRect) {
			const rect = Object.assign({}, clickedRect);

			//Clicking highlighted rect will unselect
			let isSelected = selectorWindow.getHighlighted(this.selectedSprites, clickedRect);
			if(isSelected) {
				this.#handleSelectedSprite(clickedRect, isSelected, true);
			} 
			else {
				var spriteRect = selectorWindow.trimBg(rect);
				if (spriteRect.width && spriteRect.height) {
					spriteRect = selectorWindow.expandToSpriteBoundry(rect);
					
					this.#handleSelectedSprite(clickedRect, spriteRect, true);
				} 
			}
		}.bind(this));

		this.selectColor.bind('select', function (color) {
			this.trigger('bgColorSelect', color);
			this.history.push(selectorWindow.getBg());
			selectorWindow.setBg(color);
		}.bind(this));

		this.selectColor.bind('move', function (color) {
			this.trigger('bgColorHover', color);
		}.bind(this));
	}

	init() {
		this.unselectAllSprites();
		this.setTool('select-sprite');
	}

	reload(){
		this.imgInput.reloadLastFile();
	}

	findAllSprites(spriteGap) {
		this.history.push([...this.selectedSprites]);

		//Find all sprite bounds excluding current selections from search
		let currentSelections = this.selectedSprites.map(current => current.rect);
		let selectable = this.window.findAllBounds(Array.from(currentSelections), spriteGap);

		//Filter out the current selections for next step
		selectable = selectable.filter(existing => !currentSelections.includes(existing));

		//Highlight and add to selected
		selectable.forEach(spriteRect => {
			let clickedRect = new Rect(spriteRect.x, spriteRect.y, 1, 1);
			this.selectedSprites.push(this.#selectSprite(clickedRect, spriteRect));
		});

		this.trigger('selectedSpritesChange', this.selectedSprites);
	}

	unselectAllSprites(isHistoric = false) {
		//Store previous state in history
		if(isHistoric){
			this.history.push([...this.selectedSprites]);
		}

		this.selectedSprites.forEach(sprite => sprite.unselect());
		this.selectedSprites = [];

		this.trigger('selectedSpritesChange', this.selectedSprites);
	}

	setTool(mode) {
		this.selectArea.deactivate();
		this.selectColor.deactivate();
		
		switch (mode) {
			case 'select-sprite':
				this.selectArea.activate();
				break;
			case 'select-bg':
				this.selectColor.activate();
				break;
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

		for(let i=0; i<this.selectedSprites.length; i++){
			this.selectedSprites[i].highlight.setDisplayMode(isDark);
		}
	}

	clearBg() {
		//Store previous state in history before destructive operation
		let currentState = this.window.getPixels();
		this.history.push(currentState);

		this.window.pixelsToAlpha();
	}

	clearRect() {
		//Store previous state in history before destructive operation
		let currentState = this.window.getPixels();
		this.history.push(currentState);

		this.window.pixelsToBg(this.selectedSprites);
		this.unselectAllSprites();
	}

	undo() {
		const lastState = this.history.pop();

		if (lastState) {
			if(lastState instanceof ImageData) {
				this.window.setPixels(lastState);
			} else if(lastState.length == 4 && !(lastState[0] instanceof Selected)){
				this.window.setBg(lastState);
				this.trigger('bgColorSelect', lastState);
			} else {
				this.unselectAllSprites();
				this.selectedSprites = lastState;

				for(let i=0; i<this.selectedSprites.length; i++){
					let current = this.selectedSprites[i];
					current.reselect(this.$container);
					current.highlight.setDisplayMode(this.highlight.highVis);
				}

				return this.selectedSprites;
			} 
		}
	}

	#handleSelectedSprite(clickedRect, spriteRect, isHistoric = false) {
		//Store previous state in history
		if(isHistoric) {
			this.history.push([...this.selectedSprites]);
		}

		const alreadySelectedSpriteIndex = this.selectedSprites.findIndex(sprite => JSON.stringify(sprite.rect) == JSON.stringify(spriteRect));
		if(alreadySelectedSpriteIndex > -1) {
			this.selectedSprites[alreadySelectedSpriteIndex].unselect();
			this.selectedSprites.splice(alreadySelectedSpriteIndex, 1);
		} else {
			this.selectedSprites.push(this.#selectSprite(clickedRect, spriteRect));

			if(spriteRect.width == this.window.width && spriteRect.height == this.window.height){
				this.trigger('selectedSpriteMatchesCanvas');
			}
		}

		this.trigger('selectedSpritesChange', this.selectedSprites);
	}

	#selectSprite(clickedRect, spriteRect) {
		const bbox = new Highlight(this.$container);
		bbox.setDisplayMode(this.highlight.highVis);
		bbox.moveTo(clickedRect); // move to clicked area so the animation starts from click position

		return new Selected(spriteRect, bbox);
	}
}

export default SelectorWorkspace;