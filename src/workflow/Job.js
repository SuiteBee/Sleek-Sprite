import $ from 'jquery';

import SelectorView from './selecting/SelectorView';
import EditorView from './editing/EditorView';
import AnimatorView from './animation/AnimatorView';
import ExporterView from './exporting/ExporterView';

class Job {

    constructor() {
        var $selectorTabBtn = $('#tabSelection'),
            $editorTabBtn   = $('#tabEditor'),
            $animatorTabBtn = $('#tabAnimate'),
            $exportTabBtn   = $('#tabExport');

        this.selector = new SelectorView();
        this.editor   = new EditorView(this.selector.selectorCanvas);
        this.animator = new AnimatorView(this.editor.editorCanvas);
        this.exporter = new ExporterView(this.editor.editorCanvas);

        this.darkMode = false;
        this.scale = 100;

        this.selector.bind('spriteChange', function(selectedSprites) {
			this.editor.gather(selectedSprites);
            this.editor.refresh = true;
            this.exporter.refresh = true;
		}.bind(this));

        this.selector.bind('modeChange', function(isDark) {
			this.darkMode = isDark;
		}.bind(this));

        this.editor.bind('modeChange', function(isDark) {
			this.darkMode = isDark;
		}.bind(this));

        this.animator.bind('modeChange', function(isDark) {
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
            this.selector.setMode(this.darkMode, false);
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