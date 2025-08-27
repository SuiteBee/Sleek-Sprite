import MicroEvent from '../spritecow/MicroEvent';

export default (function() {

	function EditorCanvas(container) {
		var canvas = document.createElement('canvas');
		this.canvas = canvas;
		this._context = canvas.getContext('2d');
		this._bgData = [0, 0, 0, 0];
	}
	
	var EditorCanvasProto = EditorCanvas.prototype;

    EditorCanvasProto.init = function(gridInfo) {
        this._context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.canvas.width = gridInfo.gridWidth;
        this.canvas.height = gridInfo.gridHeight;
    }

    EditorCanvasProto.drawSprites = function(spriteArr, cellSize, rows, columns) {
        var curX, curY, nRows, nCols;
        curX = curY = nRows = nCols = 0;
        var halfWidth, halfCell, midpoint;
        halfCell = cellSize/2;

        let dstCtx = this.canvas.getContext('2d');

		spriteArr.forEach(function(sprite) {
            let r = sprite.rect;
            halfWidth = r.width/2;
            midpoint = halfCell - halfWidth;

            sprite.rect.x = curX + midpoint;
            sprite.rect.y = curY;

            sprite.cell.x = curX;
            sprite.cell.y = curY;
            sprite.cell.width = cellSize;
            sprite.cell.height = cellSize;

            dstCtx.putImageData(sprite.imgData, sprite.rect.x, sprite.rect.y);

            nCols++;

            if(nCols >= columns){
                nCols = 0;
                curX = 0;
                curY += cellSize;
            } else{
                curX += cellSize;
            }
        }); 
    }

	return EditorCanvas;
})();