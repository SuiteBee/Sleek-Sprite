class Animator {

constructor(src, target) {
        this.src            = src;
        this.canvas         = target;
        this.interval       = 0;
        this.then           = Date.now();

        this.animIndex      = 0;
        this.frames         = [];

        this.handle;

        //Animation callback
        this.draw = function(src, target, frame) {
            const context = target.getContext('2d');
            context.imageSmoothingEnabled = false;
            context.clearRect(0, 0, target.width, target.height);

            let pos = frame.pos;
            let origin = frame.origin;

            context.drawImage(
                src, pos.x, pos.y, pos.width, pos.height,
                origin.x, origin.y, origin.width, origin.height
            );
        };
    }

    Queue = (sprites, fps) => {
        this.Stop();
        this.interval = 1000/fps;
        this.then = Date.now();

        this.frames = sprites;
        this.canvas.width = this.canvas.height = sprites[0].cell.width;
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

        const context = this.canvas.getContext('2d');
        context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    animLoop = () => {
        var frame = this.frames[this.animIndex];
        if(frame){
            this.draw(this.src, this.canvas, frame);
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