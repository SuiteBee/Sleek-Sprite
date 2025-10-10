import Rect from '../../../components/Rect';

class EditSprite {
	constructor(rect, index) {
		this.n = index;
		this.name = index.toString();

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

    //Remove cell positions to draw in place (for animation)
	get origin() {
		return new Rect(
			this.rect.x - this.cell.x + this.nudgeX,
			this.rect.y - this.cell.y + this.nudgeY,
			this.rect.width,
			this.rect.height
		)
	}

	get pos() {
		return new Rect(
			this.rect.x + this.nudgeX, 
			this.rect.y + this.nudgeY, 
			this.rect.width, 
			this.rect.height
		);
	}

	get nudge() {
		return new Rect(
			this.nudgeX,
			this.nudgeY,
			0,
			0
		)
	}

	get flipped(){
		return this.flipX || this.flipY;
	}

	get xRange() {
		var minX = this.cell.x - this.rect.x;
		var maxX = this.rect.x - this.cell.x;

		return [minX, maxX];
	}

	get xRangeStr() {
		let range = this.xRange;
		return `${range[0]}-${range[1]}`
	}

	get yRange() {
		var minY = this.cell.y - this.rect.y;
		var maxY = this.rect.y - this.cell.y;

		if(this.anchor == "Bottom"){
			maxY = 0;
		}
		return [minY, maxY];
	}
	
	get yRangeStr() {
		let range = this.yRange;
		return `${range[0]}-${range[1]}`
	}
}

var EditProto = EditSprite.prototype;

EditProto.validNudgeX = function(val) {
	let range = this.xRange;
	return (val >= range[0] && val <= range[1]);
}

EditProto.validNudgeY = function(val) {
	let range = this.yRange;
	return (val >= range[0] && val <= range[1]);
}

EditProto.update = function(x, y, cellSize, previous){
	this._setAlignment(x, y, cellSize, previous);
	this._setCell(x, y, cellSize);
}

EditProto._setAlignment = function(x, y, cellSize, previous) {
	let halfWidth = this.src.width/2;
	let halfHeight = this.src.height/2;
	let halfCell = cellSize/2;

	//Sprite center pos to draw from
	let midX = halfCell - halfWidth;
	let midY = halfCell - halfHeight;

	//Horizontal alignment: Always center
	this.rect.x = x + midX;

	//Vertical alignment 
	//Base on previous sprite (uses original y AND current y)
	if(this.anchor == "Previous"){
        let sign = previous.src.y > this.src.y ? 1 : -1;
		let prevOldDiff = previous.src.y - this.src.y;

		this.rect.y = y + (sign * prevOldDiff);
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
EditProto._setCell = function(x, y, size) {
	this.cell.x = x;
	this.cell.y = y;
	this.cell.width = size;
	this.cell.height = size;
}

export default EditSprite;