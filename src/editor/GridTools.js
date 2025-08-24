
//ctx: grid context
//size: of each cell in pixels
export function drawGrid(editorCanvas, size) {
    let ctx = editorCanvas._context;
    let canvasWidth = editorCanvas.canvas.width;
    let canvasHeight = editorCanvas.canvas.height;

    ctx.clearRect(0, 0, canvasWidth, canvasHeight); // Clear previous drawings

    ctx.strokeStyle = 'black'; // Grid line color
    ctx.lineWidth = 1; // Grid line thickness

    // Draw vertical lines
    for (let x = 0; x <= canvasWidth; x += size) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvasHeight);
        ctx.stroke();
    }

    // Draw horizontal lines
    for (let y = 0; y <= canvasHeight; y += size) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvasWidth, y);
        ctx.stroke();
    }
}

export function getGridInfo(spriteArr) {
    var  sWidth, sHeight, maxWidth, maxHeight;
         sWidth = sHeight =
         maxWidth = maxHeight = 0;

    spriteArr.forEach(function(sprite, i) {
        sWidth = Number(sprite.rect.width);
        sHeight = Number(sprite.rect.height);

        maxWidth = sWidth > maxWidth ? sWidth : maxWidth;
        maxHeight = sHeight > maxHeight ? sHeight : maxHeight;
    });

    var cSize = Math.max(maxWidth, maxHeight);
    let gridInfo = {
        gridWidth: cSize*spriteArr.length,
        gridHeight: cSize*spriteArr.length,
        cellSize: cSize
    };

    return gridInfo;
}