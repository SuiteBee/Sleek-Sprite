import Rect from '../sprite/Rect';

class MockSprite {
	constructor(rect, data, index) {
		this.old = rect;
		this.n = index;
		this.rect = new Rect(rect.x, rect.y, rect.width, rect.height);
        this.imgData = data;
	}
}

var MockProto = MockSprite.prototype;

export default MockSprite;