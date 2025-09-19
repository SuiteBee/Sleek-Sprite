class Animator {

constructor(src, target) {
        this.src            = src;
        this.canvas         = target;
        this.interval       = 0;
        this.then           = Date.now();

        this.animIndex      = 0;
        this.frames         = [];
        this.adjustments    = [];
        this.handle;

        //Animation callback
        this.draw = function(src, target, rect, adjust) {
            // the preview canvas has a fixed size and the sprite is resized to fit the preview panel
            const context = target.getContext('2d');
            context.imageSmoothingEnabled = false;
            context.clearRect(0, 0, target.width, target.height);
            context.drawImage(
                src, rect.x, rect.y, rect.width, rect.height,
                adjust.x, adjust.y, rect.width, rect.height 
            );
        };
    }

    Queue = (sprites, fps) => {
        this.Stop();
        this.interval = 1000/fps;
        this.then = Date.now();

        this.frames = sprites.map(s => s.pos);
        this.adjustments = sprites.map(s => s.nudge);

        let size = sprites[0].cell.width;
        this.canvas.width = size;
        this.canvas.height = size;
    }

    Update = (fps) => {
        this.Pause();
        this.interval = 1000/fps;
        this.then = Date.now();
        this.Start();
    }

    Pause = () => {
        self.cancelAnimationFrame(this.handle);
    }

    Start = () => {
        this.animIndex = 0;
        this.animLoop();
    }

    Stop = () => {
        self.cancelAnimationFrame(this.handle);
        this.animIndex = 0;
        this.frames = [];
        this.adjustments = [];

        const context = this.canvas.getContext('2d');
        context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    animLoop = () => {
        var rect = this.frames[this.animIndex];
        var adjust = this.adjustments[this.animIndex];
        if(rect){
            this.draw(this.src, this.canvas, rect, adjust);
        }

        let now = Date.now();
        let elapsed = now - this.then;

        if(elapsed >= this.interval){
            this.then = now - (elapsed % this.interval);
            this.animIndex = (this.animIndex + 1) % this.frames.length;
        }

        this.handle = self.requestAnimationFrame(this.animLoop);
    }

    zoom = function(pct){
        let scl = pct/100;
        let tOrigin = 'top right';
        let trans = `scale(${scl}, ${scl})`;

        this.canvas.style.transformOrigin = tOrigin;
        this.canvas.style.transform = trans;
    }

}

export default Animator;