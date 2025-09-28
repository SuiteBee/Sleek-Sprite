import Rect from '../../components/Rect';
import Window from '../../components/Window';

class SelectorWindow extends Window {
	constructor() {
		super();
	}

	init(img){
		//Send image to canvas
		this.setImg(img);

		//Set background as top left pixel
		let pixel = this.getFirstPixel();
		this.setBg(pixel);
	}

	findActive(selectedSprites, clickRect) {
		let currentSelections = selectedSprites.map(current => current.rect);
		return currentSelections.find(SelectorWindow.#intersect, { rect: clickRect });
	}

	pixelsToAlpha() {
		const imgDat = this.context.getImageData(0,0, this.width, this.height);
		const pixels = imgDat.data;
		const targetBg = this.getBg();

		for(let i=0; i < pixels.length; i += 4){
			const r = pixels[i];
			const g = pixels[i+1];
			const b = pixels[i+2];

			if(r == targetBg[0] && g == targetBg[1] && b == targetBg[2]){
				pixels[i+3] = 0;
			}
		}

		this.context.putImageData(imgDat, 0, 0);
		this.setBg([0,0,0,0]);
	}

	pixelsToBg(selected) {
		const targetBg = this.getBg();

		for(let i=0; i < selected.length; i++){

			var toClear = selected[i].rect;
			const imgDat = this.context.getImageData(toClear.x, toClear.y, toClear.width, toClear.height);
			const pixels = imgDat.data;

			for(let j=0; j < pixels.length; j += 4){
				pixels[j] = targetBg[0];
				pixels[j+1] = targetBg[1];
				pixels[j+2] = targetBg[2];
				pixels[j+3] = targetBg[3];
			}

			this.context.putImageData(imgDat, toClear.x, toClear.y);
		}
	}

	findAllBounds(rects, chunkSize = 1) {
		let toSelect = rects;
		var chunkWidth = chunkSize,
			chunkHieght = chunkSize;

		//Move from left to right, then top to bottom
		for(let y=0; y < this.height; y += chunkSize){
			chunkHieght = chunkSize;

			//Handle end of height
			if(y + chunkSize > this.height) { chunkHieght = this.height - y }

			for(let x=0; x < this.width; x += chunkSize){
				chunkWidth = chunkSize;
				
				//Handle end of width
				if(x + chunkSize > this.width) { chunkWidth = this.width - x }

				//Search image in chunks
				const pixels = this.context.getImageData(x, y, chunkWidth, chunkHieght).data;
				const chunkRect = new Rect(x, y, chunkWidth, chunkHieght);

				//Skip if chunk only contains bg or intersects with already selected sprites
				if (this.#pixelsContainOnlyBg(pixels) || toSelect.some(SelectorWindow.#intersect, { rect: chunkRect })){ continue }
				
				let pixelRect = this.#findChunkPixel(chunkRect, pixels);
				let spriteRect = this.#getSpriteBounds(pixelRect);

				//Skip if sprite size is smaller than a chunk
				if((spriteRect.width * spriteRect.height) < (chunkWidth * chunkHieght)) { continue }

				toSelect.push(spriteRect);
			}
		}

		return toSelect;
	}
	
	trimBg(rect) {
		var edgeBgResult;
		
		rect = this.#restrictRectToBoundry(rect);
		
		if (rect.width && rect.height) do {
			edgeBgResult = this.#edgesAreBg(rect);
			rect = this.#contractRect(rect, edgeBgResult);
		} while ( rect.height && rect.width && !SelectorWindow.#allArrayFalse(edgeBgResult) );
		
		return rect;
	}
	
	expandToSpriteBoundry(rect, callback) {
		var edgeBgResult = this.#edgesAreBg(rect),
			edgeBoundsResult = this.#edgesAtBounds(rect);
			
		// expand
		while ( !SelectorWindow.#allArrayOrTrue(edgeBgResult, edgeBoundsResult) ) {
			rect = this.#expandRect(rect, edgeBgResult, edgeBoundsResult);
			edgeBgResult = this.#edgesAreBg(rect);
			edgeBoundsResult = this.#edgesAtBounds(rect);
			// callback(); // for debugging
		}
		
		// trim edges of bg
		rect = this.#contractRect(rect, edgeBgResult);
		
		return rect;
	}

	#findChunkPixel(chunkRect, pixels){
		let chunkX = chunkRect.x,
			chunkY = chunkRect.y;

		//Find first non bg pixel
		for(let i=0; i < pixels.length; i += 4){
			//Return simulated click position
			if ( !SelectorWindow.#pixelsEquivalent(this.getBg(), 0, pixels, i) ) {
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

	#getSpriteBounds(pixelRect){
		const rect = Object.assign({}, pixelRect);
		let spriteRect = this.trimBg(rect);
		spriteRect = this.expandToSpriteBoundry(rect);

		return spriteRect;
	}

	#restrictRectToBoundry(rect) {
		var restrictedX = Math.min( Math.max(rect.x, 0), this.width ),
			restrictedY = Math.min( Math.max(rect.y, 0), this.height );
		
		if (restrictedX !== rect.x) {
			rect.width -= restrictedX - rect.x;
			rect.x = restrictedX;
		}
		if (restrictedY !== rect.y) {
			rect.height -= restrictedY - rect.y;
			rect.y = restrictedY;
		}
		rect.width  = Math.min(rect.width,  this.width - rect.x);
		rect.height = Math.min(rect.height, this.height - rect.y);
		return rect;
	}
	
	#edgesAreBg(rect) {
		// look at the pixels around the edges
		var context = this.context,
			top    = context.getImageData(rect.x, rect.y, rect.width, 1).data,
			right  = context.getImageData(rect.x + rect.width - 1, rect.y, 1, rect.height).data,
			bottom = context.getImageData(rect.x, rect.y + rect.height - 1, rect.width, 1).data,
			left   = context.getImageData(rect.x, rect.y, 1, rect.height).data;
			
		
		return [
			this.#pixelsContainOnlyBg(top),
			this.#pixelsContainOnlyBg(right),
			this.#pixelsContainOnlyBg(bottom),
			this.#pixelsContainOnlyBg(left)
		];
	}
	
	#edgesAtBounds(rect) {
		return [
			rect.y === 0,
			rect.x + rect.width === this.width,
			rect.y + rect.height === this.height,
			rect.x === 0
		];
	}
	
	#pixelsContainOnlyBg(pixels) {
		var bg = this.getBg();
		
		for (var i = 0, len = pixels.length; i < len; i += 4) {
			if ( !SelectorWindow.#pixelsEquivalent(bg, 0, pixels, i) ) {
				return false;
			}
		}
		return true;
	}
	
	#expandRect(rect, edgeBgResult, edgeBoundsResult) {
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
	}
	
	#contractRect(rect, edgeBgResult) {
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
	}

	static #pixelsEquivalent(pixels1, offset1, pixels2, offset2) {
		if ( pixels1[offset1 + 3] === 0 && pixels2[offset2 + 3] === 0 ) {
			// if both have alpha zero, they're the same
			return true;
		}
		// otherwise only true if both pixels have equal RGBA vals
		for (var i = 4; i--;) if ( pixels1[offset1 + i] !== pixels2[offset2 + i] ) {
			return false;
		}
		return true;
	}
	
	static #allArrayOrTrue(arr1, arr2) {
		for (var i = arr1.length; i--;) if ( !( arr1[i] || arr2[i] ) ) {
			return false;
		}
		return true;
	}
	
	static #allArrayFalse(arr1) {
		for (var i = arr1.length; i--;) if ( arr1[i] ) {
			return false;
		}
		return true;
	}

	static #intersect(element){
		let xIntersect = element.x < this.rect.x + this.rect.width && this.rect.x < element.x + element.width;
		let yIntersect = element.y < this.rect.y + this.rect.height && this.rect.y < element.y + element.height;
		return xIntersect && yIntersect;
	}

}
	
export default SelectorWindow;