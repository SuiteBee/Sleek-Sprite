class SelectedSprite {
    constructor(rect, highlight) {
        this.rect = rect;
        this.highlight = highlight;
        
        this.highlight.moveTo(rect, true);
    }

    unselect() {
        this.highlight.remove();
    }

    reselect(newRect) {
        this.rect = newRect;
        this.highlight.moveTo(newRect, true);
    }
}

export default SelectedSprite;