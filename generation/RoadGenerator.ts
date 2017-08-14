class RoadGenerator {
    public static generate(map: MapData, settings: GenerationSettings) {
        // create roads, only once locations are in place
        for (let lineType of map.lineTypes) {
            if (lineType.positionMode !== LinePositionMode.BetweenLocations)
                continue;

            RoadGenerator.generateLinesBetweenLocations(map, lineType);
        }
    }

    private static generateLinesBetweenLocations(map: MapData, lineType: LineType) {
        let locationGroups = RoadGenerator.groupConnectableLocations(map, map.locations);
        
        for (let group of locationGroups) {
            RoadGenerator.generateLinesForLocationGroup(map, group, lineType);
        }
    }

    private static groupConnectableLocations(map: MapData, locations: MapLocation[]) {
        let groups: Array<MapLocation>[] = [];

        for (let location of locations.slice()) {
            let foundGroup = false;
            for (let testGroup of groups) {
                let firstInGroup = testGroup[0];
                if (RoadGenerator.getConnectionPaths(map, location.cell, [firstInGroup.cell]).length !== 0) {
                    testGroup.push(location);
                    foundGroup = true;
                    break;
                }
            }

            if (!foundGroup)
                groups.push([location]);
        }

        return groups;
    }

    private static getConnectionPaths(map: MapData, from: MapCell, to: MapCell[]) {
        let results: MapCell[][] = [];

        let colMul = map.height;
        let visited: {[key:number]:boolean} = {};
        visited[from.row + from.col * colMul] = true;
        
        let prevFringe = [[from]];
        let nextFringe: MapCell[][] = [];

        do {
            for (let fringePath of prevFringe) {
                let fringeCell = fringePath[fringePath.length - 1];
                for (let testCell of map.getNeighbours(fringeCell)) {
                    let testIndex = testCell.row + testCell.col * colMul;
                    if (visited[testIndex] === true)
                        continue;

                    let path = fringePath.slice();
                    path.push(testCell);

                    for (let i=0; i<to.length; i++)
                        if (testCell === to[i]) {
                            results.push(path);

                            if (to.length === 1)
                                return results; // if this was the last remaining cell, return early

                            to.splice(i, 1);
                            break;
                        }

                    visited[testIndex] = true;

                    if (testCell.height > 0 && testCell.height < 0.75) // TODO: these height limits should probably come from line type
                        nextFringe.push(path);
                }
            }

            prevFringe = nextFringe;
            nextFringe = [];
        } while (prevFringe.length > 0);

        return results;
    }

    private static generateLinesForLocationGroup(map: MapData, locations: MapLocation[], lineType: LineType) {
        // connect every pair of locations in the group for which there isn't another location closer to both of them
        let groupLines = [];

        // calculate the distance between each pair once
        let locCells: MapCell[] = [];
        for (let i=0; i<locations.length; i++)
            locCells[i] = locations[i].cell;
        let pathCache: {[key:number]:{[key:number]:MapCell[]}} = {};
        for (let i=0; i<locations.length; i++) {
            let paths = RoadGenerator.getConnectionPaths(map, locCells[i], locCells.slice(i + 1));

            let cacheEntry: {[key:number]:MapCell[]} = {};
            for (let path of paths) {
                let endCell = path[path.length - 1];
                let index = locCells.indexOf(endCell);
                cacheEntry[index] = path;
            }

            pathCache[i] = cacheEntry;
        }
        for (let i=0; i<locations.length; i++)
            for (let j=0; j<i; j++)
                pathCache[i][j] = pathCache[j][i];

        // TODO: use a better algorithm for calculating this relative neighbourhood graph ... which this is, even though we don't actually keep it
        for (let i=0; i<locations.length; i++) {
            for (let j=i+1; j<locations.length; j++) {
                let path = pathCache[i][j];
                if (path === null)
                    continue;

                let anyCloser = false;

                for (let k=0; k<locations.length; k++) {
                    if (k === i || k === j)
                        continue;
                    
                    let dist1 = pathCache[i][k];
                    let dist2 = pathCache[j][k];

                    if (dist1 === null || dist2 === null)
                        continue;

                    if (dist1.length < path.length && dist2.length < path.length) {
                        anyCloser = true;
                        break;
                    }
                }

                if (!anyCloser) {
                    let line = new MapLine(lineType);
                    line.keyCells = path;
                    groupLines.push(line);
                }
            }
        }

        // for each line, remove any overlap with another by removing "overlapping" key cells
        RoadGenerator.removeOverlap(groupLines);

        // where exactly two lines end on the same cell, combine them into one line
        RoadGenerator.combineLines(groupLines);

        for (let line of groupLines) {
            RoadGenerator.removeSuperfluousLineCells(line.keyCells, groupLines);
            MapGenerator.renderAndErodeLine(map, line);
            map.lines.push(line);
        }
    }

    private static removeOverlap(lines: MapLine[]) {
        for (let line of lines) {
            // find all lines that share a terminus with this line.
            let startLines = [], endLines = [];
            let firstCell = line.keyCells[0], lastCell = line.keyCells[line.keyCells.length - 1];
            for (let otherLine of lines) {
                if (otherLine === line)
                    continue;
                
                let otherFirst = otherLine.keyCells[0], otherLast = otherLine.keyCells[otherLine.keyCells.length - 1];
                if (otherFirst === firstCell || otherLast === firstCell)
                    startLines.push(otherLine);
                if (otherFirst === lastCell || otherLast === lastCell)
                    endLines.push(otherLine);
            }

            // remove key cells from the start of this line until only the "first" remaining key cell touches any of startLines
            while (line.keyCells.length > 1) {
                firstCell = line.keyCells[1];
                
                let anyTouching = false;
                for (let otherLine of startLines)
                    for (let cell of otherLine.keyCells)
                        if (cell === firstCell) {
                            anyTouching = true;
                            break;
                        }

                if (!anyTouching)
                    break;
                
                line.keyCells.shift();
            }

            // remove key cells from the end of this line until only the "last" remaining key cell touches any of endLines
            while (line.keyCells.length > 1) {
                lastCell = line.keyCells[line.keyCells.length - 2];
                
                let anyTouching = false;
                for (let otherLine of endLines)
                    for (let cell of otherLine.keyCells)
                        if (cell === lastCell) {
                            anyTouching = true;
                            break;
                        }

                if (!anyTouching)
                    break;
                
                line.keyCells.pop();
            }
        }
    }

    private static combineLines(lines: MapLine[]) {
        for (let i=0; i<lines.length; i++) {
            let line = lines[i];
            let start = line.getStartCell(), end = line.getEndCell();
            let hasMerged = false;
            let startLines: [MapLine, boolean, number][] = [];
            let endLines: [MapLine, boolean, number][] = [];

            for (let j=0; j<lines.length; j++) {
                if (j == i)
                    continue;
                let other = lines[j];
                let otherStart = other.getStartCell();
                let otherEnd = other.getEndCell();

                if (otherStart == end)
                    endLines.push([other, false, j]);
                else if (otherEnd == end)
                    endLines.push([other, true, j]);

                if (otherStart == start)
                    startLines.push([other, false, j]);
                else if (otherEnd == start)
                    startLines.push([other, true, j]);
            }

            // if there is exactly one line with an end on this line's start point
            let removedIndex;
            if (startLines.length == 1) {
                let info = startLines[0];
                let cells = info[0].keyCells;
                if (info[1])
                    cells = cells.reverse();

                for (let cell of cells)
                    line.keyCells.unshift(cell);

                removedIndex = info[2];
                lines.splice(removedIndex, 1);
                hasMerged = true;
            }
            else
                removedIndex = Number.MAX_VALUE;

            // if there is exactly one line with an end on this line's end point
            if (endLines.length == 1) {
                let info = endLines[0];
                let cells = info[0].keyCells;
                if (info[1])
                    cells = cells.reverse();

                for (let cell of cells)
                    line.keyCells.push(cell);

                let indexToRemove = info[2];
                if (indexToRemove > removedIndex)
                    indexToRemove --; // ensure we remove the right line if another has already been removed

                lines.splice(indexToRemove, 1);
                hasMerged = true;
            }

            if (hasMerged)
                i--; // if this line has new ends, they still need tested
        }
    }

    private static removeSuperfluousLineCells(cells: MapCell[], linesToKeepJunctionsWith: MapLine[] = []) {
        if (cells.length <= 3)
            return;

        let first = cells[0];
        let last = cells[cells.length - 1];

        let canRemove = false;
        for (let i=1; i<cells.length - 1; i++) {
            canRemove = !canRemove;
            if (!canRemove)
                continue; // keep alternate cells
            
            // don't remove a key cell if another line ends there
            let cell = cells[i];
            for (let line of linesToKeepJunctionsWith)
                if (line.keyCells === cells)
                    continue;
                else if (cell == line.getStartCell() || cell == line.getEndCell()) {
                    canRemove = false;
                    break;
                }

            if (canRemove) {
                cells.splice(i, 1);
                i--;
            }
        }
    }
}