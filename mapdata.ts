class CellType {
    constructor(public name: string, public color: string) {
    }

    public static empty = new CellType('Empty', '#fff');
}

class MapCell {
    row: number;
    col: number;
    xPos: number;
    yPos: number;
    selected: boolean;
    typeID: number;
    constructor(readonly map: MapData, public cellType: CellType) {
        this.selected = false;
    }
}
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
type PossibleMapCell = MapCell | undefined;

class MapData {
    name: string;
    description: string;
    private underlyingWidth: number;
    width: number;
    height: number;
    cellTypes: CellType[];
    cells: PossibleMapCell[];
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;

    constructor(width: number, height: number, createCells: boolean = true) {
        this.underlyingWidth = width + Math.floor(height / 2) - 1;
        this.width = width;
        this.height = height;
        this.cells = new Array<MapCell>(this.underlyingWidth * this.height);
        this.cellTypes = [];
        this.name = '';
        this.description = '';

        if (createCells !== false) {
            for (let i = 0; i < this.cells.length; i++)
                if (this.shouldIndexHaveCell(i))
                    this.cells[i] = new MapCell(this, CellType.empty);

            this.cellTypes.push(new CellType('red', '#ff0000'));
            this.cellTypes.push(new CellType('green', '#00cc00'));
            this.cellTypes.push(new CellType('blue', '#0099ff'));

            this.positionCells();
        }
    }
    private positionCells() {
        let packedWidthRatio = 1.7320508075688772, packedHeightRatio = 1.5;
        let minX = Number.MAX_VALUE, minY = Number.MAX_VALUE;
        let maxX = Number.MIN_VALUE, maxY = Number.MIN_VALUE;

        for (let i = 0; i < this.cells.length; i++) {
            let cell = this.cells[i];
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

        this.minX = minX - 1; this.minY = minY - 1;
        this.maxX = maxX + 1; this.maxY = maxY + 1;

        for (let cell of this.cells) {
            if (cell == null)
                continue;

            cell.xPos -= minX;
            cell.yPos -= minY;
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
    getCellIndex(row: number, col: number) {
        return col + row * this.underlyingWidth;
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
                    this.cells.splice(insertPos, 0, forHeightChange ? undefined : new MapCell(this, CellType.empty));

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
                this.cells.splice(topEdgeFixed ? this.cells.length : 0, 0, this.shouldIndexHaveCell(globalIndex) ? new MapCell(this, CellType.empty) : undefined);
            }
        }
        else if (delta < 0) {
            let diff = -delta * this.underlyingWidth;
            this.height += delta;
            this.cells.splice(topEdgeFixed ? this.cells.length - diff : 0, diff);
        }
    }
    saveToJSON() {
        this.setCellTypeIndexes();

        let json = JSON.stringify(this, function (key, value) {
            if (key == 'row' || key == 'col' || key == 'xPos' || key == 'yPos'
                || key == 'minX' || key == 'maxX' || key == 'minY' || key == 'maxY'
                || key == 'map' || key == 'cellType' || key == 'selected')
                return undefined;
            return value;
        }, '	');

        return json;
    }
    private setCellTypeIndexes() {
        for (let cell of this.cells)
            if (cell !== undefined)
                cell.typeID = this.cellTypes.indexOf(cell.cellType);
    }
    private setCellTypesFromIndexes() {
        for (let cell of this.cells)
            if (cell !== undefined)
                cell.cellType = this.cellTypes[cell.typeID];
    }
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
    static loadFromJSON(json: any) {
        let map = new MapData(json.width, json.height, false);
        map.name = json.name;
        map.description = json.description;

        map.cells = json.cells.map(function (cell: {type: CellType}) {
            if (cell == null)
                return null;
            return new MapCell(map, cell.type);
        });

        map.positionCells();

        map.cellTypes = json.cellTypes.map(function (type: {name: string, color: string}) {
            return new CellType(type.name, type.color);
        });

        map.setCellTypesFromIndexes();

        return map;
    }
}