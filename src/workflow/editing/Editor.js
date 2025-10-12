import EditSprite from './components/EditSprite';

import EditorWindow from './EditorWindow';
import EditorWorkspace from './EditorWorkspace';
import EditorTools from './EditorTools';

class Editor {

	constructor(selectorWindow) {
        this.refresh   = false;

        this.edited    = [];

        this.showTicks = false;
        this.rows      = 0;
        this.cols      = 0;

        this.window    = new EditorWindow(selectorWindow);
        this.workspace = new EditorWorkspace(this.window);
        this.tools     = new EditorTools(this.workspace);

        this.tools.bind('viewMode', function(isDark) {
            this.window.setDisplayMode(isDark, this.showTicks);
            this.workspace.setDisplayMode(isDark);
		}.bind(this));

        this.tools.bind('show-ticks', function(show) {
            this.showTicks = show;
            this.#placeAllSprites();
        }.bind(this));

        this.tools.bind('set-anchor', function(anchorPos) {
            this.#anchorAll(anchorPos);
        }.bind(this));

        this.tools.bind('set-rows', function(rows) {
            this.rows = rows;
        }.bind(this));

        this.tools.bind('set-columns', function(cols) {
            this.cols = cols;
        }.bind(this));

        this.tools.bind('place-all', function() {
            this.#placeAllSprites();
        }.bind(this));

        this.tools.bind('place-single', function(idx) {
            this.#placeSingleSprite(idx);
        }.bind(this));

        this.workspace.bind('click-cell', function(click, idx) {
            if(idx >= 0 && idx < this.edited.length){
				let sprite = this.edited[idx];
                this.workspace.selectCell(click, sprite);
            }else{
                this.workspace.unselectAllCells();
            }
        }.bind(this));
    }

    init(selected) {
        //Pack selected sprites into an object array
        this.edited = [];
        this.rows = 0;
        this.cols = 0;
        
        for(let i=0; i<selected.length; i++){
            let selection = selected[i];
            let sprite = new EditSprite(selection.rect, i);
            this.edited.push(sprite);
        }
    }
    
    activeTab(){
        //Unselect all highlighted cells in editor
        this.workspace.unselectAllCells();

        if(this.refresh){
            this.tools.clearSelection();

            let nearestRoot = Math.sqrt(this.edited.length);
            let nearestSquare = Math.ceil(nearestRoot);

            this.tools.init(nearestSquare);
            this.#placeAllSprites();

            this.refresh = false;
        }

        this.window.grid.draw(this.showTicks);
    }

    updateScale(pct) {
        this.tools.updateScale(pct);
        this.workspace.updateScale(pct);
    }

    resize(pct) {
        this.window.grid.resize(pct, this.showTicks);
    }

    setDisplayMode(isDark) {
        this.tools.setDisplayMode(isDark);
        this.window.setDisplayMode(isDark, this.showTicks);
        this.workspace.setDisplayMode(isDark, false);
    }

    #placeAllSprites() {
        this.workspace.unselectAllCells();

        this.window.init(this.edited, this.rows, this.cols);
        this.window.drawAll(this.edited, true, this.showTicks); 
    }

    #placeSingleSprite(idx) {
        let sprite = this.edited[idx];
        let previous = idx > 0 ? this.edited[idx-1] : sprite;
        this.window.drawSingle(sprite, previous);
    }

    #anchorAll(anchorPos) {
        for(let i=0; i<this.edited.length; i++){
            let cell = this.edited[i];
            cell.anchor = anchorPos;
            cell.nudgeY = 0;
        }
    }
}

export default Editor;

