import $ from 'jquery';

class Exporter {

    constructor(editorSprites) {
		this.$exportContainer   = $('.export-container');

        this.$table = this.createExportTable().appendTo(this.$exportContainer);
        this.$options = this.createExportOptions().appendTo(this.$exportContainer);
        this.selectedSprites = editorSprites;

    }

    createExportTable() {
        const container = $('<div class="export-table"></div>');
        var $table = $('<table>');
        var $tHead = $('<thead>');
        var $tBody = $('<tbody>');

        $table.append($tHead);
        $table.append($tBody);

        var $headerRow = $('<tr>');
        $headerRow.append('<th>Sprite</th>');
        $headerRow.append('<th>Name</th>');
        $tHead.append($headerRow);

        $table.appendTo(container);
        return container;
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