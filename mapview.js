"use strict";

function MapView(root, data) {
	this.data = data;
	this.root = root;
	this._initialize();
}

MapView.prototype = {
	constructor: MapView,
	_initialize: function() {
		this.root.classList.add('mapRoot');
		this.root.innerHTML = '<canvas></canvas><div class="scrollPane"><div className="scrollSize" /></div>';
		this.canvas = this.root.childNodes[0];
		this.scrollPane = this.root.childNodes[1];
		this.scrollSize = this.scrollPane.childNodes[0];
		
		this.canvas.style.pointerEvents = 'none';
		this.scrollPane.style.overflow = 'scroll';
		this.canvas.style.position = 'absolute';
		this.scrollPane.style.position = 'absolute';
		
		this.cellRadius = 30;
		this.terrainBrush = null;
		
		this.scrollPane.onscroll = this.draw.bind(this);
		this.scrollSize.onclick = this.clicked.bind(this);
		window.onresize = this.updateSize.bind(this);
		
		var scrollSize = this._getScrollbarSize();
		this.scrollbarWidth = scrollSize.width;
		this.scrollbarHeight = scrollSize.height;

		this.updateSize();
	},
	draw: function() {
		var ctx = this.canvas.getContext('2d');
        ctx.fillStyle = '#ccc';
        ctx.fillRect(0, 0, this.root.offsetWidth, this.root.offsetHeight);
        ctx.translate(-this.scrollPane.scrollLeft, -this.scrollPane.scrollTop);

        var map = this.data;
        for (var i=0; i<map.cells.length; i++) {
            var cell = map.cells[i];
            if (cell == null)
                continue;
            this._drawHex(ctx, cell, this.cellRadius);
        }

        ctx.translate(this.scrollPane.scrollLeft, this.scrollPane.scrollTop);
    },
    _drawHex: function(ctx, cell, radius) {
        ctx.beginPath();
        
        var centerX = cell.xPos * radius + radius, centerY = cell.yPos * radius + radius;
        radius -= 0.4; // ensure there's always a 1px border drawn between cells

        var angle, x, y;
        for (var point = 0; point < 6; point++) {
            angle = 2 * Math.PI / 6 * (point + 0.5);
            x = centerX + radius * Math.cos(angle);
            y = centerY + radius * Math.sin(angle);

            if (point === 0)
                ctx.moveTo(x, y);
            else
                ctx.lineTo(x, y);
        }

		if (cell.selected)
            ctx.fillStyle = '#fcc';
		else if (cell.type == null)
			ctx.fillStyle = '#666';
		else
			ctx.fillStyle = cell.type.color;
		
        ctx.fill();
    },
	updateSize: function() {
		this.canvas.setAttribute('width', this.root.offsetWidth - this.scrollbarWidth);
		this.canvas.setAttribute('height', this.root.offsetHeight - this.scrollbarHeight);
		
		this.scrollPane.style.width = this.root.offsetWidth + 'px';
		this.scrollPane.style.height = this.root.offsetHeight + 'px';
		
		var overallWidth = (this.data.maxX - this.data.minX) * this.cellRadius;
		var overallHeight = (this.data.maxY - this.data.minY) * this.cellRadius;
		
		this.scrollSize.style.width = overallWidth + 'px';
		this.scrollSize.style.height = overallHeight + 'px';
		
		this.draw();
	},
	clicked: function(e) {
		var cellIndex = this._getCellIndexAtPoint(e.clientX, e.clientY);
		if (cellIndex >= 0 && cellIndex < this.data.cells.length) {
			var cell = this.data.cells[cellIndex];
			if (cell != null) {
				this._cellClicked(cell);
				return;
			}
		}
	},
	_cellClicked: function(cell) {
		if (this.terrainBrush == null) {
			if (cell.selected === true)
				cell.selected = undefined;
			else
				cell.selected = true;
		}
		else
			cell.type = this.terrainBrush;
		
        this.draw();
    },
    _getCellIndexAtPoint: function(screenX, screenY) {
        var mapX = screenX - this.canvas.offsetLeft + this.scrollPane.scrollLeft + this.data.minX * this.cellRadius;
        var mapY = screenY - this.canvas.offsetTop + this.scrollPane.scrollTop + this.data.minY * this.cellRadius;
        var fCol = (mapX * Math.sqrt(3) - mapY) / 3 / this.cellRadius;
        var fRow = mapY * 2 / 3 / this.cellRadius;
        var fThirdCoord = - fCol - fRow;

        var rCol = Math.round(fCol);
        var rRow = Math.round(fRow);
        var rThird = Math.round(fThirdCoord);

        var colDiff = Math.abs(rCol - fCol);
        var rowDiff = Math.abs(rRow - fRow);
        var thirdDiff = Math.abs(rThird - fThirdCoord);

        if (colDiff >= rowDiff) {
            if (colDiff >= thirdDiff)
                rCol = - rRow - rThird;
        }
        else if (rowDiff >= colDiff && rowDiff >= thirdDiff)
            rRow = - rCol - rThird;

        return rCol + rRow * this.data.width;
    },
	_getScrollbarSize: function() {
        var outer = document.createElement("div");
        outer.style.visibility = "hidden";
        outer.style.width = "100px";
        outer.style.height = "100px";
        outer.style.msOverflowStyle = "scrollbar"; // needed for WinJS apps

        document.body.appendChild(outer);

        var widthNoScroll = outer.offsetWidth;
        var heightNoScroll = outer.offsetHeight;

        // force scrollbars
        outer.style.overflow = "scroll";

        // add innerdiv
        var inner = document.createElement("div");
        inner.style.width = "100%";
        inner.style.height = "100%";
        outer.appendChild(inner);

        var widthWithScroll = inner.offsetWidth;
        var heightWithScroll = inner.offsetHeight;

        // remove divs
        outer.parentNode.removeChild(outer);

        return {
            width: widthNoScroll - widthWithScroll,
            height: heightNoScroll - heightWithScroll
        }
    },
	extractData: function() {
		var json = data.saveToJSON();
		window.open('data:text/json,' + encodeURIComponent(json));
	},
	drawCellTypes: function(element) {
		var output = '';
		
		for (var i=0; i<this.data.cellTypes.length; i++) {
			var type = this.data.cellTypes[i];
			output += '<div class="brush" style="background-color: ' + type.color + '" data-number="' + i + '">' + type.name + '</div>';
		}
		
		element.innerHTML = output;
		element.onclick = function(e) {
			var brush = element.querySelector('.selected');
			if (brush != null)
				brush.classList.remove('selected');
			
			brush = e.target;
			brush.classList.add('selected');
			var number = brush.getAttribute('data-number');
			this.terrainBrush = this.data.cellTypes[number];
		}.bind(this);
	}
};