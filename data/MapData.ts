type PossibleMapCell = MapCell | null;

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
        this.cellTypes = [CellType.empty];
        this.name = '';
        this.description = '';

        if (createCells !== false) {
            for (let i = 0; i < this.cells.length; i++)
                this.cells[i] = this.shouldIndexHaveCell(i) ? new MapCell(this, CellType.empty) : null;

            this.cellTypes.push(new CellType('Water', '#179ce6'));
            this.cellTypes.push(new CellType('Grass', '#a1e94d'));
            this.cellTypes.push(new CellType('Forest', '#189b11'));
            this.cellTypes.push(new CellType('Hills', '#7bac46'));
            this.cellTypes.push(new CellType('Mountains', '#7c7c4b'));
            this.cellTypes.push(new CellType('Desert', '#ebd178'));

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
    saveToJSON() {
        for (let cell of this.cells)
            if (cell !== null)
                cell.typeID = this.cellTypes.indexOf(cell.cellType);

        let json = JSON.stringify(this, function (key, value) {
            if (key == 'row' || key == 'col' || key == 'xPos' || key == 'yPos'
                || key == 'minX' || key == 'maxX' || key == 'minY' || key == 'maxY'
                || key == 'map' || key == 'cellType' || key == 'selected' || key == 'underlyingWidth')
                return undefined;
            return value;
        }, '	');

        return json;
    }
    static loadFromJSON(json: string) {
        let data: any = JSON.parse(json);
        let map = new MapData(data.width, data.height, false);
        map.name = data.name;
        map.description = data.description;

        map.cellTypes = data.cellTypes.map(function (type: {name: string, color: string}) {
            return new CellType(type.name, type.color);
        });

        map.cells = data.cells.map(function (cell: {typeID: number}) {
            if (cell == null)
                return null;

            let cellType = map.cellTypes[cell.typeID];
            return new MapCell(map, cellType);
        });

        map.positionCells();

        return map;
    }
}