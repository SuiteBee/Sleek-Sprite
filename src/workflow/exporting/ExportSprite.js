class ExportSprite {
	constructor(sprite, name) {
		this.name = name;
		this.rect = {
			x: sprite.cell.x,
			y: sprite.cell.y,
			w: sprite.cell.width,
			h: sprite.cell.height
		}
	}
}

export default ExportSprite;