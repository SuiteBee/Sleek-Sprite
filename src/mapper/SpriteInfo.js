class SpriteInfo {

    constructor(name, selected) {
        this.name = name;
        if(selected.length > 1){
            this.type = "anim";
            this.frames = this.get_frames(selected);
        }else{
            this.type = "pose";
        }
    }

    get_frames(selected){
        selected.foreach(function(sprite, index){

        });
    }
}

class SpritePosition {
    constructor(rect){
        this.minX = rect.x;
        this.minY = rect.y; 
    }
}

class SpriteSize {
    constructor(rect){
        this.width = rect.width;
        this.height = rect.height;
    }
}

export {
	SpriteInfo,
	SpritePosition,
    SpriteSize
};