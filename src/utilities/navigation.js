import $ from 'jquery';

//Initialize tabs
(function() {
  //Hide all tab content
  function hideTabs(){
    var $tabcontent = $('.tabcontent');
    for (var i = 0; i < $tabcontent.length; i++) {
        $tabcontent[i].style.display = "none";
    }
  };

  //Make visible and set as active (no event)
  function initTab(btn, tabClass){
    btn.addClass('active');
    $(tabClass).css('display', 'table');
  };

  //Make visible and set as active
  function setTab(evt, tabClass) {
    var i, $tablinks;

    hideTabs();

    $tablinks = $('.tablinks');
    for (i = 0; i < $tablinks.length; i++) {
      $tablinks[i].className = $tablinks[i].className.replace(' active', '');
    }

    $(tabClass).css('display', 'table');
    evt.className += ' active';
  };

  //Create tab button with event
  function addButton(text, id, tabClass){
      var $button = $('<div role="button"/>').attr("id", id).addClass('tablinks').text(text);
      $button.on('click', function() {
          setTab(this, tabClass);
      });
      return $button;
  }

	(function() {
        //Add buttons to container
        var $workflow = $('.workflow');
        var $selectionBtn = addButton('Selector', 'tabSelection', '.selection-tab');
        $selectionBtn.appendTo($workflow);
        addButton('Editor', 'tabEditor', '.editor-tab').appendTo($workflow);
        addButton('Animator', 'tabAnimate', '.animator-tab').appendTo($workflow);
        addButton('Export', 'tabExport', '.export-tab').appendTo($workflow);

        //Set initial state
        hideTabs();
        initTab($selectionBtn, '.selection-tab');
        
	})();
})();