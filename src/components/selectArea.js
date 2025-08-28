import $ from 'jquery';
import MicroEvent from '../utilities/MicroEvent';
import Rect from '../utilities/Rect';

export default (function() {
	function SelectArea($eventArea, $area, highlight) {
		this._$area = $area;
		this._$eventArea = $eventArea;
		this._highlight = highlight;
		this._listeners = [];

		this.createListeners();
	}
	
	var SelectAreaProto = SelectArea.prototype = new MicroEvent;

	SelectAreaProto.createListeners = function() {
		var selectArea = this,
			rect = new Rect(0, 0, 0, 0),
			startX, startY,
			startPositionX, startPositionY,
			isDragging,
			$document = $(document);

		selectArea._listeners.push([
			selectArea._$eventArea, 'mousedown', function(event) {
				if (event.button !== 0) { return; }
				var offset = selectArea._$area.offset();

				startX = event.pageX;
				startY = event.pageY;
				// firefox like coming up with fraction values from offset()
				startPositionX = Math.floor(event.pageX - offset.left);
				startPositionY = Math.floor(event.pageY - offset.top);
				
				rect = new Rect(
					startPositionX,
					startPositionY,
					1, 1
				);
				
				selectArea._highlight.moveTo(rect);
				isDragging = true;
				event.preventDefault();
			}
		]);
		
		selectArea._listeners.push([
			$document, 'mousemove', function(event) {
				if (!isDragging) { return; }
				
				rect.x = startPositionX + Math.min(event.pageX - startX, 0);
				rect.y = startPositionY + Math.min(event.pageY - startY, 0);
				rect.width = Math.abs(event.pageX - startX) || 1;
				rect.height = Math.abs(event.pageY - startY) || 1;
				selectArea._highlight.moveTo(rect);
			}
		]);
		
		selectArea._listeners.push([
			$document, 'mouseup', function(event) {
				if (!isDragging) { return; }
				isDragging = false;
				selectArea.trigger('select', rect);
				selectArea._highlight.hide();
			}
		]);
	}
	
	SelectAreaProto.activate = function() {
		var selectArea = this;
		
		selectArea._listeners.forEach(function(set) {
			set[0].bind.apply( set[0], set.slice(1) );
		});
		
		return selectArea;
	};
	
	SelectAreaProto.deactivate = function() {
		this._listeners.forEach(function(set) {
			set[0].unbind.apply( set[0], set.slice(1) );
		});
		
		return this;
	};
	
	return SelectArea;
})();