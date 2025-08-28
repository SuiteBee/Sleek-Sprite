import Rect from '../../utilities/Rect';

class MockSprite {
	constructor(rect, data, index) {
		this.old = rect;
		this.n = index;
		this.rect = new Rect(rect.x, rect.y, rect.width, rect.height);
		this.cell = new Rect(rect.x, rect.y, rect.width, rect.height)
        this.imgData = data;

		this.align = "Center";
	}
}

var MockProto = MockSprite.prototype;

MockProto.setAlignment = function(x, y, previous, cellSize) {
	let halfWidth = this.rect.width/2;
	let halfHeight = this.rect.height/2;
	let halfCell = cellSize/2;

	//Align Center: Default
	let midX = halfCell - halfWidth;
	let midY = halfCell - halfHeight;

	//Horizontal alignment: Always center
	this.rect.x = x + midX;

	//Align based on previous sprite position (uses original y AND current y)
	if(this.align == "Previous"){
		let prevOldDiff = previous.old.y - this.old.y;
		let prevCurDiff = previous.rect.y - this.rect.y;

		this.rect.y = y + prevOldDiff + prevCurDiff;
	//Align to bottom of cell
	} else if(this.align == "Bottom"){
		let cellDiff = cellSize - this.rect.height;
		let verticalPadding = cellDiff/2;

		this.rect.y = y + midY + verticalPadding;
	} else if(this.align == "Center"){
		this.rect.y = y + midY;
	}
}

MockProto.setCell = function(x, y, size) {
	this.cell.x = x;
	this.cell.y = y;
	this.cell.width = size;
	this.cell.height = size;
}

export default MockSprite;