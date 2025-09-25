import Grid from './components/Grid';
import Window from '../../components/Window';

class EditorWindow extends Window {
    constructor(srcWindow) {
        super();

        this.src = srcWindow;
        this.grid = new Grid();
        this.sprites = [];
    }  
    
    init(spriteArr, rows, cols) {
        this.clear();

        this.sprites = spriteArr;
        this.grid.init(spriteArr, rows, cols);

        this.width = this.grid.width;
        this.height = this.grid.height;

        //Disable aliasing (has to be done on each resize or pixels get murdered)
        this.context.imageSmoothingEnabled = false;
    }

    drawAll(showGrid) {
        var curX, curY, nCols;
        curX = curY = nCols = 0;

        if(showGrid) { this.grid.draw() }
        
        for(let i=0; i<this.sprites.length; i++){
            this.#update(i, curX, curY);
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

    drawSingle(n) {
        this.#update(n)
    }

    setDisplayMode(isDark) {
        this.grid.setDisplayMode(isDark);
    }

    #fillCell(x, y, cellSize) {
        let bg = this.src.getBg();

        //If background is not transparent
        if(bg.reduce((acc, cur) => acc + cur, 0) > 0){
            this.context.fillStyle = `rgba(${bg[0]}, ${bg[1]}, ${bg[2]}, ${bg[3]})`;
            this.context.fillRect(x, y, cellSize, cellSize);
        }
    }

    #update(index, x = -1, y = -1){
        let sprite = this.sprites[index];
        
        //Updating in place
        if((x + y) < 0){ x = sprite.cell.x, y = sprite.cell.y }

        //Update sprite rect and cell rect
        let previous = index > 0 ? this.sprites[index-1] : sprite;
        sprite.update(x, y, this.grid.cellSize, previous);

        this.context.clearRect(x, y, this.grid.cellSize, this.grid.cellSize);
        this.#fillCell(x, y, this.grid.cellSize);

        if(sprite.flipped){
            this.#drawFlipped(sprite);
        }else{
            this.#draw(sprite);
        }
    }

    #draw(sprite){
        let s = sprite.src;
        let d = sprite.pos;

        this.context.drawImage(
            this.src.canvas, s.x, s.y, s.width, s.height, 
            d.x, d.y, d.width, d.height
        );
    }

    #drawFlipped(sprite){
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
            this.src.canvas, s.x, s.y, s.width, s.height, 
            posX, posY, d.width, d.height
        );
        this.context.restore();
    }

}

export default EditorWindow;