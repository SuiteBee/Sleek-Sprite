class Rect {
	constructor(x, y, width, height) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
	}

	scaled(val) {
		let scaledCopy = structuredClone(this);
		scaledCopy.x *= val;
		scaledCopy.y *= val;
		scaledCopy.width *= val;
		scaledCopy.height *= val;

		return scaledCopy;
	}
}

export default Rect;