"use strict";

function CellType(name, color) {
	this.name = name;
	this.color = color;
}

CellType.prototype = {
	constructor: CellType,
	something: function() {
		
	}
}

function MapCell(map, type) {
	this.map = map;
	this.type = type;
}

MapCell.prototype = {
	constructor: MapCell,
	something: function() {
		
	}
}

function CellGroup(map, size, startRow, startCol) {
	this.map = map;
	this.size = size;
	this.startRow = startRow;
	this.startCol = startCol;
	
	this.determineCells();
}

CellGroup.prototype = {
	constructor: CellGroup,
	determineCells: function() {
		this.cells = [];
		
		var halfHeight = Math.ceil(this.size / 2);
		var even = this.size % 2 == 0
		
		this._addHalfCells(false, even, halfHeight);
		this._addHalfCells(true, even, halfHeight);
		
		// when map size changes, groups will need recalculated if:
		// startX or startY < 0
		// startX + this.size  >= old map width
		// startY + this.size  >= old map height
		
		// when recalculating, dump links to all previous cells, and obtain them afresh.
		// if there are no cells for a group, it should be removed.
	},
	_addHalfCells: function(downward, evenSize, halfHeight) {
		for (var i = 0; i < halfHeight; i++) {
			var row;
			var rowStart = this.startCol;
			var rowSize = this.size - i;
			
			// on the downward half, an even-sized cell needs to extend one further to the right, and one further down, than an odd-sized cell
			if (downward) {
				row = this.startRow + i;
				if (evenSize)
					row++;
				else if (i == 0)
					continue;
			}
			else {
				row = this.startRow - i;
				rowStart += i;
			}
			
			if (row < 0 || row >= this.map.height)
				continue;
			
			for (var j=0; j<rowSize; j++) {
				var col = rowStart + j;
				if (col < 0 || col >= this.map.width)
					continue;
				
				var cell = this.map.cells[row * this.map.width + col];
				if (cell != null)
					this.cells.push(cell);
			}
		}
	}
}

function MapData(width, height, createCells) {
	this.width = width + Math.floor(height/2) - 1;
	this.height = height;
	this.cells = new Array(this.width * this.height);
	this.cellTypes = [];
	
	if (createCells !== false) {	
		for (var i=0; i<this.cells.length; i++)
			if (this._shouldIndexHaveCell(i))
				this.cells[i] = new MapCell(this, null);
		
		this.cellTypes.push(new CellType('red', '#ff0000'));
		this.cellTypes.push(new CellType('green', '#00cc00'));
		this.cellTypes.push(new CellType('blue', '#0099ff'));
		
		this._positionCells();
	}
}

MapData.prototype = {
	constructor: MapData,
	_positionCells: function() {
        var packedWidthRatio = 1.7320508075688772, packedHeightRatio = 1.5;
        var minX = Number.MAX_VALUE, minY = Number.MAX_VALUE;
        var maxX = Number.MIN_VALUE, maxY = Number.MIN_VALUE;

        for (var i = 0; i < this.cells.length; i++) {
            var cell = this.cells[i];
            if (cell == null)
                continue;

            cell.row = Math.floor(i / this.width);
            cell.col = i % this.width;
            cell.xPos = packedWidthRatio * (cell.col + cell.row/2);
            cell.yPos = packedHeightRatio * cell.row;

            if (cell.xPos < minX)
                minX = cell.xPos;
            else if (cell.xPos > maxX)
                maxX = cell.xPos;

            if (cell.yPos < minY)
                minY = cell.yPos;
            else if (cell.yPos > maxY)
                maxY = cell.yPos;
        }

        this.minX = minX - 1; this.minY = minY - 1;
        this.maxX = maxX + 1; this.maxY = maxY + 1;

        for (var i = 0; i < this.cells.length; i++) {
            var cell = this.cells[i];
            if (cell == null)
                continue;

            cell.xPos -= minX;
            cell.yPos -= minY;
        }
	},
	_shouldIndexHaveCell: function(index) {
		var row = Math.floor(index / this.width);
		var col = index % this.width;
		if (2 * col + row < this.height - 2)
			return false; // chop left to get square edge
		if (row + 2 * col > 2 * this.width - 1)
			return false; // chop right to get square edge
		return true;
	},
	changeWidth: function(delta, leftEdgeFixed) {
		this._performWidthChange(delta, leftEdgeFixed, false);
		this._positionCells();
	},
	changeHeight: function(delta, topEdgeFixed) {
		var increment = delta > 0 ? 1 : -1;
		var increasing = delta > 0 ? 1 : 0;
		
		for (var i=0; i != delta; i += increment) {
			if ((this.height + increasing) % 2 == 0)
				this._performWidthChange(increment, !topEdgeFixed, true);
			this._performHeightChange(increment, topEdgeFixed);
		}
		this._positionCells();
	},
	_performWidthChange(delta, leftEdgeFixed, forHeightChange) {
		var overallDelta = 0;
		if (delta > 0) {
			for (var row=0; row<this.height; row++) {
				var rowInsertIndex; // this is complicated on account of the "chopping" we did to get square edges
				if (leftEdgeFixed)
					rowInsertIndex = this.width - Math.floor(row/2);
				else
					rowInsertIndex = Math.floor((this.height - row - 1)/2);
				
				var rowStart = row * this.width;
				var insertPos = rowStart + rowInsertIndex + overallDelta;
				
				for (var i=0; i<delta; i++)
					this.cells.splice(insertPos, 0, forHeightChange ? null : new MapCell(this, null));
				
				overallDelta += delta;
			}
		}
		else if (delta < 0) {
			for (var row=0; row<this.height; row++) {
				var rowChopPos;
				if (forHeightChange) {
					if (leftEdgeFixed)
						rowChopPos = this.width + delta;
					else
						rowChopPos = 0;
				}
				else if (leftEdgeFixed)
					rowChopPos = this.width - Math.floor(row/2) + delta;
				else
					rowChopPos = Math.floor((this.height - row - 1)/2);
				
				var rowStart = row * this.width;
				var chopPos = rowStart + rowChopPos + overallDelta;
				this.cells.splice(chopPos, -delta);
				overallDelta += delta;
			}
		}
		
		this.width += delta;
	},
	_performHeightChange: function (delta, topEdgeFixed) {
		if (delta > 0) {
			var diff = delta * this.width;
			for (var i=0; i<diff; i++) {
				if (this.cells.length + 1 > this.width * this.height)
					this.height++;
				
				var globalIndex = topEdgeFixed ? this.cells.length : diff - i - 1;
				this.cells.splice(topEdgeFixed ? this.cells.length : 0, 0, this._shouldIndexHaveCell(globalIndex) ? new MapCell(this, null) : null);
			}
		}
		else if (delta < 0) {
			var diff = -delta * this.width;
			this.height += delta;
			this.cells.splice(topEdgeFixed ? this.cells.length - diff : 0, diff);
		}
	},
	saveToJSON: function() {
		this._replaceTypesWithIndexes();
		
		var json = JSON.stringify(this, function (key,value) {
			if (key == 'row' || key == 'col' || key == 'xPos' || key == 'yPos'
			|| key == 'minX' || key == 'maxX' || key == 'minY' || key == 'maxY'
			|| key == 'map' || key == 'selected')
				return undefined;
			return value;
		}, '	');
		
		this._replaceIndexesWithTypes();
		return json;
	},
	_replaceTypesWithIndexes: function() {
		for (var i=0; i<this.cells.length; i++) {
			var cell = this.cells[i];
			cell.type = this.cellTypes.indexOf(cell.type);
		}
	},
	_replaceIndexesWithTypes: function() {
		for (var i=0; i<this.cells.length; i++) {
			var cell = this.cells[i];
			cell.type = this.cellTypes[cell.type];
		}
	},
	createCellGroups: function(size) {
		var groups = [];
		
		var halfSizeUp = Math.ceil(size / 2);
		var halfSizeDown = Math.floor(size / 2);
		this._createCellGroupSet(size, -size + 1, -halfSizeUp - 1, this.cellTypes[0]);
		this._createCellGroupSet(size, -halfSizeDown, -halfSizeUp * 3, this.cellTypes[1]);
		this._createCellGroupSet(size, 1, -size - 2, this.cellTypes[2]);
		
		return groups;
	},
	_createCellGroupSet: function(size, startRow, startCol, cellType) {
		var rowSpacing = size + Math.ceil(size / 2);
		var colSpacing = size + Math.floor(size / 2);
		var colOffset = 0;
		
		for (var row = startRow; row<this.height; row += rowSpacing) {
			var rowOffset = 0;
			for (var col = startCol + colOffset; col<this.width; col += colSpacing) {
				var group = new CellGroup(this, size, row + rowOffset, col);
				
				if (cellType !== undefined)
					for (var i=0; i<group.cells.length; i++)
						group.cells[i].type = cellType;

				rowOffset ++;
			}
			
			colOffset -= 1;
		}
	}
};

MapData.loadFromJSON = function(json) {
	var map = new MapData(json.width, json.height, false);
	
	map.cells = json.cells.map(function(cell) {
		if (cell == null)
			return null;
		return new MapCell(map, cell.type);
	});
	
	map._positionCells();
	
	map.cellTypes = json.cellTypes.map(function(type) {
		return new CellType(type.name, type.color);
	});
	
	map._replaceIndexesWithTypes();
	
	return map;
};