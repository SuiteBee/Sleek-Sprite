import MicroEvent from '../../utilities/MicroEvent';

export default (function() {

	function EditorCanvas(container) {
		var canvas = document.createElement('canvas');
		this.canvas = canvas;
		this.context = canvas.getContext('2d');
	}
	
	var EditorCanvasProto = EditorCanvas.prototype;

    EditorCanvasProto.init = function(gridInfo) {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.canvas.width = gridInfo.gridWidth;
        this.canvas.height = gridInfo.gridHeight;
    }

    EditorCanvasProto.drawSprites = function(spriteArr, cellSize, rows, columns) {
        var curX, curY, nRows, nCols;
        curX = curY = nRows = nCols = 0;
        var halfWidth, halfHeight, halfCell, midX, midY;
        halfCell = cellSize/2;

        let dstCtx = this.canvas.getContext('2d');

        for(let i=0; i<spriteArr.length; i++){
            let sprite = spriteArr[i];
            let r = sprite.rect;

            halfWidth = r.width/2;
            halfHeight = r.height/2;

            let align_previous = false;
            let align_bottom = false;
            let align_center = true;

            //Align Previous
            let previous = i > 0 ? spriteArr[i-1] : sprite;
            let prevDiff = Math.abs(previous.old.y - sprite.old.y);

            //Align Bottom
            let cellDiff = cellSize - r.height;
            let verticalPadding = cellDiff/2;

            //Align Center
            midX = halfCell - halfWidth;
            midY = halfCell - halfHeight;

            sprite.rect.x = curX + midX;

            if(align_previous){
                sprite.rect.y = curY + midY + verticalPadding - prevDiff;
            } else if(align_bottom){
                sprite.rect.y = curY + midY + verticalPadding;
            } else if(align_center){
                sprite.rect.y = curY + midY;
            }

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
        }
    }

	return EditorCanvas;
})();