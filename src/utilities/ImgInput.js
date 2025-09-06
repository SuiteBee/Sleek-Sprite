import $ from 'jquery';

import MicroEvent from './MicroEvent';

class ImgInput extends MicroEvent {
	constructor($container, $dropZone) {
		super();
		var $fileInput = $('<input type="file" accept="image/*" class="upload-input">').appendTo(document.body),
			$buttons = $('<div class="start-buttons"/>').appendTo($container),
			$selectButton = $('<div role="button" class="select-btn lg-button">Open Image</div>').appendTo($buttons),
			$demoButton = $('<div role="button" class="demo-btn lg-button">Show Example</div>').appendTo($buttons),
			$dropIndicator = $('<div class="drop-indicator"></div>').appendTo($dropZone),
			tutorialUrl = $('.tutorial').attr('href');

		$buttons.css('z-index', '1');
		this.fileName = 'example.png';
		this._fileInput = $fileInput[0];
		this.#addDropEvents($dropZone);

		$fileInput.on('change', '.upload-input', function () {
			var file = this.files[0];
			file && imgInput.#openFileAsImg(file);
			this.value = '';
		}.bind(this));

		this.fileClickjackFor($selectButton);
		$demoButton.on('click', function (event) {
			this.#loadImgUrl(tutorialUrl);
			event.preventDefault();
		}.bind(this));
	}

	reloadLastFile() {
		this._lastFile && this.#openFileAsImg( this._lastFile );
	};

	fileClickjackFor($elm) {
		$elm.fileClickjack(this._fileInput);
	};

	#openFileAsImg(file) {
		var reader = new FileReader;
		
		this._lastFile = file;
		this.fileName = file.fileName || file.name;
		
		reader.onload = function() {
			this.#loadImgUrl(reader.result);
		}.bind(this);
		reader.readAsDataURL(file);
	};

	#addDropEvents($dropZone) {
		var dropZone = $dropZone[0];
		
		dropZone.addEventListener('dragenter', function(event) {
			event.stopPropagation();
			event.preventDefault();
		}, false);
		
		dropZone.addEventListener('dragover', function(event) {
			event.stopPropagation();
			event.preventDefault();
			$dropZone.addClass('drag-over');
		}, false);
		
		dropZone.addEventListener('dragleave', function(event) {
			event.stopPropagation();
			event.preventDefault();
			$dropZone.removeClass('drag-over');
		}, false);
		
		dropZone.addEventListener('drop', function(event) {
			event.stopPropagation();
			event.preventDefault();
			$dropZone.removeClass('drag-over');
			var file = event.dataTransfer.files[0];
			
			if ( file && file.type.slice(0,5) === 'image' ) {
				this.#openFileAsImg(file);
			}
		}.bind(this), false);
	};

	#loadImgUrl(url) {
		var img = new Image;
		
		img.onload = function() {
			this.trigger('load', img);
		}.bind(this);
		img.src = url;
	};
}

export default ImgInput;