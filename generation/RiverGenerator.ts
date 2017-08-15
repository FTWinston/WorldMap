class RiverGenerator {
    public static generate(map: MapData, settings: GenerationSettings) {
        // create river lines and allow them to erode the map.
        for (let lineType of map.lineTypes) {
            if (lineType.positionMode !== LinePositionMode.HighToLow)
                continue;

            RiverGenerator.generateLines(map, lineType);
        }
    }

    private static generateLines(map: MapData, lineType: LineType) {
        let lines = [];
        const onePerNCells = 80; // TODO: Make this configurable, ideally in generation settings.
        let numLines = Math.round(map.width * map.height / onePerNCells);

        for (let iLine = 0; iLine<numLines; iLine++) {
            let cells = RiverGenerator.pickHighToLowLineCells(map, lineType, lines);

            if (cells.length <= 1)
                continue;

            let line = new MapLine(lineType);
            line.keyCells = cells;
            lines.push(line);
        }

        for (let line of lines) {
            MapGenerator.removeSuperfluousLineCells(line.keyCells);
            MapGenerator.renderAndErodeLine(map, line);
            map.lines.push(line);
        }
    }

    private static pickHighToLowLineCells(map: MapData, lineType: LineType, otherLines: MapLine[]) {
        // start with a random cell
        let genStartCell = map.getRandomCell(!lineType.canErodeBelowSeaLevel);
        if (genStartCell === undefined)
            return [];

        let highestCell = genStartCell;
        let lowestCell = genStartCell;
        let cells = [genStartCell];

        // "flow" downwards through adjacent cells until we reach a "lowest" point or go below sea level
        while (true) {
            let testCells = map.getCellsInRange(lowestCell, 1);
            let testCell = MapGenerator.pickLowestCell(testCells);
            if (testCell === lowestCell) {
                if (testCell.height < 0)
                    break; // if under the sea, stop rather than eroding a valley

                // erode a valley
                let dipCell = testCell;
                cells.push(dipCell);
                
                // if this line came in, don't go out that way
                if (cells.length > 2)
                    testCells.slice(testCells.indexOf(cells[cells.length - 2]), 1);

                // find the next lowest cell, and "erode" it down so that we can flow there
                testCells.slice(testCells.indexOf(dipCell), 1);
                testCell = MapGenerator.pickLowestCell(testCells);
                testCell.height = dipCell.height - 0.01; // this can sink to below level and form a lake. that's not really how i wanted them to form...
            }

            cells.push(testCell);
            lowestCell = testCell;

            if (!lineType.canErodeBelowSeaLevel && lowestCell.height < 0)
                break; // some line types (rivers!) don't want us to keep eroding once we reach the seabed
        }

        // also "flow" upwards until we reach a highest point
        // TODO: upward flow should stop if an existing river is reached, to prevent rivers from "branching" implausibly
        while (true) {
            let testCell = MapGenerator.pickHighestCell(map.getCellsInRange(highestCell, 1));
            if (testCell === highestCell)
                break;

            cells.unshift(testCell);
            highestCell = testCell;
        }

        // remove cells from the start until it doesn't touch any other river
        for (let other of otherLines) {
            let removedOnThisPass;
            do {
                let start = cells[0];
                removedOnThisPass = false;
                for (let cell of other.keyCells)
                    if (cell == start) {
                        cells.shift();
                        removedOnThisPass = true;
                        break;
                    }
            } while (removedOnThisPass);
        }

        return cells;
    }
}