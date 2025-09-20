class ExportData {
	constructor(exportSprites, fileName, width, height) {
        this.textures = {
            fileName: fileName,
            size: {
                w: width,
                h: height
            },
            frames: exportSprites.reduce((accumulator, sprite) => {
                accumulator[sprite.name] = {
                    frame: sprite.rect
                }
                return accumulator;
            }, {})
        }
	}

    AddAnimations(exportAnims) {
        this.animations = 
            exportAnims.reduce((accumulator, anim) => {
                accumulator[anim.name] = {
                    fps: anim.fps,
                    frames: anim.frames
                }
                return accumulator;
            }, {});
    }
}

export default ExportData;