import $ from 'jquery';

import ImgInput from '../../utilities/ImgInput';
import {Toolbar, ToolbarGroup} from '../../components/Toolbar';
import pageLayout from '../../utilities/pageLayout';

import SelectorCanvas from './SelectorCanvas';
import SelectorCanvasView from './SelectorCanvasView';
import MicroEvent from '../../utilities/MicroEvent';

class Selector extends MicroEvent {

	constructor() {
		super();
		var $selectorContainer  = $('.selection-inner'),
			imgInput            = new ImgInput( $selectorContainer, $selectorContainer);

		this.selectorCanvas      = new SelectorCanvas();
		this.selectorCanvasView  = new SelectorCanvasView(this.selectorCanvas, $selectorContainer);

		this.toolbarTop          = new Toolbar('.selection-tab', '.toolbar-container'),
		this.toolbarBottom       = new Toolbar('.selection-tab', '.toolbar-bottom-container');
		
		this.toolbarTop.
			addItem('open-img', 'Open Image', {noLabel: true}).
			addItem('reload-img', 'Reload Current Image', {noLabel: true}).
			addItem(
				new ToolbarGroup('select-find').
					addInput('select-size', '', 'Minimum Gap Between Sprites (larger is faster)', '4', '10').
					addItem('select-all', 'Find All', {noLabel: true})
			).
			addItem('select-none', 'Unselect All', {noLabel: true}).
			addItem(
				new ToolbarGroup().
					addItem('select-sprite', 'Select Sprite', {active: true}).
					addItem('select-bg', 'Pick Background')
			).
			addStatus('selected-bg', 'Selected Background').
			addItem('remove-bg', 'Erase Selected Background', {noLabel: true}).
			addItem('remove-rect', 'Delete Selected Pixels', {noLabel: true}).
			addItem('undo', 'Undo Last Operation', {noLabel: true}).
			addItem('invert-bg', 'Toggle Dark Mode', {noLabel: true});

		this.toolbarTop.$container.addClass('top');
		this.toolbarBottom.$container.addClass('bottom');

		pageLayout.init();
		imgInput.fileClickjackFor( this.toolbarTop.$container.find('div.open-img') );
				
		imgInput.bind('load', function(img) {
			//Send image to canvas
			this.selectorCanvas.setImg(img);
			
			//Prepare toolbar
			this.#init_selection_tools();

			pageLayout.toAppView();
		}.bind(this));
			
		this.selectorCanvasView.bind('selectedSpritesChange', function(selectedSprites) {
			this.trigger('spriteChange', selectedSprites);
			if(selectedSprites.length === 0) { return; }
			
			selectedSprites.forEach(({rect}) => {
				if (rect.width === this.selectorCanvas.canvas.width && rect.height === this.selectorCanvas.canvas.height) {
					toolbarTop.feedback( 'Incorrect background colour set?', true );
				}
			});
		}.bind(this));
		
		this.selectorCanvasView.bind('bgColorHover', function(color) {
			this.toolbarTop.feedbackColor(color, colourBytesToCss(color) );
		}.bind(this));
		
		this.selectorCanvasView.bind('bgColorSelect', function(color) {
			var $selectedBg = $('.selected-bg');
			var colorStr = colourBytesToCss(color);
			if (colorStr == 'transparent'){
				$selectedBg.css('background-color', '');
				$selectedBg.addClass('none');
			} else {
				$selectedBg.removeClass('none');
				$selectedBg.css('background-color', colorStr);
			}
			this.toolbarTop.feedback( 'Background set to ' + colorStr );
		}.bind(this));
		
		this.toolbarTop.bind('open-img', function(event) {
			event.preventDefault();
		});

		this.toolbarTop.bind('select-bg', function() {
			this.selectorCanvasView.setTool('select-bg');
		}.bind(this));
		
		this.toolbarTop.bind('select-sprite', function() {
			this.selectorCanvasView.setTool('select-sprite');
		}.bind(this));
		
		this.toolbarTop.bind('reload-img', function(event) {
			imgInput.reloadLastFile();
			event.preventDefault();
		});

		this.toolbarTop.bind('select-all', function(event) {
			let txtGap = $('#select-size').val();
			let spriteGap = Number(txtGap);

			if(isNaN(spriteGap) || spriteGap < 1){
				toolbarTop.feedback('Chunk size must be a number greater than 0');
			} else{
				this.selectorCanvasView.findAllSprites(spriteGap);
			}
			event.preventDefault();
		}.bind(this));

		this.toolbarTop.bind('select-none', function(event) {
			this.selectorCanvasView.unselectAllSprites(true);
			event.preventDefault();
		}.bind(this));
		

		this.toolbarTop.bind('remove-bg', function(event) {
			this.selectorCanvasView.clearBg();
			event.preventDefault();
		}.bind(this));

		this.toolbarTop.bind('remove-rect', function(event) {
			this.selectorCanvasView.clearRect();
			event.preventDefault();
		}.bind(this));

		this.toolbarTop.bind('undo', function(event) {
			let selectedSprites = this.selectorCanvasView.undo();
			if(selectedSprites){
				this.trigger('selectedSpritesChange', selectedSprites);
			}
			
			event.preventDefault();
		}.bind(this));

		this.toolbarTop.bind('invert-bg', function(event) {
			this.setMode(!event.isActive, true);
			this.trigger('modeChange', !event.isActive);
		}.bind(this));

		this.toolbarBottom.bind('percent', function(event) {
			cssOutput.percentPos = !event.isActive;
			cssOutput.update();
		});

		this.toolbarBottom.bind('bg-size', function(event) {
			cssOutput.bgSize = !event.isActive;
			cssOutput.update();
		});
	}

	setMode(dark, anim){
		if(dark){
			this.toolbarTop.activate('invert-bg');
			this.selectorCanvasView.setDarkMode('#000', anim);
		} else{
			this.toolbarTop.deactivate('invert-bg');
			this.selectorCanvasView.setDarkMode('#fff', anim);
		}
	};

	static #colourBytesToCss(color) {
		if (color[3] === 0) {
			return 'transparent';
		}
		return 'rgba(' + color[0] + ', ' + color[1] + ', ' + color[2] + ', ' + String( color[3] / 255 ).slice(0, 5) + ')';
	}

	#init_selection_tools (){
		//Set background as top left pixel
		let colArr = this.selectorCanvas.getFirstPixelColor();
		this.selectorCanvas.setBg(colArr);

		this.selectorCanvasView.unselectAllSprites();
		this.selectorCanvasView.setTool('select-sprite');

		//Set background status
		let $selectedBg = $('.selected-bg');
		let colorStr = Selector.#colourBytesToCss(colArr);
		if (colorStr == 'transparent'){
			$selectedBg.css('background-color', '');
			$selectedBg.addClass('none');
		} else {
			$selectedBg.removeClass('none');
			$selectedBg.css('background-color', colorStr);
		}
	}
}

export default Selector;