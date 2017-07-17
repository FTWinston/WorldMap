class LineType {
    constructor(
        public name: string,
        public color: string,
        public width: number,
        public startWidth: number,
        public endWidth: number,
        public curviture: number,
    ) {}

    static createDefaults(types: LineType[]) {
        types.push(new LineType('River', '#179ce6', 6, 0, 9, 1));
        types.push(new LineType('Road', '#bbad65', 4, 4, 4, 0.5));
    }
}

class MapLine {
    readonly keyCells: MapCell[];
    renderPoints: number[];
    isLoop: boolean;

    constructor(public type: LineType) {
        this.keyCells = [];
        this.isLoop = false;
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
}