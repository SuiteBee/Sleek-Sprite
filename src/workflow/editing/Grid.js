
class Grid {
    constructor(ctx) {
        this.gridContext = ctx;

        this.width = 0;
        this.height = 0;
        this.cellSize = 0;
        this.rows = 0;
        this.cols = 0;
    }
}

var GridProto = Grid.prototype;

GridProto.set = function(spriteArr, rows, columns) {
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

GridProto.draw = function() {
    this.gridContext.strokeStyle = 'black'; // Grid line color
    this.gridContext.lineWidth = 1; // Grid line thickness

    // Draw vertical lines
    for (let x = 0; x <= this.width; x += this.cellSize) {
        this.gridContext.beginPath();
        this.gridContext.moveTo(x, 0);
        this.gridContext.lineTo(x, this.height);
        this.gridContext.stroke();
    }

    // Draw horizontal lines
    for (let y = 0; y <= this.height; y += this.cellSize) {
        this.gridContext.beginPath();
        this.gridContext.moveTo(0, y);
        this.gridContext.lineTo(this.width, y);
        this.gridContext.stroke();
    }
}

GridProto.find = function(mousePos) {
    if(mousePos.x <= this.width && mousePos.y <= this.height){
        let findCol = Math.floor(mousePos.x / this.cellSize);
        let findRow = Math.floor(mousePos.y / this.cellSize);

        let i = (findRow * this.cols) + findCol;
        return i;
    }
    
}

export default Grid;