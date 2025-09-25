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
        
    draw() {
        this.clear();

        this.context.strokeStyle = this.color; // Grid line color
        this.context.lineWidth = 1; // Grid line thickness

        if(!this.cellSize) {return}

        // Draw vertical lines
        for (let x = 0; x <= this.width; x += this.cellSize) {
            this.context.beginPath();
            this.context.moveTo(x, 0);
            this.context.lineTo(x, this.height);
            this.context.stroke();
        }

        // Draw horizontal lines
        for (let y = 0; y <= this.height; y += this.cellSize) {
            this.context.beginPath();
            this.context.moveTo(0, y);
            this.context.lineTo(this.width, y);
            this.context.stroke();
        }
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

    setDisplayMode(isDark) {
        this.color = isDark ? 'white' : 'black';
        this.draw();
    }
}

export default Grid;