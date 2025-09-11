
class Grid {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.context = this.canvas.getContext('2d');

        this.width = 0;
        this.height = 0;
        this.cellSize = 0;
        this.rows = 0;
        this.cols = 0;

        this.zoomScale = 1;
    }
}

var GridProto = Grid.prototype;

GridProto.reset = function(spriteArr, rows, columns) {
    this.context.clearRect(0, 0, this.width, this.height);

    //Get the max size of the selected sprites width and height
    var maxWidth = Math.max(...spriteArr.map(sprite => sprite.rect.width));
    var maxHeight = Math.max(...spriteArr.map(sprite => sprite.rect.height));

    //Set cell size (square) to the largest dimension
    this.cellSize = Math.max(maxWidth, maxHeight);

    this.width = this.cellSize * columns;
    this.height = this.cellSize * rows;

    this.rows = rows;
    this.cols = columns;

    this.canvas.width = this.width;
    this.canvas.height = this.height;
}

GridProto.draw = function() {
    this.context.strokeStyle = 'black'; // Grid line color
    this.context.lineWidth = 1; // Grid line thickness

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

GridProto.find = function(mousePos) {
    if(mousePos.x <= this.width && mousePos.y <= this.height){
        let findCol = Math.floor(mousePos.x / (this.cellSize * this.zoomScale));
        let findRow = Math.floor(mousePos.y / (this.cellSize * this.zoomScale));

        let i = (findRow * this.cols) + findCol;
        return i;
    }
}

GridProto.zoom = function(scl, origin, transform) {
    this.zoomScale = scl;
    this.canvas.style.transformOrigin = origin;
    this.canvas.style.transform = transform;
}

export default Grid;