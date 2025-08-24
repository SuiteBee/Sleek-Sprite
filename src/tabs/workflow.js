import $ from 'jquery';

//Hide all tab content
function hideTabs(){
    var $tabcontent = $('.tabcontent');
    for (var i = 0; i < $tabcontent.length; i++) {
        $tabcontent[i].style.display = "none";
    }
};

//Make visible and set as active (no event)
function initTab(btn, tabName){
    btn.addClass('active');
    $(tabName).css('display', 'table');
};

//Make visible and set as active
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

//Initialize tabs
(function() {
	(function() {
        //Create tab button with event
        function addButton(text, target){
            var $button = $('<div role="button"/>').addClass('tablinks').text(text).data('target', target);
            $button.on('click', function() {
                var tgt = $(this).data('target');
                setTab(this, tgt);
            });
            return $button;
        }
        
        //Add buttons to container
        var $workflow = $('.workflow');
        var $selectionBtn = addButton('Selection', '.selection-tab');
        $selectionBtn.appendTo($workflow);
        addButton('Adjustment', '.adjustment-tab').appendTo($workflow);
        addButton('Export', '.export-tab').appendTo($workflow);

        //Set initial state
        hideTabs();
        initTab($selectionBtn, '.selection-tab');
        
	})();
})();