import $ from 'jquery';

import SelectorView from './selecting/SelectorView';
import EditorView from './editing/EditorView';
import ExporterView from './exporting/ExporterView';

class Job {

    constructor() {
        var $selectorTabBtn = $('#tabSelection'),
            $editorTabBtn   = $('#tabEditor'),
            $exportTabBtn   = $('#tabExport');

        this.selector = new SelectorView();
        this.editor   = new EditorView(this.selector.selectorCanvas);
        this.exporter = new ExporterView(this.editor.editorCanvas);

        this.darkMode = false;

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

        //Selector tab activated
        $selectorTabBtn.on('click', function() {
            this.selector.setMode(this.darkMode, false);
        }.bind(this));

        //Editor tab activated
        $editorTabBtn.on('click', function() {
            this.editor.setMode(this.darkMode, false);
            this.editor.activeTab();
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