export default (function() {

	function AnimatorCanvas(src, srcGrid) {
		this.canvas = document.createElement('canvas');
		this.context = this.canvas.getContext('2d');
        this.gridCanvas = document.createElement('canvas');
        this.gridContext = this.gridCanvas.getContext('2d');

        this.src = src;
        this.srcCanvas = src.canvas;
        this.srcContext = src.canvas.getContext('2d');
        this.srcGrid = srcGrid;
        this.sprites = [...src.sprites];
	}
	
	var AnimatorCanvasProto = AnimatorCanvas.prototype;

    AnimatorCanvasProto.reset = function() {
        this.sprites = [...this.src.sprites];

        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.gridContext.clearRect(0, 0, this.gridCanvas.width, this.gridCanvas.height);

        this.canvas.width = this.srcGrid.width;
        this.canvas.height = this.srcGrid.height;
        this.canvas.style.transformOrigin = this.srcGrid.canvas.style.transformOrigin;
        this.canvas.style.transform = this.srcGrid.canvas.style.transform;

        this.gridCanvas.width = this.srcGrid.width;
        this.gridCanvas.height = this.srcGrid.height;
        this.gridCanvas.style.transformOrigin = this.srcGrid.canvas.style.transformOrigin;
        this.gridCanvas.style.transform = this.srcGrid.canvas.style.transform;
        
        //Disable aliasing (has to be done on each resize or pixels get murdered)
        this.context.imageSmoothingEnabled = false;
        this.gridContext.imageSmoothingEnabled = false;

        if(this.sprites.length > 0){
            this.context.drawImage(this.srcCanvas, 0, 0);
            this.gridContext.drawImage(this.srcGrid.canvas, 0, 0);
        }
    }

    AnimatorCanvasProto.zoom = function(pct){
        let scl = pct/100;
        let tOrigin = 'top left';
        let trans = `scale(${scl}, ${scl})`;

        this.canvas.style.transformOrigin = tOrigin;
        this.canvas.style.transform = trans;

        this.grid.zoom(scl, tOrigin, trans)
    }

	return AnimatorCanvas;
})();