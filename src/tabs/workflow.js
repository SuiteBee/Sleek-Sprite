import $ from 'jquery';

function hideTabs(){
    var $tabcontent = $('.tabcontent');
    for (var i = 0; i < $tabcontent.length; i++) {
        $tabcontent[i].style.display = "none";
    }
};

function showTab(tabName){
    $(tabName).css('display', 'table');
};

function setTab(evt, tabName) {
  var i, $tablinks;

  hideTabs();

  $tablinks = $('.tablinks');
  for (i = 0; i < $tablinks.length; i++) {
    $tablinks[i].className = $tablinks[i].className.replace(' active', "");
  }

  $(tabName).css('display', 'table');
  evt.className += ' active';
};

(function() {
	// init
	(function() {
        function addButton(text, target){
            var $button = $('<div role="button"/>').addClass('tablinks').text(text).data('target', target);
            $button.on('click', function() {
                var tgt = $(this).data('target');
                setTab(this, tgt);
            });
            return $button;
        }

        var $workflow = $('.workflow');

        addButton('Selection', '.selection-tab').appendTo($workflow);
        addButton('Adjustment', '.adjustment-tab').appendTo($workflow);
        addButton('Export', '.export-tab').appendTo($workflow);

        hideTabs();
        showTab('.selection-tab');
        
	})();
})();