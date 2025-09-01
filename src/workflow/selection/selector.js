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
		
		var previewPanel      = new PreviewPanel( spriteCanvas, spriteCanvasView, $codeContainer );
		var editor		  	  = new Editor(spriteCanvas);
		
		var toolbarTop        = new Toolbar('.selection-tab', '.toolbar-container');
		var toolbarBottom     = new Toolbar('.selection-tab', '.toolbar-bottom-container');
		
		toolbarTop.
			addItem('open-img', 'Open Image', {noLabel: true}).
			addItem('reload-img', 'Reload Current Image', {noLabel: true}).
			addItem('select-none', 'Unselect All', {noLabel: true}).
			addItem(
				new ToolbarGroup().
					addItem('select-sprite', 'Select Sprite', {active: true}).
					addItem('select-bg', 'Pick Background')
			).
			addStatus('selected-bg', 'Selected Background').
			addItem('remove-bg', 'Erase Color', {noLabel: true}).
			addItem('invert-bg', 'Toggle Dark Mode', {noLabel: true});

		toolbarTop.$container.addClass('top');

		toolbarBottom.$container.addClass('bottom');

		pageLayout.init();
		
		// listeners
		imgInput.bind('load', function(img) {
			spriteCanvas.setImg(img);
			spriteCanvas.setBg([0, 0, 0, 0]);

			spriteCanvasView.unselectAllSprites();
			spriteCanvasView.setTool('select-sprite');

			var $selectedBg = $('.selected-bg');
			$selectedBg.css('background-color', '');
			$selectedBg.addClass('none');

			pageLayout.toAppView();
		});
		
		spriteCanvasView.bind('selectedSpritesChange', function(selectedSprites) {
			editor.gather(selectedSprites);
			
			if(selectedSprites.length === 0) {
				return;
			}

			previewPanel.selectedSprites = selectedSprites;
			previewPanel.update();

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

		toolbarTop.bind('select-none', function(event) {
			spriteCanvasView.unselectAllSprites();
			event.preventDefault();
		});
		
		imgInput.fileClickjackFor( toolbarTop.$container.find('div.open-img') );
		
		toolbarTop.bind('remove-bg', function(img) {
			spriteCanvas.clearBg(img);
			img.preventDefault();
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
	})();
})();