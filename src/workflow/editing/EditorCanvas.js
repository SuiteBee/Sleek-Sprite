import Grid from './components/Grid';

export default (function() {

	function EditorCanvas(src) {
		this.canvas = document.createElement('canvas');
		this.context = this.canvas.getContext('2d');

        this.src = src;
        this.srcCanvas = src.canvas;
        this.srcContext = src.canvas.getContext('2d');

        this.grid = new Grid();
        this.sprites = [];
	}
	
	var EditorCanvasProto = EditorCanvas.prototype;

    EditorCanvasProto.reset = function(spriteArr, rows, cols) {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.sprites = spriteArr;
        this.grid.reset(spriteArr, rows, cols);

        this.canvas.width = this.grid.width;
        this.canvas.height = this.grid.height;

        //Disable aliasing (has to be done on each resize or pixels get murdered)
        this.context.imageSmoothingEnabled = false;
    }

    EditorCanvasProto.drawAll = function(showGrid) {
        var curX, curY, nCols;
        curX = curY = nCols = 0;

        if(showGrid && this.sprites.length > 0) { this.grid.draw() }
        
        for(let i=0; i<this.sprites.length; i++){
            this._update(i, curX, curY);
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

    EditorCanvasProto.drawSingle = function(n) {
        this._update(n)
    }

    EditorCanvasProto.zoom = function(pct){
        let scl = pct/100;
        let tOrigin = 'top left';
        let trans = `scale(${scl}, ${scl})`;

        this.canvas.style.transformOrigin = tOrigin;
        this.canvas.style.transform = trans;

        this.grid.zoom(scl, tOrigin, trans)
    }

    EditorCanvasProto._fillCell = function(x, y, cellSize) {
        let bg = this.src.getBg();

        //If background is not transparent
        if(bg.reduce((acc, cur) => acc + cur, 0) > 0){
            this.context.fillStyle = `rgba(${bg[0]}, ${bg[1]}, ${bg[2]}, ${bg[3]})`;
            this.context.fillRect(x, y, cellSize, cellSize);
        }
    }

    EditorCanvasProto._update = function(index, x = -1, y = -1){
        let sprite = this.sprites[index];
        
        //Updating in place
        if((x + y) < 0){ x = sprite.cell.x, y = sprite.cell.y }

        //Update sprite rect and cell rect
        let previous = index > 0 ? this.sprites[index-1] : sprite;
        sprite.update(x, y, this.grid.cellSize, previous);

        this.context.clearRect(x, y, this.grid.cellSize, this.grid.cellSize);
        this._fillCell(x, y, this.grid.cellSize);

        if(sprite.flipped){
            this._drawFlipped(sprite);
        }else{
            this._draw(sprite);
        }
    }

    EditorCanvasProto._draw = function(sprite){
        let s = sprite.src;
        let d = sprite.pos;

        this.context.drawImage(
            this.srcCanvas, s.x, s.y, s.width, s.height, 
            d.x, d.y, d.width, d.height
        );
    }

    EditorCanvasProto._drawFlipped = function(sprite){
        this.context.save();

        let s = sprite.src;
        let d = sprite.pos;

        var translateX = 0, translateY = 0, 
        posX = d.x, posY = d.y, 
        scaleX = 1, scaleY = 1;

        if(sprite.flipX){
            translateY = d.y + d.height / 2;
            posY = -d.height / 2;
            scaleY = -1;
        }
        if(sprite.flipY){
            translateX = d.x + d.width / 2;
            posX = -d.width / 2;
            scaleX = -1;
        }

        this.context.translate(translateX, translateY);
        this.context.scale(scaleX, scaleY);

        this.context.drawImage(
            this.srcCanvas, s.x, s.y, s.width, s.height, 
            posX, posY, d.width, d.height
        );
        this.context.restore();
    }


	return EditorCanvas;
})();