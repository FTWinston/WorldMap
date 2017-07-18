type PossibleMapCell = MapCell | null;

interface ICubeCoord {
    x: number,
    y: number,
    z: number,
}

class MapData {
    name: string;
    description: string;
    width: number;
    height: number;
    cellTypes: CellType[];
    cells: MapCell[];
    offsetEvenRows: boolean;
    locationTypes: LocationType[];
    locations: MapLocation[];
    lineTypes: LineType[];
    lines: MapLine[];

    constructor(width: number, height: number, createCells: boolean = true) {
        this.width = width;
        this.height = height;
        this.cells = new Array<MapCell>(this.width * this.height);
        this.cellTypes = [CellType.empty];
        this.name = '';
        this.description = '';
        this.locationTypes = [];
        this.locations = [];
        this.lineTypes = [];
        this.lines = [];

        if (createCells !== false) {
            for (let i = 0; i < this.cells.length; i++)
                this.cells[i] = new MapCell(this, CellType.empty);

            CellType.createDefaults(this.cellTypes);
            LocationType.createDefaults(this.locationTypes);
            LineType.createDefaults(this.lineTypes);
            
            this.offsetEvenRows = true;
            this.positionCells();
        }
    }
    static readonly packedWidthRatio = 1.7320508075688772;
    static readonly packedHeightRatio = 1.5;
    private positionCells() {
        for (let i = 0; i < this.cells.length; i++) {
            let cell = this.cells[i];

            cell.row = Math.floor(i / this.width);
            cell.col = i % this.width;
            let offset = (cell.row % 2 == 1) == this.offsetEvenRows ? 0.5 : 0;

            cell.xPos = MapData.packedWidthRatio * (cell.col + offset);
            cell.yPos = MapData.packedHeightRatio * cell.row;
        }

        for (let line of this.lines)
            line.updateRenderPoints();
    }
    getCellIndex(row: number, col: number) {
        return col + row * this.width;
    }
    convertToCube(row: number, col: number) {
        let x: number;
        if (this.offsetEvenRows)
            x = col - (row + (row&1)) / 2;
        else
            x = col - (row - (row&1)) / 2;

        return {
            x: x,
            y: -x-row,
            z: row,
        }
    }
    convertFromCube(cubeX: number, cubeY: number, cubeZ: number) {
        let row: number, col: number;

        if (this.offsetEvenRows)
            col = cubeX + (cubeZ + (cubeZ&1)) / 2;
        else
            col = cubeX + (cubeZ - (cubeZ&1)) / 2;
        row = cubeZ;

        return this.getCellIndex(row, col);
    }
    changeSize(newWidth: number, newHeight: number, mode: ResizeAnchorMode) {
        let deltaWidth = newWidth - this.width;
        let deltaHeight = newHeight - this.height;

        switch (mode) {
            case ResizeAnchorMode.TopLeft:
                this.performWidthChange(deltaWidth, true, false);
                this.changeHeight(deltaHeight, true);
                break;
            case ResizeAnchorMode.TopMiddle:
                this.performWidthChange(Math.floor(deltaWidth/2), true, false);
                this.performWidthChange(Math.ceil(deltaWidth/2), false, false);
                this.changeHeight(deltaHeight, true);
                break;
            case ResizeAnchorMode.TopRight:
                this.performWidthChange(deltaWidth, false, false);
                this.changeHeight(deltaHeight, true);
                break;
            case ResizeAnchorMode.CenterLeft:
                this.performWidthChange(deltaWidth, true, false);
                this.changeHeight(Math.floor(deltaHeight/2), true);
                this.changeHeight(Math.ceil(deltaHeight/2), false);
                break;
            case ResizeAnchorMode.Center:
                this.performWidthChange(Math.floor(deltaWidth/2), true, false);
                this.performWidthChange(Math.ceil(deltaWidth/2), false, false);
                this.changeHeight(Math.floor(deltaHeight/2), true);
                this.changeHeight(Math.ceil(deltaHeight/2), false);
                break;
            case ResizeAnchorMode.CenterRight:
                this.performWidthChange(deltaWidth, false, false);
                this.changeHeight(Math.floor(deltaHeight/2), true);
                this.changeHeight(Math.ceil(deltaHeight/2), false);
                break;
            case ResizeAnchorMode.BottomLeft:
                this.performWidthChange(deltaWidth, true, false);
                this.changeHeight(deltaHeight, false);
                break;
            case ResizeAnchorMode.BottomMiddle:
                this.performWidthChange(Math.floor(deltaWidth/2), true, false);
                this.performWidthChange(Math.ceil(deltaWidth/2), false, false);
                this.changeHeight(deltaHeight, false);
                break;
            case ResizeAnchorMode.BottomRight:
                this.performWidthChange(deltaWidth, false, false);
                this.changeHeight(deltaHeight, false);
                break;
        }

        this.width += deltaWidth; // this is a "display only" property, and isn't affected by underlying calculations
        this.positionCells();
    }
    private changeHeight(delta: number, topEdgeFixed: boolean) {
        let increment = delta > 0 ? 1 : -1;
        let increasing = delta > 0 ? 1 : 0;

        for (let i = 0; i != delta; i += increment) {
            if ((this.height + increasing) % 2 == 0)
                this.performWidthChange(increment, !topEdgeFixed, true);
            this.performHeightChange(increment, topEdgeFixed);
        }
    }
    private performWidthChange(delta: number, leftEdgeFixed: boolean, forHeightChange: boolean) {
        let overallDelta = 0;
        if (delta > 0) {
            for (let row = 0; row < this.height; row++) {
                let rowInsertIndex: number; // this is complicated on account of the "chopping" we did to get square edges
                if (leftEdgeFixed)
                    rowInsertIndex = this.width - Math.floor(row / 2);
                else
                    rowInsertIndex = Math.floor((this.height - row - 1) / 2);

                let rowStart = row * this.width;
                let insertPos = rowStart + rowInsertIndex + overallDelta;

                for (let i = 0; i < delta; i++)
                    this.cells.splice(insertPos, 0, new MapCell(this, CellType.empty));

                overallDelta += delta;
            }
        }
        else if (delta < 0) {
            for (let row = 0; row < this.height; row++) {
                let rowChopPos;
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

                let rowStart = row * this.width;
                let chopPos = rowStart + rowChopPos + overallDelta;
                this.cells.splice(chopPos, -delta);
                overallDelta += delta;
            }
        }

        this.width += delta;
    }
    private performHeightChange(delta: number, topEdgeFixed: boolean) {
        if (delta > 0) {
            let diff = delta * this.width;
            for (let i = 0; i < diff; i++) {
                if (this.cells.length + 1 > this.width * this.height)
                    this.height++;

                this.cells.splice(topEdgeFixed ? this.cells.length : 0, 0, new MapCell(this, CellType.empty));
            }
        }
        else if (delta < 0) {
            let diff = -delta * this.width;
            this.height += delta;
            this.cells.splice(topEdgeFixed ? this.cells.length - diff : 0, diff);
        }
    }
    replaceCellType(find: CellType, replace: CellType) {
        for (let cell of this.cells)
            if (cell !== null && cell.cellType === find)
                cell.cellType = replace;
    }
    replaceLocationType(find: LocationType, replace: LocationType) {
        for (let loc of this.locations)
            if (loc !== null && loc.type === find)
                loc.type = replace;
    }
    replaceLineType(find: LineType, replace: LineType) {
        for (let loc of this.lines)
            if (loc !== null && loc.type === find)
                loc.type = replace;
    }
    saveToJSON() {
        for (let cell of this.cells)
            if (cell !== null)
                (cell as any).typeID = this.cellTypes.indexOf(cell.cellType);

        for (let location of this.locations) {
            (location as any).typeID = this.locationTypes.indexOf(location.type);
            (location as any).cellID = this.cells.indexOf(location.cell);
        }

        let that = this;
        for (let line of this.lines) {
            (line as any).typeID = this.lineTypes.indexOf(line.type);
            (line as any).cellIDs = line.keyCells.map(function(cell: MapCell, id: number) {
                return that.cells.indexOf(cell);
            });
        }

        let map = this;
        let json = JSON.stringify(this, function (key, value) {
            if (key == 'row' || key == 'col' || key == 'xPos' || key == 'yPos'
                || key == 'minX' || key == 'maxX' || key == 'minY' || key == 'maxY'
                || key == 'map' || key == 'cellType' || key == 'cell' || key == 'keyCells'
                || key == 'type' || key == 'renderPoints' || key == 'isLoop')
                return undefined;
            return value;
        });

        return json;
    }
    static loadFromJSON(json: string) {
        let data: {
            width: number;
            height: number;
            name: string;
            description: string;
            cellTypes: {name: string, color: string}[];
            cells: {typeID: number}[];
            locationTypes: {name: string, textSize: number, textColor: string, icon: string, minDrawCellRadius?: number}[];
            locations: {cellID: number, typeID: number, name: string}[];
            lineTypes: {name: string, color: string, width: number, startWidth: number, endWidth: number, curviture: number}[];
            lines: {typeID: number, cellIDs: number[]}[];
        } = JSON.parse(json);

        let map = new MapData(data.width, data.height, false);
        map.name = data.name;
        map.description = data.description;

        if (data.cellTypes !== undefined)
            map.cellTypes = data.cellTypes.map(function (type) {
                return new CellType(type.name, type.color);
            });

        if (data.cells !== undefined)
            map.cells = data.cells.map(function (cell) {
                let cellType = map.cellTypes[cell.typeID];
                return new MapCell(map, cellType);
            });

        if (data.locationTypes !== undefined)
            map.locationTypes = data.locationTypes.map(function (type) {
                return new LocationType(type.name, type.textSize, type.textColor, type.icon, type.minDrawCellRadius);
            });

        if (data.locations !== undefined)
            for (let location of data.locations) {
                let locationType = map.locationTypes[location.typeID];
                let cell = map.cells[location.cellID];
                if (cell !== null)
                    map.locations.push(new MapLocation(cell, location.name, locationType));
            }

        if (data.lineTypes !== undefined)
            map.lineTypes = data.lineTypes.map(function (type) {
                return new LineType(type.name, type.color, type.width, type.startWidth, type.endWidth, type.curviture);
            });

        if (data.lines !== undefined)
            for (let line of data.lines) {
                let mapLine = new MapLine(map.lineTypes[line.typeID])
                for (let cellID of line.cellIDs) {
                    let cell = map.cells[cellID];
                    if (cell !== null)
                        mapLine.keyCells.push(cell);
                }

                map.lines.push(mapLine);
            }

        map.positionCells();
        return map;
    }
}