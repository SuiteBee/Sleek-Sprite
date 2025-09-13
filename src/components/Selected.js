import Highlight from './highlight';

class Selected {
    constructor(rect, highlight) {
        this.rect = rect;
        this.highlight = highlight;
        
        this.highlight.moveTo(rect, true);
    }
}

Selected.prototype.unselect = function() {
    this.highlight.remove();
}

Selected.prototype.selectNew = function(newRect) {
    this.rect = newRect;
    this.highlight.moveTo(newRect, true);
}

Selected.prototype.reselect = function(container) {
    const highlight = new Highlight(container);
    this.highlight = highlight;
    this.highlight.moveTo(this.rect, false);
}

export default Selected;