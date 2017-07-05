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
var OverviewEditor = (function (_super) {
    __extends(OverviewEditor, _super);
    function OverviewEditor(props) {
        var _this = _super.call(this, props) || this;
        _this.state = {
            name: props.name,
            description: props.description,
        };
        return _this;
    }
    OverviewEditor.prototype.render = function () {
        return React.createElement("form", { onSubmit: this.updateDetails.bind(this) },
            React.createElement("div", { role: "group" },
                React.createElement("label", { htmlFor: "txtName" }, "Name"),
                React.createElement("input", { type: "text", id: "txtName", value: this.state.name, onChange: this.nameChanged.bind(this) })),
            React.createElement("div", { role: "group" },
                React.createElement("label", { htmlFor: "txtDesc" }, "Info"),
                React.createElement("textarea", { id: "txtDesc", onChange: this.descChanged.bind(this), rows: 20, value: this.state.description })),
            React.createElement("div", { role: "group" },
                React.createElement("button", { type: "submit" }, "Save details")));
    };
    OverviewEditor.prototype.nameChanged = function (e) {
        this.setState({ name: e.target.value, description: this.state.description });
    };
    OverviewEditor.prototype.descChanged = function (e) {
        this.setState({ name: this.state.name, description: e.target.value });
    };
    OverviewEditor.prototype.updateDetails = function (e) {
        e.preventDefault();
        this.props.saveChanges(this.state.name, this.state.description);
    };
    return OverviewEditor;
}(React.Component));
var SizeEditor = (function (_super) {
    __extends(SizeEditor, _super);
    function SizeEditor(props) {
        var _this = _super.call(this, props) || this;
        _this.state = {
            newWidth: props.width,
            newHeight: props.height,
            resizeAnchor: 0 /* TopLeft */,
        };
        return _this;
    }
    SizeEditor.prototype.render = function () {
        var sameSize = this.state.newWidth == this.props.width && this.state.newHeight == this.props.height;
        return React.createElement("form", { onSubmit: this.changeSize.bind(this) },
            React.createElement("div", { role: "group" },
                React.createElement("label", { htmlFor: "txtResizeWidth" }, "Width"),
                React.createElement("input", { type: "number", id: "txtResizeWidth", value: this.state.newWidth.toString(), onChange: this.widthChanged.bind(this) })),
            React.createElement("div", { role: "group" },
                React.createElement("label", { htmlFor: "txtResizeHeight" }, "Height"),
                React.createElement("input", { type: "number", id: "txtResizeHeight", value: this.state.newHeight.toString(), onChange: this.heightChanged.bind(this) })),
            React.createElement("div", { role: "group" },
                React.createElement("label", null, "Anchor"),
                React.createElement(ResizeAnchorInput, { oldWidth: this.props.width, newWidth: this.state.newWidth, oldHeight: this.props.height, newHeight: this.state.newHeight, mode: this.state.resizeAnchor, setMode: this.setMode.bind(this) })),
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
        this.props.changeSize(this.state.newWidth, this.state.newHeight, this.state.resizeAnchor);
    };
    return SizeEditor;
}(React.Component));
var TerrainTypesEditor = (function (_super) {
    __extends(TerrainTypesEditor, _super);
    function TerrainTypesEditor(props) {
        var _this = _super.call(this, props) || this;
        _this.state = {
            cellTypes: props.cellTypes.slice(),
        };
        return _this;
    }
    TerrainTypesEditor.prototype.componentWillReceiveProps = function (newProps) {
        this.setState({
            cellTypes: newProps.cellTypes.slice(),
            editingType: undefined,
        });
    };
    TerrainTypesEditor.prototype.render = function () {
        if (this.state.editName === undefined)
            return this.renderAllTypes();
        else
            return this.renderTypeEdit();
    };
    TerrainTypesEditor.prototype.renderAllTypes = function () {
        var that = this;
        return React.createElement("div", null,
            React.createElement("div", { className: "palleteList" }, this.state.cellTypes.map(function (type, id) {
                return React.createElement("div", { key: id.toString(), style: { 'backgroundColor': type.color }, onClick: that.showEdit.bind(that, type) }, type.name);
            })),
            React.createElement("p", { className: "prompt" }, "Click a terrain type to edit it."),
            React.createElement("button", { type: "button", onClick: this.showEdit.bind(this, undefined) }, "Add new type"));
    };
    TerrainTypesEditor.prototype.renderTypeEdit = function () {
        var deleteButton = this.state.editingType === undefined || this.state.editingType == CellType.empty ? undefined : React.createElement("button", { type: "button", onClick: this.deleteType.bind(this) }, "Delete");
        return React.createElement("form", { onSubmit: this.saveType.bind(this) },
            React.createElement("div", { role: "group" },
                React.createElement("label", { htmlFor: "txtName" }, "Name"),
                React.createElement("input", { type: "text", id: "txtName", value: this.state.editName, onChange: this.nameChanged.bind(this) })),
            React.createElement("div", { role: "group" },
                React.createElement("label", { htmlFor: "inColor" }, "Color"),
                React.createElement("input", { type: "color", id: "inColor", value: this.state.editColor, onChange: this.colorChanged.bind(this) })),
            React.createElement("div", { role: "group" },
                React.createElement("button", { type: "submit" }, "Save type"),
                React.createElement("button", { type: "button", onClick: this.cancelEdit.bind(this) }, "Cancel"),
                deleteButton));
    };
    TerrainTypesEditor.prototype.nameChanged = function (e) {
        this.setState({
            editName: e.target.value,
            cellTypes: this.state.cellTypes,
        });
    };
    TerrainTypesEditor.prototype.colorChanged = function (e) {
        this.setState({
            editColor: e.target.value,
            cellTypes: this.state.cellTypes,
        });
    };
    TerrainTypesEditor.prototype.showEdit = function (type) {
        var name, color;
        if (type === undefined) {
            name = '';
            color = '#666666';
        }
        else {
            name = type.name;
            color = type.color;
        }
        this.setState({
            cellTypes: this.state.cellTypes,
            editingType: type,
            editName: name,
            editColor: color,
        });
    };
    TerrainTypesEditor.prototype.saveType = function (e) {
        e.preventDefault();
        var name = this.state.editName === undefined ? '' : this.state.editName.trim();
        if (name == '')
            return;
        var color = this.state.editColor === undefined ? '' : this.state.editColor;
        if (color == '')
            return;
        var editType = this.state.editingType;
        this.setState(function (state) {
            var cellTypes = state.cellTypes;
            if (editType === undefined) {
                cellTypes.push(new CellType(name, color));
            }
            else {
                editType.name = name;
                editType.color = color;
            }
            this.props.updateCellTypes(cellTypes);
            return {
                cellTypes: cellTypes,
                editingType: undefined,
                editName: undefined,
                editColor: undefined,
            };
        });
    };
    TerrainTypesEditor.prototype.cancelEdit = function () {
        this.setState({
            editingType: undefined,
            editName: undefined,
            editColor: undefined,
            cellTypes: this.state.cellTypes,
        });
    };
    TerrainTypesEditor.prototype.deleteType = function () {
        this.setState(function (state) {
            var cellTypes = state.cellTypes;
            if (state.editingType !== undefined) {
                var pos = cellTypes.indexOf(state.editingType);
                cellTypes.splice(pos, 1);
            }
            this.props.updateCellTypes(cellTypes);
            return {
                editingType: undefined,
                editName: undefined,
                editColor: undefined,
                cellTypes: cellTypes,
            };
        });
    };
    return TerrainTypesEditor;
}(React.Component));
var TerrainEditor = (function (_super) {
    __extends(TerrainEditor, _super);
    function TerrainEditor(props) {
        var _this = _super.call(this, props) || this;
        _this.state = {
            selectedTerrainType: props.cellTypes[0],
        };
        return _this;
    }
    TerrainEditor.prototype.componentWillReceiveProps = function (newProps) {
        this.setState({
            selectedTerrainType: newProps.cellTypes[0],
        });
    };
    TerrainEditor.prototype.render = function () {
        var that = this;
        return React.createElement("div", null,
            React.createElement("div", { className: "palleteList" }, this.props.cellTypes.map(function (type, id) {
                var classes = type == that.state.selectedTerrainType ? 'selected' : undefined;
                return React.createElement("div", { key: id.toString(), className: classes, style: { 'backgroundColor': type.color }, onClick: that.selectTerrainType.bind(that, type) }, type.name);
            })));
    };
    TerrainEditor.prototype.selectTerrainType = function (type) {
        this.setState({
            selectedTerrainType: type,
        });
    };
    TerrainEditor.prototype.mouseDown = function (cell) {
        cell.cellType = this.state.selectedTerrainType;
        this.props.redraw();
    };
    TerrainEditor.prototype.mouseEnter = function (cell) {
        cell.cellType = this.state.selectedTerrainType;
        this.props.redraw();
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
var LayersEditor = (function (_super) {
    __extends(LayersEditor, _super);
    function LayersEditor() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    LayersEditor.prototype.render = function () {
        return React.createElement("div", null);
    };
    return LayersEditor;
}(React.Component));
var CellType = (function () {
    function CellType(name, color) {
        this.name = name;
        this.color = color;
    }
    return CellType;
}());
CellType.empty = new CellType('Empty', '#ffffff');
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
        this.underlyingWidth = width + Math.floor(height / 2) - 1;
        this.width = width;
        this.height = height;
        this.cells = new Array(this.underlyingWidth * this.height);
        this.cellTypes = [CellType.empty];
        this.name = '';
        this.description = '';
        if (createCells !== false) {
            for (var i = 0; i < this.cells.length; i++)
                if (this.shouldIndexHaveCell(i))
                    this.cells[i] = new MapCell(this, CellType.empty);
            this.cellTypes.push(new CellType('Red', '#ff0000'));
            this.cellTypes.push(new CellType('Green', '#00cc00'));
            this.cellTypes.push(new CellType('Blue', '#0099ff'));
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
            cell.row = Math.floor(i / this.underlyingWidth);
            cell.col = i % this.underlyingWidth;
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
        var row = Math.floor(index / this.underlyingWidth);
        var col = index % this.underlyingWidth;
        if (2 * col + row < this.height - 2)
            return false; // chop left to get square edge
        if (row + 2 * col > 2 * this.underlyingWidth - 1)
            return false; // chop right to get square edge
        return true;
    };
    MapData.prototype.getCellIndex = function (row, col) {
        return col + row * this.underlyingWidth;
    };
    MapData.prototype.changeSize = function (newWidth, newHeight, mode) {
        var deltaWidth = newWidth - this.width;
        var deltaHeight = newHeight - this.height;
        switch (mode) {
            case 0 /* TopLeft */:
                this.performWidthChange(deltaWidth, true, false);
                this.changeHeight(deltaHeight, true);
                break;
            case 1 /* TopMiddle */:
                this.performWidthChange(Math.floor(deltaWidth / 2), true, false);
                this.performWidthChange(Math.ceil(deltaWidth / 2), false, false);
                this.changeHeight(deltaHeight, true);
                break;
            case 2 /* TopRight */:
                this.performWidthChange(deltaWidth, false, false);
                this.changeHeight(deltaHeight, true);
                break;
            case 3 /* CenterLeft */:
                this.performWidthChange(deltaWidth, true, false);
                this.changeHeight(Math.floor(deltaHeight / 2), true);
                this.changeHeight(Math.ceil(deltaHeight / 2), false);
                break;
            case 4 /* Center */:
                this.performWidthChange(Math.floor(deltaWidth / 2), true, false);
                this.performWidthChange(Math.ceil(deltaWidth / 2), false, false);
                this.changeHeight(Math.floor(deltaHeight / 2), true);
                this.changeHeight(Math.ceil(deltaHeight / 2), false);
                break;
            case 5 /* CenterRight */:
                this.performWidthChange(deltaWidth, false, false);
                this.changeHeight(Math.floor(deltaHeight / 2), true);
                this.changeHeight(Math.ceil(deltaHeight / 2), false);
                break;
            case 6 /* BottomLeft */:
                this.performWidthChange(deltaWidth, true, false);
                this.changeHeight(deltaHeight, false);
                break;
            case 7 /* BottomMiddle */:
                this.performWidthChange(Math.floor(deltaWidth / 2), true, false);
                this.performWidthChange(Math.ceil(deltaWidth / 2), false, false);
                this.changeHeight(deltaHeight, false);
                break;
            case 8 /* BottomRight */:
                this.performWidthChange(deltaWidth, false, false);
                this.changeHeight(deltaHeight, false);
                break;
        }
        this.width += deltaWidth; // this is a "display only" property, and isn't affected by underlying calculations
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
    };
    MapData.prototype.performWidthChange = function (delta, leftEdgeFixed, forHeightChange) {
        var overallDelta = 0;
        if (delta > 0) {
            for (var row = 0; row < this.height; row++) {
                var rowInsertIndex = void 0; // this is complicated on account of the "chopping" we did to get square edges
                if (leftEdgeFixed)
                    rowInsertIndex = this.underlyingWidth - Math.floor(row / 2);
                else
                    rowInsertIndex = Math.floor((this.height - row - 1) / 2);
                var rowStart = row * this.underlyingWidth;
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
                        rowChopPos = this.underlyingWidth + delta;
                    else
                        rowChopPos = 0;
                }
                else if (leftEdgeFixed)
                    rowChopPos = this.underlyingWidth - Math.floor(row / 2) + delta;
                else
                    rowChopPos = Math.floor((this.height - row - 1) / 2);
                var rowStart = row * this.underlyingWidth;
                var chopPos = rowStart + rowChopPos + overallDelta;
                this.cells.splice(chopPos, -delta);
                overallDelta += delta;
            }
        }
        this.underlyingWidth += delta;
    };
    MapData.prototype.performHeightChange = function (delta, topEdgeFixed) {
        if (delta > 0) {
            var diff = delta * this.underlyingWidth;
            for (var i = 0; i < diff; i++) {
                if (this.cells.length + 1 > this.underlyingWidth * this.height)
                    this.height++;
                var globalIndex = topEdgeFixed ? this.cells.length : diff - i - 1;
                this.cells.splice(topEdgeFixed ? this.cells.length : 0, 0, this.shouldIndexHaveCell(globalIndex) ? new MapCell(this, CellType.empty) : undefined);
            }
        }
        else if (delta < 0) {
            var diff = -delta * this.underlyingWidth;
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
        map.name = json.name;
        map.description = json.description;
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
            cellDrawInterval: 1,
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
        this.setupTouch();
        this.resize();
    };
    MapView.prototype.componentWillUnmount = function () {
        window.removeEventListener('resize', this.resize.bind(this));
        if (this.hammer !== undefined) {
            this.hammer.destroy();
            this.hammer = undefined;
        }
    };
    MapView.prototype.setupTouch = function () {
        this.hammer = new Hammer.Manager(this.scrollPane);
        var zoom = new Hammer.Pinch({ event: 'zoom', threshold: 0.1 });
        this.hammer.add(zoom);
        var prevScale = 1;
        this.hammer.on('zoom', function (ev) {
            var touchZoomScale = ev.scale / prevScale;
            if (touchZoomScale > 0.9 && touchZoomScale < 1.1)
                return;
            prevScale = ev.scale;
            this.zoom(touchZoomScale);
        }.bind(this));
        this.hammer.on('zoomend', function (ev) {
            prevScale = 1;
        });
        var pan = new Hammer.Pan({ event: 'pan', threshold: 10, pointers: 3, direction: Hammer.DIRECTION_ALL });
        this.hammer.add(pan);
        var lastX = 0, lastY = 0, panScale = 1.5;
        this.hammer.on('pan', function (ev) {
            var dX = ev.deltaX - lastX;
            lastX = ev.deltaX;
            var dY = ev.deltaY - lastY;
            lastY = ev.deltaY;
            this.scrollPane.scrollLeft -= dX * panScale;
            this.scrollPane.scrollTop -= dY * panScale;
            this.redraw();
        }.bind(this));
        this.hammer.on('panend', function (ev) {
            lastX = lastY = 0;
        }.bind(this));
        var touch = new Hammer.Pan({ event: 'touch', threshold: 10, pointers: 1, direction: Hammer.DIRECTION_ALL });
        this.hammer.add(touch);
        this.hammer.on('touchstart', function (ev) {
            this.startCellInteract(ev.center.x, ev.center.y);
        }.bind(this));
        this.hammer.on('touch', function (ev) {
            this.hoverCellAt(ev.center.x, ev.center.y);
        }.bind(this));
        this.hammer.on('touchend', function (ev) {
            this.endCellInteract(ev.center.x, ev.center.y);
        }.bind(this));
        pan.requireFailure(zoom);
        zoom.requireFailure(pan);
        touch.requireFailure(pan);
        touch.requireFailure(zoom);
    };
    MapView.prototype.render = function () {
        var _this = this;
        return React.createElement("div", { id: "mapRoot", ref: function (c) { return _this.root = c; } },
            React.createElement("canvas", { ref: function (c) { return _this.canvas = c; } }),
            React.createElement("div", { ref: function (c) { return _this.scrollPane = c; }, className: "scrollPane", onScroll: this.redraw.bind(this), onWheel: this.mouseScroll.bind(this), onMouseMove: this.mouseMove.bind(this), onMouseEnter: this.mouseMove.bind(this), onMouseDown: this.mouseDown.bind(this), onMouseUp: this.mouseUp.bind(this) },
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
    MapView.prototype.updateScrollSize = function () {
        var screenFocusX, screenFocusY;
        if (this.mouseX !== undefined && this.mouseY !== undefined) {
            screenFocusX = this.mouseX;
            screenFocusY = this.mouseY;
        }
        else {
            screenFocusX = this.canvas.width / 2;
            screenFocusY = this.canvas.height / 2;
        }
        var scrollBounds = this.scrollSize.getBoundingClientRect();
        var scrollFractionX = scrollBounds.width == 0 ? 0 : (this.scrollPane.scrollLeft + screenFocusX) / scrollBounds.width;
        var scrollFractionY = scrollBounds.height == 0 ? 0 : (this.scrollPane.scrollTop + screenFocusY) / scrollBounds.height;
        this.scrollPane.style.width = this.root.offsetWidth + 'px';
        this.scrollPane.style.height = this.root.offsetHeight + 'px';
        var overallWidth = (this.props.map.maxX - this.props.map.minX) * this.state.cellRadius;
        var overallHeight = (this.props.map.maxY - this.props.map.minY) * this.state.cellRadius;
        this.scrollSize.style.width = overallWidth + 'px';
        this.scrollSize.style.height = overallHeight + 'px';
        this.scrollPane.scrollLeft = scrollFractionX * overallWidth - screenFocusX;
        this.scrollPane.scrollTop = scrollFractionY * overallHeight - screenFocusY;
    };
    MapView.prototype.updateSize = function () {
        var viewWidth = this.root.offsetWidth - this.state.scrollbarWidth;
        var viewHeight = this.root.offsetHeight - this.state.scrollbarHeight;
        this.canvas.setAttribute('width', viewWidth.toString());
        this.canvas.setAttribute('height', viewHeight.toString());
        this.updateScrollSize();
        this.redraw();
        this.resizing = false;
    };
    MapView.prototype.mouseScroll = function (e) {
        if (!e.ctrlKey || e.deltaY == 0)
            return;
        e.preventDefault();
        this.zoom(e.deltaY < 0 ? 1.1 : 0.9);
    };
    MapView.prototype.zoom = function (scale) {
        this.setCellRadius(Math.min(200, Math.ceil(this.state.cellRadius * scale)));
        this.updateScrollSize();
        this.redraw();
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
        this.hoverCellAt(e.clientX, e.clientY);
    };
    MapView.prototype.mouseDown = function (e) {
        this.startCellInteract(e.clientX, e.clientY);
    };
    MapView.prototype.mouseUp = function (e) {
        this.endCellInteract(e.clientX, e.clientY);
    };
    MapView.prototype.hoverCellAt = function (x, y) {
        if (this.mouseDownCell === undefined)
            return;
        var cellIndex = this.getCellIndexAtPoint(x, y);
        var cell = cellIndex >= 0 && cellIndex < this.props.map.cells.length ? this.props.map.cells[cellIndex] : undefined;
        if (cell !== this.mouseDownCell) {
            if (this.props.cellMouseLeave !== undefined)
                this.props.cellMouseLeave(this.mouseDownCell);
            this.mouseDownCell = cell;
            if (cell !== undefined && this.props.cellMouseEnter !== undefined)
                this.props.cellMouseEnter(cell);
        }
    };
    MapView.prototype.startCellInteract = function (x, y) {
        var cellIndex = this.getCellIndexAtPoint(x, y);
        if (cellIndex >= 0 && cellIndex < this.props.map.cells.length) {
            var cell = this.props.map.cells[cellIndex];
            if (cell !== undefined && this.props.cellMouseDown !== undefined)
                this.props.cellMouseDown(cell);
            this.mouseDownCell = cell;
        }
    };
    MapView.prototype.endCellInteract = function (x, y) {
        var cellIndex = this.getCellIndexAtPoint(x, y);
        if (cellIndex >= 0 && cellIndex < this.props.map.cells.length) {
            var cell = this.props.map.cells[cellIndex];
            if (cell !== undefined && this.props.cellMouseUp !== undefined)
                this.props.cellMouseUp(cell);
        }
        this.mouseDownCell = undefined;
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
        return this.props.map.getCellIndex(rRow, rCol);
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
            this.renderButton(0 /* Overview */, 'Overview', // info
            React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24" },
                React.createElement("circle", { cx: "12", cy: "12", r: "10" }),
                React.createElement("line", { x1: "12", y1: "16", x2: "12", y2: "12" }),
                React.createElement("line", { x1: "12", y1: "8", x2: "12", y2: "8" }))),
            this.renderButton(1 /* Size */, 'Size', // move
            React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24" },
                React.createElement("polyline", { points: "5 9 2 12 5 15" }),
                React.createElement("polyline", { points: "9 5 12 2 15 5" }),
                React.createElement("polyline", { points: "15 19 12 22 9 19" }),
                React.createElement("polyline", { points: "19 9 22 12 19 15" }),
                React.createElement("line", { x1: "2", y1: "12", x2: "22", y2: "12" }),
                React.createElement("line", { x1: "12", y1: "2", x2: "12", y2: "22" }))),
            this.renderButton(2 /* TerrainTypes */, 'Terrain Types', // grid
            React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24" },
                React.createElement("rect", { x: "3", y: "3", width: "7", height: "7" }),
                React.createElement("rect", { x: "14", y: "3", width: "7", height: "7" }),
                React.createElement("rect", { x: "14", y: "14", width: "7", height: "7" }),
                React.createElement("rect", { x: "3", y: "14", width: "7", height: "7" }))),
            this.renderButton(3 /* Terrain */, 'Terrain', // edit
            React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24" },
                React.createElement("path", { d: "M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34" }),
                React.createElement("polygon", { points: "18 2 22 6 12 16 8 16 8 12 18 2" }))),
            this.renderButton(4 /* Lines */, 'Lines', // edit-3
            React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24" },
                React.createElement("polygon", { points: "14 2 18 6 7 17 3 17 3 13 14 2" }),
                React.createElement("line", { x1: "3", y1: "22", x2: "21", y2: "22" }))),
            this.renderButton(5 /* Locations */, 'Locations', // map-pin
            React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24" },
                React.createElement("path", { d: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" }),
                React.createElement("circle", { cx: "12", cy: "10", r: "3" }))),
            this.renderButton(6 /* Layers */, 'Layers', // layers
            React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24" },
                React.createElement("polygon", { points: "12 2 2 7 12 12 22 7 12 2" }),
                React.createElement("polyline", { points: "2 17 12 22 22 17" }),
                React.createElement("polyline", { points: "2 12 12 17 22 12" }))),
            React.createElement("div", { className: "filler" }));
    };
    EditorControls.prototype.renderButton = function (editor, text, image) {
        var classes = this.props.activeEditor === editor ? 'active' : undefined;
        return React.createElement("button", { className: classes, title: text, onClick: this.selectEditor.bind(this, editor, text) }, image);
    };
    EditorControls.prototype.selectEditor = function (editor, name) {
        this.props.editorSelected(this.props.activeEditor === editor ? undefined : editor, name);
    };
    return EditorControls;
}(React.Component));
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var WorldMap = (function (_super) {
    __extends(WorldMap, _super);
    function WorldMap(props) {
        var _this = _super.call(this, props) || this;
        _this.state = {
            map: new MapData(50, 50),
            activeEditor: props.editable ? 0 /* Overview */ : undefined,
        };
        return _this;
    }
    WorldMap.prototype.render = function () {
        var _this = this;
        if (this.state.map === undefined)
            return React.createElement("div", { id: "worldRoot" });
        if (!this.props.editable)
            return React.createElement("div", { id: "worldRoot" },
                React.createElement(MapView, { map: this.state.map, ref: function (c) { return _this.mapView = c; }, cellMouseDown: this.cellMouseDown.bind(this), cellMouseUp: this.cellMouseUp.bind(this), cellMouseEnter: this.cellMouseEnter.bind(this), cellMouseLeave: this.cellMouseLeave.bind(this) }));
        var activeEditor = this.state.activeEditor === undefined ? undefined : this.renderEditor(this.state.activeEditor);
        return React.createElement("div", { id: "worldRoot" },
            React.createElement(MapView, { map: this.state.map, ref: function (c) { return _this.mapView = c; }, cellMouseDown: this.cellMouseDown.bind(this), cellMouseUp: this.cellMouseUp.bind(this), cellMouseEnter: this.cellMouseEnter.bind(this), cellMouseLeave: this.cellMouseLeave.bind(this) }),
            React.createElement(EditorControls, { activeEditor: this.state.activeEditor, editorSelected: this.selectEditor.bind(this) }),
            React.createElement("div", { id: "editor" },
                React.createElement("h1", null, this.state.editorHeading),
                activeEditor));
    };
    WorldMap.prototype.renderEditor = function (editor) {
        var _this = this;
        if (this.state.map === undefined)
            return React.createElement("div", null, "No map");
        var props = {
            ref: function (c) { return _this.activeEditor = c; }
        };
        switch (editor) {
            case 0 /* Overview */:
                return React.createElement(OverviewEditor, __assign({}, props, { name: this.state.map.name, description: this.state.map.description, saveChanges: this.updateDetails.bind(this) }));
            case 1 /* Size */:
                return React.createElement(SizeEditor, __assign({}, props, { width: this.state.map.width, height: this.state.map.height, changeSize: this.changeSize.bind(this) }));
            case 2 /* TerrainTypes */:
                return React.createElement(TerrainTypesEditor, __assign({}, props, { cellTypes: this.state.map.cellTypes, updateCellTypes: this.updateCellTypes.bind(this) }));
            case 3 /* Terrain */:
                return React.createElement(TerrainEditor, __assign({}, props, { cellTypes: this.state.map.cellTypes, redraw: this.mapView.redraw.bind(this.mapView) }));
            case 4 /* Lines */:
                return React.createElement(LinesEditor, __assign({}, props));
            case 5 /* Locations */:
                return React.createElement(LocationsEditor, __assign({}, props));
            case 6 /* Layers */:
                return React.createElement(LayersEditor, __assign({}, props));
        }
    };
    WorldMap.prototype.cellMouseDown = function (cell) {
        if (this.activeEditor !== undefined && this.activeEditor.mouseDown !== undefined)
            this.activeEditor.mouseDown(cell);
    };
    WorldMap.prototype.cellMouseUp = function (cell) {
        if (this.activeEditor !== undefined && this.activeEditor.mouseUp !== undefined)
            this.activeEditor.mouseUp(cell);
    };
    WorldMap.prototype.cellMouseEnter = function (cell) {
        if (this.activeEditor !== undefined && this.activeEditor.mouseEnter !== undefined)
            this.activeEditor.mouseEnter(cell);
    };
    WorldMap.prototype.cellMouseLeave = function (cell) {
        if (this.activeEditor !== undefined && this.activeEditor.mouseLeave !== undefined)
            this.activeEditor.mouseLeave(cell);
    };
    WorldMap.prototype.updateDetails = function (name, desc) {
        if (this.state.map === undefined)
            return;
        this.state.map.name = name;
        this.state.map.description = desc;
        this.setState({ map: this.state.map });
    };
    WorldMap.prototype.changeSize = function (width, height, mode) {
        if (this.state.map === undefined)
            return;
        this.state.map.changeSize(width, height, mode);
        this.mapView.redraw();
        this.setState({ map: this.state.map });
    };
    WorldMap.prototype.updateCellTypes = function (cellTypes) {
        if (this.state.map === undefined)
            return;
        // TODO: surely check that a cell type isn't in use before we get this far?
        // or just clear all cells of a "removed" type, but the user should be warned first.
        this.state.map.cellTypes = cellTypes;
        this.mapView.redraw();
        this.setState({ map: this.state.map });
    };
    WorldMap.prototype.mapChanged = function () {
        this.mapView.redraw();
        this.setState({ map: this.state.map });
    };
    WorldMap.prototype.selectEditor = function (editor, name) {
        this.setState({ activeEditor: editor, editorHeading: name });
    };
    return WorldMap;
}(React.Component));
var editable = document.location.search != '?readonly';
var worldMap = ReactDOM.render(React.createElement(WorldMap, { editable: editable }), document.getElementById('uiRoot'));
//# sourceMappingURL=maps.js.map