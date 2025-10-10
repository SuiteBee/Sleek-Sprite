import Window from '../../../components/Window';

class Grid extends Window {
    constructor() {
        super();

        this.color = 'black';
        this.cellSize = 0;

        this.rows = 0;
        this.cols = 0;
    }

    init(spriteArr, rows, columns) {
        if(!spriteArr.length) { this.cellSize = 0; return; }

        //Get the max size of the selected sprites width and height
        var maxWidth = Math.max(...spriteArr.map(sprite => sprite.rect.width));
        var maxHeight = Math.max(...spriteArr.map(sprite => sprite.rect.height));

        //Set cell size (square) to the largest dimension
        this.cellSize = Math.max(maxWidth, maxHeight);

        this.width = this.cellSize * columns;
        this.height = this.cellSize * rows;

        this.rows = rows;
        this.cols = columns;
    }
        
    draw(showTicks = false) {
        this.clear();

        this.context.strokeStyle = this.color; // Grid line color
        this.context.lineWidth = 1; // Grid line thickness
        this.context.imageSmoothingEnabled = false;

        if(!this.cellSize) {return}

        // Draw vertical lines
        for (let x = 0; x <= this.width; x += this.cellSize) {
            this.drawLine([x, 0], [x, this.height]);
        }

        // Draw horizontal lines
        for (let y = 0; y <= this.height; y += this.cellSize) {
            this.drawLine([0, y], [this.width, y]);
        }

        if(showTicks) {
            this.drawTicks();
        }
    }

    drawTicks() {
        let halfWidth = this.cellSize/2;
        let tickLength = this.cellSize/8;
        let halfTick = tickLength/2;

        for(let x = 0; x <= this.cols; x++){
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
        let scaledWidth  = this.width * this.scale,
            scaledHeight = this.height * this.scale,
            scaledCell   = this.cellSize * this.scale;

        if(mousePos.x <= scaledWidth && mousePos.y <= scaledHeight){
            let findCol = Math.floor(mousePos.x / scaledCell);
            let findRow = Math.floor(mousePos.y / scaledCell);

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