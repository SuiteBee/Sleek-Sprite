import $ from 'jquery';

import Animator from './Animator';

class AnimatorView {
    constructor() {
        this.$preview = createPreviewComponent().appendTo($appendTo);
        
        this.canvas = this.$preview.find('canvas')[0];
        this.context = this.canvas.getContext('2d');

        this.fps = 5;
        this.frames = [];
        this.animation = new Animator(this.$preview)

        function createPreviewComponent() {
            const container = $('<div class="edit-preview-container"></div>');
            $('<div class="panel-title">Editing</div>').appendTo(container);
            $('<div><canvas id="edit-preview-canvas" class="panel-sprite-selected" width="200" height="200"></canvas></div>').appendTo(container);

            return container;
        }
    }
}
        
export default AnimatorView