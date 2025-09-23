import $ from 'jquery';

import Selector from './selecting/Selector';
import EditorView from './editing/EditorView';
import AnimatorView from './animation/AnimatorView';
import ExporterView from './exporting/ExporterView';

class Job {
    constructor() {
        this.selector = new Selector();
        this.editor   = new EditorView(this.selector.window);
        this.animator = new AnimatorView(this.editor.editorCanvas);
        this.exporter = new ExporterView(this.editor.editorCanvas, this.animator);

        var $selectorTabBtn = $('#tabSelection'),
            $editorTabBtn   = $('#tabEditor'),
            $animatorTabBtn = $('#tabAnimate'),
            $exportTabBtn   = $('#tabExport');

        this.darkMode = false;
        this.scale = 100;

        this.selector.workspace.bind('selectedSpritesChange', function(selectedSprites) {
			this.editor.gather(selectedSprites);
            this.editor.refresh = this.exporter.refresh = this.animator.refresh = true;
		}.bind(this));

        this.selector.tools.bind('viewMode', function(isDark) {
			this.darkMode = isDark;
		}.bind(this));

        this.editor.bind('viewMode', function(isDark) {
			this.darkMode = isDark;
		}.bind(this));

        this.animator.bind('viewMode', function(isDark) {
			this.darkMode = isDark;
		}.bind(this));

        this.editor.bind('zoomChange', function(pct) {
            this.scale = pct;
            this.editor.setScale(this.scale);
        }.bind(this));

        this.animator.bind('zoomChange', function(pct) {
            this.scale = pct;
            this.animator.setScale(this.scale);
        }.bind(this));

        //Selector tab activated
        $selectorTabBtn.on('click', function() {
            this.selector.setDisplayMode(this.darkMode);
        }.bind(this));

        //Editor tab activated
        $editorTabBtn.on('click', function() {
            this.editor.setMode(this.darkMode, false);
            this.editor.activeTab(this.scale);
        }.bind(this));

        //Animator tab activated
        $animatorTabBtn.on('click', function() {
            if(this.editor.refresh){
                this.editor.activeTab();
            }
            this.animator.setMode(this.darkMode, false);
            this.animator.activeTab(this.scale);
        }.bind(this));

        //Exporter tab activated
        $exportTabBtn.on('click', function() {
            if(this.editor.refresh){
                this.editor.activeTab();
            }
            this.exporter.activeTab();
        }.bind(this));
    }
}

export default Job;