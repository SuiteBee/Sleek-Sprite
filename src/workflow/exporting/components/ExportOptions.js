class ExportOptions {
	constructor(name = 'texture', map = true, data = false, anim = false) {
		this.exportName = name
        this.hasMap     = map;
        this.isSeparate = data;
        this.hasAnim    = anim;
	}
}

export default ExportOptions;