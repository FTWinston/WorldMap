"use strict";

function Wizard(root, callback) {
	this.root = root;
	this.callback = callback;
	this._initialize();
}

Wizard.prototype = {
	constructor: Wizard,
	_initialize: function() {
		var btn = this.root.querySelector('.dialog-buttons input.ok');
		btn.style.display = 'none';
		btn.addEventListener('click', this._confirmed.bind(this));
		
		this.output = {};
	
		this.steps = this.root.querySelectorAll('.step');
		for (var i=0; i<this.steps.length; i++) {
			var step = this.steps[i];
			
			var items = step.querySelectorAll('li');
			for (var j=0; j<items.length; j++) {
				var item = items[j];
				item.addEventListener('click', this._stepItemPicked.bind(this, step, item));
			}
			
			items = step.querySelectorAll('input[type="text"]');
			for (var j=0; j<items.length; j++) {
				var item = items[j];
				item.addEventListener('keyup', this._stepItemPicked.bind(this, step, item));
			}
		}
	},
	show: function() {
		this._showStep(this.steps[0]);
		this._showDialog();
	},
	_showDialog: function() {
		this.root.style.display = '';
	},
	_showStep: function(step) {
		var display = step.querySelectorAll('.display');
		for (var i=0; i<display.length; i++) {
			var prop = display[i].getAttribute('data-property');
			display[i].innerText = this.output[prop];
		}
		
		var items = step.querySelectorAll('li');
		for (var i=0; i<items.length; i++) {
			var item = items[i];
			
			var attr = item.getAttribute('data-show-property');
			if (attr !== null) {
				if (this.output[attr] != item.getAttribute('data-show-value'))
					item.style.display = 'none';
				else
					item.style.display = '';
			}
			
			item.classList.remove('selected');
		}
		
		items = step.querySelectorAll('input[type="text"]');
		for (var i=0; i<items.length; i++) {
			var item = items[i];
			item.classList.remove('selected');
			item.value = '';
		}
		
		step.classList.remove('done');
		step.style.display = '';
		
		// also hide all later steps, in case this was re-picked
		var passed = false;
		for (var i=0; i<this.steps.length; i++)
			if (passed)
				this.steps[i].style.display = 'none';
			else if (this.steps[i] == step)
				passed = true;
		
		this.root.querySelector('.dialog-buttons input.ok').style.display = 'none';
	},
	_stepItemPicked: function(step, item, e) {
		var value = item.getAttribute('data-value');
		if (value == null && item.value !== undefined)
			value = item.value;
		
		var items = step.querySelectorAll('li');
		for (var i=0; i<items.length; i++)
			items[i].classList.remove('selected');
		
		items = step.querySelectorAll('input[type="text"]');
		for (var i=0; i<items.length; i++)
			items[i].classList.remove('selected');
		
		
		this.output[item.getAttribute('data-property')] = value;
		item.classList.add('selected');
		step.classList.add('done');
		
		var isFinal = step.classList.contains('final');
		if (!isFinal) {
			// show the next step
			var stepNum = 0;
			for (var i=0; i<this.steps.length; i++) {
				if (this.steps[i] == step)
					break;
				stepNum++;
			}
			if (stepNum == this.steps.length - 1)
				isFinal = true;
			else
				this._showStep(this.steps[stepNum + 1]);
		}
		
		if (isFinal) {
			this.root.querySelector('.dialog-buttons input.ok').style.display = '';
		}
	},
	_confirmed: function () {
		this.callback(this.output);
	}
};

var dialogs = document.querySelectorAll('.dialog');
for (var i=0; i<dialogs.length; i++) {
	var dialog = dialogs[i]
	
	var btns = document.createElement('div');
	btns.classList.add('dialog-buttons');
	btns.innerHTML = '<input type="button" class="cancel" value="Cancel" /> <input type="button" class="ok" value="OK" />';
	dialog.appendChild(btns)
	
	var hide = function() {
		this.style.display = 'none';
	}.bind(dialog);
	
	dialog.querySelector('.dialog-buttons input.cancel').addEventListener('click', hide);
	dialog.querySelector('.dialog-buttons input.ok').addEventListener('click', hide);
}


var numeric = document.querySelectorAll('input.number[type="text"]');
for (var i=0; i<numeric.length; i++) {
	numeric[i].addEventListener('keypress', function(e) {
		if ((e.keyCode >= 48 && e.keyCode <= 57) || e.keyCode < 31)
			return;
		e.preventDefault();
	});
}