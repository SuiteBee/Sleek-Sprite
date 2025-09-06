import $ from 'jquery';

import Selector from './selecting/Selector';
import Editor from './editing/Editor';
import Exporter from './exporting/Exporter';

class Job {

    constructor() {
        var $selectorTabBtn = $('#tabSelection'),
            $editorTabBtn   = $('#tabEditor'),
            $exportTabBtn   = $('#tabExport');

        this.selector = new Selector();
        this.editor   = new Editor(this.selector.selectorCanvas);
        this.exporter = new Exporter(this.selector.selectorCanvas, this.editor.editorCanvas);

        this.darkMode = false;

        this.selector.bind('spriteChange', function(selectedSprites) {
			this.editor.gather(selectedSprites);
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
            this.exporter.activeTab();
        }.bind(this));
    }
}

export default Job;