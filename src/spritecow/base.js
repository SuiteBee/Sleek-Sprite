import $ from 'jquery';

import SpriteCanvas from './SpriteCanvas';
import SpriteCanvasView from './SpriteCanvasView';
import ImgInput from './ImgInput';
import {Toolbar, ToolbarGroup} from './Toolbar';
import pageLayout from './pageLayout';

import PreviewPanel from '../cutter/PreviewPanel';
import Editor from '../editor/Editor';

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
		
		var previewPanel      = new PreviewPanel( spriteCanvas, spriteCanvasView, $codeContainer );
		var editorView		  = new Editor(spriteCanvas);
		
		var toolbarTop        = new Toolbar('.toolbar-container');
		var toolbarBottom     = new Toolbar('.toolbar-bottom-container');
		
		toolbarTop.
			addItem('open-img', 'Open').
			addItem('reload-img', 'Reload Current Image', {noLabel: true}).
			addItem(
				new ToolbarGroup().
					addItem('select-sprite', 'Select Sprite', {active: true}).
					addItem('select-bg', 'Pick Background')
			).
			addStatus('selected-bg', 'Selected Background').
			addItem('remove-bg', 'Clear');

		toolbarTop.$container.addClass('top');

		toolbarBottom.$container.addClass('bottom');

		pageLayout.init();
		
		// listeners
		imgInput.bind('load', function(img) {
			spriteCanvas.setImg(img);
			
			spriteCanvasView.setTool('select-sprite');
			pageLayout.toAppView();
		});
		
		spriteCanvasView.bind('selectedSpritesChange', function(selectedSprites) {
			if(selectedSprites.length === 0) {
				return;
			}

			previewPanel.selectedSprites = selectedSprites;
			previewPanel.update();
			
			editorView.selectedSprites = selectedSprites;
			editorView.reset();

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
			toolbarTop.feedback( colourBytesToCss(color) );
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
		
		imgInput.fileClickjackFor( toolbarTop.$container.find('div.open-img') );
		
		toolbarTop.bind('remove-bg', function(img) {
			spriteCanvas.clearBg(img);
			img.preventDefault();
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
	})();
})();