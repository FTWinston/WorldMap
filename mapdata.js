"use strict";

function MapCell() {
	
}

MapCell.prototype = {
	constructor: MapCell,
	something: function() {
		
	}
}

function MapData(width, height) {
	this.width = width + Math.floor(height/2) - 1;
	this.height = height;
	this.cells = new Array(this.width * this.height);
	
	for (var i=0; i<this.cells.length; i++) {
		var row = Math.floor(i / this.width);
		var col = i % this.width;
		if (2 * col + row < this.height - 2)
			continue; // chop left to get square edge
		if (row + 2 * col > 2 * this.width - 1)
			continue; // chop right to get square edge
		
		this.cells[i] = new MapCell();
	}
	
	this._preprocess();
}

MapData.prototype = {
	constructor: MapData,
	_preprocess: function() {
		/*
		map.CellType = {
            OutOfBounds: 0,
            Flat: 1,
            Difficult: 2,
            Unpassable: 3,
            LowBarrier: 4,
            Barrier: 5,
        }
		*/
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
	changeWidth: function(delta, leftEdgeFixed) {
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
					this.cells.splice(insertPos, 0, new MapCell());
				
				overallDelta += delta;
			}
		}
		else {
			for (var row=0; row<this.height; row++) {
				var rowChopPos;
				if (leftEdgeFixed)
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
		this._preprocess();
	},
	changeHeight: function(delta, topEdgeFixed) {
		console.log('new height is ' + (this.height + delta) + ', ' + (topEdgeFixed ? 'top' : 'bottom') + ' edge is fixed');

		// if height increases, width must also change, which is kinda awkward
		
		this._preprocess();
	},
	saveToJSON: function() {
		return JSON.stringify(this, function (key,value) {
			if (key == 'row' || key == 'col' || key == 'xPos' || key == 'yPos'
			|| key == 'minX' || key == 'maxX' || key == 'minY' || key == 'maxY'
			|| key == 'selected')
				return undefined;
			return value;
		}, '	');
	}
};