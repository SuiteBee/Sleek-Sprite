import Grid from './Grid';

export default (function() {

	function EditorCanvas(container) {
		var canvas = document.createElement('canvas');
		this.canvas = canvas;
		this.context = canvas.getContext('2d');

        this.grid = new Grid(this.context);
        this.sprites = [];
	}
	
	var EditorCanvasProto = EditorCanvas.prototype;

    EditorCanvasProto.reset = function(spriteArr, rows, cols) {
        this.sprites = spriteArr;
        this.grid.set(spriteArr, rows, cols);
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.canvas.width = this.grid.width;
        this.canvas.height = this.grid.height;
    }

    EditorCanvasProto.drawSprites = function() {
        var curX, curY, nCols;
        curX = curY = nCols = 0;
        
        for(let i=0; i<this.sprites.length; i++){
            let sprite = this.sprites[i];

            //Set rect alignemtn to draw sprite from anchor
            let previous = i > 0 ? this.sprites[i-1] : sprite;
            sprite.setAlignment(curX, curY, previous, this.grid.cellSize);

            //Set full cell rect position/dimensions
            sprite.setCell(curX, curY, this.grid.cellSize);

            this.context.putImageData(sprite.imgData, sprite.rect.x, sprite.rect.y);

            nCols++;

            if(nCols >= this.grid.cols){
                nCols = 0;
                curX = 0;
                curY += this.grid.cellSize;
            } else{
                curX += this.grid.cellSize;
            }
        }
    }

    EditorCanvasProto.drawGrid = function() {
        this.grid.draw()
    }

	return EditorCanvas;
})();