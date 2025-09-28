import $ from 'jquery';

import {Toolbar, ToolbarGroup} from '../../components/Toolbar';

import MicroEvent from '../../utilities/MicroEvent';

class SelectorTools extends MicroEvent {

	constructor(workspace) {
		super();

		this.toolbarTop          		= new Toolbar('.selection-tab', '.toolbar-container');
		this.toolbarBottom       		= new Toolbar('.selection-tab', '.toolbar-bottom-container');
		
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

		//////////////////////////////////////////////////
		//Workspace Events
		//////////////////////////////////////////////////
			
		//Select or Unselect Images
		workspace.bind('selectedSpriteMatchesCanvas', function() {
			this.toolbarTop.feedback( 'Incorrect background colour set?', true );
		}.bind(this));
		
		//Canvas Hover
		workspace.bind('bgColorHover', function(color) {
			let msg = SelectorTools.#colourBytesToCss(color);
			this.toolbarTop.feedbackColor(color, msg);
		}.bind(this));
		
		//Select Background pixel
		workspace.bind('bgColorSelect', function(color) {
			var $selectedBg = $('.selected-bg');
			var colorStr = SelectorTools.#colourBytesToCss(color);
			if (colorStr == 'transparent'){
				$selectedBg.css('background-color', '');
				$selectedBg.addClass('none');
			} else {
				$selectedBg.removeClass('none');
				$selectedBg.css('background-color', colorStr);
			}
			this.toolbarTop.feedback( 'Background set to ' + colorStr );
		}.bind(this));

		//////////////////////////////////////////////////
		//Toolbar Events
		//////////////////////////////////////////////////
		
		//BTN Open Image
		this.toolbarTop.bind('open-img', function(event) {
			this.trigger('load');
			event.preventDefault();
		});

		//BTN Reload Image
		this.toolbarTop.bind('reload-img', function(event) {
			this.trigger('reload');
			event.preventDefault();
		}.bind(this));

		//BTN Change Tool: Select Color
		this.toolbarTop.bind('select-bg', function() {
			workspace.setTool('select-bg');
		}.bind(this));
		
		//BTN Change Tool: Select Image
		this.toolbarTop.bind('select-sprite', function() {
			workspace.setTool('select-sprite');
		}.bind(this));
		
		//BTN Change Selection: Find All
		this.toolbarTop.bind('select-all', function(event) {
			let txtGap = $('#select-size').val();
			let spriteGap = Number(txtGap);

			if(isNaN(spriteGap) || spriteGap < 1){
				this.toolbarTop.feedback('Chunk size must be a number greater than 0');
			} else{
				workspace.findAllSprites(spriteGap);
			}
			event.preventDefault();
		}.bind(this));

		//BTN Change Selection: None
		this.toolbarTop.bind('select-none', function(event) {
			workspace.unselectAllSprites(true);
			event.preventDefault();
		}.bind(this));
		
		//BTN Alter Selection: Clear Color
		this.toolbarTop.bind('remove-bg', function(event) {
			var $selectedBg = $('.selected-bg');
			$selectedBg.css('background-color', '');
			$selectedBg.addClass('none');

			workspace.clearBg();
			event.preventDefault();
		}.bind(this));

		//BTN Alter Selection: Delete Image
		this.toolbarTop.bind('remove-rect', function(event) {
			workspace.clearRect();
			event.preventDefault();
		}.bind(this));

		//BTN Revert Changes
		this.toolbarTop.bind('undo', function(event) {
			workspace.undo();
			event.preventDefault();
		}.bind(this));

		//BTN Set Dark Mode
		this.toolbarTop.bind('invert-bg', function(event) {
			this.setDisplayMode(!event.isActive);
			this.trigger('viewMode', !event.isActive);
		}.bind(this));
	}

	init(imgInput, pixel){

		//Bind IO action to open-img btn
		imgInput.fileClickjackFor( this.toolbarTop.$container.find('div.open-img') );

		//Set background status
		let $selectedBg = $('.selected-bg');
		let colorStr = SelectorTools.#colourBytesToCss(pixel);
		if (colorStr == 'transparent'){
			$selectedBg.css('background-color', '');
			$selectedBg.addClass('none');
		} else {
			$selectedBg.removeClass('none');
			$selectedBg.css('background-color', colorStr);
		}
	}

	setDisplayMode(isDark){
		if(isDark){
			this.toolbarTop.activate('invert-bg');
		} else{
			this.toolbarTop.deactivate('invert-bg');
		}
	}

	static #colourBytesToCss(color) {
		if (color[3] === 0) {
			return 'transparent';
		}
		return 'rgba(' + color[0] + ', ' + color[1] + ', ' + color[2] + ', ' + String( color[3] / 255 ).slice(0, 5) + ')';
	}
}

export default SelectorTools;