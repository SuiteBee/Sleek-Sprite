class Animator {

constructor(canvas) {
        this.canvas = canvas;
        this.interval = 0;
        this.then = Date.now();

        this.animIndex = 0;
        this.animSprites = [];
        this.handle;

        //Animation callback
        this.draw = (canvas, rect) => {
            // the preview canvas has a fixed size and the sprite is resized to fit the preview panel
            const context = canvas.getContext('2d');
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.drawImage(
                canvas, rect.x, rect.y, rect.width, rect.height,
                0, 0, canvas.width, canvas.height
                //0, 0, rect.width, rect.height 
            );
        };
    }

    Queue = (sprites, fps) => {
        this.Stop();
        this.interval = 1000/fps;
        this.then = Date.now();

        this.animIndex = 0;
        this.animSprites = sprites;

        this.animLoop();
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
        this.animSprites = [];
    }

    animLoop = () => {
        var rect = this.animSprites[this.animIndex];
        if(rect){
            this.draw(this.canvas, rect);
        }

        let now = Date.now();
        let elapsed = now - this.then;

        if(elapsed >= this.interval){
            this.then = now - (elapsed % this.interval);
            this.animIndex = (this.animIndex + 1) % this.animSprites.length;
        }

        this.handle = self.requestAnimationFrame(this.animLoop);
    }

}

export default Animator;