class Window {
    
    #bgColor;
    
	constructor() {
		this.canvas = document.createElement('canvas');
		this.context = this.canvas.getContext('2d');
		this.#bgColor = [0, 0, 0, 0];

		this.scale = 1;
    }

	get width() {
		return this.canvas.width;
	}

	set width(val) {
		this.canvas.width = val;
	}

	get height() {
		return this.canvas.height;
	}

	set height(val) {
		this.canvas.height = val;
	}

    setBg(color) {
		this.#bgColor = color;
	}
	
	getBg() {
		return this.#bgColor;
	}

    setImg(img) {
		this.canvas.width = img.width;
		this.canvas.height = img.height;
		
		this.context.drawImage(img, 0, 0);
	}

	getFirstPixel() {
		return this.context.getImageData(0, 0, 1, 1).data;
	}

	getPixels() {
		return this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
	}

	setPixels(data) {
		this.context.putImageData(data, 0, 0);
	}

	clear() {
		this.context.clearRect(0, 0, this.width, this.height);
	}

	zoom(val, from = 'top left'){
        this.scale = val/100;

        let origin    = from;
        let transform = `scale(${this.scale}, ${this.scale})`;

        this.canvas.style.transformOrigin = origin;
        this.canvas.style.transform = transform;
    }
}

export default Window;