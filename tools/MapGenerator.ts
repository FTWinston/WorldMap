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
        
        // TODO: Give each location type a "minimum distance" from other named locations. Don't let them generate closer than this.

        cell = MapGenerator.pickLowestCell(map.getCellsInRange(cell, 2), true);

        if (cell.height <= 0)
            console.log('generating underwater city');

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
                    cells = MapGenerator.pickHighToLowLineCells(map, lineType); break;
                default:
                    continue;
            }

            if (cells.length <= 1)
                continue;

            let line = MapGenerator.generateLine(map, lineType, cells);
            lines.push(line);
        }

        return lines;
    }

    private static generateLinesBetweenLocations(map: MapData, lineType: LineType) {
        // TODO: use something like an Urquhart graph per landmass to decide which pairs of location to draw lines between
        for (let location of map.locations) {
            let index = Random.randomIntRange(0, map.locations.length);
            let other = map.locations[index];

            if (other === location || Math.random() < 0.85) // TODO: no random failure chance, or at least a very small one
                continue;

            // TODO: plot a path between locations, don't just go straight
            let cells = [location.cell, other.cell];
            let line = MapGenerator.generateLine(map, lineType, cells);
            map.lines.push(line);
        }
    }

    private static generateLine(map: MapData, lineType: LineType, cells: MapCell[]) {
        // create line
        let line = new MapLine(lineType);
        line.keyCells = cells;
        line.updateRenderPoints();

        // erode the terrain this line passes through, if needed
        if (lineType.erosionAmount != 0) {
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

    private static pickHighToLowLineCells(map: MapData, lineType: LineType) {
        // start with a random cell
        let genStartCell = map.getRandomCell(!lineType.canErodeBelowSeaLevel);
        if (genStartCell === undefined)
            return [];

        let highestCell = genStartCell;
        let lowestCell = genStartCell;
        let cells = [genStartCell];

        // "flow" downwards through adjacent cells until we reach a "lowest" point or go below sea level
        // TODO: local minima above sea level shouldn't just terminate a river. They should flow over that, possibly making a lake in the process. Right?
        while (true) {
            let testCell = MapGenerator.pickLowestCell(map.getCellsInRange(lowestCell, 1));
            if (testCell === lowestCell)
                break;

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

        cells.shift(); // always remove first cell, or most rivers will start on the same mountain
        // TODO: as we don't want a key cell EVERY cell, remove every N cells or something ... start from the end, so the river still ends in the right place

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