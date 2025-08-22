import $ from 'jquery';
import JSZip from 'jszip';

import InlineEdit from '../spritecow/InlineEdit';
import PreviewAnimation from '../mapper/PreviewAnimation';
import Rect from '../spritecow/Rect';

class PreviewPanel {

    constructor(spriteCanvas, spriteCanvasView, $appendTo) {
        var $container = $('<div class="preview-panel"></div>').appendTo($appendTo);
        this._$container = $container;
        this.$preview = this.createPreviewComponent().appendTo($container);
        this.$mods = this.createModComponent().appendTo($container);
        this.$properties = this.createPropertiesComponent().appendTo($container);
        this.$settings = this.createSettingsComponent().appendTo($container);
        this.$array = this.createArrayComponent().appendTo($container)

        this.$previewCanvas = this.$preview.find('canvas')[0];
        this.$hiddenExportingCanvas = $(`<canvas style="display:none"/>`)[0];
        this.$exportButton = this.$settings.find('#exportButton');

        this.$spriteCanvas = spriteCanvas.canvas;
        this.$spriteCanvasView = spriteCanvasView;
        this.fileName = 'map';
        this.spriteName = 'tile';
        this.fps = 5;
        this.selectedSprites = [];
        this.animation = new PreviewAnimation(this.$previewCanvas, this.draw)
        this._addEditEvents();
        this.$exportButton.on('click', this.handleExport.bind(this));
    }

    createPreviewComponent() {
        const container = $('<div class="preview-container"></div>');
        $('<div class="panel-title">Sprite Preview</div>').appendTo(container);
        $('<div id="preview"><canvas class="panel-sprite-selected" width="100" height="100"></canvas></div>').appendTo(container);

        return container;
    }

    createModComponent() {
        const container = $('<div class="panel-mods"></div>');

        $('<div class="panel-title">Modifications</div>').appendTo(container);
        $('<div>FPS</div>').appendTo(container);
        $('<div><input id="animFps"/></div>').appendTo(container);
        $('<div>Normalize</div>').appendTo(container);
        $('<div><input type="checkbox" id="alignSlice"/></div>').appendTo(container);

        return container;
    }

    createPropertiesComponent() {
        const container = $('<div class="panel-props"></div>');

        $('<div class="panel-title">Properties</div>').appendTo(container);
        $('<div>Top Left</div>').appendTo(container);
        $('<div><span><input id="topX"/> , <input id="topY"/></span></div>').appendTo(container);
        $('<div>Dimensions</div>').appendTo(container);
        $('<div><span><input id="width"/> x <input id="height"/></span></div>').appendTo(container);
        
        return container;
    }

    createSettingsComponent() {
        const container = $('<div></div>');

        $('<div class="panel-title">Export</div>').appendTo(container);
        $('<div>File Name: <span id="fileName" data-inline-edit="file-name"/></div>').appendTo(container);
        $('<div><span id="selectedSpritesCount">0</span> sprite(s) selected!</div>').appendTo(container);
        $('<div><input id="exportButton" type="button" value="Export" title="Export as JSON"></div>').appendTo(container);
        return container;
    }

    createArrayComponent() {
        const container = $('<div></div>');

        $('<div class="panel-title">Mapped</div>').appendTo(container);
        $('<div>Sprite Name:<span id="spriteName" data-inline-edit="sprite-name"/></div>').appendTo(container);
        $('<div><input id="addButton" type="button" value="Add" title="Add to map"></div>').appendTo(container);
        return container;
    }

    update() {
        var rect = this.selectedSprites[this.selectedSprites.length - 1].rect;
        const previewCanvas = this.$previewCanvas;

        this.$settings.find('#fileName').text(this.fileName);
        this.$array.find('#spriteName').text(this.spriteName);
        this.fps = this.$mods.find('#animFps').val();
        this.$settings.find('#selectedSpritesCount').text(this.selectedSprites.length);

        this.$properties.find('#topX').val(rect.x);
        this.$properties.find('#topY').val(rect.y);
        this.$properties.find('#width').val(rect.width);
        this.$properties.find('#height').val(rect.height);

        if(this.selectedSprites.length > 1){
            let sprites = this.selectedSprites.map(s => s.rect);
            this.animation.Queue(sprites, this.fps);
        }
        else{
            this.animation.Stop();
            this.draw(previewCanvas, rect);
        }
    };

    draw = (canvas, rect) => {
        // the preview canvas has a fixed size and the sprite is resized to fit the preview panel
        const context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(
            this.$spriteCanvas, rect.x, rect.y, rect.width, rect.height,
             0, 0, canvas.width, canvas.height
            //0, 0, rect.width, rect.height 
        );
    };

    handleExport() {
        if(this.selectedSprites.length > 1) {
            this.createZipExport().then(base64 => {
                const dataUrl = "data:application/zip;base64," + base64;
                this.downloadExport(dataUrl, '.zip');
            });
        } else {
            const image = this.createImageData(this.selectedSprites[0]);
            this.downloadExport(image, '.png');
        }
    }

    downloadExport(dataUrl, ext) {
        var link = document.createElement('a');
        link.download = this.fileName + ext;
        link.href = dataUrl;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    createImageData(sprite) {
        const rect = sprite.rect;
        const hiddenCanvas = this.$hiddenExportingCanvas;
        const hiddenCanvasContext = hiddenCanvas.getContext('2d');

        hiddenCanvasContext.clearRect(0, 0, hiddenCanvas.width, hiddenCanvas.height);
        hiddenCanvas.width = rect.width;
        hiddenCanvas.height = rect.height;
        hiddenCanvasContext.drawImage(
            this.$spriteCanvas, rect.x, rect.y, rect.width, rect.height,
            0, 0, hiddenCanvas.width, hiddenCanvas.height
        );

        return hiddenCanvas.toDataURL("image/png");
    }

    createZipExport() {
        var zip = new JSZip();

        this.selectedSprites.forEach((sprite, i) => {
            const base64Image = this.createImageData(sprite).split(';base64,')[1];
            zip.file(`${i}.png`, base64Image, {base64: true});
        });

        return zip.generateAsync({type:"base64"});
    }

    _addEditEvents() {
        var previewPanel = this;
    
        new InlineEdit( previewPanel._$container ).bind('file-name', function(event) {
            var newVal = event.val;

            if(newVal.trim() !== "") {
                previewPanel.fileName = newVal;
                previewPanel.update();
            }
        });

        this.$mods.find('#animFps').val(this.fps);
        const fpsInput = document.getElementById("animFps");
        fpsInput.addEventListener('change', this.fpsHandler);

        const topXInput = document.getElementById("topX");
        topXInput.addEventListener('change', this.resizeHandler);

        const topYInput = document.getElementById("topY");
        topYInput.addEventListener('change', this.resizeHandler);

        const widthInput = document.getElementById("width");
        widthInput.addEventListener('change', this.resizeHandler);

        const heightInput = document.getElementById("height");
        heightInput.addEventListener('change', this.resizeHandler);

    };

    fpsHandler = () => {
        let val = this.$mods.find('#animFps').val();
        this.fps = val;
        if(this.selectedSprites.length > 1){
            this.animation.Update(this.fps);
        }
    }

    resizeHandler = () => {
        let oldRect = this.selectedSprites[this.selectedSprites.length - 1].rect

        let strX = this.$properties.find('#topX').val();
        let strY = this.$properties.find('#topY').val();
        let strWidth = this.$properties.find('#width').val();
        let strHeight = this.$properties.find('#height').val();

        let newX = parseInt(strX);
        let newY = parseInt(strY);
        let newWidth = parseInt(strWidth);
        let newHeight = parseInt(strHeight);

        let newRect = new Rect(newX, newY, newWidth, newHeight);

        this.$spriteCanvasView.resizeSelectedSprite(oldRect, newRect);
    }
}

export default PreviewPanel;