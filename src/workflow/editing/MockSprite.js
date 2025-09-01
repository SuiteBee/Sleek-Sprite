import Rect from '../../utilities/Rect';

class MockSprite {
	constructor(rect, index) {
		this.n = index;

		this.src = rect;
		this.rect = new Rect(rect.x, rect.y, rect.width, rect.height);
		this.cell = new Rect(rect.x, rect.y, rect.width, rect.height);

		//Defaults
		this.anchor = "Center";
		this.flipX = false;
		this.flipY = false;
		this.nudgeX = 0;
		this.nudgeY = 0;
	}

	get pos() {
		return new Rect(
			this.rect.x + this.nudgeX, 
			this.rect.y + this.nudgeY, 
			this.rect.width, 
			this.rect.height
		);
	}

	get flipped(){
		return this.flipX || this.flipY;
	}
}

var MockProto = MockSprite.prototype;

MockProto.update = function(x, y, cellSize, previous){
	this._setAlignment(x, y, cellSize, previous);
	this._setCell(x, y, cellSize);
}

MockProto._setAlignment = function(x, y, cellSize, previous) {
	let halfWidth = this.rect.width/2;
	let halfHeight = this.rect.height/2;
	let halfCell = cellSize/2;

	//Sprite center pos to draw from
	let midX = halfCell - halfWidth;
	let midY = halfCell - halfHeight;

	//Horizontal alignment: Always center
	this.rect.x = x + midX;

	//Vertical alignment 
	//Base on previous sprite (uses original y AND current y)
	if(this.anchor == "Previous"){
		let prevOldDiff = previous.src.y - this.src.y;
		let prevCurDiff = previous.rect.y;

		this.rect.y = y + prevCurDiff - prevOldDiff;
	//Align to bottom of cell
	} else if(this.anchor == "Bottom"){
		let cellDiff = cellSize - this.rect.height;
		let verticalPadding = cellDiff/2;

		this.rect.y = y + midY + verticalPadding;
	} else if(this.anchor == "Center"){
		this.rect.y = y + midY;
	}
}

//Cell size/pos sprite is contained in
MockProto._setCell = function(x, y, size) {
	this.cell.x = x;
	this.cell.y = y;
	this.cell.width = size;
	this.cell.height = size;
}

export default MockSprite;