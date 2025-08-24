import MicroEvent from '../spritecow/MicroEvent';

export default (function() {

	function EditorCanvas(container) {
		var canvas = document.createElement('canvas');
		this.canvas = canvas;
		this._context = canvas.getContext('2d');
		this._bgData = [0, 0, 0, 0];
	}
	
	var EditorCanvasProto = EditorCanvas.prototype;
	
	EditorCanvasProto.setSprites = function(srcCanvas, spriteArr, cellSize) {
        var curX, curY;
        curX = curY = 0;
        var halfWidth, halfCell, midpoint;
        halfCell = cellSize/2;

        let dstCtx = this.canvas.getContext('2d');

		spriteArr.forEach(function(sprite, i) {
            let r = sprite.rect;
            halfWidth = r.width/2;
            midpoint = halfCell - halfWidth;

            dstCtx.drawImage(
                srcCanvas, 
                r.x, r.y, r.width, r.height, //src
                curX + midpoint, curY, r.width, r.height //dst
            ); 
            curX += cellSize;
        }); 
	};

	return EditorCanvas;
})();