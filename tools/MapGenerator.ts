class MapGenerator {
    public static generate(map: MapData, settings: GenerationSettings) {
        // clear down all lines and locations
        map.lines = [];
        map.locations = [];
        
        // to start with, generate height, temperate and precipitation values for all map cells
        MapGenerator.allocateCellProperties(map, settings);

        // generate mountain ranges, but don't add these to the map. Just use them for (negative) erosion.
        let mountains = new LineType('Mountains', '#000000', 1, 1, 1, 1, -0.4, 1, true, LinePositionMode.Random);
        MapGenerator.generateLines(map, mountains);

        // create river lines and allow them to erode the map.
        for (let lineType of map.lineTypes) {
            if (lineType.positionMode === LinePositionMode.BetweenLocations)
                continue;

            let lines = MapGenerator.generateLines(map, lineType);
            map.lines = map.lines.concat(lines);
        }

        // create locations, which currently all prefer the lowest nearby point
        for (let locationType of map.locationTypes) {
            const onePerNCells = 50; // TODO: to be specified per location type. Make this only consider LAND cells?
            let numLocations = Math.round(map.width * map.height / onePerNCells);
            for (let iLoc = 0; iLoc<numLocations; iLoc++) {
                let loc = MapGenerator.generateLocation(map, locationType);

                if (loc === undefined)
                    continue;

                map.locations.push(loc);
            }
        }
        
        // create roads, only once locations are in place
        for (let lineType of map.lineTypes) {
            if (lineType.positionMode !== LinePositionMode.BetweenLocations)
                continue;

            MapGenerator.generateLinesBetweenLocations(map, lineType);
        }

        // TODO: calculate wind, use that to modify precipitation and temperature

        // finally, allocate types to cells based on their generation properties
        for (let cell of map.cells) {
            if (cell === null)
                continue;

            MapGenerator.updateCellType(cell);
        }
    }

    private static allocateCellProperties(map: MapData, settings: GenerationSettings) {
        let heightGuide = settings.heightGuide;
        let lowFreqHeightNoise = new SimplexNoise();
        let highFreqHeightNoise = new SimplexNoise();

        let temperatureGuide = settings.temperatureGuide;
        let lowFreqTemperatureNoise = new SimplexNoise();
        let highFreqTemperatureNoise = new SimplexNoise();
        
        let precipitationGuide = settings.precipitationGuide;
        let lowFreqPrecipitationNoise = new SimplexNoise();
        let highFreqPrecipitationNoise = new SimplexNoise();

        let heightScaleTot = settings.heightScaleGuide + settings.heightScaleLowFreq + settings.heightScaleHighFreq;
        if (heightScaleTot == 0)
            heightScaleTot = 1;
        let guideHeightScale = settings.heightScaleGuide / heightScaleTot;
        let lowFreqHeightScale = settings.heightScaleLowFreq/ heightScaleTot;
        let highFreqHeightScale = settings.heightScaleHighFreq / heightScaleTot;

        let temperatureScaleTot = settings.temperatureScaleGuide + settings.temperatureScaleLowFreq + settings.temperatureScaleHighFreq;
        if (temperatureScaleTot == 0)
            temperatureScaleTot = 1;
        let guideTemperatureScale = settings.temperatureScaleGuide / temperatureScaleTot;
        let lowFreqTemperatureScale = settings.temperatureScaleLowFreq/ temperatureScaleTot;
        let highFreqTemperatureScale = settings.temperatureScaleHighFreq / temperatureScaleTot;

        let precipitationScaleTot = settings.precipitationScaleGuide + settings.precipitationScaleLowFreq + settings.precipitationScaleHighFreq;
        if (precipitationScaleTot == 0)
            precipitationScaleTot = 1;
        let guidePrecipitationScale = settings.precipitationScaleGuide / precipitationScaleTot;
        let lowFreqPrecipitationScale = settings.precipitationScaleLowFreq/ precipitationScaleTot;
        let highFreqPrecipitationScale = settings.precipitationScaleHighFreq / precipitationScaleTot;

        let maxX = map.width * MapData.packedWidthRatio;
        let maxY = map.height * MapData.packedHeightRatio;

        // allocate height / temperature / precipitation generation properties to each cell
        for (let cell of map.cells) {
            if (cell === null)
                continue;

            cell.height = MapGenerator.determineValue(
                cell.xPos, cell.yPos, maxX, maxY,
                guideHeightScale, lowFreqHeightScale, highFreqHeightScale,
                heightGuide, lowFreqHeightNoise, highFreqHeightNoise,
                settings.minHeight, settings.maxHeight,
            );

            cell.temperature = MapGenerator.determineValue(
                cell.xPos, cell.yPos, maxX, maxY,
                guideTemperatureScale, lowFreqTemperatureScale, highFreqTemperatureScale,
                temperatureGuide, lowFreqTemperatureNoise, highFreqTemperatureNoise,
                settings.minTemperature, settings.maxTemperature,
            );

            cell.precipitation = MapGenerator.determineValue(
                cell.xPos, cell.yPos, maxX, maxY,
                guideTemperatureScale, lowFreqPrecipitationScale, highFreqPrecipitationScale,
                precipitationGuide, lowFreqPrecipitationNoise, highFreqPrecipitationNoise,
                settings.minPrecipitation, settings.maxPrecipitation,
            );

            // don't allocate a cell type right away, as later steps may change these properties
        }
    }
    private static determineValue(x: number, y: number, maxX: number, maxY: number,
        guideScale: number, lowFreqScale: number, highFreqScale: number,
        guide: GenerationGuide, lowFreqNoise: SimplexNoise, highFreqNoise: SimplexNoise,
        minValue: number, maxValue: number,
    ) {
        let value = lowFreqScale * lowFreqNoise.noise(x / 10, y / 10)
                  + highFreqScale * highFreqNoise.noise(x, y)
                  + guideScale * guide.generation(x, y, maxX, maxY);
        let rawRange = lowFreqScale + highFreqScale + guideScale;
        return minValue + (maxValue - minValue) * value / rawRange;
    }

    private static cellTypeLookup: kdTree<CellType, MapCell>;

    static updateCellType(cell: MapCell) {
        let type = cell.height <= 0
            ? CellType.empty
            : MapGenerator.cellTypeLookup.nearest(cell);

        if (type !== undefined)
            cell.cellType = type;
    }

    private static cellTypeDistanceMetric(a: MapCell, b: CellType) {
        let heightDif = (a.height - b.height) * 5;
        let tempDif = a.temperature - b.temperature;
        let precDif = a.precipitation - b.precipitation;

        return Math.sqrt(
            heightDif * heightDif +
            tempDif * tempDif +
            precDif * precDif
        );
    }

    static constructCellTypeLookup(cellTypes: CellType[]) {
        MapGenerator.cellTypeLookup = new kdTree<CellType, MapCell>(cellTypes.slice(), MapGenerator.cellTypeDistanceMetric, ['height', 'temperature', 'precipitation']);
    }

    private static generateLocation(map: MapData, locationType: LocationType) {
        let cell = map.getRandomCell(true);
        if (cell === undefined)
            return undefined;
        
        cell = MapGenerator.pickLowestCell(map.getCellsInRange(cell, 2), true);
        for (let other of map.locations) {
            let minDist = Math.min(locationType.minDistanceToOther, other.type.minDistanceToOther);
            if (cell.distanceTo(other.cell) < minDist)
                return undefined;
        }

        let location = new MapLocation(cell, locationType.name, locationType);
        return location;
    }

    private static generateLines(map: MapData, lineType: LineType) {
        let lines = [];
        const onePerNCells = 80; // TODO: Make this configurable, ideally in generation settings.
        let numLines = Math.round(map.width * map.height / onePerNCells);

        for (let iLine = 0; iLine<numLines; iLine++) {
            let cells: MapCell[];
            switch (lineType.positionMode) {
                case LinePositionMode.Random:
                    cells = MapGenerator.pickRandomLineCells(map, lineType); break;
                case LinePositionMode.HighToLow:
                    cells = MapGenerator.pickHighToLowLineCells(map, lineType, lines); break;
                default:
                    continue;
            }

            if (cells.length <= 1)
                continue;

            let line = new MapLine(lineType);
            line.keyCells = cells;
            lines.push(line);
        }

        for (let line of lines) {
            MapGenerator.removeSuperfluousLineCells(line.keyCells);
            MapGenerator.renderAndErodeLine(map, line);
        }
        return lines;
    }

    private static generateLinesBetweenLocations(map: MapData, lineType: LineType) {
        let locationGroups = MapGenerator.groupConnectableLocations(map, map.locations);
        
        for (let group of locationGroups) {
            MapGenerator.generateLinesForLocationGroup(map, group, lineType);
        }
    }

    private static groupConnectableLocations(map: MapData, locations: MapLocation[]) {
        let groups: Array<MapLocation>[] = [];

        for (let location of locations.slice()) {
            let foundGroup = false;
            for (let testGroup of groups) {
                let firstInGroup = testGroup[0];
                if (MapGenerator.getConnectionPath(map, location.cell, firstInGroup.cell) !== null) {
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

    private static getConnectionPath(map: MapData, from: MapCell, to: MapCell) {
        let colMul = map.height;
        let visited: {[key:number]:boolean} = {};
        visited[from.row + from.col * colMul] = true;
        
        let prevFringe = [[from]];
        let nextFringe: MapCell[][] = [];

        while (prevFringe.length > 0) {
            for (let fringePath of prevFringe) {
                let fringeCell = fringePath[fringePath.length - 1];
                for (let testCell of map.getNeighbours(fringeCell)) {
                    let testIndex = testCell.row + testCell.col * colMul;
                    if (visited[testIndex] === true)
                        continue;

                    let path = fringePath.slice();
                    path.push(testCell);

                    if (testCell === to)
                        return path;

                    visited[testIndex] = true;

                    if (testCell.height > 0 && testCell.height < 0.75) // TODO: these height limits should probably come from line type
                        nextFringe.push(path);
                }
            }

            prevFringe = nextFringe;
            nextFringe = [];
        }

        return null;
    }

    private static generateLinesForLocationGroup(map: MapData, locations: MapLocation[], lineType: LineType) {
        // connect every pair of locations in the group for which there isn't another location closer to both of them
        let groupLines = [];
        // TODO: use a better algorithm for calculating this relative neighbourhood graph ... which this is, even though we don't actually keep it
        for (let i=0; i<locations.length; i++) {
            let from = locations[i];
            for (let j=i+1; j<locations.length; j++) {
                let to = locations[j];

                let path = MapGenerator.getConnectionPath(map, from.cell, to.cell);
                if (path === null)
                    continue;

                let anyCloser = false;

                for (let test of locations) {
                    let dist1 = MapGenerator.getConnectionPath(map, from.cell, test.cell);
                    let dist2 = MapGenerator.getConnectionPath(map, to.cell, test.cell);

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
        MapGenerator.removeOverlap(groupLines);

        // where exactly two lines end on the same cell, combine them into one line
        MapGenerator.combineLines(groupLines);

        for (let line of groupLines) {
            MapGenerator.removeSuperfluousLineCells(line.keyCells, groupLines);
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

    private static renderAndErodeLine(map: MapData, line: MapLine) {
        line.updateRenderPoints();

        // erode the terrain this line passes through, if needed
        if (line.type.erosionAmount != 0) {
            let erosionAmount = line.type.erosionAmount;
            let cellsToErode = line.getErosionAffectedCells(map);
            for (let cell of cellsToErode)
                cell.height -= erosionAmount;
        }

        return line;
    }

    private static pickRandomLineCells(map: MapData, lineType: LineType) {
        // TODO: plot a path between these two points, not just a straight line

        let cellA = map.getRandomCell(true), cellB = map.getRandomCell(true);
        if (cellA === undefined || cellB === undefined)
            return [];

        return [cellA, cellB];
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
                if (testCell.height <= 0)
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
                testCell.height = dipCell.height - 0.01;
            }

            cells.push(testCell);
            lowestCell = testCell;

            if (!lineType.canErodeBelowSeaLevel && lowestCell.height <= 0)
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

    private static pickHighestCell(cells: MapCell[]) {
        let returnCell = cells[0];

        for (let i=1;i<cells.length; i++) {
            let testCell = cells[i];
            if (testCell.height > returnCell.height)
                returnCell = testCell;
        }

        return returnCell;
    }

    private static pickLowestCell(cells: MapCell[], mustBeAboveSeaLevel: boolean = false) {
        let returnCell = cells[0];
        let bestHeight = Number.MAX_VALUE;

        for (let i=0;i<cells.length; i++) {
            let testCell = cells[i];
            if (testCell.height < bestHeight && (!mustBeAboveSeaLevel || testCell.height > 0)) {
                returnCell = testCell;
                bestHeight = testCell.height;
            }
        }

        return returnCell;
    }
}