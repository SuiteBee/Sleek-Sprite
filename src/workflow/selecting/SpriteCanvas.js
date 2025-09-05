import MicroEvent from '../../utilities/MicroEvent';
import Rect from '../../utilities/Rect';

export default (function() {
	function pixelsEquivalent(pixels1, offset1, pixels2, offset2) {
		if ( pixels1[offset1 + 3] === 0 && pixels2[offset2 + 3] === 0 ) {
			// if both have alpha zero, they're the same
			return true;
		}
		// otherwise only true if both pixels have equal RGBA vals
		for (var i = 4; i--;) if ( pixels1[offset1 + i] !== pixels2[offset2 + i] ) {
			return false;
		}
		return true;
	};
	
	function allArrayOrTrue(arr1, arr2) {
		for (var i = arr1.length; i--;) if ( !( arr1[i] || arr2[i] ) ) {
			return false;
		}
		return true;
	}
	
	function allArrayFalse(arr1) {
		for (var i = arr1.length; i--;) if ( arr1[i] ) {
			return false;
		}
		return true;
	}

	function intersect(element){
		let xIntersect = element.x < this.rect.x + this.rect.width && this.rect.x < element.x + element.width;
		let yIntersect = element.y < this.rect.y + this.rect.height && this.rect.y < element.y + element.height;
		return xIntersect && yIntersect;
	}
	
	function SpriteCanvas() {
		var canvas = document.createElement('canvas');
		this.canvas = canvas;
		this._context = canvas.getContext('2d');
		this._bgData = [0, 0, 0, 0];
	}
	
	var SpriteCanvasProto = SpriteCanvas.prototype = new MicroEvent;
	
	SpriteCanvasProto.setImg = function(img) {
		var canvas = this.canvas,
			context = this._context;
		
		canvas.width = img.width;
		canvas.height = img.height;
		
		context.drawImage(img, 0, 0);
		
		this._img = img;
	};

	SpriteCanvasProto.getFirstPixelColor = function() {
		return this._context.getImageData(0,0, 1, 1).data;
	}

	SpriteCanvasProto.getCurrentState = function() {
		return this._context.getImageData(0,0, this.canvas.width, this.canvas.height);
	}

	SpriteCanvasProto.undoPixels = function(lastState) {
		this._context.putImageData(lastState, 0, 0);
	}

	SpriteCanvasProto.pixelsToAlpha = function(){
		const imgDat = this._context.getImageData(0,0, this.canvas.width, this.canvas.height);
		const pixels = imgDat.data;
		const targetBg = this._bgData;

		for(let i=0; i < pixels.length; i += 4){
			const r = pixels[i];
			const g = pixels[i+1];
			const b = pixels[i+2];

			if(r == targetBg[0] && g == targetBg[1] && b == targetBg[2]){
				pixels[i+3] = 0;
			}
		}

		this._context.putImageData(imgDat, 0, 0);
		this._bgData = [0,0,0,0];
	}

	SpriteCanvasProto.pixelsToBg = function(selected) {
		const targetBg = this._bgData;

		for(let i=0; i < selected.length; i++){

			var toClear = selected[i].rect;
			const imgDat = this._context.getImageData(toClear.x, toClear.y, toClear.width, toClear.height);
			const pixels = imgDat.data;

			for(let j=0; j < pixels.length; j += 4){
				pixels[j] = targetBg[0];
				pixels[j+1] = targetBg[1];
				pixels[j+2] = targetBg[2];
				pixels[j+3] = targetBg[3];
			}

			this._context.putImageData(imgDat, toClear.x, toClear.y);
		}
	}

	SpriteCanvasProto.findAllBounds = function(rects, chunkSize = 1) {
		let toSelect = rects;
		var chunkWidth = chunkSize,
			chunkHieght = chunkSize;

		//Move from left to right, then top to bottom
		for(let y=0; y < this.canvas.height; y += chunkSize){
			chunkHieght = chunkSize;

			//Handle end of height
			if(y + chunkSize > this.canvas.height) { chunkHieght = this.canvas.height - y }

			for(let x=0; x < this.canvas.width; x += chunkSize){
				chunkWidth = chunkSize;
				
				//Handle end of width
				if(x + chunkSize > this.canvas.width) { chunkWidth = this.canvas.width - x }

				//Search image in chunks
				const pixels = this._context.getImageData(x, y, chunkWidth, chunkHieght).data;
				const chunkRect = new Rect(x, y, chunkWidth, chunkHieght);

				//Skip if chunk only contains bg or intersects with already selected sprites
				if (this._pixelsContainOnlyBg(pixels) || toSelect.some(intersect, { rect: chunkRect })){ continue }
				
				let pixelRect = this._findChunkPixel(chunkRect, pixels);
				let spriteRect = this._getSpriteBounds(pixelRect);

				//Skip if sprite size is smaller than a chunk
				if((spriteRect.width * spriteRect.height) < (chunkWidth * chunkHieght)) { continue }

				toSelect.push(spriteRect);
			}
		}

		return toSelect;
	}

	SpriteCanvasProto._findChunkPixel = function(chunkRect, pixels){
		let chunkX = chunkRect.x,
			chunkY = chunkRect.y;

		//Find first non bg pixel
		for(let i=0; i < pixels.length; i += 4){
			//Return simulated click position
			if ( !pixelsEquivalent(this._bgData, 0, pixels, i) ) {
				return new Rect(chunkX, chunkY, 1, 1);
			}

			//Track chunk coordinates
			chunkX += 1;
			if(chunkX >= chunkRect.x + chunkRect.width){
				chunkX = chunkRect.x;
				chunkY += 1;
			}
		}
	}

	SpriteCanvasProto._getSpriteBounds = function(pixelRect){
		const rect = Object.assign({}, pixelRect);
		let spriteRect = this.trimBg(rect);
		spriteRect = this.expandToSpriteBoundry(rect);

		return spriteRect;
	}

	SpriteCanvasProto.setBg = function(pixelArr) {
		this._bgData = pixelArr;
	};
	
	SpriteCanvasProto.getBg = function() {
		return this._bgData;
	};
	
	SpriteCanvasProto.trimBg = function(rect) {
		var edgeBgResult;
		
		rect = this._restrictRectToBoundry(rect);
		
		if (rect.width && rect.height) do {
			edgeBgResult = this._edgesAreBg(rect);
			rect = this._contractRect(rect, edgeBgResult);
		} while ( rect.height && rect.width && !allArrayFalse(edgeBgResult) );
		
		return rect;
	};
	
	SpriteCanvasProto._restrictRectToBoundry = function(rect) {
		var canvas = this.canvas,
			restrictedX = Math.min( Math.max(rect.x, 0), canvas.width ),
			restrictedY = Math.min( Math.max(rect.y, 0), canvas.height );
		
		if (restrictedX !== rect.x) {
			rect.width -= restrictedX - rect.x;
			rect.x = restrictedX;
		}
		if (restrictedY !== rect.y) {
			rect.height -= restrictedY - rect.y;
			rect.y = restrictedY;
		}
		rect.width  = Math.min(rect.width,  canvas.width - rect.x);
		rect.height = Math.min(rect.height, canvas.height - rect.y);
		return rect;
	}
	
	SpriteCanvasProto.expandToSpriteBoundry = function(rect, callback) {
		var edgeBgResult = this._edgesAreBg(rect),
			edgeBoundsResult = this._edgesAtBounds(rect);
			
		// expand
		while ( !allArrayOrTrue(edgeBgResult, edgeBoundsResult) ) {
			rect = this._expandRect(rect, edgeBgResult, edgeBoundsResult);
			edgeBgResult = this._edgesAreBg(rect);
			edgeBoundsResult = this._edgesAtBounds(rect);
			// callback(); // for debugging
		}
		
		// trim edges of bg
		rect = this._contractRect(rect, edgeBgResult);
		
		return rect;
	};
	
	SpriteCanvasProto._edgesAreBg = function(rect) {
		// look at the pixels around the edges
		var canvas = this.canvas,
			context = this._context,
			top    = context.getImageData(rect.x, rect.y, rect.width, 1).data,
			right  = context.getImageData(rect.x + rect.width - 1, rect.y, 1, rect.height).data,
			bottom = context.getImageData(rect.x, rect.y + rect.height - 1, rect.width, 1).data,
			left   = context.getImageData(rect.x, rect.y, 1, rect.height).data;
			
		
		return [
			this._pixelsContainOnlyBg(top),
			this._pixelsContainOnlyBg(right),
			this._pixelsContainOnlyBg(bottom),
			this._pixelsContainOnlyBg(left)
		];
	};
	
	SpriteCanvasProto._edgesAtBounds = function(rect) {
		var canvas = this.canvas;
		
		return [
			rect.y === 0,
			rect.x + rect.width === canvas.width,
			rect.y + rect.height === canvas.height,
			rect.x === 0
		];
	};
	
	SpriteCanvasProto._pixelsContainOnlyBg = function(pixels) {
		var bg = this._bgData;
		
		for (var i = 0, len = pixels.length; i < len; i += 4) {
			if ( !pixelsEquivalent(bg, 0, pixels, i) ) {
				return false;
			}
		}
		return true;
	};
	
	SpriteCanvasProto._expandRect = function(rect, edgeBgResult, edgeBoundsResult) {
		if ( !edgeBgResult[0] && !edgeBoundsResult[0] ) {
			rect.y--;
			rect.height++;
		}
		if ( !edgeBgResult[1] && !edgeBoundsResult[1] ) {
			rect.width++;
		}
		if ( !edgeBgResult[2] && !edgeBoundsResult[2] ) {
			rect.height++;
		}
		if ( !edgeBgResult[3] && !edgeBoundsResult[3] ) {
			rect.x--;
			rect.width++;
		}
		
		return rect;
	};
	
	SpriteCanvasProto._contractRect = function(rect, edgeBgResult) {
		if ( edgeBgResult[0] && rect.height ) {
			rect.y++;
			rect.height--;
		}
		if ( edgeBgResult[1] && rect.width ) {
			rect.width--;
		}
		if ( edgeBgResult[2] && rect.height ) {
			rect.height--;
		}
		if ( edgeBgResult[3] && rect.width ) {
			rect.x++;
			rect.width--;
		}
		
		return rect;
	};
	
	return SpriteCanvas;
})();