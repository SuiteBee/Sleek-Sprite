class ExportSprite {
	constructor(sprite, name) {
		this.dat = {};
		this.dat[name] = {
			rect: {
				x: sprite.cell.x,
				y: sprite.cell.y,
				w: sprite.cell.width,
				h: sprite.cell.height
			}
		}
	}
}

export default ExportSprite;