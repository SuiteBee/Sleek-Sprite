import $ from 'jquery';

export default (function() {
	function Highlight($appendTo) {
		this._$container = $('<div class="highlight"/>').appendTo( $appendTo );
	}
	
	var HighlightProto = Highlight.prototype;
	
	HighlightProto.moveTo = function(rect, animate) {
		var $container = this._$container.transitionStop(true),
			destination = {
				left: rect.x,
				top: rect.y,
				width: rect.width,
				height: rect.height,
				opacity: 1
			};
		
		
		if (rect.width && rect.height) {
			$container.css('display', 'block');
			
			if (animate) {
				$container.transition(destination, {
					duration: 200,
					easing: 'easeOutQuad'
				});
			}
			else {		
				$container.vendorCss(destination);				
			}
		}
		else {
			this.hide(animate);
		}
	};
	
	HighlightProto.hide = function(animate) {
		var $container = this._$container.transitionStop(true);
		
		if (animate) {
			var currentLeft = parseInt( $container.css('left') ),
				currentTop = parseInt( $container.css('top') );
			
			$container.transition({
				left: currentLeft + $container.width()  / 2,
				top:  currentTop  + $container.height() / 2,
				width: 0,
				height: 0,
				opacity: 0
			}, {
				duration: 200,
				easing: 'easeInQuad'
			});
		}
		else {
			$container.css('display', 'none');
		}
	};

	HighlightProto.remove = function() {
		this._$container.remove();
	}
	
	HighlightProto.setHighVisOnDark = function(highVis) {
		this._$container[highVis ? 'addClass' : 'removeClass']('high-vis');
		return this;
	}
	
	return Highlight;
})();