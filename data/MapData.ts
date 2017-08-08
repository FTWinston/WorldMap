type PossibleMapCell = MapCell | null;

class MapData {
    name: string;
    description: string;
    private underlyingWidth: number;
    width: number;
    height: number;
    cellTypes: CellType[];
    cells: PossibleMapCell[];
    locationTypes: LocationType[];
    locations: MapLocation[];
    lineTypes: LineType[];
    lines: MapLine[];

    constructor(width: number, height: number, createCells: boolean = true) {
        this.underlyingWidth = width + Math.floor(height / 2) - 1;
        this.width = width;
        this.height = height;
        this.cells = new Array<MapCell>(this.underlyingWidth * this.height);
        this.cellTypes = [CellType.empty];
        this.name = '';
        this.description = '';
        this.locationTypes = [];
        this.locations = [];
        this.lineTypes = [];
        this.lines = [];

        if (createCells !== false) {
            for (let i = 0; i < this.cells.length; i++)
                this.cells[i] = this.shouldIndexHaveCell(i) ? new MapCell(this, CellType.empty) : null;

            CellType.createDefaults(this.cellTypes);
            LocationType.createDefaults(this.locationTypes);
            LineType.createDefaults(this.lineTypes);

            this.positionCells();
        }
    }

    static readonly packedWidthRatio = 1.7320508075688772; // Math.sqrt(3);
    static readonly packedHeightRatio = 1.5;

    minX: number;
    private positionCells() {
        this.minX = MapData.packedWidthRatio * (this.height/2 - 1);

        for (let i = 0; i < this.cells.length; i++) {
            let cell = this.cells[i];
            if (cell == null)
                continue;

            cell.row = Math.floor(i / this.underlyingWidth);
            cell.col = i % this.underlyingWidth;
            cell.xPos = MapData.packedWidthRatio * (cell.col + cell.row / 2) - this.minX;
            cell.yPos = MapData.packedHeightRatio * cell.row;
        }
    }
    private shouldIndexHaveCell(index: number) {
        let row = Math.floor(index / this.underlyingWidth);
        let col = index % this.underlyingWidth;
        if (2 * col + row < this.height - 2)
            return false; // chop left to get square edge
        if (row + 2 * col > 2 * this.underlyingWidth - 1)
            return false; // chop right to get square edge
        return true;
    }
    private getCellIndex(row: number, col: number) {
        return col + row * this.underlyingWidth;
    }
    getRandomCell(aboveSeaLevel: boolean, attempts: number = 100) {
        do {
            let index = Random.randomIntRange(0, this.cells.length);
            let cell = this.cells[index];

            if (cell !== null) {
                if (!aboveSeaLevel || cell.height > 0)
                    return cell;
            }
        } while (--attempts > 0);

        return undefined;
    }
    getCellIndexAtPoint(mapX: number, mapY: number) {
        let fCol = (mapX * Math.sqrt(3) - mapY) / 3;
        let fRow = mapY * 2 / 3;
        let fThirdCoord = - fCol - fRow;

        let rCol = Math.round(fCol);
        let rRow = Math.round(fRow);
        let rThird = Math.round(fThirdCoord);

        let colDiff = Math.abs(rCol - fCol);
        let rowDiff = Math.abs(rRow - fRow);
        let thirdDiff = Math.abs(rThird - fThirdCoord);

        if (colDiff >= rowDiff) {
            if (colDiff >= thirdDiff)
                rCol = - rRow - rThird;
        }
        else if (rowDiff >= colDiff && rowDiff >= thirdDiff)
            rRow = - rCol - rThird;

        return this.getCellIndex(rRow, rCol);
    }
    getNeighbours(cell: MapCell) {
        let neighbours = [];
        for (let offset of MapCell.orthogonalDirections) {
            let row = cell.row + offset.dRow;
            let col = cell.col + offset.dCol;

            if (row >= 0 && row < this.height && col >= 0 && col <= this.underlyingWidth) {
                let cell = this.cells[this.getCellIndex(row, col)];
                if (cell !== null)
                    neighbours.push(cell);
            }
        }
        return neighbours;
    }
    getCellsInRange(center: MapCell, distance: number) {
        let results: MapCell[] = [];

        let minDc = -distance,
            maxDc = +distance;
    
        for (let dc = minDc; dc <= maxDc; dc++) {
            let col = center.col + dc;
            
            if (col < 0 || col >= this.underlyingWidth)
                continue; // out of bounds
            
            let minRow = Math.max(0, center.row + Math.max(-distance, -dc - distance)),
                maxRow = Math.min(this.height - 1, center.row + Math.min(+distance, -dc + distance));
            
            for (let row = minRow; row <= maxRow; row++) {
                let index = this.getCellIndex(row, col);
                let cell = this.cells[index];
                if (cell !== null)
                    results.push(cell);
            }
        }
        return results;
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
                    rowInsertIndex = this.underlyingWidth - Math.floor(row / 2);
                else
                    rowInsertIndex = Math.floor((this.height - row - 1) / 2);

                let rowStart = row * this.underlyingWidth;
                let insertPos = rowStart + rowInsertIndex + overallDelta;

                for (let i = 0; i < delta; i++)
                    this.cells.splice(insertPos, 0, forHeightChange ? null : new MapCell(this, CellType.empty));

                overallDelta += delta;
            }
        }
        else if (delta < 0) {
            for (let row = 0; row < this.height; row++) {
                let rowChopPos;
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

                let rowStart = row * this.underlyingWidth;
                let chopPos = rowStart + rowChopPos + overallDelta;
                this.cells.splice(chopPos, -delta);
                overallDelta += delta;
            }
        }

        this.underlyingWidth += delta;
    }
    private performHeightChange(delta: number, topEdgeFixed: boolean) {
        if (delta > 0) {
            let diff = delta * this.underlyingWidth;
            for (let i = 0; i < diff; i++) {
                if (this.cells.length + 1 > this.underlyingWidth * this.height)
                    this.height++;

                let globalIndex = topEdgeFixed ? this.cells.length : diff - i - 1;
                this.cells.splice(topEdgeFixed ? this.cells.length : 0, 0, this.shouldIndexHaveCell(globalIndex) ? new MapCell(this, CellType.empty) : null);
            }
        }
        else if (delta < 0) {
            let diff = -delta * this.underlyingWidth;
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
                || key == 'map' || key == 'cellType' || key == 'underlyingWidth' || key == 'cell'
                || key == 'keyCells' || key == 'type' || key == 'renderPoints' || key == 'isLoop'
                || key == 'textureCanvas' || key == 'texturePattern')
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
            cellTypes: {name: string, color: string,
                genHeight?: number, genTemperature?: number, genPrecipitation?: number,
                noiseScale?: number, noiseIntensity?: number, noiseDensity?: number,
                detail?: string, detailColor?: string, detailNumberPerCell?: number, detailSize?: number
            }[];
            cells: {typeID: number}[];
            locationTypes: {
                name: string, textSize: number, textColor: string, icon: string,
                minDistanceToOther: number, minDrawCellRadius?: number
            }[];
            locations: {cellID: number, typeID: number, name: string}[];
            lineTypes: {
                name: string, color: string, width: number, startWidth: number, endWidth: number, curviture: number,
                erosionAmount: number, adjacentErosionDistance: number, canErodeToSeaLevel: boolean, positionMode: number
            }[];
            lines: {typeID: number, cellIDs: number[]}[];
        } = JSON.parse(json);

        let map = new MapData(data.width, data.height, false);
        map.name = data.name;
        map.description = data.description;

        if (data.cellTypes !== undefined)
            map.cellTypes = data.cellTypes.map(function (type) {
                let genHeight = type.genHeight === undefined ? 0.5 : type.genHeight;
                let genTemperature = type.genTemperature === undefined ? 0.5 : type.genTemperature;
                let genPrecipitation = type.genPrecipitation === undefined ? 0.5 : type.genPrecipitation;
                let noiseScale = type.noiseScale === undefined ? 1 : type.noiseScale;
                let noiseIntensity = type.noiseIntensity === undefined ? 0 : type.noiseIntensity;
                let noiseDensity = type.noiseDensity === undefined ? 0 : type.noiseDensity;

                return new CellType(type.name, type.color,
                    genHeight, genTemperature, genPrecipitation,
                    noiseScale, noiseIntensity, noiseDensity,
                    type.detail, type.detailColor, type.detailNumberPerCell, type.detailSize
                );
            });

        if (data.cells !== undefined)
            map.cells = data.cells.map(function (cell) {
                if (cell == null)
                    return null;

                let cellType = map.cellTypes[cell.typeID == -1 ? 0 : cell.typeID];
                return new MapCell(map, cellType);
            });

        if (data.locationTypes !== undefined)
            map.locationTypes = data.locationTypes.map(function (type) {
                return new LocationType(type.name, type.textSize, type.textColor, type.icon, type.minDistanceToOther, type.minDrawCellRadius);
            });

        if (data.locations !== undefined)
            for (let location of data.locations) {
                let type = map.locationTypes[location.typeID == -1 ? 0 : location.typeID];
                let cell = map.cells[location.cellID];
                if (cell !== null)
                    map.locations.push(new MapLocation(cell, location.name, type));
            }

        if (data.lineTypes !== undefined)
            map.lineTypes = data.lineTypes.map(function (type) {
                return new LineType(
                    type.name, type.color, type.width, type.startWidth, type.endWidth, type.curviture,
                    type.erosionAmount, type.adjacentErosionDistance, type.canErodeToSeaLevel, type.positionMode
                );
            });

        map.positionCells();

        if (data.lines !== undefined)
            for (let line of data.lines) {
                let type = map.lineTypes[line.typeID === -1 ? 0 : line.typeID];
                let mapLine = new MapLine(type);
                for (let cellID of line.cellIDs) {
                    let cell = map.cells[cellID];
                    if (cell !== null)
                        mapLine.keyCells.push(cell);
                }

                mapLine.updateRenderPoints();
                map.lines.push(mapLine);
            }

        return map;
    }
}