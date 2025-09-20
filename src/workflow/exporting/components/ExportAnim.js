class ExportAnim {
	constructor(animSprite, editSprites) {
		this.name = animSprite.name;
        this.fps = animSprite.fps;
		this.frames = animSprite.frames.map(frame => editSprites[frame].name);
	}
}

export default ExportAnim;