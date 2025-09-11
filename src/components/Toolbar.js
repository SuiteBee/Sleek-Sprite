import $ from 'jquery';
import MicroEvent from '../utilities/MicroEvent';

class Toolbar extends MicroEvent {
	constructor(parent, appendToElm) {
		super();
		var toolbar = this,
			$container = $('<div class="toolbar">').appendTo($(parent).find(appendToElm)),
			$feed = $('<div class="feedback"></div>').appendTo($(parent).find(appendToElm));

		$container.on('mouseenter', 'div[role=button]', function () {
			var $button = $(this);
			if($button.hasClass('no-label')){
				toolbar.feedback($button.text());
			}
		});

		$container.on('mouseenter', 'div[role=img]', function () {
			var $item = $(this);
			toolbar.feedback($item.text());
		});

		$container.on('mouseenter', 'input[type=radio]', function () {
			var $radio = $(this);
			toolbar.feedback($radio.data('hint'));
		});

		$container.on('mouseenter', 'input[type=checkbox]', function () {
			var $checkbox = $(this);
			toolbar.feedback($checkbox.data('hint'));
		});

		$container.on('mouseenter', 'input[type=text]', function () {
			var $txtInput = $(this);
			var hint = $txtInput.data('hint');
			if(hint.length > 0){
				toolbar.feedback(hint);
			}
		});

		$container.on('mouseenter', 'select', function () {
			var $ddl = $(this);
			toolbar.feedback($ddl.data('hint'));
		});

		$container.on('click', 'div[role=button]', function () {
			var $button = $(this),
				toolName = $button.data('toolName'),
				event = new $.Event(toolName);

			event.isActive = $button.hasClass('active');

			if (!toolbar.trigger(event).isDefaultPrevented()) {
				if (event.isActive) {
					toolbar.deactivate(toolName);
				}
				else {
					toolbar.activate(toolName);
				}
			}

			event.preventDefault();
		});

		$container.on('input', 'input[type=text]', function() {
			var $input = $(this), 
			inputName = $input.data('inputName'),
			inputChange = new $.Event(inputName);
			toolbar.trigger(inputChange, $input.val());
		});

		$container.on('change', 'select', function() {
			var $ddl = $(this), 
			ddlName = $ddl.data('ddlName'),
			ddlChange = new $.Event(ddlName);
			toolbar.trigger(ddlChange, $ddl.val());
		});

		$container.on('change', 'input[type=checkbox]', function() {
			var $chkbox = $(this),
			chkName = $chkbox.data('chkName'),
			chkChange = new $.Event(chkName);
			toolbar.trigger(chkChange, $chkbox.prop("checked"));
		});

		$container.on('change', 'input[type=radio]', function() {
			var $radio = $(this),
			rdName = $radio.data('rdName'),
			rdOption = $radio.data('rdOption'),
			rdChange = new $.Event(rdName);
			toolbar.trigger(rdChange, rdOption);
		});

		$container.on('change', 'input[type=range]', function() {
			var $slider = $(this),
			scrName = $slider.data('scrName'),
			scrChange = new $.Event(scrName);
			toolbar.trigger(scrChange, $slider.val());
		});

		toolbar.$container = $container;
		toolbar._$feedback = $feed;
	}
	static createButton(toolName, text, opts) {
		opts = opts || {};

		var $button = $('<div role="button"/>').addClass(toolName).text(text).data('toolName', toolName);

		if (opts.noLabel) {
			$button.addClass('no-label');
		}
		if (opts.active) {
			$button.addClass('active');
		}

		return $button;
	}

	static createStatus(statusName, text){
		var $status = $('<div role="img"/>').addClass(statusName).text(text).data('status', statusName);
		return $status;
	}

	static createInput(inputName, text, hint, limit, defVal){
		var $container = $('<div role="input"/>').addClass(`${inputName}`).text(text);
		var $txtInput = $(`<input type="text" name="${inputName}" id="${inputName}" maxlength="${limit}"/>`).
			addClass(inputName).
			data('inputName', inputName).
			data('hint', hint).
			val(defVal);

		$txtInput.appendTo($container);
		return $container;
	}

	static createDropDown(ddlName, text, hint, ...options){
		var $container = $('<div role="select"/>').addClass(`${ddlName}`).text(text);
		var $ddl = $(`<select name="${ddlName}" id="${ddlName}"/>`).
			addClass(ddlName).
			data('ddlName', ddlName).
			data('hint', hint);

		for(let i=0; i<options.length;i++){
			let $option = $(`<option value="${options[i]}">${options[i]}</option>`);
			$option.appendTo($ddl);
		}
		$ddl.appendTo($container);
		return $container;
	}

	static createCheckbox(chkName, text, hint, defVal) {
		var $container = $('<div role="checkbox"/>').addClass(`${chkName}`).text(text);
		var $chkBox = $(`<input type="checkbox" name="${chkName}" id="${chkName}"/>`).
			addClass(chkName).
			data('chkName', chkName).
			data('hint', hint);

		$chkBox.prop('checked', defVal);
		$chkBox.appendTo($container);
		return $container;
	}

	static createRadio(rdName, option, optionVal, text, hint, defVal) {
		var $container = $('<div role="radio"/>').addClass(`${rdName}`).addClass(option).text(text);
		var $radio = $(`<input type="radio" name="${rdName}" id="${option}"/>`).
			addClass(option).
			data('hint', hint);
			
		$radio.data('rdName', rdName).data('rdOption', optionVal).prop('checked', defVal);

		$radio.appendTo($container);

		return $container;
	}

	static createSlider(scrName, limitLow, limitHigh){
		var $container = $('<div role="slider"/>').addClass(scrName);
		var $scrollBar = $(`<input type="range" min="${limitLow}" max="${limitHigh}" value="50" id="${scrName}"/>`);
		$scrollBar.data('scrName', scrName);
		$scrollBar.appendTo($container);

		return $container;
	}
}

var ToolbarProto = Toolbar.prototype;

ToolbarProto.addItem = function(toolName, text, opts) {
	if (toolName instanceof ToolbarGroup) {
		toolName.$container.appendTo(this.$container);
	}
	else {
		Toolbar.createButton(toolName, text, opts).appendTo( this.$container );
	}

	return this;
};

ToolbarProto.addStatus = function(statusName, text) {
	Toolbar.createStatus(statusName, text).appendTo( this.$container );

	return this;
};

ToolbarProto.addInput = function(inputName, text, hint, limit, defVal = '') {
	Toolbar.createInput(inputName, text, hint, limit, defVal).appendTo( this.$container );

	return this;
}

ToolbarProto.addDropDown = function(ddlName, text, hint, ...options){
	Toolbar.createDropDown(ddlName, text, hint, ...options).appendTo( this.$container );
	return this;
}

ToolbarProto.addCheckbox = function(chkName, text, hint, defVal = false) {
	Toolbar.createCheckbox(chkName, text, hint, defVal).appendTo( this.$container );

	return this;
}

ToolbarProto.addRadio = function(rdName, option, optionVal, text, hint, defVal = false) {
	Toolbar.createRadio(rdName, option, optionVal, text, hint, defVal).appendTo( this.$container );

	return this;
}

ToolbarProto.addSlider = function(scrName, limitLow, limitHigh) {
	Toolbar.createSlider(scrName, limitLow, limitHigh).appendTo( this.$container );

	return this;
}

ToolbarProto.feedbackColor = function(color, msg){
	var $feedback = this._$feedback, colBack, txtColor, readable, noColor = 'transparent';

	if(msg == noColor){
		$feedback.addClass(noColor);

		colBack = 'white';
		txtColor = 'black';
	}else{
		$feedback.removeClass(noColor);

		colBack = msg;
		readable = Math.round(((color[0] * 299) + (color[1] * 587) + (color[2]) * 114)/1000);
		txtColor = readable > 125 ? 'black' : 'white';
	}

	// opacity 0.999 to avoid antialiasing differences when 1
	$feedback.transitionStop(true).text(msg).css({
		opacity: 0.999,
		color: txtColor,
		background: '',
		'background-color': colBack,
		'font-weight': 'bold'
	});

	$feedback.transition({ opacity: 0 }, {
		duration: 2000
	});
	
	return this;
}

ToolbarProto.feedback = function(msg, severe) {
	var $feedback = this._$feedback,
		txtColor = 'black',
		gradBack = 'linear-gradient(to bottom, #d0d0d0, #a7a7a7)';

	// opacity 0.999 to avoid antialiasing differences when 1
	$feedback.transitionStop(true).text(msg).css({
		opacity: 0.999,
		color: txtColor,
		background: gradBack,
		'font-weight': 'normal'
	});
	
	if (severe) {
		$feedback.css('font-weight', 'bold');
		
		if ($.support.transition) {
			$feedback.transition({ color: 'red' }, {
				duration: 3000
			});
		}
		else {
			$feedback.css('color', 'red');
		}
	}
	else {
		$feedback.animate({
			// should be using delay() here, but http://bugs.jquery.com/ticket/6150 makes it not work
			// need to specify a dummy property to animate, cuh!
			_:0
		}, 3000);
	}
	
	$feedback.transition({ opacity: 0 }, {
		duration: 2000
	});
	
	return this;
};

ToolbarProto.activate = function(toolName) {
	var $button = this.$container.find('.' + toolName + '[role=button]');
	$button.closest('.toolbar-group').children().removeClass('active');
	$button.addClass('active');
	return this;
};

ToolbarProto.deactivate = function(toolName) {
	this.$container.find('.' + toolName + '[role=button]').removeClass('active');
	return this;
};

ToolbarProto.isActive = function(toolName) {
	return this.$container.find('.' + toolName + '[role=button]').hasClass('active');
};

class ToolbarGroup {
	constructor(groupClass) {
		this.$container = $('<div class="toolbar-group"/>').addClass(groupClass);
	}
}

var ToolbarGroupProto = ToolbarGroup.prototype;

ToolbarGroupProto.addItem = function(toolName, text, opts) {
	Toolbar.createButton(toolName, text, opts).appendTo(this.$container);
	return this;
};

ToolbarGroupProto.addStatus = function(statusName, text) {
	Toolbar.createStatus(statusName, text).appendTo(this.$container);

	return this;
};

ToolbarGroupProto.addInput = function(inputName, text, hint, limit, defVal = '') {
	Toolbar.createInput(inputName, text, hint, limit, defVal).appendTo(this.$container);

	return this;
}

ToolbarGroupProto.addDropDown = function(ddlName, text, hint, ...options){
	Toolbar.createDropDown(ddlName, text, hint, ...options).appendTo(this.$container);

	return this;
}

ToolbarGroupProto.addCheckbox = function(chkName, text, hint, defVal = false) {
	Toolbar.createCheckbox(chkName, text, hint, defVal).appendTo(this.$container);

	return this;
}

ToolbarGroupProto.addRadio = function(rdName, option, optionVal, text, hint, defVal = false) {
	Toolbar.createRadio(rdName, option, optionVal, text, hint, defVal).appendTo(this.$container);

	return this;
}

export {
	Toolbar,
	ToolbarGroup
};