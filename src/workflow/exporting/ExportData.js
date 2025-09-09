class ExportData {
	constructor(exportSprites) {
        this.sprites = exportSprites.reduce((accumulator, sprite) => {
            accumulator[sprite.name] = {
                rect: sprite.rect
            }
            return accumulator;
        }, {});
	}
}

export default ExportData;