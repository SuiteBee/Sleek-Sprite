import Grid from '../editing/components/Grid';
import Window from '../../components/Window';

class AnimatorWindow extends Window {
    constructor(srcWindow) {
        super();

        this.src     = srcWindow;
        this.srcGrid = srcWindow.grid;

        this.grid    = new Grid();
	}

    reset() {
        this.clear();
        this.grid.clear();

        this.grid.rows = this.srcGrid.rows;
        this.grid.cols = this.srcGrid.cols;
        this.grid.cellSize = this.srcGrid.cellSize;

        this.width = this.src.width;
        this.height = this.src.height;
        this.canvas.style.transformOrigin = this.src.canvas.style.transformOrigin;
        this.canvas.style.transform = this.src.canvas.style.transform;

        this.grid.width = this.srcGrid.width;
        this.grid.height = this.srcGrid.height;
        this.grid.canvas.style.transformOrigin = this.srcGrid.canvas.style.transformOrigin;
        this.grid.canvas.style.transform = this.srcGrid.canvas.style.transform;
        
        //Disable aliasing (has to be done on each resize or pixels get murdered)
        this.context.imageSmoothingEnabled = false;
        this.grid.context.imageSmoothingEnabled = false;

        this.context.drawImage(this.src.canvas, 0, 0);
        this.grid.draw();
    }

    setDisplayMode(isDark) {
        this.grid.rows = this.srcGrid.rows;
        this.grid.cols = this.srcGrid.cols;
        this.grid.cellSize = this.srcGrid.cellSize;

        this.grid.setDisplayMode(isDark);
    }
}

export default AnimatorWindow;