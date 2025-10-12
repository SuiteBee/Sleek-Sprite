import AnimSprite from './components/AnimSprite';

import AnimatorWindow from './AnimatorWindow';
import AnimatorWorkspace from './AnimatorWorkspace';
import AnimatorTools from './AnimatorTools';

class Animator {

	constructor(editorWindow) {
        this.refresh            = false;

        this.sprites            = [];
        this.frames             = [];
        this.animations         = [];

        this.copyEnabled        = false;
        this.name               = 'new0';
        this.fps                = 5;

        this.window    = new AnimatorWindow(editorWindow);
        this.workspace = new AnimatorWorkspace(this.window);
        this.tools     = new AnimatorTools(this.workspace);

        this.tools.bind('viewMode', function(isDark) {
            this.window.setDisplayMode(isDark);
            this.workspace.setDisplayMode(isDark);
		}.bind(this));

        this.tools.bind('delete-anim', function() {
           this.#deleteAnimation();
        }.bind(this));

        this.tools.bind('load-anim', function(option) {
            this.#setAnimation(option);
        }.bind(this));

        this.tools.bind('save-anim', function() {
            this.#saveAnimation();
        }.bind(this));

        this.tools.bind('set-name', function(txt) {
            this.name = txt;
        }.bind(this));

        this.tools.bind('set-fps', function(fps) {
            this.fps = fps;
            this.workspace.preview.Update(this.fps);
        }.bind(this));

        this.tools.bind('enable-copy', function(enabled) {
            this.copyEnabled = enabled;
        }.bind(this));

        this.tools.bind('add-frame', function(sprite) {
            this.frames.push(sprite);
            this.#animate();
        }.bind(this));

        this.tools.bind('remove-frame', function(sprite) {
            //Remove last instance of sprite from frames
            let toRemove = this.frames.findLastIndex(f => f.n == sprite.n);
            this.frames.splice(toRemove, 1);
            this.#animate();
        }.bind(this));

        this.tools.bind('remove-all', function() {
            this.frames = [];
            this.#animate();
        }.bind(this));

        this.workspace.bind('click-cell', function(click, idx) {
            if(idx >= 0 && idx < this.sprites.length){
				let sprite = this.sprites[idx];
                this.workspace.selectCell(click, sprite, this.copyEnabled);
            }
        }.bind(this));
    }
    
    activeTab(editSprites){
        if(this.refresh){
            this.animations = [];
            this.sprites = editSprites;

            let options = this.animations.map(a => a.name);
            this.tools.updateAnimations(options);

            this.refresh = false;
        } else {
            this.sprites = editSprites;
        }

        this.window.reset();
    }

    updateScale(pct) {
        this.tools.updateScale(pct);
        this.workspace.updateScale(pct);
    }

    resize(pct) {
        this.window.grid.resize(pct);
    }

    setDisplayMode(isDark) {
        this.tools.setDisplayMode(isDark);
        this.window.setDisplayMode(isDark);
        this.workspace.setDisplayMode(isDark, false);
    }

    #setAnimation(option) {
        let anim = this.animations.filter(a => a.name == option)[0];
        if(anim) {
            this.name = anim.name;
            this.fps = anim.fps;

            this.tools.setAnimation(anim);
            this.workspace.preview.Update(this.fps);
            this.workspace.loadAnimation(anim.frames, this.sprites);
        }
    }

    #saveAnimation() {
        if(this.frames.length < 2) {return}

        let frameIndices = this.frames.map(f => f.n);

        //If animation is already saved replace
        let exists = this.animations.find((a) => a.name == this.name)
        if(this.animations.length > 0 && exists){
            let existingIndex = this.animations.findIndex((a) => a.name == this.name);
            this.animations[existingIndex] = new AnimSprite(this.name, this.fps, frameIndices);
        } else {
            let newAnim = new AnimSprite(this.name, this.fps, frameIndices);
            this.animations.push(newAnim);
        }

        let options = this.animations.map(a => a.name);
        this.tools.updateAnimations(options, this.name);
    }

    #deleteAnimation() {
        this.animations = this.animations.filter(a => a.name != this.name);

        let options = this.animations.map(a => a.name);
        this.tools.updateAnimations(options);

        if(this.animations.length > 0){
            this.#setAnimation(this.animations[0].name);
        } else{
            this.workspace.unselectAllFrames();
        }
    }

    #animate() {
        if(this.frames.length == 0) {
            this.workspace.preview.Stop();
        } else {
            this.workspace.preview.Queue(this.frames, this.fps);
            this.workspace.preview.Start();
        }
    }
}

export default Animator;

