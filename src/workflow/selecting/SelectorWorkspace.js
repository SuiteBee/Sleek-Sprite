import $ from 'jquery';

import Workspace from '../../components/Workspace';
import Rect from '../../components/Rect';

import ImgInput from '../../utilities/ImgInput';
import Highlight from '../../utilities/highlight';
import SelectArea from '../../utilities/selectArea';
import SelectColor from '../../utilities/selectColor';
import HistoryType from '../../utilities/enum';

class SelectorWorkspace extends Workspace {

	constructor(selectorWindow) {
		super(selectorWindow);

		var $parent   		 = $('.selection-inner');
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
			this.#handleClick(clickedRect);
		}.bind(this));

		this.selectColor.bind('select', function (color) {
			this.trigger('bgColorSelect', color);
            this.saveState(HistoryType.COLOR, selectorWindow.getBg());
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
        this.saveState(HistoryType.SELECTION, [...this.activeSelections]);

		//Find all sprite bounds excluding current selections from search
		let currentSelections = this.activeSelections.map(current => current.rect);
		let selectable = this.window.findAllBounds(Array.from(currentSelections), spriteGap);

		//Filter out the current selections for next step
		selectable = selectable.filter(existing => !currentSelections.includes(existing));

		//Highlight and add to selected
		selectable.forEach(spriteRect => {
			let clickedRect = new Rect(spriteRect.x, spriteRect.y, 1, 1);
			let activeSprite = this.getActive(clickedRect, spriteRect);

			this.activeSelections.push(activeSprite);
		});

		this.trigger('selectedSpritesChange', this.activeSelections);
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

	clearBg() {
		//Store previous state in history before destructive operation
		let currentState = this.window.getPixels();
        this.saveState(HistoryType.IMAGE, currentState);

		this.window.pixelsToAlpha();
	}

	clearRect() {
		//Store previous state in history before destructive operation
		let currentState = this.window.getPixels();
		this.saveState(HistoryType.IMAGE, currentState);

		this.window.pixelsToBg(this.activeSelections);
		this.unselectAllSprites();
	}

	undo() {
		const state = this.lastState();
        
        if(!state) {return}

        switch(state.type) {
            case HistoryType.IMAGE:
                this.window.setPixels(state.data);
                break;
            case HistoryType.COLOR:
                this.window.setBg(state.data);
				this.trigger('bgColorSelect', state.data);
                break;
            case HistoryType.SELECTION:
                this.unselectAllSprites();
				this.activeSelections = state.data;

				for(let i=0; i<this.activeSelections.length; i++){
					let current = this.activeSelections[i];
					current.reselect(this.$container);
					current.highlight.setDisplayMode(this.highlight.highVis);
				}

				this.trigger('selectedSpritesChange', this.activeSelections);
                break;
            default:
                console.log('SelectorWorkspace: Unexpected State: ' + state.type);
        }
	}

	#handleClick(clickedRect) {
		const rect = Object.assign({}, clickedRect);

		//Clicking highlighted rect will unselect
		let activeRect = this.window.findActive(this.activeSelections, clickedRect);
		if(activeRect) {
			this.selectSprite(clickedRect, activeRect, true);
		} 
		else {
			var spriteRect = this.window.trimBg(rect);
			if (spriteRect.width && spriteRect.height) {
				spriteRect = this.window.expandToSpriteBoundry(rect);
				
				this.selectSprite(clickedRect, spriteRect, true);
			} 
		}
	}

	
}

export default SelectorWorkspace;