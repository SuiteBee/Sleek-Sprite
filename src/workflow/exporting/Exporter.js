import $ from 'jquery';

class Exporter {

    constructor(editorCanvas) {
		this.$exportContainer   = $('.export-container');
        this.editorCanvas = editorCanvas;

        //Exporter tab activated
        var $exportTabBtn = $('#tabExport');
        $exportTabBtn.on("click", function() {
            $('.export-table').remove();
            $('.export-options').remove();

            this.$tableContainer = this.createExportTable().appendTo(this.$exportContainer);
            this.$options = this.createExportOptions().appendTo(this.$exportContainer);

        }.bind(this));
    }

    createExportTable() {
        const container = $('<div class="export-table"></div>');
        var $table = $('<table>');
        var $tHead = $('<thead>');

        $table.append($tHead);

        var $headerRow = $('<tr>');
        $headerRow.append('<th>Sprite</th>');
        $headerRow.append('<th>Name</th>');
        $tHead.append($headerRow);

        var $tBody = this.gatherExportRows();
        $table.append($tBody);

        $table.appendTo(container);
        return container;
    }

    gatherExportRows() {
        var $tBody = $('<tbody>');

        let sprites = [...this.editorCanvas.sprites];
        for(let i=0; i<sprites.length; i++){
            let $row = this.createExportRow(sprites[i]);
            $tBody.append($row);
        }

        return $tBody;
    }

    createExportRow(sprite) {
        var $dataRow = $('<tr>');

        var $previewCell = $('<td>');
        let $smallPreview = $('<canvas width="100" height="100"></canvas>');
        let smallContext = $smallPreview[0].getContext('2d');
        smallContext.drawImage(
            this.editorCanvas.canvas, sprite.cell.x, sprite.cell.y, sprite.cell.width, sprite.cell.height,
            0, 0, 100, 100
        );

        $smallPreview.addClass('small-preview').appendTo($previewCell);
        $previewCell.appendTo($dataRow);

        var $nameCell = $('<td>');
        var $txtInput = $(`<input type="text" name="export-cell-${sprite.n}" id="export-cell-${sprite.n}"/>`).
			addClass('export-cell').
			val(sprite.n);

        $txtInput.appendTo($nameCell);
        $nameCell.appendTo($dataRow);

        return $dataRow;
    }

    createExportOptions() {
        const container = $('<div class="export-options"></div>');
        var $btnExport = $('<button>Export</button>');
        $btnExport.appendTo(container);
        
        return container;
    }
}

var ExporterProto = Exporter.prototype;

export default Exporter;