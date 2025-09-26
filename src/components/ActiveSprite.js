import Highlight from '../utilities/highlight';

class ActiveSprite {
    constructor(rect, highlight) {
        this.rect = rect;
        this.highlight = highlight;
        
        this.highlight.moveTo(rect, true);
    }
}

ActiveSprite.prototype.unselect = function() {
    this.highlight.remove();
}

ActiveSprite.prototype.selectNew = function(newRect) {
    this.rect = newRect;
    this.highlight.moveTo(newRect, true);
}

ActiveSprite.prototype.reselect = function(container) {
    const highlight = new Highlight(container);
    this.highlight = highlight;
    this.highlight.moveTo(this.rect, false);
}

export default ActiveSprite;