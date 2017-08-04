class MapGenerator {
    public static generate(map: MapData, settings: GenerationSettings) {
        // to start with, just generate height, temperate and precipitation simplex noise of the same size as the map, and allocate cell types based on those.

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

            // don't allocate a cell type right away, as wind, lines and locations may change these properties
        }
        
        // TODO: erosion, mountain ranges, etc

        // TODO: calculate wind, use that to modify precipitation and temperature

        // TODO: add lines, locations

        // allocate types to cells based on their generation properties
        for (let cell of map.cells) {
            if (cell === null)
                continue;

            MapGenerator.updateCellType(cell);
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
        MapGenerator.cellTypeLookup = new kdTree<CellType, MapCell>(cellTypes, MapGenerator.cellTypeDistanceMetric, ['height', 'temperature', 'precipitation']);
    }
}