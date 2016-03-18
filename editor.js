"use strict";

function MapEditor(view) {
	this.view = view;
	this._initialize();
}

MapEditor.prototype = {
	constructor: MapEditor,
	_initialize: function() {
		this.view.cellClicked = this._cellClicked.bind(this);
		this.terrainBrush = null;
		
		document.getElementById('addBrushLink').addEventListener('click', function() {
			this.terrainBrush = null;
			var brush = this.brushList.querySelector('.selected');
			if (brush != null)
				brush.classList.remove('selected');
			
			document.getElementById('brushName').value = '';
			document.getElementById('brushColor').value = '';
			document.getElementById('brushEdit').style.display = '';
			return false;
		}.bind(this));

		this.brushList = document.getElementById('brushList');
		document.querySelector('#brushEdit .dialog-buttons .ok').addEventListener('click', function() {
			var name = document.getElementById('brushName').value;
			var color = document.getElementById('brushColor').value;
			
			if (this.terrainBrush == null)
			{
				var type = new CellType(name, color);
				this.view.data.cellTypes.push(type);
			}
			else
			{
				this.terrainBrush.name = name;
				this.terrainBrush.color = color;
			}
			
			this.terrainBrush = null;
			this.drawCellTypes();
			return false;
		}.bind(this));
		
		this.drawCellTypes();

		var resizeWizard = new Wizard(document.getElementById('resize-wizard'), function (resize) {
			var number = parseInt(resize.number);
			if (resize.change != 'add')
				number = -number;
			
			switch (resize.edge) {
			case 'top':
				this.view.data.changeHeight(number, false);
				break;
			case 'bottom':
				this.view.data.changeHeight(number, true);
				break;
			case 'left':
				this.view.data.changeWidth(number, false);
				break;
			case 'right':
				this.view.data.changeWidth(number, true);
				break;
			}
			this.view.updateSize();
		}.bind(this));

		document.getElementById('resizeLink').addEventListener('click', function() {
			resizeWizard.show();
			return false;
		});
	},
	_cellClicked: function(cell) {
		if (this.terrainBrush == null)
			return false;

		cell.type = this.terrainBrush;
		return true;
    },
	drawCellTypes: function() {
		var output = '';
		
		for (var i=0; i<this.view.data.cellTypes.length; i++) {
			var type = this.view.data.cellTypes[i];
			output += '<div class="brush" style="background-color: ' + type.color + '" data-number="' + i + '">' + type.name + '</div>';
		}
		
		this.brushList.innerHTML = output;
		this.brushList.onclick = function(e) {
			var brush = e.target;
			var number = brush.getAttribute('data-number');
			if (number == null)
				return false;
			
			var brush = this.brushList.querySelector('.selected');
			if (brush != null)
				brush.classList.remove('selected');
			brush = e.target;
			
			brush.classList.add('selected');
			this.terrainBrush = this.view.data.cellTypes[number];
		}.bind(this);
		
		this.brushList.ondblclick = function(e) {
			if (this.brushList.onclick(e) === false)
				return;
	
			document.getElementById('brushName').value = this.terrainBrush.name;
			document.getElementById('brushColor').value = this.terrainBrush.color;
			document.getElementById('brushEdit').style.display = '';
		}.bind(this);
	}
};