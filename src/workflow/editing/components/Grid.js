import Window from '../../../components/Window';

class Grid extends Window {
    constructor() {
        super();

        this.color = 'black';

        this.cellSizeUnscaled = 0
        this.cellSize = 0;

        this.rows = 0;
        this.cols = 0;
    }

    init(spriteArr, rows, columns, scale) {
        if(!spriteArr.length) { this.cellSize = 0; return; }

        //Get the max size of the selected sprites width and height
        var maxWidth = Math.max(...spriteArr.map(sprite => sprite.rect.width));
        var maxHeight = Math.max(...spriteArr.map(sprite => sprite.rect.height));

        //Set cell size (square) to the largest dimension
        this.cellSizeUnscaled = Math.max(maxWidth, maxHeight);
        this.cellSize = this.cellSizeUnscaled * scale;

        this.width = this.cellSize * columns;
        this.height = this.cellSize * rows;

        this.rows = rows;
        this.cols = columns;
    }

    resize(pct, showTicks) {
        if(!this.cellSize) { return; }

        let scale = pct/100;
        this.cellSize = this.cellSizeUnscaled * scale;

        this.width = this.cellSize * this.cols;
        this.height = this.cellSize * this.rows;

        this.draw(showTicks);
    }
        
    draw(showTicks = false) {
        this.clear();

        this.context.strokeStyle = this.color; // Grid line color
        this.context.lineWidth = 1; // Grid line thickness
        this.context.imageSmoothingEnabled = false;

        if(!this.cellSize) {return}

        // Draw vertical lines
        for (let x = 0; x < this.cols; x++) {
            let curX = (this.cellSize * x);
            this.drawLine([curX, 0], [curX, this.height]);
        }
        this.drawLine([this.width, 0], [this.width, this.height]);

        // Draw horizontal lines
        for (let y = 0; y < this.rows; y++) {
            let curY = (this.cellSize * y);
            this.drawLine([0, curY], [this.width, curY]);
        }
        this.drawLine([0, this.height], [this.width, this.height]);

        if(showTicks) {
            this.drawTicks();
        }
    }

    drawTicks() {
        let halfWidth = this.cellSize/2;
        let tickLength = this.cellSize/8;
        let halfTick = tickLength/2;

        for(let x = 0; x < this.cols; x++){
            for(let y = 0; y < this.rows; y++) {
                let curX = (this.cellSize * x);
                let curY = (this.cellSize * y);

                let originX = curX + halfWidth;
                let originY = curY + halfWidth;

                //Vertical Ticks
                this.drawLine([originX, curY], [originX, curY + tickLength]);
                this.drawLine([originX, curY + this.cellSize], [originX, curY + this.cellSize - tickLength]);
                //Center
                this.drawLine([originX, originY - halfTick], [originX, originY + halfTick]);

                //Horizontal Ticks
                this.drawLine([curX, originY], [curX + tickLength, originY]);
                this.drawLine([curX + this.cellSize, originY], [curX + this.cellSize - tickLength, originY]);
                //Center
                this.drawLine([originX - halfTick, originY], [originX + halfTick, originY]);
            }
        }
    }

    drawLine(from, to) {
        this.context.beginPath();
        this.context.moveTo(from[0], from[1]);
        this.context.lineTo(to[0], to[1]);
        this.context.stroke();
    }

    find(mousePos) {
        if(mousePos.x <= this.width && mousePos.y <= this.height){
            let findCol = Math.floor(mousePos.x / this.cellSize);
            let findRow = Math.floor(mousePos.y / this.cellSize);

            let i = (findRow * this.cols) + findCol;
            return i;
        }
    }

    setDisplayMode(isDark, showTicks) {
        this.color = isDark ? 'white' : 'black';
        this.draw(showTicks);
    }
}

export default Grid;