
import pageLayout from '../../utilities/pageLayout';

import SelectorWindow from './SelectorWindow';
import SelectorWorkspace from './SelectorWorkspace';
import SelectorTools from './SelectorTools';

class Selector {

	constructor() {
        this.model     = new SelectorModel();
        this.window    = new SelectorWindow();
        
        this.workspace = new SelectorWorkspace(this.window, this.model);
        this.tools     = new SelectorTools(this.workspace);

        //Prepare animations
        pageLayout.init();

        this.tools.bind('viewMode', function(isDark) {
            this.workspace.setDisplayMode(isDark);
		}.bind(this));

        this.workspace.bind('load', function(img) {
            this.init(img)
            
            //Play animations
            pageLayout.toAppView();
		}.bind(this));

        this.tools.bind('reload', function() {
            this.workspace.reload();
		}.bind(this));
    }

    init(img) {
        this.window.init(img);
        this.workspace.init();

        let color = this.window.getBg();
        let imgInput = this.workspace.imgInput;

        this.tools.init(imgInput, color);
    }

    setDisplayMode(isDark) {
        this.tools.setDisplayMode(isDark);
        this.workspace.setDisplayMode(isDark, false);
    }
}

class SelectorModel {
    constructor() {
        this.selectedSprites = [];
        this.history = [];
    }
}

export default Selector;

