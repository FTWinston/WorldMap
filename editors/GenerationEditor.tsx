interface IGenerationEditorProps {
    map: MapData;
    settings: GenerationSettings;
    showingSettings: boolean;
    mapChanged: () => void;
    settingsChanged: () => void;
    showSettings: (show: boolean) => void;
}

interface ICellTypeCoordinate {
    genHeight: number,
    genTemperature: number,
    genPrecipitation: number,
}

class GenerationEditor extends React.Component<IGenerationEditorProps, {}> implements IMapEditor {
    render() {
        let showHide = this.props.showingSettings
         ? <button type="button" onClick={this.showSettings.bind(this, false)}>Close settings</button>
         : <button type="button" onClick={this.showSettings.bind(this, true)}>Edit settings</button>;

        return <form onSubmit={this.generate.bind(this)}>
            <p>Each cell type has value for its associated height, temperature and precipitation. These are used to decide what type to use for each cell.</p>
            <p>A number of settings are available to control the height, temperature and precipitation of the generated map.</p>
            <p>For now the whole map will be generated, but in the future you might be able to only generate over empty cells.</p>
            <div role="group" className="vertical">
                {showHide}
                <button type="submit">Generate map using settings</button>
                <button type="button" onClick={this.randomizeSettings.bind(this)}>Randomize settings &amp; generate</button>
            </div>
        </form>
    }

    componentWillUnmount() {
        this.props.showSettings(false);
    }

    private showSettings(show: boolean) {
        this.props.showSettings(show);
    }

    private randomizeSettings() {
        this.props.settings.randomize();
        this.props.settingsChanged();
        this.generateMap();
        this.props.showSettings(false);
    }

    private generate(e: Event) {
        e.preventDefault();
        this.generateMap();
        this.props.showSettings(false);
    }

    private generateMap() {
        // to start with, just generate height, temperate and precipitation simplex noise of the same size as the map, and allocate cell types based on those.

        let cellTypeLookup = GenerationEditor.constructCellTypeTree(this.props.map.cellTypes);
        let settings = this.props.settings;
        
        let heightGuide = settings.heightGuide.generation;
        let lowFreqHeightNoise = new SimplexNoise();
        let highFreqHeightNoise = new SimplexNoise();

        let temperatureGuide = settings.temperatureGuide.generation;
        let lowFreqTemperatureNoise = new SimplexNoise();
        let highFreqTemperatureNoise = new SimplexNoise();
        
        let precipitationGuide = settings.precipitationGuide.generation;
        let lowFreqPrecipitationNoise = new SimplexNoise();
        let highFreqPrecipitationNoise = new SimplexNoise();

        let heightScaleTot = settings.heightScaleFixed + settings.heightScaleGuide + settings.heightScaleLowFreq + settings.heightScaleHighFreq;
        if (heightScaleTot == 0)
            heightScaleTot = 1;
        let fixedHeightScale = settings.fixedHeight * settings.heightScaleFixed / heightScaleTot;
        let guideHeightScale = settings.heightScaleGuide / heightScaleTot;
        let lowFreqHeightScale = settings.heightScaleLowFreq/ heightScaleTot;
        let highFreqHeightScale = settings.heightScaleHighFreq / heightScaleTot;

        let temperatureScaleTot = settings.temperatureScaleFixed + settings.temperatureScaleGuide + settings.temperatureScaleLowFreq + settings.temperatureScaleHighFreq;
        if (temperatureScaleTot == 0)
            temperatureScaleTot = 1;
        let fixedTemperatureScale = settings.fixedTemperature * settings.temperatureScaleFixed / temperatureScaleTot;
        let guideTemperatureScale = settings.temperatureScaleGuide / temperatureScaleTot;
        let lowFreqTemperatureScale = settings.temperatureScaleLowFreq/ temperatureScaleTot;
        let highFreqTemperatureScale = settings.temperatureScaleHighFreq / temperatureScaleTot;

        let precipitationScaleTot = settings.precipitationScaleFixed + settings.precipitationScaleGuide + settings.precipitationScaleLowFreq + settings.precipitationScaleHighFreq;
        if (precipitationScaleTot == 0)
            precipitationScaleTot = 1;
        let fixedPrecipitationScale = settings.fixedPrecipitation * settings.precipitationScaleFixed / precipitationScaleTot;
        let guidePrecipitationScale = settings.precipitationScaleGuide / precipitationScaleTot;
        let lowFreqPrecipitationScale = settings.precipitationScaleLowFreq/ precipitationScaleTot;
        let highFreqPrecipitationScale = settings.precipitationScaleHighFreq / precipitationScaleTot;

        let maxX = this.props.map.width * MapData.packedWidthRatio;
        let maxY = this.props.map.height * MapData.packedHeightRatio;

        for (let cell of this.props.map.cells) {
            if (cell === null)
                continue;

            let height = fixedHeightScale
                       + highFreqHeightScale * highFreqHeightNoise.noise(cell.xPos, cell.yPos) 
                       + lowFreqHeightScale * lowFreqHeightNoise.noise(cell.xPos / 10, cell.yPos / 10)
                       + guideHeightScale * heightGuide(cell.xPos, cell.yPos, maxX, maxY);

            let temper = fixedTemperatureScale
                       + highFreqTemperatureScale * highFreqTemperatureNoise.noise(cell.xPos, cell.yPos) 
                       + lowFreqTemperatureScale * lowFreqTemperatureNoise.noise(cell.xPos / 10, cell.yPos / 10)
                       + guideTemperatureScale * temperatureGuide(cell.xPos, cell.yPos, maxX, maxY);

            let precip = fixedPrecipitationScale
                       + highFreqPrecipitationScale * highFreqPrecipitationNoise.noise(cell.xPos, cell.yPos) 
                       + lowFreqPrecipitationScale * lowFreqPrecipitationNoise.noise(cell.xPos / 10, cell.yPos / 10)
                       + guidePrecipitationScale * precipitationGuide(cell.xPos, cell.yPos, maxX, maxY);

            let nearestType = cellTypeLookup.nearest({
                genHeight: height,
                genTemperature: temper,
                genPrecipitation: precip,
            });
            if (nearestType !== undefined)
                cell.cellType = nearestType;
        }

        this.props.mapChanged();
        this.cellTypeLookup = cellTypeLookup;
    }
    cellTypeLookup: any;

    private static cellTypeDistanceMetric(a: ICellTypeCoordinate, b: CellType) {
        let heightDif = (a.genHeight - b.genHeight) * 5;
        let tempDif = a.genTemperature - b.genTemperature;
        let precDif = a.genPrecipitation - b.genPrecipitation;

        return Math.sqrt(
            heightDif * heightDif +
            tempDif * tempDif +
            precDif * precDif
        );
    }
    private static constructCellTypeTree(cellTypes: CellType[]) {
        return new kdTree<CellType, ICellTypeCoordinate>(cellTypes, GenerationEditor.cellTypeDistanceMetric, ['genHeight', 'genTemperature', 'genPrecipitation']);
    }
}