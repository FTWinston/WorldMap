"use strict";

function MapView(root, data) {
	this.data = data;
	this.root = root;
	this.cellClicked = null;
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
		
		this.scrollPane.onscroll = this.draw.bind(this);
		this.scrollPane.addEventListener('wheel', this.mouseScroll.bind(this));
		this.scrollPane.ontouchstart = this.touchStart.bind(this);
		this.scrollPane.ontouchend = this.touchEnd.bind(this);
		this.scrollPane.ontouchmove = this.touchMove.bind(this);
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
	mouseScroll: function(e) {
		if (!e.ctrlKey)
			return;
		e.preventDefault();
		
		if (e.deltaY < 0)
			this.zoomIn(1);
		else if (e.deltaY > 0)
			this.zoomOut(1);
	},
	touchStart: function(e) {
		if (e.touches.length != 2) {
			this.touchZoomDist = undefined;
			return;
		}
		
		var t1 = e.touches.item(0), t2 = e.touches.item(1);
		this.touchZoomDist = (t1.screenX-t2.screenX)*(t1.screenX-t2.screenX) + (t1.screenY-t2.screenY)*(t1.screenY-t2.screenY);
	},
	touchEnd: function(e) {
		this.touchZoomDist = undefined;
	},
	touchMove: function(e) {
		if (e.touches.length != 2 || this.touchZoomDist === undefined)
			return;
		e.preventDefault();
		
		var t1 = e.touches.item(0), t2 = e.touches.item(1);
		var distSq = (t1.screenX-t2.screenX)*(t1.screenX-t2.screenX) + (t1.screenY-t2.screenY)*(t1.screenY-t2.screenY);
		
		var diff = (distSq - this.touchZoomDist) * 0.0000002;
		if (diff > 0)
			this.zoomIn(diff);
		else if (diff < 0)
			this.zoomOut(-diff);
		
		this.touchZoomDist = distSq;
	},
	zoomIn: function(scale) {
		this.cellRadius = Math.min(200, Math.ceil(this.cellRadius * (1 + 0.1 * scale)));
		this.updateSize();
	},
	zoomOut: function(scale) {
		this.cellRadius = Math.max(5, Math.floor(this.cellRadius * (1 - 0.1 * scale)));
		this.updateSize();
	},
	clicked: function(e) {
		var cellIndex = this._getCellIndexAtPoint(e.clientX, e.clientY);
		if (cellIndex >= 0 && cellIndex < this.data.cells.length) {
			var cell = this.data.cells[cellIndex];
			if (cell != null) {
				if (this.cellClicked == null || !this.cellClicked(cell)) {
					if (cell.selected === true)
						cell.selected = undefined;
					else
						cell.selected = true;
				}
				this.draw();
				return;
			}
		}
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
	}
};