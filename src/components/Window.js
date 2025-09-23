class Window {
    
    #bgColor;
    
	constructor() {
		this.canvas = document.createElement('canvas');
		this.context = this.canvas.getContext('2d');
		this.#bgColor = [0, 0, 0, 0];
    }

	get width() {
		return this.canvas.width;
	}

	get height() {
		return this.canvas.height;
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
}

export default Window;