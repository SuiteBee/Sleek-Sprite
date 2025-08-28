import MicroEvent from '../utilities/MicroEvent';

export default (function() {
	
	function SelectColor($eventArea, $canvas) {
		this._$canvas = $canvas;
		this._$eventArea = $eventArea;
		this._context = $canvas[0].getContext('2d');
		this._listeners = [];
	}
	
	var SelectColorProto = SelectColor.prototype = new MicroEvent;
	
	SelectColorProto.activate = function() {
		var selectColor = this,
			canvasX, canvasY,
			context = selectColor._context,
			$eventArea = selectColor._$eventArea;
		
		selectColor._listeners.push([
			$eventArea, 'mousedown', function(event) {
				if (event.button !== 0) { return; }
				var color = selectColor._getColourAtMouse(event.pageX, event.pageY);
				selectColor.trigger( 'select', color );
				event.preventDefault();
			}
		]);
		
		selectColor._listeners.push([
			$eventArea, 'mousemove', function(event) {
				var color = selectColor._getColourAtMouse(event.pageX, event.pageY);
				selectColor.trigger( 'move', color );
			}
		]);
		
		selectColor._listeners.forEach(function(set) {
			set[0].bind.apply( set[0], set.slice(1) );
		});
		
		return selectColor;
	};
	
	SelectColorProto.deactivate = function() {
		this._listeners.forEach(function(set) {
			set[0].unbind.apply( set[0], set.slice(1) );
		});
		
		return this;
	};
	
	SelectColorProto._getColourAtMouse = function(pageX, pageY) {
		var offset = this._$canvas.offset(),
			x = pageX - Math.floor(offset.left),
			y = pageY - Math.floor(offset.top);
		
		return this._context.getImageData(x, y, 1, 1).data;
	};
	
	return SelectColor;
})();