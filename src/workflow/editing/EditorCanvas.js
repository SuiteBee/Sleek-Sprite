import Grid from './Grid';

export default (function() {

	function EditorCanvas(srcCanvas) {
		var canvas = document.createElement('canvas');
		this.canvas = canvas;
		this.context = canvas.getContext('2d');
        this._bgData = [0, 0, 0, 0];

        this.srcCanvas = srcCanvas.canvas;
        this.srcContext = srcCanvas.canvas.getContext('2d');

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

        //Disable aliasing (has to be done on each resize or pixels get murdered)
        this.context.imageSmoothingEnabled = false;
    }

    EditorCanvasProto.drawSprites = function() {
        var curX, curY, nCols;
        curX = curY = nCols = 0;
        
        for(let i=0; i<this.sprites.length; i++){
            let sprite = this.sprites[i];

            //Update mock sprite rect and cell rect
            let previous = i > 0 ? this.sprites[i-1] : sprite;
            sprite.update(curX, curY, this.grid.cellSize, previous);

            if(sprite.flipped){
                this.drawFlipped(sprite);
            }else{
                this.draw(sprite);
            }

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

    EditorCanvasProto.draw = function(sprite){
        let s = sprite.src;
        let d = sprite.pos;

        this.context.drawImage(this.srcCanvas, s.x, s.y, s.width, s.height, d.x, d.y, d.width, d.height);
    }

    EditorCanvasProto.drawFlipped = function(sprite){
        this.context.save();

        let s = sprite.src;
        let d = sprite.pos;

        var translateX = 0, translateY = 0, 
        posX = d.x, posY = d.y, 
        scaleX = 1, scaleY = 1;

        if(sprite.flipX){
            translateX = d.x + d.width / 2;
            posX = -d.width / 2;
            scaleX = -1;
        }
        if(sprite.flipY){
            translateY = d.y + d.height / 2;
            posY = -d.height / 2;
            scaleY = -1;
        }

        this.context.translate(translateX, translateY);
        this.context.scale(scaleX, scaleY);

        
        this.context.drawImage(this.srcCanvas, s.x, s.y, s.width, s.height, posX, posY, d.width, d.height);
        this.context.restore();
    }

    EditorCanvasProto.drawGrid = function() {
        this.grid.draw()
    }

	return EditorCanvas;
})();