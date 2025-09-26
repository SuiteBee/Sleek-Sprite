import Window from '../../components/Window';

class AnimatorPreview extends Window {

constructor(src, target) {
        super(target);

        this.src            = src;
        this.interval       = 0;
        this.then           = Date.now();

        this.animIndex      = 0;
        this.frames         = [];

        this.handle;

        //Animation callback
        this.draw = function(src, frame) {
            this.clear();

            let pos = frame.pos;
            let origin = frame.origin;

            this.context.imageSmoothingEnabled = false;
            this.context.drawImage(
                src, pos.x, pos.y, pos.width, pos.height,
                origin.x, origin.y, origin.width, origin.height
            );
        };
    }

    Queue(sprites, fps) {
        this.Stop();
        this.interval = 1000/fps;
        this.then = Date.now();

        this.frames = sprites;
        this.width = this.height = sprites[0].cell.width;
    }

    Update(fps) {
        this.Pause();
        this.interval = 1000/fps;
        this.then = Date.now();
        this.Start();
    }

    Pause() {
        self.cancelAnimationFrame(this.handle);
    }

    Start() {
        this.animIndex = 0;
        this.#animLoop();
    }

    Stop() {
        self.cancelAnimationFrame(this.handle);
        this.animIndex = 0;
        this.frames = [];

        this.clear();
    }

    #animLoop = () => {
        var frame = this.frames[this.animIndex];
        if(frame){
            this.draw(this.src, frame);
        }

        let now = Date.now();
        let elapsed = now - this.then;

        if(elapsed >= this.interval){
            this.then = now - (elapsed % this.interval);
            this.animIndex = (this.animIndex + 1) % this.frames.length;
        }

        this.handle = self.requestAnimationFrame(this.#animLoop);
    }

}

export default AnimatorPreview;