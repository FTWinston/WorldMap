class TerrainGenerator {
    public static generate(map: MapData, settings: GenerationSettings) {
        // to start with, generate height, temperate and precipitation values for all map cells
        TerrainGenerator.allocateCellProperties(map, settings);

        //TerrainGenerator.generateMountainRanges(map, settings);
    }

    private static allocateCellProperties(map: MapData, settings: GenerationSettings) {
        let heightGuide = settings.heightGuide;
        let lowFreqHeightNoise = new SimplexNoise();
        let highFreqHeightNoise = new SimplexNoise();

        let heightScaleTot = settings.heightScaleGuide + settings.heightScaleLowFreq + settings.heightScaleHighFreq;
        if (heightScaleTot == 0)
            heightScaleTot = 1;
        let guideHeightScale = settings.heightScaleGuide / heightScaleTot;
        let lowFreqHeightScale = settings.heightScaleLowFreq/ heightScaleTot;
        let highFreqHeightScale = settings.heightScaleHighFreq / heightScaleTot;


        let temperatureGuide = settings.temperatureGuide;
        let lowFreqTemperatureNoise = new SimplexNoise();
        let highFreqTemperatureNoise = new SimplexNoise();
        
        let temperatureScaleTot = settings.temperatureScaleGuide + settings.temperatureScaleLowFreq + settings.temperatureScaleHighFreq;
        if (temperatureScaleTot == 0)
            temperatureScaleTot = 1;
        let guideTemperatureScale = settings.temperatureScaleGuide / temperatureScaleTot;
        let lowFreqTemperatureScale = settings.temperatureScaleLowFreq/ temperatureScaleTot;
        let highFreqTemperatureScale = settings.temperatureScaleHighFreq / temperatureScaleTot;


        let precipitationGuide = settings.precipitationGuide;
        let lowFreqPrecipitationNoise = new SimplexNoise();
        let highFreqPrecipitationNoise = new SimplexNoise();
        
        let precipitationScaleTot = settings.precipitationScaleGuide + settings.precipitationScaleLowFreq + settings.precipitationScaleHighFreq;
        if (precipitationScaleTot == 0)
            precipitationScaleTot = 1;
        let guidePrecipitationScale = settings.precipitationScaleGuide / precipitationScaleTot;
        let lowFreqPrecipitationScale = settings.precipitationScaleLowFreq/ precipitationScaleTot;
        let highFreqPrecipitationScale = settings.precipitationScaleHighFreq / precipitationScaleTot;


        let maxX = map.width * MapData.packedWidthRatio;
        let maxY = map.height * MapData.packedHeightRatio;

        // allocate height / temperature / precipitation generation properties to each cell with a height >= 0
        for (let cell of map.cells) {
            if (cell === null || cell.height < 0)
                continue;

            cell.height = TerrainGenerator.determineValue(
                cell.xPos, cell.yPos, maxX, maxY,
                guideHeightScale, lowFreqHeightScale, highFreqHeightScale,
                heightGuide, lowFreqHeightNoise, highFreqHeightNoise,
                settings.minHeight, settings.maxHeight,
            );

            cell.temperature = TerrainGenerator.determineValue(
                cell.xPos, cell.yPos, maxX, maxY,
                guideTemperatureScale, lowFreqTemperatureScale, highFreqTemperatureScale,
                temperatureGuide, lowFreqTemperatureNoise, highFreqTemperatureNoise,
                settings.minTemperature, settings.maxTemperature,
            );

            cell.precipitation = TerrainGenerator.determineValue(
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
    
    private static generateMountainRanges(map: MapData, settings: GenerationSettings) {
        // generate mountain ranges, but don't add these to the map. Just use them for (negative) erosion.
        let lineType = new LineType('Mountains', '#000000', 1, 1, 1, 1, -0.4, 1, true, LinePositionMode.Random);

        let lines = [];
        const onePerNCells = 120; // TODO: Make this configurable, ideally in generation settings.
        let numLines = Math.round(map.width * map.height / onePerNCells);

        for (let iLine = 0; iLine<numLines; iLine++) {
            let cells = TerrainGenerator.pickRandomLineCells(map, lineType);
            
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

    private static pickRandomLineCells(map: MapData, lineType: LineType) {
        // TODO: plot a path between these two points, not just a straight line
        let cellA = map.getRandomCell(false), cellB = map.getRandomCell(false);
        if (cellA === undefined || cellB === undefined)
            return [];

        return [cellA, cellB];
    }
}