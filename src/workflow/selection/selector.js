import $ from 'jquery';

import ImgInput from '../../utilities/ImgInput';
import {Toolbar, ToolbarGroup} from '../../components/Toolbar';
import pageLayout from '../../utilities/pageLayout';

import SpriteCanvas from './SpriteCanvas';
import SpriteCanvasView from './SpriteCanvasView';

import PreviewPanel from '../../cutter/PreviewPanel';
import Editor from '../editing/Editor';

(function() {
	// init
	(function() {
		function colourBytesToCss(color) {
			if (color[3] === 0) {
				return 'transparent';
			}
			return 'rgba(' + color[0] + ', ' + color[1] + ', ' + color[2] + ', ' + String( color[3] / 255 ).slice(0, 5) + ')';
		}
		
		var $canvasContainer  = $('.selection-inner');
		var $codeContainer    = $('.code-container');
		var $tutorialLink     = $('.tutorial');
		var spriteCanvas      = new SpriteCanvas();
		var spriteCanvasView  = new SpriteCanvasView( spriteCanvas, $canvasContainer );
		var imgInput          = new ImgInput( $canvasContainer, $canvasContainer, $tutorialLink.attr('href') );

		var toolbarTop        = new Toolbar('.selection-tab', '.toolbar-container');
		var toolbarBottom     = new Toolbar('.selection-tab', '.toolbar-bottom-container');

		//var previewPanel      = new PreviewPanel( spriteCanvas, spriteCanvasView, $codeContainer );
		var editor		  	  = new Editor(spriteCanvas, toolbarTop);
		
		toolbarTop.
			addItem('open-img', 'Open Image', {noLabel: true}).
			addItem('reload-img', 'Reload Current Image', {noLabel: true}).
			addItem('select-all', 'Find All', {noLabel: true}).
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

		toolbarTop.$container.addClass('top');
		toolbarBottom.$container.addClass('bottom');

		pageLayout.init();
		function init_selection_tools(){
			//Set background as top left pixel
			let colArr = spriteCanvas.getFirstPixelColor();
			spriteCanvas.setBg(colArr);

			spriteCanvasView.unselectAllSprites();
			spriteCanvasView.setTool('select-sprite');

			//Set background status
			let $selectedBg = $('.selected-bg');
			let colorStr = colourBytesToCss(colArr);
			if (colorStr == 'transparent'){
				$selectedBg.css('background-color', '');
				$selectedBg.addClass('none');
			} else {
				$selectedBg.removeClass('none');
				$selectedBg.css('background-color', colorStr);
			}
		}
		
		// listeners
		imgInput.bind('load', function(img) {
			//Send image to canvas
			spriteCanvas.setImg(img);
			
			//Prepare toolbar
			init_selection_tools();

			pageLayout.toAppView();
		});
		
		spriteCanvasView.bind('selectedSpritesChange', function(selectedSprites) {
			editor.gather(selectedSprites);
			
			if(selectedSprites.length === 0) {
				return;
			}

			//previewPanel.selectedSprites = selectedSprites;
			//previewPanel.update();

			selectedSprites.forEach(({rect}) => {
				if (rect.width === spriteCanvas.canvas.width && rect.height === spriteCanvas.canvas.height) {
					// if the rect is the same size as the whole canvas,
					// it's probably because the background is set wrong
					// let's be kind...
					toolbarTop.feedback( 'Incorrect background colour set?', true );
				}
			});
		});
		
		spriteCanvasView.bind('bgColorHover', function(color) {
			toolbarTop.feedbackColor(color, colourBytesToCss(color) );
		});
		
		spriteCanvasView.bind('bgColorSelect', function(color) {
			var $selectedBg = $('.selected-bg');
			var colorStr = colourBytesToCss(color);
			if (colorStr == 'transparent'){
				$selectedBg.css('background-color', '');
				$selectedBg.addClass('none');
			} else {
				$selectedBg.removeClass('none');
				$selectedBg.css('background-color', colorStr);
			}
			toolbarTop.feedback( 'Background set to ' + colorStr );
		});
		
		toolbarTop.bind('open-img', function(event) {
			event.preventDefault();
		});

		toolbarTop.bind('select-bg', function() {
			spriteCanvasView.setTool('select-bg');
		});
		
		toolbarTop.bind('select-sprite', function() {
			spriteCanvasView.setTool('select-sprite');
		});
		
		toolbarTop.bind('reload-img', function(event) {
			imgInput.reloadLastFile();
			event.preventDefault();
		});

		toolbarTop.bind('select-all', function(event) {
			spriteCanvasView.findAllSprites();
			event.preventDefault();
		});

		toolbarTop.bind('select-none', function(event) {
			spriteCanvasView.unselectAllSprites(true);
			event.preventDefault();
		});
		
		imgInput.fileClickjackFor( toolbarTop.$container.find('div.open-img') );
		
		toolbarTop.bind('remove-bg', function(event) {
			spriteCanvasView.clearBg();
			event.preventDefault();
		});

		toolbarTop.bind('remove-rect', function(event) {
			spriteCanvasView.clearRect();
			event.preventDefault();
		});

		toolbarTop.bind('undo', function(event) {
			let selectedSprites = spriteCanvasView.undo();
			if(selectedSprites){
				editor.gather(selectedSprites);
			}
			
			event.preventDefault();
		});

		toolbarTop.bind('invert-bg', function(event) {
			if ( event.isActive ) {
				spriteCanvasView.setBg('#fff');
			}
			else {
				spriteCanvasView.setBg('#000');
			}
		});

		toolbarBottom.bind('percent', function(event) {
			cssOutput.percentPos = !event.isActive;
			cssOutput.update();
		});

		toolbarBottom.bind('bg-size', function(event) {
			cssOutput.bgSize = !event.isActive;
			cssOutput.update();
		});
		
		$tutorialLink.click(function(event) {
			imgInput.loadImgUrl( this.href );
			event.preventDefault();
		});

		//Selector tab activated
        var $selectorTabBtn = $('#tabSelection');
        $selectorTabBtn.on("click", function() {
			let editorDark = editor.toolbarTop.isActive('invert-bg');

			if(editorDark){
				toolbarTop.activate('invert-bg');
				spriteCanvasView.setBg('#000', false);
			} else{
				toolbarTop.deactivate('invert-bg');
				spriteCanvasView.setBg('#fff', false);
			}
        });
		
	})();
})();