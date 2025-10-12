import $ from 'jquery';

import Selector from './selecting/Selector';
import Editor from './editing/Editor';
import Animator from './animating/Animator';
import Exporter from './exporting/Exporter';

class Job {
    constructor() {
        this.selector = new Selector();
        this.editor   = new Editor(this.selector.window);
        this.animator = new Animator(this.editor.window);
        this.exporter = new Exporter(this.editor, this.animator);

        var $selectorTabBtn = $('#tabSelection'),
            $editorTabBtn   = $('#tabEditor'),
            $animatorTabBtn = $('#tabAnimate'),
            $exportTabBtn   = $('#tabExport');

        this.darkMode = false;
        this.scale = 100;

        $editorTabBtn.prop('disabled', true);
        $animatorTabBtn.prop('disabled', true);
        $exportTabBtn.prop('disabled', true);

        this.selector.workspace.bind('selectedSpritesChange', function(selectedSprites) {
            let disableWorkflow = selectedSprites.length == 0;

            $editorTabBtn.prop('disabled', disableWorkflow);
            $animatorTabBtn.prop('disabled', disableWorkflow);
            $exportTabBtn.prop('disabled', disableWorkflow);
            
			this.editor.init(selectedSprites);
            this.editor.refresh = this.exporter.refresh = this.animator.refresh = true;
		}.bind(this));

        this.selector.tools.bind('viewMode', function(isDark) {
			this.darkMode = isDark;
		}.bind(this));

        this.editor.tools.bind('viewMode', function(isDark) {
			this.darkMode = isDark;
		}.bind(this));

        this.animator.tools.bind('viewMode', function(isDark) {
			this.darkMode = isDark;
		}.bind(this));

        this.editor.tools.bind('zoomStart', function(pct) {
            this.scale = pct;
            this.editor.updateScale(this.scale);
        }.bind(this));

        this.editor.tools.bind('zoomEnd', function() {
            this.editor.resize(this.scale);
        }.bind(this));

        this.animator.tools.bind('zoomStart', function(pct) {
            this.scale = pct;
            this.animator.updateScale(this.scale);
        }.bind(this));

        this.animator.tools.bind('zoomEnd', function() {
            this.animator.resize(this.scale);
        }.bind(this));

        //Selector tab activated
        $selectorTabBtn.on('click', function() {
            this.selector.setDisplayMode(this.darkMode);
        }.bind(this));

        //Editor tab activated
        $editorTabBtn.on('click', function() {
            this.editor.setDisplayMode(this.darkMode);
            this.editor.updateScale(this.scale);
            this.editor.resize(this.scale);
            this.editor.activeTab();
        }.bind(this));

        //Animator tab activated
        $animatorTabBtn.on('click', function() {
            if(this.editor.refresh){
                this.editor.activeTab();
            }
            this.animator.setDisplayMode(this.darkMode);
            this.animator.updateScale(this.scale);
            this.animator.resize(this.scale);
            this.animator.activeTab(this.editor.edited);
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