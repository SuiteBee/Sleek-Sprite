import MicroEvent from '../utilities/MicroEvent';

import Rect from './Rect';
import ActiveSprite from './ActiveSprite';
import SaveState from './SaveState';

import Highlight from '../utilities/highlight';
import HistoryType from '../utilities/enum';

class Workspace extends MicroEvent {

	constructor(window) {
        super();
        
		this.window             = window;

        this.activeSelections   = [];
		this.history            = [];

    }

    lastState() {
        let state = this.history.pop();
        return state;
    }

	saveState(type, data) {
		let state = new SaveState(type, data);
		this.history.push(state);
	}

    unselectAllSprites(isHistoric = false) {
		this.#unselectAll(isHistoric);
		this.trigger('selectedSpritesChange', this.activeSelections);
	}

    unselectAllCells(isHistoric = false) {
        this.#unselectAll(isHistoric);
        this.trigger('editNone');
    }

    unselectAllFrames(isHistoric = false) {
        this.#unselectAll(isHistoric);
        this.trigger('removeAllFrames');
    }

    #unselectAll(isHistoric = false){
        //Store previous state in history
		if(isHistoric){
            this.saveState(HistoryType.SELECTION, [...this.activeSelections]);
		}

		this.activeSelections.forEach(selection => selection.unselect());
		this.activeSelections = [];
    }

    selectSprite(clickedRect, spriteRect, isHistoric = false) {
		//Store previous state in history
		if(isHistoric) {
			this.saveState(HistoryType.SELECTION, [...this.activeSelections]);
		}

		const activeIndex = this.activeSelections.findIndex(sprite => JSON.stringify(sprite.rect) == JSON.stringify(spriteRect));
		if(activeIndex > -1) {
			this.activeSelections[activeIndex].unselect();
			this.activeSelections.splice(activeIndex, 1);
		} else {
			let activeSprite = this.getActive(clickedRect, spriteRect);
			this.activeSelections.push(activeSprite);

			if(spriteRect.width == this.window.width && spriteRect.height == this.window.height){
				this.trigger('selectedSpriteMatchesCanvas');
			}
		}

		this.trigger('selectedSpritesChange', this.activeSelections);
	}

	getActive(clickedRect, spriteRect) {
		const bbox = new Highlight(this.$container);
		bbox.setDisplayMode(this.highlight.highVis);
		bbox.moveTo(clickedRect); // move to clicked area so the animation starts from click position

		return new ActiveSprite(spriteRect, bbox);
	}

    loadActive(cellRect) {
        const clickedRect = new Rect(cellRect.x, cellRect.y, 1, 1);
        return this.getActive(clickedRect, cellRect);
    }

    setDisplayMode(isDark, anim = true) {
		let color = isDark ? '#000' : '#fff';
		
		if (anim) {
			this.$canvasBg.transition({ 'background-color': color }, {
				duration: 500
			});								
		}
		else {
			this.$canvasBg.css({ 'background-color': color });
		}

		this.highlight.setDisplayMode(isDark);

		for(let i=0; i<this.activeSelections.length; i++){
			this.activeSelections[i].highlight.setDisplayMode(isDark);
		}
	}
}

export default Workspace;