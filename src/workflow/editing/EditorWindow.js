import Grid from './components/Grid';
import Window from '../../components/Window';

class EditorWindow extends Window {
    constructor(srcWindow) {
        super();

        this.src = srcWindow;
        this.grid = new Grid();
    }  
    
    init(editedArr, rows, cols) {
        this.clear();

        this.grid.init(editedArr, rows, cols, this.scale);

        this.width = this.grid.cellSizeUnscaled * cols;
        this.height = this.grid.cellSizeUnscaled * rows;

        //Disable aliasing (has to be done on each resize or pixels get murdered)
        this.context.imageSmoothingEnabled = false;
    }

    drawAll(editedArr, showGrid, showTicks) {
        var curX, curY, nCols;
        curX = curY = nCols = 0;

        if(showGrid) { this.grid.draw(showTicks) }
        
        for(let i=0; i<editedArr.length; i++){
            let sprite = editedArr[i];
            let previous = i > 0 ? editedArr[i-1] : sprite;
            this.#update(sprite, previous, curX, curY);
            
            nCols++;

            if(nCols >= this.grid.cols){
                nCols = 0;
                curX = 0;
                curY += this.grid.cellSizeUnscaled;
            } else{
                curX += this.grid.cellSizeUnscaled;
            }
        }
    }

    drawSingle(sprite, previous) {
        this.#update(sprite, previous)
    }

    setDisplayMode(isDark, showTicks) {
        this.grid.setDisplayMode(isDark, showTicks);
    }

    #fillCell(x, y, cellSize) {
        let bg = this.src.getBg();

        //If background is not transparent
        if(bg.reduce((acc, cur) => acc + cur, 0) > 0){
            this.context.fillStyle = `rgba(${bg[0]}, ${bg[1]}, ${bg[2]}, ${bg[3]})`;
            this.context.fillRect(x, y, cellSize, cellSize);
        }
    }

    #update(sprite, previous, x = -1, y = -1){
        //Updating in place
        if((x + y) < 0){ x = sprite.cell.x, y = sprite.cell.y }

        //Update sprite rect and cell rect
        sprite.update(x, y, this.grid.cellSizeUnscaled, previous);

        this.context.clearRect(x, y, this.grid.cellSizeUnscaled, this.grid.cellSizeUnscaled);
        this.#fillCell(x, y, this.grid.cellSizeUnscaled);

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