import $ from 'jquery';

export default (function() {
	var $content = $('.content'),
		$container = $('.selection-tab'),
		$workflow = $('.workflow'),
		$header = $('.container > header'),
		$canvasCell = $('.selection-cell'),
		$canvasInner = $('.canvas-inner'),
		$headerMain = $('.main-header'),
		$footerMain = $('.main-footer'),
		$footerUl = $('.main-footer ul'),
		$footerP = $('.main-footer p'),
		$cssOutput,
		$startButtons,
		$spriteCanvasContainer,
		$window = $(window),
		$toolbarTop,
		$toolbarBottom,
		currentView = 'intro';
	
	function getContainerWidthPercent() {
		var bodyHorizontalPadding = 40,
			containerRelativeWidth = $container.width() / ( $window.width() - bodyHorizontalPadding );
		
		return Math.round(containerRelativeWidth * 10000) / 100 + '%';
	}
	
	function getAppViewTransitions() {
		// Here we read all the destination styles to animate to when the intro class is removed
		var transitions,
			containerWidth = getContainerWidthPercent();
		
		$headerMain.removeClass('intro');
		$content.removeClass('intro');
		$container.removeClass('intro');
		$footerMain.removeClass('intro');
		$workflow.removeClass('intro');

		transitions = [
			{
				duration: 300,
				easing: 'easeInOutQuad',
				targets: [
					[$container, { width: '100%' }],
					[$footerUl, {
						padding: $footerUl.css('padding')
					}],
					[$footerP, {
						padding: $footerP.css('padding')
					}],
					[$startButtons, { opacity: 0 }],
					[$canvasCell, { border: 0 }],
					[$headerMain, { 
						height: $headerMain.height(),
						'font': $headerMain.css('font'),
						'position': $headerMain.css('position')
					}]
				],
				before: function() {
					$container.width(containerWidth);
					// stops browser reverting to previous scroll position
					$canvasInner.scrollTop(0);
				}
			},
			{
				duration: 500,
				easing: 'easeInOutQuad',
				targets: [
					[$container, { width: '100%' }],
					[$header, { height: $header.height() }],
					[$cssOutput, {
						height: $cssOutput.height(),
						'padding-top': $cssOutput.css('padding-top'),
						'padding-bottom': $cssOutput.css('padding-bottom')
					}],
					[$canvasCell, {
						height: $canvasCell.height()
					}],
					[$toolbarTop, {
						height: $toolbarTop.height(),
						'padding-top': $toolbarTop.css('padding-top'),
						'padding-bottom': $toolbarTop.css('padding-bottom'),
						'border-top-width': $toolbarTop.css('border-top-width'),
						'border-bottom-width': $toolbarTop.css('border-bottom-width')
					}],
					[$toolbarBottom, {
						height: $toolbarBottom.height(),
						'padding-top': $toolbarBottom.css('padding-top'),
						'padding-bottom': $toolbarBottom.css('padding-bottom'),
						'border-top-width': $toolbarBottom.css('border-top-width'),
						'border-bottom-width': $toolbarBottom.css('border-bottom-width')
					}],
					[$footerMain, {
						width: $footerMain.width(),
						'padding-top': $footerMain.css('padding-top'),
						'padding-bottom': $footerMain.css('padding-bottom'),
						'border-top-width': $footerMain.css('border-top-width'),
						'border-bottom-width': $footerMain.css('border-bottom-width')
					}]
				],
				before: function() {
				}
			},
			{
				duration: 500,
				easing: 'swing',
				targets: [
					[$spriteCanvasContainer, {opacity: 1}],
					[$workflow, {opacity: 1}]
				]
			}
		];
		
		$headerMain.addClass('intro');
		$content.addClass('intro');
		$container.addClass('intro');
		$footerMain.addClass('intro');
		$workflow.addClass('intro');
		
		return transitions;
	}
	
	function doAnimStep(steps, i, callback) {
		var nextStep = steps[i+1],
			step = steps[i],
			duration = step.duration,
			easing = step.easing;
		
		function complete() {
			if (nextStep) {
				doAnimStep(steps, i + 1, callback);
			}
			else {
				callback();
			}
		}
		
		if (step.before) {
			step.before();
		}
		
		step.targets.forEach(function(target, i, targets) {
			target[0].transition(target[1], {
				duration: duration,
				easing: easing,
				complete: i ? $.noop : complete
			});
		});
	}
	
	return {
		init: function() {
			$toolbarTop = $('.toolbar.top');
			$toolbarBottom = $('.toolbar.bottom');
			$startButtons = $('.start-buttons');
			$cssOutput = $('.css-output');
			$spriteCanvasContainer = $('.selector-canvas-container');
		},
		toAppView: function() {
			if (currentView === 'app') { return; }
			
			var steps = getAppViewTransitions(),
				i = 0;
				
			currentView = 'app';

			if ($.support.transition) {
				doAnimStep(steps, 0, function() {
					var targets = [];
					
					$headerMain.removeClass('intro');
					$content.removeClass('intro');
					$container.removeClass('intro');
					$footerMain.removeClass('intro');
					$workflow.removeClass('intro');
					
					steps.forEach(function(step) {
						targets = targets.concat( step.targets );
					});
					
					targets.forEach(function(target) {
						for ( var propName in target[1] ) {
							target[0].css(propName, '');
						}
					});
				});
			}
			else {
				$headerMain.removeClass('intro');
				$content.removeClass('intro');
				$container.removeClass('intro');
				$footerMain.removeClass('intro');
				$workflow.removeClass('intro');
			}

		}
	};
})();