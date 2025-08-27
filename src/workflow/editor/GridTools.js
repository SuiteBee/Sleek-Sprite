
//ctx: grid context

import MockSprite from "./MockSprite";

//size: of each cell in pixels
export function drawGrid(editorCanvas, cellSize) {
    let ctx = editorCanvas.context;
    let canvasWidth = editorCanvas.canvas.width;
    let canvasHeight = editorCanvas.canvas.height;

    ctx.strokeStyle = 'black'; // Grid line color
    ctx.lineWidth = 1; // Grid line thickness

    // Draw vertical lines
    for (let x = 0; x <= canvasWidth; x += cellSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvasHeight);
        ctx.stroke();
    }

    // Draw horizontal lines
    for (let y = 0; y <= canvasHeight; y += cellSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvasWidth, y);
        ctx.stroke();
    }
}

export function initGrid(spriteArr, rows, columns) {
    //Get the max size of the selected sprites width and height
    var maxWidth = Math.max(...spriteArr.map(sprite => sprite.rect.width));
    var maxHeight = Math.max(...spriteArr.map(sprite => sprite.rect.height));

    //Set cell size (square) to the largest dimension
    var cSize = Math.max(maxWidth, maxHeight);
    
    let gridInfo = {
        gridWidth: cSize * columns,
        gridHeight: cSize * rows,
        cellSize: cSize
    };

    return gridInfo;
}