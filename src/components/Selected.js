import Highlight from './highlight';

class Selected {
    constructor(rect, highlight) {
        this.rect = rect;
        this.highlight = highlight;
        
        this.highlight.moveTo(rect, true);
    }

    unselect() {
        this.highlight.remove();
    }

    selectNew(newRect) {
         this.rect = newRect;
         this.highlight.moveTo(newRect, true);
    }

    reselect(container) {
        const highlight = new Highlight(container);
        this.highlight = highlight;
        this.highlight.moveTo(this.rect, false);
    }
}

export default Selected;