var MapEditor = (function () {
    function MapEditor(view) {
        this.view = view;
        this.initialize();
    }
    MapEditor.prototype.initialize = function () {
        this.view.cellClicked = this.cellClicked.bind(this);
        this.terrainBrush = null;
        document.getElementById('addBrushLink').addEventListener('click', this.addBrushClicked.bind(this));
        this.brushList = document.getElementById('brushList');
        document.querySelector('#brushEdit .dialog-buttons .ok').addEventListener('click', this.brushEditConfirmed.bind(this));
        this.drawCellTypes();
        var resizeWizard = new Wizard(document.getElementById('resize-wizard'), this.performResize.bind(this));
        document.getElementById('resizeLink').addEventListener('click', this.resizeClicked.bind(this, resizeWizard));
    };
    MapEditor.prototype.resizeClicked = function (wizard) {
        wizard.show();
        return false;
    };
    MapEditor.prototype.addBrushClicked = function () {
        this.terrainBrush = null;
        var brush = this.brushList.querySelector('.selected');
        if (brush != null)
            brush.classList.remove('selected');
        document.getElementById('brushName').value = '';
        document.getElementById('brushColor').value = '';
        document.getElementById('brushEdit').style.display = '';
        return false;
    };
    MapEditor.prototype.brushEditConfirmed = function () {
        var name = document.getElementById('brushName').value;
        var color = document.getElementById('brushColor').value;
        if (this.terrainBrush == null) {
            var type = new CellType(name, color);
            this.view.data.cellTypes.push(type);
        }
        else {
            this.terrainBrush.name = name;
            this.terrainBrush.color = color;
        }
        this.terrainBrush = null;
        this.drawCellTypes();
        return false;
    };
    MapEditor.prototype.performResize = function (resize) {
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
    };
    MapEditor.prototype.cellClicked = function (cell) {
        if (this.terrainBrush == null)
            return false;
        cell.cellType = this.terrainBrush;
        return true;
    };
    MapEditor.prototype.drawCellTypes = function () {
        var output = '';
        for (var i = 0; i < this.view.data.cellTypes.length; i++) {
            var type = this.view.data.cellTypes[i];
            output += '<div class="brush" style="background-color: ' + type.color + '" data-number="' + i + '">' + type.name + '</div>';
        }
        this.brushList.innerHTML = output;
        this.brushList.onclick = this.brushListClicked.bind(this);
        this.brushList.ondblclick = this.brushListDoubleClicked.bind(this);
    };
    MapEditor.prototype.brushListClicked = function (e) {
        var brush = e.target;
        var number = brush.getAttribute('data-number');
        if (number == null)
            return false;
        brush = this.brushList.querySelector('.selected');
        if (brush != null)
            brush.classList.remove('selected');
        brush = e.target;
        brush.classList.add('selected');
        this.terrainBrush = this.view.data.cellTypes[number];
    };
    MapEditor.prototype.brushListDoubleClicked = function (e) {
        if (this.brushList.onclick(e) === false)
            return;
        document.getElementById('brushName').value = this.terrainBrush.name;
        document.getElementById('brushColor').value = this.terrainBrush.color;
        document.getElementById('brushEdit').style.display = '';
    };
    return MapEditor;
}());
var CellType = (function () {
    function CellType(name, color) {
        this.name = name;
        this.color = color;
    }
    return CellType;
}());
var MapCell = (function () {
    function MapCell(map, cellType) {
        this.map = map;
        this.cellType = cellType;
        this.selected = false;
    }
    return MapCell;
}());
/*
class CellGroup {
    cells: MapCell[];
    constructor(readonly map: MapData, readonly size: number, readonly startRow: number, readonly startCol: number) {
        this.determineCells();
    }
    determineCells() {
        this.cells = [];

        let halfHeight = Math.ceil(this.size / 2);
        let even = this.size % 2 == 0

        this.addHalfCells(false, even, halfHeight);
        this.addHalfCells(true, even, halfHeight);

        // when map size changes, groups will need recalculated if:
        // startX or startY < 0
        // startX + this.size  >= old map width
        // startY + this.size  >= old map height

        // when recalculating, dump links to all previous cells, and obtain them afresh.
        // if there are no cells for a group, it should be removed.
    }
    private addHalfCells(downward: boolean, evenSize: boolean, halfHeight: number) {
        for (let i = 0; i < halfHeight; i++) {
            let row;
            let rowStart = this.startCol;
            let rowSize = this.size - i;

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

            for (let j = 0; j < rowSize; j++) {
                let col = rowStart + j;
                if (col < 0 || col >= this.map.width)
                    continue;

                let cell = this.map.cells[row * this.map.width + col];
                if (cell != null)
                    this.cells.push(cell);
            }
        }
    }
}
*/
var MapData = (function () {
    function MapData(width, height, createCells) {
        if (createCells === void 0) { createCells = true; }
        this.width = width + Math.floor(height / 2) - 1;
        this.height = height;
        this.cells = new Array(this.width * this.height);
        this.cellTypes = [];
        if (createCells !== false) {
            for (var i = 0; i < this.cells.length; i++)
                if (this.shouldIndexHaveCell(i))
                    this.cells[i] = new MapCell(this, null);
            this.cellTypes.push(new CellType('red', '#ff0000'));
            this.cellTypes.push(new CellType('green', '#00cc00'));
            this.cellTypes.push(new CellType('blue', '#0099ff'));
            this.positionCells();
        }
    }
    MapData.prototype.positionCells = function () {
        var packedWidthRatio = 1.7320508075688772, packedHeightRatio = 1.5;
        var minX = Number.MAX_VALUE, minY = Number.MAX_VALUE;
        var maxX = Number.MIN_VALUE, maxY = Number.MIN_VALUE;
        for (var i = 0; i < this.cells.length; i++) {
            var cell = this.cells[i];
            if (cell == null)
                continue;
            cell.row = Math.floor(i / this.width);
            cell.col = i % this.width;
            cell.xPos = packedWidthRatio * (cell.col + cell.row / 2);
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
        this.minX = minX - 1;
        this.minY = minY - 1;
        this.maxX = maxX + 1;
        this.maxY = maxY + 1;
        for (var _i = 0, _a = this.cells; _i < _a.length; _i++) {
            var cell = _a[_i];
            if (cell == null)
                continue;
            cell.xPos -= minX;
            cell.yPos -= minY;
        }
    };
    MapData.prototype.shouldIndexHaveCell = function (index) {
        var row = Math.floor(index / this.width);
        var col = index % this.width;
        if (2 * col + row < this.height - 2)
            return false; // chop left to get square edge
        if (row + 2 * col > 2 * this.width - 1)
            return false; // chop right to get square edge
        return true;
    };
    MapData.prototype.changeWidth = function (delta, leftEdgeFixed) {
        this.performWidthChange(delta, leftEdgeFixed, false);
        this.positionCells();
    };
    MapData.prototype.changeHeight = function (delta, topEdgeFixed) {
        var increment = delta > 0 ? 1 : -1;
        var increasing = delta > 0 ? 1 : 0;
        for (var i = 0; i != delta; i += increment) {
            if ((this.height + increasing) % 2 == 0)
                this.performWidthChange(increment, !topEdgeFixed, true);
            this.performHeightChange(increment, topEdgeFixed);
        }
        this.positionCells();
    };
    MapData.prototype.performWidthChange = function (delta, leftEdgeFixed, forHeightChange) {
        var overallDelta = 0;
        if (delta > 0) {
            for (var row = 0; row < this.height; row++) {
                var rowInsertIndex = void 0; // this is complicated on account of the "chopping" we did to get square edges
                if (leftEdgeFixed)
                    rowInsertIndex = this.width - Math.floor(row / 2);
                else
                    rowInsertIndex = Math.floor((this.height - row - 1) / 2);
                var rowStart = row * this.width;
                var insertPos = rowStart + rowInsertIndex + overallDelta;
                for (var i = 0; i < delta; i++)
                    this.cells.splice(insertPos, 0, forHeightChange ? null : new MapCell(this, null));
                overallDelta += delta;
            }
        }
        else if (delta < 0) {
            for (var row = 0; row < this.height; row++) {
                var rowChopPos = void 0;
                if (forHeightChange) {
                    if (leftEdgeFixed)
                        rowChopPos = this.width + delta;
                    else
                        rowChopPos = 0;
                }
                else if (leftEdgeFixed)
                    rowChopPos = this.width - Math.floor(row / 2) + delta;
                else
                    rowChopPos = Math.floor((this.height - row - 1) / 2);
                var rowStart = row * this.width;
                var chopPos = rowStart + rowChopPos + overallDelta;
                this.cells.splice(chopPos, -delta);
                overallDelta += delta;
            }
        }
        this.width += delta;
    };
    MapData.prototype.performHeightChange = function (delta, topEdgeFixed) {
        if (delta > 0) {
            var diff = delta * this.width;
            for (var i = 0; i < diff; i++) {
                if (this.cells.length + 1 > this.width * this.height)
                    this.height++;
                var globalIndex = topEdgeFixed ? this.cells.length : diff - i - 1;
                this.cells.splice(topEdgeFixed ? this.cells.length : 0, 0, this.shouldIndexHaveCell(globalIndex) ? new MapCell(this, null) : null);
            }
        }
        else if (delta < 0) {
            var diff = -delta * this.width;
            this.height += delta;
            this.cells.splice(topEdgeFixed ? this.cells.length - diff : 0, diff);
        }
    };
    MapData.prototype.saveToJSON = function () {
        this.setCellTypeIndexes();
        var json = JSON.stringify(this, function (key, value) {
            if (key == 'row' || key == 'col' || key == 'xPos' || key == 'yPos'
                || key == 'minX' || key == 'maxX' || key == 'minY' || key == 'maxY'
                || key == 'map' || key == 'cellType' || key == 'selected')
                return undefined;
            return value;
        }, '	');
        return json;
    };
    MapData.prototype.setCellTypeIndexes = function () {
        for (var _i = 0, _a = this.cells; _i < _a.length; _i++) {
            var cell = _a[_i];
            cell.typeID = this.cellTypes.indexOf(cell.cellType);
        }
    };
    MapData.prototype.setCellTypesFromIndexes = function () {
        for (var _i = 0, _a = this.cells; _i < _a.length; _i++) {
            var cell = _a[_i];
            cell.cellType = this.cellTypes[cell.typeID];
        }
    };
    /*
    createCellGroups(size: number) {
        let groups = [];

        let halfSizeUp = Math.ceil(size / 2);
        let halfSizeDown = Math.floor(size / 2);
        this.createCellGroupSet(size, -size + 1, -halfSizeUp - 1, this.cellTypes[0]);
        this.createCellGroupSet(size, -halfSizeDown, -halfSizeUp * 3, this.cellTypes[1]);
        this.createCellGroupSet(size, 1, -size - 2, this.cellTypes[2]);

        return groups;
    }
    private createCellGroupSet(size: number, startRow: number, startCol: number, cellType: CellType) {
        let rowSpacing = size + Math.ceil(size / 2);
        let colSpacing = size + Math.floor(size / 2);
        let colOffset = 0;

        for (let row = startRow; row < this.height; row += rowSpacing) {
            let rowOffset = 0;
            for (let col = startCol + colOffset; col < this.width; col += colSpacing) {
                let group = new CellGroup(this, size, row + rowOffset, col);

                if (cellType !== undefined)
                    for (let cell of group.cells)
                        cell.cellType = cellType;

                rowOffset++;
            }

            colOffset -= 1;
        }
    }
    */
    MapData.loadFromJSON = function (json) {
        var map = new MapData(json.width, json.height, false);
        map.cells = json.cells.map(function (cell) {
            if (cell == null)
                return null;
            return new MapCell(map, cell.type);
        });
        map.positionCells();
        map.cellTypes = json.cellTypes.map(function (type) {
            return new CellType(type.name, type.color);
        });
        map.setCellTypesFromIndexes();
        return map;
    };
    return MapData;
}());
var MapView = (function () {
    function MapView(root, data) {
        this.root = root;
        this.data = data;
        this.backgroundColor = '#ccc';
        this.cellClicked = null;
        this.initialize();
    }
    MapView.prototype.initialize = function () {
        this.root.classList.add('mapRoot');
        this.canvas = document.createElement('canvas');
        this.root.appendChild(this.canvas);
        this.scrollPane = document.createElement('div');
        this.scrollPane.classList.add('scrollPane');
        this.root.appendChild(this.scrollPane);
        this.scrollSize = document.createElement('div');
        this.scrollSize.classList.add('scrollSize');
        this.scrollPane.appendChild(this.scrollSize);
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
        this.scrollPane.onmousemove = this.mouseMove.bind(this);
        this.scrollPane.onmouseenter = this.mouseMove.bind(this);
        this.scrollSize.onclick = this.clicked.bind(this);
        window.onresize = this.updateSize.bind(this);
        var scrollSize = this.getScrollbarSize();
        this.scrollbarWidth = scrollSize.width;
        this.scrollbarHeight = scrollSize.height;
        this.updateSize();
    };
    MapView.prototype.draw = function () {
        var ctx = this.canvas.getContext('2d');
        ctx.fillStyle = this.backgroundColor;
        ctx.fillRect(0, 0, this.root.offsetWidth, this.root.offsetHeight);
        ctx.translate(-this.scrollPane.scrollLeft, -this.scrollPane.scrollTop);
        var twoLevels = this.cellRadius < 40;
        this.drawCells(ctx, this.cellDrawInterval, !twoLevels, true, !twoLevels, !twoLevels);
        if (twoLevels) {
            // outline of next zoom level
            this.drawCells(ctx, this.cellDrawInterval * 2, true, false, true, true);
        }
        ctx.translate(this.scrollPane.scrollLeft, this.scrollPane.scrollTop);
    };
    MapView.prototype.drawCells = function (ctx, cellDrawInterval, outline, fillContent, showSelection, writeCoords) {
        var drawCellRadius = this.cellRadius * cellDrawInterval;
        if (fillContent)
            if (outline)
                drawCellRadius -= 0.4; // ensure there's always a 1px border left between cells
            else
                ; //drawCellRadius += 0.4; // overlap cells slightly so there's no gap
        var minDrawX = this.scrollPane.scrollLeft - drawCellRadius;
        var minDrawY = this.scrollPane.scrollTop - drawCellRadius;
        var maxDrawX = this.scrollPane.scrollLeft + this.root.offsetWidth + drawCellRadius;
        var maxDrawY = this.scrollPane.scrollTop + this.root.offsetHeight + drawCellRadius;
        var map = this.data;
        var halfInterval = Math.ceil(cellDrawInterval / 2);
        var xOffset = cellDrawInterval <= 2 ? 0 : Math.floor(cellDrawInterval / 2) - 1;
        for (var _i = 0, _a = map.cells; _i < _a.length; _i++) {
            var cell = _a[_i];
            if (cell == null)
                continue;
            if (this.getCellDisplayY(cell) % cellDrawInterval != 0)
                continue;
            var alternateRowOffset = this.getCellDisplayY(cell) % (2 * cellDrawInterval) == 0 ? halfInterval : 0;
            if ((this.getCellDisplayX(cell) + alternateRowOffset + xOffset) % cellDrawInterval != 0)
                continue;
            var centerX = cell.xPos * this.cellRadius + this.cellRadius;
            if (centerX < minDrawX || centerX > maxDrawX)
                continue;
            var centerY = cell.yPos * this.cellRadius + this.cellRadius;
            if (centerY < minDrawY || centerY > maxDrawY)
                continue;
            this.drawCell(ctx, cell, centerX, centerY, drawCellRadius, outline, fillContent, showSelection, writeCoords);
        }
    };
    MapView.prototype.drawCell = function (ctx, cell, centerX, centerY, radius, outline, fillContent, showSelection, writeCoords) {
        ctx.beginPath();
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
        if (outline) {
            ctx.strokeStyle = this.backgroundColor;
            ctx.stroke();
        }
        if (fillContent || (cell.selected && showSelection)) {
            if (cell.selected)
                ctx.fillStyle = '#fcc';
            else if (cell.cellType == null)
                ctx.fillStyle = '#666';
            else
                ctx.fillStyle = cell.cellType.color;
            ctx.fill();
        }
        if (writeCoords) {
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(this.getCellDisplayX(cell) + ', ' + this.getCellDisplayY(cell), centerX, centerY);
        }
    };
    MapView.prototype.getCellDisplayX = function (cell) {
        return cell.col + 2 + Math.floor((cell.row - this.data.height) / 2);
    };
    MapView.prototype.getCellDisplayY = function (cell) {
        return cell.row + 1;
    };
    Object.defineProperty(MapView.prototype, "cellRadius", {
        get: function () { return this._cellRadius; },
        set: function (radius) {
            this._cellRadius = radius;
            var displayRadius = radius;
            var cellDrawInterval = 1;
            var minRadius = 20;
            while (displayRadius < minRadius) {
                displayRadius *= 2;
                cellDrawInterval *= 2;
            }
            this.cellDrawInterval = cellDrawInterval;
        },
        enumerable: true,
        configurable: true
    });
    MapView.prototype.updateSize = function () {
        var viewWidth = this.root.offsetWidth - this.scrollbarWidth;
        var viewHeight = this.root.offsetHeight - this.scrollbarHeight;
        var screenFocusX = this.mouseX !== null ? this.mouseX : viewWidth / 2;
        var screenFocusY = this.mouseY !== null ? this.mouseY : viewHeight / 2;
        var scrollBounds = this.scrollSize.getBoundingClientRect();
        var scrollFractionX = scrollBounds.width == 0 ? 0 : (this.scrollPane.scrollLeft + screenFocusX) / scrollBounds.width;
        var scrollFractionY = scrollBounds.height == 0 ? 0 : (this.scrollPane.scrollTop + screenFocusY) / scrollBounds.height;
        this.canvas.setAttribute('width', viewWidth.toString());
        this.canvas.setAttribute('height', viewHeight.toString());
        this.scrollPane.style.width = this.root.offsetWidth + 'px';
        this.scrollPane.style.height = this.root.offsetHeight + 'px';
        var overallWidth = (this.data.maxX - this.data.minX) * this._cellRadius;
        var overallHeight = (this.data.maxY - this.data.minY) * this._cellRadius;
        this.scrollSize.style.width = overallWidth + 'px';
        this.scrollSize.style.height = overallHeight + 'px';
        this.scrollPane.scrollLeft = scrollFractionX * overallWidth - screenFocusX;
        this.scrollPane.scrollTop = scrollFractionY * overallHeight - screenFocusY;
        this.draw();
    };
    MapView.prototype.mouseScroll = function (e) {
        if (!e.ctrlKey)
            return;
        e.preventDefault();
        if (e.deltaY < 0)
            this.zoomIn(0.1);
        else if (e.deltaY > 0)
            this.zoomOut(0.1);
    };
    MapView.prototype.touchStart = function (e) {
        if (e.touches.length != 2) {
            this.touchZoomDist = undefined;
            return;
        }
        var t1 = e.touches.item(0), t2 = e.touches.item(1);
        this.touchZoomDist = (t1.screenX - t2.screenX) * (t1.screenX - t2.screenX) + (t1.screenY - t2.screenY) * (t1.screenY - t2.screenY);
    };
    MapView.prototype.touchEnd = function (e) {
        this.touchZoomDist = undefined;
    };
    MapView.prototype.touchMove = function (e) {
        if (e.touches.length != 2 || this.touchZoomDist === undefined)
            return;
        e.preventDefault();
        var t1 = e.touches.item(0), t2 = e.touches.item(1);
        var distSq = (t1.screenX - t2.screenX) * (t1.screenX - t2.screenX) + (t1.screenY - t2.screenY) * (t1.screenY - t2.screenY);
        var diff = (distSq - this.touchZoomDist) * 0.0000002;
        if (diff > 0)
            this.zoomIn(diff);
        else if (diff < 0)
            this.zoomOut(-diff);
        this.touchZoomDist = distSq;
    };
    MapView.prototype.zoomIn = function (stepScale) {
        this.cellRadius = Math.min(200, Math.ceil(this.cellRadius * (1 + stepScale)));
        this.updateSize();
    };
    MapView.prototype.zoomOut = function (stepScale) {
        this.cellRadius = Math.max(0.1, Math.floor(this.cellRadius * (1 - stepScale)));
        this.updateSize();
    };
    MapView.prototype.mouseMove = function (e) {
        this.mouseX = e.clientX;
        this.mouseY = e.clientY;
    };
    MapView.prototype.clicked = function (e) {
        var cellIndex = this.getCellIndexAtPoint(e.clientX, e.clientY);
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
    };
    MapView.prototype.getCellIndexAtPoint = function (screenX, screenY) {
        var mapX = screenX - this.canvas.offsetLeft + this.scrollPane.scrollLeft + this.data.minX * this._cellRadius;
        var mapY = screenY - this.canvas.offsetTop + this.scrollPane.scrollTop + this.data.minY * this._cellRadius;
        var fCol = (mapX * Math.sqrt(3) - mapY) / 3 / this._cellRadius;
        var fRow = mapY * 2 / 3 / this._cellRadius;
        var fThirdCoord = -fCol - fRow;
        var rCol = Math.round(fCol);
        var rRow = Math.round(fRow);
        var rThird = Math.round(fThirdCoord);
        var colDiff = Math.abs(rCol - fCol);
        var rowDiff = Math.abs(rRow - fRow);
        var thirdDiff = Math.abs(rThird - fThirdCoord);
        if (colDiff >= rowDiff) {
            if (colDiff >= thirdDiff)
                rCol = -rRow - rThird;
        }
        else if (rowDiff >= colDiff && rowDiff >= thirdDiff)
            rRow = -rCol - rThird;
        // TODO: account for cellCombinationScale to get the VISIBLE cell closest to this
        return rCol + rRow * this.data.width;
    };
    MapView.prototype.getScrollbarSize = function () {
        var outer = document.createElement('div');
        outer.style.visibility = 'hidden';
        outer.style.width = '100px';
        outer.style.height = '100px';
        outer.style.msOverflowStyle = 'scrollbar'; // needed for WinJS apps
        document.body.appendChild(outer);
        var widthNoScroll = outer.offsetWidth;
        var heightNoScroll = outer.offsetHeight;
        // force scrollbars
        outer.style.overflow = 'scroll';
        // add innerdiv
        var inner = document.createElement('div');
        inner.style.width = '100%';
        inner.style.height = '100%';
        outer.appendChild(inner);
        var widthWithScroll = inner.offsetWidth;
        var heightWithScroll = inner.offsetHeight;
        // remove divs
        outer.parentNode.removeChild(outer);
        return {
            width: widthNoScroll - widthWithScroll,
            height: heightNoScroll - heightWithScroll
        };
    };
    MapView.prototype.extractData = function () {
        var json = this.data.saveToJSON();
        window.open('data:text/json,' + encodeURIComponent(json));
    };
    return MapView;
}());
var Wizard = (function () {
    function Wizard(root, callback) {
        this.root = root;
        this.callback = callback;
        this.initialize();
    }
    Wizard.prototype.initialize = function () {
        var btn = this.root.querySelector('.dialog-buttons input.ok');
        btn.style.display = 'none';
        btn.addEventListener('click', this.confirmed.bind(this));
        this.output = {};
        this.steps = this.root.querySelectorAll('.step');
        for (var i = 0; i < this.steps.length; i++) {
            var step = this.steps[i];
            var items = step.querySelectorAll('li');
            for (var j = 0; j < items.length; j++) {
                var item = items[j];
                item.addEventListener('click', this.stepItemPicked.bind(this, step, item));
            }
            items = step.querySelectorAll('input[type="text"]');
            for (var j = 0; j < items.length; j++) {
                var item = items[j];
                item.addEventListener('keyup', this.stepItemPicked.bind(this, step, item));
            }
        }
    };
    Wizard.prototype.show = function () {
        this.showStep(this.steps[0]);
        this.showDialog();
    };
    Wizard.prototype.showDialog = function () {
        this.root.style.display = '';
    };
    Wizard.prototype.showStep = function (step) {
        var display = step.querySelectorAll('.display');
        for (var i = 0; i < display.length; i++) {
            var prop = display[i].getAttribute('data-property');
            display[i].innerText = this.output[prop];
        }
        var items = step.querySelectorAll('li');
        for (var i = 0; i < items.length; i++) {
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
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            item.classList.remove('selected');
            item.value = '';
        }
        step.classList.remove('done');
        step.style.display = '';
        // also hide all later steps, in case this was re-picked
        var passed = false;
        for (var i = 0; i < this.steps.length; i++)
            if (passed)
                this.steps[i].style.display = 'none';
            else if (this.steps[i] == step)
                passed = true;
        var okButton = this.root.querySelector('.dialog-buttons input.ok');
        okButton.style.display = 'none';
    };
    Wizard.prototype.stepItemPicked = function (step, item, e) {
        var value = item.getAttribute('data-value');
        if (value == null && item.value !== undefined)
            value = item.value;
        var items = step.querySelectorAll('li');
        for (var i = 0; i < items.length; i++)
            items[i].classList.remove('selected');
        items = step.querySelectorAll('input[type="text"]');
        for (var i = 0; i < items.length; i++)
            items[i].classList.remove('selected');
        this.output[item.getAttribute('data-property')] = value;
        item.classList.add('selected');
        step.classList.add('done');
        var isFinal = step.classList.contains('final');
        if (!isFinal) {
            // show the next step
            var stepNum = 0;
            for (var i = 0; i < this.steps.length; i++) {
                if (this.steps[i] == step)
                    break;
                stepNum++;
            }
            if (stepNum == this.steps.length - 1)
                isFinal = true;
            else
                this.showStep(this.steps[stepNum + 1]);
        }
        if (isFinal) {
            var okButton = this.root.querySelector('.dialog-buttons input.ok');
            okButton.style.display = '';
        }
    };
    Wizard.prototype.confirmed = function () {
        this.callback(this.output);
    };
    return Wizard;
}());
var dialogs = document.querySelectorAll('.dialog');
for (var i = 0; i < dialogs.length; i++) {
    var dialog = dialogs[i];
    var btns = document.createElement('div');
    btns.classList.add('dialog-buttons');
    btns.innerHTML = '<input type="button" class="cancel" value="Cancel" /> <input type="button" class="ok" value="OK" />';
    dialog.appendChild(btns);
    var hide = function () {
        this.style.display = 'none';
    }.bind(dialog);
    dialog.querySelector('.dialog-buttons input.cancel').addEventListener('click', hide);
    dialog.querySelector('.dialog-buttons input.ok').addEventListener('click', hide);
}
var numeric = document.querySelectorAll('input.number[type="text"]');
for (var i = 0; i < numeric.length; i++) {
    numeric[i].addEventListener('keypress', function (e) {
        if ((e.keyCode >= 48 && e.keyCode <= 57) || e.keyCode < 31)
            return;
        e.preventDefault();
    });
}
function getParameterByName(name, url) {
    if (url === void 0) { url = null; }
    if (!url)
        url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"), results = regex.exec(url);
    if (!results)
        return null;
    if (!results[2])
        return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}
function get(url, callback, contentType) {
    if (contentType === void 0) { contentType = null; }
    var req = new XMLHttpRequest();
    req.open('GET', url);
    if (contentType !== null)
        req.setRequestHeader('Content-Type', contentType);
    req.onload = function () {
        if (req.status == 200)
            callback(req.response);
        else
            console.error(Error(req.statusText));
    };
    req.onerror = function () {
        console.error(Error('Network error'));
    };
    req.send();
}
function loadData(url) {
    url = url.replace('gist.github.com', 'gist.githubusercontent.com');
    if (url.indexOf('gist.githubusercontent.com') != -1) {
        if (url.charAt(url.length - 1) != '/')
            url += '/';
        var suffix = 'raw/';
        if (url.substr(-suffix.length) !== suffix)
            url += 'raw';
    }
    if (url.indexOf('://') == -1) {
        url = 'http://' + url;
    }
    get(url, function (data) {
        editor.view.data = MapData.loadFromJSON(data);
        editor.view.updateSize();
        editor.drawCellTypes();
    });
}
var view = new MapView(document.getElementById('mapRoot'), new MapData(500, 500));
var editor = new MapEditor(view);
var queryUrl = getParameterByName('source');
if (queryUrl != null)
    loadData(queryUrl);
document.getElementById('modeSwitch').addEventListener('click', function () {
    document.getElementById('editorRoot').classList.toggle('edit');
    editor.view.updateSize();
    return false;
});
/*
document.getElementById('loadUrl').addEventListener('click', function() {
    let url = document.getElementById('dataUrl').value;
    loadData(url);
    return false;
});
*/ 
//# sourceMappingURL=maps.js.map