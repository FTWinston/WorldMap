var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var ResizeAnchorInput = (function (_super) {
    __extends(ResizeAnchorInput, _super);
    function ResizeAnchorInput(props) {
        var _this = _super.call(this, props) || this;
        _this.arrows = [
            ['&#8598;', '&#8593;', '&#8599;'],
            ['&#8592;', '', '&#8594;'],
            ['&#8601;', '&#8595;', '&#8600;'],
        ];
        _this.state = {
            mode: 0 /* TopLeft */,
        };
        return _this;
    }
    ResizeAnchorInput.prototype.render = function () {
        var widthChange = this.props.newWidth - this.props.oldWidth;
        var heightChange = this.props.newHeight - this.props.oldHeight;
        var tlIcon = this.decideIcon(0 /* TopLeft */, widthChange, heightChange);
        var tmIcon = this.decideIcon(1 /* TopMiddle */, widthChange, heightChange);
        var trIcon = this.decideIcon(2 /* TopRight */, widthChange, heightChange);
        var clIcon = this.decideIcon(3 /* CenterLeft */, widthChange, heightChange);
        var cmIcon = this.decideIcon(4 /* Center */, widthChange, heightChange);
        var crIcon = this.decideIcon(5 /* CenterRight */, widthChange, heightChange);
        var blIcon = this.decideIcon(6 /* BottomLeft */, widthChange, heightChange);
        var bmIcon = this.decideIcon(7 /* BottomMiddle */, widthChange, heightChange);
        var brIcon = this.decideIcon(8 /* BottomRight */, widthChange, heightChange);
        return React.createElement("div", { className: "resizeAnchor" },
            React.createElement("div", null,
                React.createElement("button", { type: "button", onClick: this.setMode.bind(this, 0 /* TopLeft */), dangerouslySetInnerHTML: tlIcon }),
                React.createElement("button", { type: "button", onClick: this.setMode.bind(this, 1 /* TopMiddle */), dangerouslySetInnerHTML: tmIcon }),
                React.createElement("button", { type: "button", onClick: this.setMode.bind(this, 2 /* TopRight */), dangerouslySetInnerHTML: trIcon })),
            React.createElement("div", null,
                React.createElement("button", { type: "button", onClick: this.setMode.bind(this, 3 /* CenterLeft */), dangerouslySetInnerHTML: clIcon }),
                React.createElement("button", { type: "button", onClick: this.setMode.bind(this, 4 /* Center */), dangerouslySetInnerHTML: cmIcon }),
                React.createElement("button", { type: "button", onClick: this.setMode.bind(this, 5 /* CenterRight */), dangerouslySetInnerHTML: crIcon })),
            React.createElement("div", null,
                React.createElement("button", { type: "button", onClick: this.setMode.bind(this, 6 /* BottomLeft */), dangerouslySetInnerHTML: blIcon }),
                React.createElement("button", { type: "button", onClick: this.setMode.bind(this, 7 /* BottomMiddle */), dangerouslySetInnerHTML: bmIcon }),
                React.createElement("button", { type: "button", onClick: this.setMode.bind(this, 8 /* BottomRight */), dangerouslySetInnerHTML: brIcon })));
    };
    ResizeAnchorInput.prototype.setMode = function (mode) {
        this.props.setMode(mode);
    };
    ResizeAnchorInput.prototype.decideIcon = function (button, widthChange, heightChange) {
        if (this.props.mode == button)
            return { __html: '&#9974;' }; // picture icon
        if (widthChange == 0 && heightChange == 0)
            return undefined;
        var buttonCoords = this.getCoords(button);
        var stateCoords = this.getCoords(this.props.mode);
        var dx = buttonCoords.x - stateCoords.x;
        var dy = buttonCoords.y - stateCoords.y;
        // only draw arrow if adjacent to selected icon
        if (Math.abs(dx) > 1 || Math.abs(dy) > 1)
            return undefined;
        if (widthChange == 0)
            dx = 0;
        if (heightChange == 0)
            dy = 0;
        // now dx and dy are both in range -1 .. 1
        var arrowX = widthChange >= 0 ? 1 + dx : 1 - dx;
        var arrowY = heightChange >= 0 ? 1 + dy : 1 - dy;
        return { __html: this.arrows[arrowY][arrowX] };
    };
    ResizeAnchorInput.prototype.getCoords = function (mode) {
        switch (mode) {
            case 0 /* TopLeft */:
                return { x: -1, y: -1 };
            case 1 /* TopMiddle */:
                return { x: 0, y: -1 };
            case 2 /* TopRight */:
                return { x: 1, y: -1 };
            case 3 /* CenterLeft */:
                return { x: -1, y: 0 };
            case 4 /* Center */:
                return { x: 0, y: 0 };
            case 5 /* CenterRight */:
                return { x: 1, y: 0 };
            case 6 /* BottomLeft */:
                return { x: -1, y: 1 };
            case 7 /* BottomMiddle */:
                return { x: 0, y: 1 };
            case 8 /* BottomRight */:
                return { x: 1, y: 1 };
        }
    };
    return ResizeAnchorInput;
}(React.Component));
var SizeEditor = (function (_super) {
    __extends(SizeEditor, _super);
    function SizeEditor(props) {
        var _this = _super.call(this, props) || this;
        _this.state = {
            newWidth: props.map.width,
            newHeight: props.map.height,
            resizeAnchor: 0 /* TopLeft */,
        };
        return _this;
    }
    SizeEditor.prototype.render = function () {
        var sameSize = this.state.newWidth == this.props.map.width && this.state.newHeight == this.props.map.height;
        return React.createElement("form", { onSubmit: this.changeSize.bind(this) },
            React.createElement("div", { role: "group" },
                React.createElement("label", { htmlFor: "txtResizeWidth" }, "Width"),
                React.createElement("input", { type: "number", id: "txtResizeWidth", value: this.state.newWidth.toString(), onChange: this.widthChanged.bind(this) })),
            React.createElement("div", { role: "group" },
                React.createElement("label", { htmlFor: "txtResizeHeight" }, "Height"),
                React.createElement("input", { type: "number", id: "txtResizeHeight", value: this.state.newHeight.toString(), onChange: this.heightChanged.bind(this) })),
            React.createElement("div", { role: "group" },
                React.createElement("label", null, "Anchor"),
                React.createElement(ResizeAnchorInput, { oldWidth: this.props.map.width, newWidth: this.state.newWidth, oldHeight: this.props.map.height, newHeight: this.state.newHeight, mode: this.state.resizeAnchor, setMode: this.setMode.bind(this) })),
            React.createElement("div", { role: "group" },
                React.createElement("button", { type: "submit", disabled: sameSize }, "Change size")));
    };
    SizeEditor.prototype.widthChanged = function (e) {
        this.setState({ newWidth: e.target.value, newHeight: this.state.newHeight, resizeAnchor: this.state.resizeAnchor });
    };
    SizeEditor.prototype.heightChanged = function (e) {
        this.setState({ newWidth: this.state.newWidth, newHeight: e.target.value, resizeAnchor: this.state.resizeAnchor });
    };
    SizeEditor.prototype.setMode = function (mode) {
        this.setState({ newWidth: this.state.newWidth, newHeight: this.state.newHeight, resizeAnchor: mode });
    };
    SizeEditor.prototype.changeSize = function (e) {
        e.preventDefault();
        var deltaWidth = this.state.newWidth - this.props.map.width;
        var deltaHeight = this.state.newWidth - this.props.map.width;
        // TODO: commented out lines need to be done twice, each for half the delta. One half rounded up, the other rounded down, tying to the left & right edges
        switch (this.state.resizeAnchor) {
            case 0 /* TopLeft */:
                this.props.map.changeWidth(deltaWidth, true);
                this.props.map.changeHeight(deltaHeight, true);
                break;
            case 1 /* TopMiddle */:
                //this.props.map.changeWidth(deltaWidth, true);
                this.props.map.changeHeight(deltaHeight, true);
                break;
            case 2 /* TopRight */:
                this.props.map.changeWidth(deltaWidth, false);
                this.props.map.changeHeight(deltaHeight, true);
                break;
            case 3 /* CenterLeft */:
                this.props.map.changeWidth(deltaWidth, true);
                //this.props.map.changeHeight(deltaHeight, true);
                break;
            case 4 /* Center */:
                //this.props.map.changeWidth(deltaWidth, true);
                //this.props.map.changeHeight(deltaHeight, true);
                break;
            case 5 /* CenterRight */:
                this.props.map.changeWidth(deltaWidth, false);
                //this.props.map.changeHeight(deltaHeight, true);
                break;
            case 6 /* BottomLeft */:
                this.props.map.changeWidth(deltaWidth, true);
                this.props.map.changeHeight(deltaHeight, false);
                break;
            case 7 /* BottomMiddle */:
                //this.props.map.changeWidth(deltaWidth, true);
                this.props.map.changeHeight(deltaHeight, false);
                break;
            case 8 /* BottomRight */:
                this.props.map.changeWidth(deltaWidth, false);
                this.props.map.changeHeight(deltaHeight, false);
                break;
        }
        this.props.mapChanged();
    };
    return SizeEditor;
}(React.Component));
var TerrainEditor = (function (_super) {
    __extends(TerrainEditor, _super);
    function TerrainEditor() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TerrainEditor.prototype.render = function () {
        return React.createElement("div", null);
    };
    return TerrainEditor;
}(React.Component));
var LinesEditor = (function (_super) {
    __extends(LinesEditor, _super);
    function LinesEditor() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    LinesEditor.prototype.render = function () {
        return React.createElement("div", null);
    };
    return LinesEditor;
}(React.Component));
var LocationsEditor = (function (_super) {
    __extends(LocationsEditor, _super);
    function LocationsEditor() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    LocationsEditor.prototype.render = function () {
        return React.createElement("div", null);
    };
    return LocationsEditor;
}(React.Component));
var CellType = (function () {
    function CellType(name, color) {
        this.name = name;
        this.color = color;
    }
    return CellType;
}());
CellType.empty = new CellType('Empty', '#fff');
var MapCell = (function () {
    function MapCell(map, cellType) {
        this.map = map;
        this.cellType = cellType;
        this.selected = false;
    }
    return MapCell;
}());
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
                    this.cells[i] = new MapCell(this, CellType.empty);
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
                    this.cells.splice(insertPos, 0, forHeightChange ? undefined : new MapCell(this, CellType.empty));
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
                this.cells.splice(topEdgeFixed ? this.cells.length : 0, 0, this.shouldIndexHaveCell(globalIndex) ? new MapCell(this, CellType.empty) : undefined);
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
            if (cell !== undefined)
                cell.typeID = this.cellTypes.indexOf(cell.cellType);
        }
    };
    MapData.prototype.setCellTypesFromIndexes = function () {
        for (var _i = 0, _a = this.cells; _i < _a.length; _i++) {
            var cell = _a[_i];
            if (cell !== undefined)
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
var MapView = (function (_super) {
    __extends(MapView, _super);
    function MapView(props) {
        var _this = _super.call(this, props) || this;
        _this.backgroundColor = '#ccc';
        _this.redrawing = false;
        _this.resizing = false;
        var scrollSize = _this.getScrollbarSize();
        _this.state = {
            cellRadius: 30,
            cellDrawInterval: 2,
            scrollbarWidth: scrollSize.width,
            scrollbarHeight: scrollSize.height,
        };
        return _this;
    }
    MapView.prototype.componentDidMount = function () {
        window.addEventListener('resize', this.resize.bind(this));
        var ctx = this.canvas.getContext('2d');
        if (ctx !== null)
            this.ctx = ctx;
        this.resize();
    };
    MapView.prototype.componentWillUnmount = function () {
        window.removeEventListener('resize', this.resize.bind(this));
    };
    MapView.prototype.render = function () {
        var _this = this;
        return React.createElement("div", { id: "mapRoot", ref: function (c) { return _this.root = c; } },
            React.createElement("canvas", { ref: function (c) { return _this.canvas = c; } }),
            React.createElement("div", { ref: function (c) { return _this.scrollPane = c; }, className: "scrollPane", onScroll: this.redraw.bind(this), onWheel: this.mouseScroll.bind(this), onTouchStart: this.touchStart.bind(this), onTouchEnd: this.touchEnd.bind(this), onTouchMove: this.touchMove.bind(this), onMouseMove: this.mouseMove.bind(this), onMouseEnter: this.mouseMove.bind(this), onClick: this.clicked.bind(this) },
                React.createElement("div", { ref: function (c) { return _this.scrollSize = c; }, className: "scrollSize" })));
    };
    MapView.prototype.redraw = function () {
        if (this.redrawing)
            return;
        requestAnimationFrame(this.draw.bind(this));
        this.redrawing = true;
    };
    MapView.prototype.draw = function () {
        this.ctx.fillStyle = this.backgroundColor;
        this.ctx.fillRect(0, 0, this.root.offsetWidth, this.root.offsetHeight);
        this.ctx.translate(-this.scrollPane.scrollLeft, -this.scrollPane.scrollTop);
        var twoLevels = this.state.cellRadius < 40;
        var drawInterval = this.state.cellDrawInterval === undefined ? 1 : this.state.cellDrawInterval;
        this.drawCells(drawInterval, !twoLevels, true, !twoLevels, !twoLevels);
        if (twoLevels) {
            // outline of next zoom level
            this.drawCells(drawInterval * 2, true, false, true, true);
        }
        this.ctx.translate(this.scrollPane.scrollLeft, this.scrollPane.scrollTop);
        this.redrawing = false;
    };
    MapView.prototype.drawCells = function (cellDrawInterval, outline, fillContent, showSelection, writeCoords) {
        var drawCellRadius = this.state.cellRadius * cellDrawInterval;
        if (fillContent)
            if (outline)
                drawCellRadius -= 0.4; // ensure there's always a 1px border left between cells
            else
                ; //drawCellRadius += 0.4; // overlap cells slightly so there's no gap
        var minDrawX = this.scrollPane.scrollLeft - drawCellRadius;
        var minDrawY = this.scrollPane.scrollTop - drawCellRadius;
        var maxDrawX = this.scrollPane.scrollLeft + this.root.offsetWidth + drawCellRadius;
        var maxDrawY = this.scrollPane.scrollTop + this.root.offsetHeight + drawCellRadius;
        var map = this.props.map;
        var cellRadius = this.state.cellRadius;
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
            var centerX = cell.xPos * cellRadius + cellRadius;
            if (centerX < minDrawX || centerX > maxDrawX)
                continue;
            var centerY = cell.yPos * cellRadius + cellRadius;
            if (centerY < minDrawY || centerY > maxDrawY)
                continue;
            this.drawCell(cell, centerX, centerY, drawCellRadius, outline, fillContent, showSelection, writeCoords);
        }
    };
    MapView.prototype.drawCell = function (cell, centerX, centerY, radius, outline, fillContent, showSelection, writeCoords) {
        var ctx = this.ctx;
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
        return cell.col + 2 + Math.floor((cell.row - this.props.map.height) / 2);
    };
    MapView.prototype.getCellDisplayY = function (cell) {
        return cell.row + 1;
    };
    MapView.prototype.resize = function () {
        if (this.resizing)
            return;
        requestAnimationFrame(this.updateSize.bind(this));
        this.resizing = true;
    };
    MapView.prototype.updateSize = function () {
        var viewWidth = this.root.offsetWidth - this.state.scrollbarWidth;
        var viewHeight = this.root.offsetHeight - this.state.scrollbarHeight;
        var screenFocusX = this.mouseX !== undefined ? this.mouseX : viewWidth / 2;
        var screenFocusY = this.mouseY !== undefined ? this.mouseY : viewHeight / 2;
        var scrollBounds = this.scrollSize.getBoundingClientRect();
        var scrollFractionX = scrollBounds.width == 0 ? 0 : (this.scrollPane.scrollLeft + screenFocusX) / scrollBounds.width;
        var scrollFractionY = scrollBounds.height == 0 ? 0 : (this.scrollPane.scrollTop + screenFocusY) / scrollBounds.height;
        this.canvas.setAttribute('width', viewWidth.toString());
        this.canvas.setAttribute('height', viewHeight.toString());
        this.scrollPane.style.width = this.root.offsetWidth + 'px';
        this.scrollPane.style.height = this.root.offsetHeight + 'px';
        var overallWidth = (this.props.map.maxX - this.props.map.minX) * this.state.cellRadius;
        var overallHeight = (this.props.map.maxY - this.props.map.minY) * this.state.cellRadius;
        this.scrollSize.style.width = overallWidth + 'px';
        this.scrollSize.style.height = overallHeight + 'px';
        this.scrollPane.scrollLeft = scrollFractionX * overallWidth - screenFocusX;
        this.scrollPane.scrollTop = scrollFractionY * overallHeight - screenFocusY;
        this.redraw();
        this.resizing = false;
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
        if (t1 !== null && t2 !== null)
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
        var distSq = t1 === null || t2 === null ? 0 :
            (t1.screenX - t2.screenX) * (t1.screenX - t2.screenX) + (t1.screenY - t2.screenY) * (t1.screenY - t2.screenY);
        var diff = (distSq - this.touchZoomDist) * 0.0000002;
        if (diff > 0)
            this.zoomIn(diff);
        else if (diff < 0)
            this.zoomOut(-diff);
        this.touchZoomDist = distSq;
    };
    MapView.prototype.zoomIn = function (stepScale) {
        this.setCellRadius(Math.min(200, Math.ceil(this.state.cellRadius * (1 + stepScale))));
        this.resize();
    };
    MapView.prototype.zoomOut = function (stepScale) {
        this.setCellRadius(Math.max(0.1, Math.floor(this.state.cellRadius * (1 - stepScale))));
        this.resize();
    };
    MapView.prototype.setCellRadius = function (radius) {
        var displayRadius = radius;
        var cellDrawInterval = 1;
        var minRadius = 20;
        while (displayRadius < minRadius) {
            displayRadius *= 2;
            cellDrawInterval *= 2;
        }
        this.setState({ cellRadius: radius, cellDrawInterval: cellDrawInterval, scrollbarWidth: this.state.scrollbarWidth, scrollbarHeight: this.state.scrollbarHeight });
    };
    MapView.prototype.mouseMove = function (e) {
        this.mouseX = e.clientX;
        this.mouseY = e.clientY;
    };
    MapView.prototype.clicked = function (e) {
        var cellIndex = this.getCellIndexAtPoint(e.clientX, e.clientY);
        if (cellIndex >= 0 && cellIndex < this.props.map.cells.length) {
            var cell = this.props.map.cells[cellIndex];
            if (cell != null) {
                if (this.props.cellClicked === undefined || !this.props.cellClicked(cell)) {
                    cell.selected = cell.selected !== true;
                }
                this.redraw();
                return;
            }
        }
    };
    MapView.prototype.getCellIndexAtPoint = function (screenX, screenY) {
        var mapX = screenX - this.canvas.offsetLeft + this.scrollPane.scrollLeft + this.props.map.minX * this.state.cellRadius;
        var mapY = screenY - this.canvas.offsetTop + this.scrollPane.scrollTop + this.props.map.minY * this.state.cellRadius;
        var fCol = (mapX * Math.sqrt(3) - mapY) / 3 / this.state.cellRadius;
        var fRow = mapY * 2 / 3 / this.state.cellRadius;
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
        return rCol + rRow * this.props.map.width;
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
        if (outer.parentNode !== null)
            outer.parentNode.removeChild(outer);
        return {
            width: widthNoScroll - widthWithScroll,
            height: heightNoScroll - heightWithScroll
        };
    };
    MapView.prototype.extractData = function () {
        var json = this.props.map.saveToJSON();
        window.open('data:text/json,' + encodeURIComponent(json));
    };
    return MapView;
}(React.Component));
var EditorControls = (function (_super) {
    __extends(EditorControls, _super);
    function EditorControls() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    EditorControls.prototype.render = function () {
        return React.createElement("div", { id: "editorControls" },
            this.renderButton(0 /* Size */, 'Size'),
            this.renderButton(1 /* Terrain */, 'Terrain'),
            this.renderButton(2 /* Lines */, 'Lines'),
            this.renderButton(3 /* Locations */, 'Locations'),
            React.createElement("div", { className: "filler" }));
    };
    EditorControls.prototype.renderButton = function (editor, text) {
        var classes = this.props.activeEditor === editor ? 'active' : undefined;
        return React.createElement("button", { className: classes, onClick: this.selectEditor.bind(this, editor) },
            React.createElement("span", null, text));
    };
    EditorControls.prototype.selectEditor = function (editor) {
        this.props.editorSelected(this.props.activeEditor === editor ? undefined : editor);
    };
    return EditorControls;
}(React.Component));
var WorldMap = (function (_super) {
    __extends(WorldMap, _super);
    function WorldMap(props) {
        var _this = _super.call(this, props) || this;
        _this.state = {
            map: new MapData(500, 500),
        };
        return _this;
    }
    WorldMap.prototype.render = function () {
        var _this = this;
        var editorClass = this.state.activeEditor === undefined ? 'hidden' : undefined;
        var activeEditor = this.state.activeEditor === undefined ? undefined : this.renderEditor(this.state.activeEditor);
        if (this.state.map === undefined)
            return React.createElement("div", { id: "worldRoot" });
        return React.createElement("div", { id: "worldRoot" },
            React.createElement(MapView, { map: this.state.map, ref: function (c) { return _this.mapView = c; } }),
            React.createElement(EditorControls, { activeEditor: this.state.activeEditor, editorSelected: this.selectEditor.bind(this) }),
            React.createElement("div", { id: "editor", className: editorClass }, activeEditor));
    };
    WorldMap.prototype.renderEditor = function (editor) {
        var mapChanged = this.mapView.redraw.bind(this.mapView);
        if (this.state.map === undefined)
            return React.createElement("div", null, "No map");
        switch (editor) {
            case 0 /* Size */:
                return React.createElement(SizeEditor, { mapChanged: mapChanged, map: this.state.map });
            case 1 /* Terrain */:
                return React.createElement(TerrainEditor, { mapChanged: mapChanged, map: this.state.map });
            case 2 /* Lines */:
                return React.createElement(LinesEditor, { mapChanged: mapChanged, map: this.state.map });
            case 3 /* Locations */:
                return React.createElement(LocationsEditor, { mapChanged: mapChanged, map: this.state.map });
        }
    };
    WorldMap.prototype.selectEditor = function (editor) {
        this.setState({ activeEditor: editor });
        window.setTimeout(this.mapView.resize.bind(this.mapView), 1510);
    };
    return WorldMap;
}(React.Component));
var worldMap = ReactDOM.render(React.createElement(WorldMap, null), document.getElementById('uiRoot'));
//# sourceMappingURL=maps.js.map