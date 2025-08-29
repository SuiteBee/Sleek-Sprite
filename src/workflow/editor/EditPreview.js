import $ from 'jquery';

export default (function() {

	function EditPreview($appendTo) {
        this.$preview = createPreviewComponent().appendTo($appendTo);
        
        this.canvas = this.$preview.find('canvas')[0];
        this.context = this.canvas.getContext('2d');

        function createPreviewComponent() {
            const container = $('<div class="edit-preview-container"></div>');
            $('<div class="panel-title">Editing</div>').appendTo(container);
            $('<div><canvas id="edit-preview-canvas" class="panel-sprite-selected" width="200" height="200"></canvas></div>').appendTo(container);

            return container;
        }
	}
	
	var EditPreviewProto = EditPreview.prototype;

	return EditPreview;
})();