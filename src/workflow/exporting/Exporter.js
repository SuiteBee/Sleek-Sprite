import ExportView from './ExporterView';
import ExporterController from './ExporterController';

class Exporter {
    constructor(editor, animator) {
        this.refresh    = false;

        this.controller = new ExporterController(editor, animator);
        this.view       = new ExportView(this.controller);
    }

    activeTab() {
        if(this.refresh){
            this.view.init();
            this.refresh = false;
        }
    }
}

export default Exporter;