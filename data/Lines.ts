const enum LinePositionMode {
    Random,
    HighToLow,
    BetweenLocations,
}


class LineType {
    constructor(
        public name: string,
        public color: string,
        public width: number,
        public startWidth: number,
        public endWidth: number,
        public curviture: number,

        public erosionAmount: number,
        public adjacentErosionDistance: number,
        public canErodeBelowSeaLevel: boolean,
        public positionMode: LinePositionMode,
    ) {}

    static createDefaults(types: LineType[]) {
        types.push(new LineType('River', '#179ce6', 6, 0, 9, 1, 0.2, 0, false, LinePositionMode.HighToLow));
        types.push(new LineType('Road', '#bbad65', 4, 4, 4, 0.5, 0, 0, false, LinePositionMode.BetweenLocations));
    }
}

class MapLine {
    keyCells: MapCell[];
    renderPoints: number[];
    isLoop: boolean;

    constructor(public type: LineType) {
        this.keyCells = [];
        this.isLoop = false;
    }

    draw(ctx: CanvasRenderingContext2D, cellRadius: number, highlightKeyCells: boolean) {
        let type = this.type;

        if (highlightKeyCells) {
            ctx.strokeStyle = '#ff0000';
            ctx.lineWidth = 2;

            for (let cell of this.keyCells) {
                ctx.beginPath();
                ctx.arc(cell.xPos * cellRadius + cellRadius, cell.yPos * cellRadius + cellRadius, cellRadius * 0.65, 0, Math.PI * 2);
                ctx.stroke();
            }
        }

        if (this.keyCells.length == 1) {
            let cell = this.keyCells[0];
            let x = cell.xPos * cellRadius + cellRadius;
            let y = cell.yPos * cellRadius + cellRadius;

            ctx.fillStyle = type.color;
            ctx.beginPath();
            ctx.arc(x, y, type.width / 2, 0, Math.PI * 2);
            ctx.fill();
            return;
        }
        
        let points = this.renderPoints;
        ctx.strokeStyle = type.color;

        let mainWidthStart = this.isLoop || type.width == type.startWidth ? 2 : 16;
        let mainWidthEnd = this.isLoop || type.width == type.endWidth ? points.length - 1 : points.length - 16;
        let x = points[0] * cellRadius + cellRadius;
        let y = points[1] * cellRadius + cellRadius;
        
        ctx.beginPath();
        ctx.moveTo(x, y);
        
        // for the initial line segments, line width changes from startWidth to width
        for (let i=2; i<mainWidthStart; i+=2) {
            ctx.lineCap = 'round';
            let fraction = i / mainWidthStart;
            ctx.lineWidth = type.startWidth * (1-fraction) + type.width * fraction;

            x = points[i] * cellRadius + cellRadius;
            y = points[i+1] * cellRadius + cellRadius;

            ctx.lineTo(x, y);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(x, y);
        }

        ctx.lineCap = this.isLoop ? 'butt' : 'round';

        // for the main segment, its always just width, so can draw them all in a single stroke
        ctx.lineWidth = type.width;
        for (let i = mainWidthStart; i<mainWidthEnd; i+=2) {
            x = points[i] * cellRadius + cellRadius;
            y = points[i+1] * cellRadius + cellRadius;
            ctx.lineTo(x, y);
        }
        ctx.stroke();

        // for the end line segment, line width changes from width to endWidth
        for (let i=mainWidthEnd; i < points.length - 1; i+=2) {
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(x, y);

            let fraction = (points.length - i - 2)  / (points.length - mainWidthEnd);
            ctx.lineWidth = type.endWidth * (1-fraction) + type.width * fraction;
            
            x = points[i] * cellRadius + cellRadius;
            y = points[i+1] * cellRadius + cellRadius;

            ctx.lineTo(x, y);
            ctx.stroke();
        }

        ctx.lineCap = 'butt';
    }

    static getByCell(cell: MapCell, lines: MapLine[]) {
        for (let line of lines)
            for (let testCell of line.keyCells)
                if (testCell == cell)
                    return line;

        return undefined;
    }

    static readonly stepsPerSegment = 16;

    updateRenderPoints() {
        this.renderPoints = [];

        if (this.keyCells.length < 2)
            return;

        let tension = this.type.curviture;
        let pts: number[] = [],
            x: number, y: number,
            t1x: number, t2x: number, t1y: number, t2y: number,
            c1: number, c2: number, c3: number, c4: number,
            fraction: number, step: number, iPt: number

        let firstCell = this.keyCells[0];
        let lastCell = this.keyCells[this.keyCells.length - 1];

        // decide if it's a closed loop, which needs the ends of the array set up differently
        let lastCellIndex: number;
        if (firstCell == lastCell) {
            this.isLoop = true;
            lastCellIndex = this.keyCells.length - 2; // don't copy the last cell, its the same as the first
            lastCell = this.keyCells[lastCellIndex];
        }
        else {
            this.isLoop = false;
            lastCellIndex = this.keyCells.length - 1;
        }
        
        for (let iCell = 0; iCell <= lastCellIndex; iCell++) {
            let cell = this.keyCells[iCell];
            pts.push(cell.xPos, cell.yPos);
        }
        
        if (this.isLoop) {
            // copy last cell onto start, and first cells onto end
            let secondCell = this.keyCells[1];
            pts.push(firstCell.xPos, firstCell.yPos);
            pts.push(secondCell.xPos, secondCell.yPos);
            pts.unshift(lastCell.xPos, lastCell.yPos);
        }
        else {
            // copy first cell onto start, and last cell onto end
            pts.unshift(firstCell.xPos, firstCell.yPos);
            pts.push(lastCell.xPos, lastCell.yPos);
        }

        // loop through key points. Use each set of 4 points p0 p1 p2 p3 to draw segment p1-p2.
        for (iPt=2; iPt < (pts.length - 4); iPt+=2) {
            for (step=0; step <= MapLine.stepsPerSegment; step++) {

                // tension vectors
                t1x = (pts[iPt+2] - pts[iPt-2]) * tension;
                t2x = (pts[iPt+4] - pts[iPt]) * tension;

                t1y = (pts[iPt+3] - pts[iPt-1]) * tension;
                t2y = (pts[iPt+5] - pts[iPt+1]) * tension;

                fraction = step / MapLine.stepsPerSegment;

                // cardinals
                c1 =   2 * Math.pow(fraction, 3)  - 3 * Math.pow(fraction, 2) + 1; 
                c2 = -(2 * Math.pow(fraction, 3)) + 3 * Math.pow(fraction, 2); 
                c3 =       Math.pow(fraction, 3)  - 2 * Math.pow(fraction, 2) + fraction; 
                c4 =       Math.pow(fraction, 3)  -     Math.pow(fraction, 2);

                //x and y coordinates
                x = c1 * pts[iPt]    + c2 * pts[iPt+2] + c3 * t1x + c4 * t2x;
                y = c1 * pts[iPt+1]  + c2 * pts[iPt+3] + c3 * t1y + c4 * t2y;
                this.renderPoints.push(x);
                this.renderPoints.push(y);
            }
        }
    }

    private static dedupe(cells: MapCell[]) {
        return cells.filter(function(cell: MapCell, index: number, cells: MapCell[]) {
            return index == cells.indexOf(cell);
        });
    }

    getErosionAffectedCells(map: MapData) {
        let cells: MapCell[] = [];

        for (let i=1; i<this.renderPoints.length; i+=2) {
            let cellIndex = map.getCellIndexAtPoint(this.renderPoints[i-1], this.renderPoints[i]);
            let cell = map.cells[cellIndex];
            if (cell !== null)
                cells.push(cell);
        }

        // deduplicate the affected cells
        cells = MapLine.dedupe(cells);

        if (this.type.adjacentErosionDistance > 0) {
            let passedThroughCells = cells;
            cells = []; // getCellsInRange always includes the center cell, so no need to ensure they're already present

            for (let cell of passedThroughCells) {
                let adjacent = map.getCellsInRange(cell, this.type.adjacentErosionDistance);
                cells = cells.concat(adjacent);
            }

            cells = MapLine.dedupe(cells);
        }

        return cells;
    }
}