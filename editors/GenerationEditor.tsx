interface IGenerationEditorProps {
    map: MapData;
    settings: GenerationSettings;
    mapChanged: () => void;
    settingsChanged: () => void;
}

interface IGenerationEditorState {
    selectingHeightGuide: boolean;
    selectingTemperatureGuide: boolean;
    selectingPrecipitationGuide: boolean;
}

interface ICellTypeCoordinate {
    genHeight: number,
    genTemperature: number,
    genPrecipitation: number,
}

class GenerationEditor extends React.Component<IGenerationEditorProps, IGenerationEditorState> implements IMapEditor {
    constructor(props: IGenerationEditorProps) {
        super(props);

        this.state = {
            selectingHeightGuide: false,
            selectingTemperatureGuide: false,
            selectingPrecipitationGuide: false,
        };
    }
    render() {
        if (this.state.selectingHeightGuide)
            return this.renderGuideSelection(this.props.settings.heightGuide, this.heightGuideSelected.bind(this), 'Select an elevation guide, which controls the overall shape of generated terrain.');
        if (this.state.selectingTemperatureGuide)
            return this.renderGuideSelection(this.props.settings.temperatureGuide, this.temperatureGuideSelected.bind(this), 'Select a temperature guide, which controls the overall temperature of generated terrain.');
        if (this.state.selectingPrecipitationGuide)
            return this.renderGuideSelection(this.props.settings.precipitationGuide, this.precipitationGuideSelected.bind(this), 'Select a precipitation guide, which controls the overall rainfall / humidity of generated terrain.');
        
        return <form onSubmit={this.generate.bind(this)}>
            <p>Each cell type has value for its associated height, temperature and precipitation. Ensure you're happy with these before continuing.</p>
            <hr/>
            <GenerationField name="Height" guide={this.props.settings.heightGuide} fixedValue={this.props.settings.fixedHeight} fixedScale={this.props.settings.heightScaleFixed}
                guideScale={this.props.settings.heightScaleGuide} lowFreqScale={this.props.settings.heightScaleLowFreq} highFreqScale={this.props.settings.heightScaleHighFreq} showGuideSelection={this.showHeightGuideSelection.bind(this)} changed={this.heightChanged.bind(this)} />
            <hr/>            
            <GenerationField name="Temperature" guide={this.props.settings.temperatureGuide} fixedValue={this.props.settings.fixedTemperature} fixedScale={this.props.settings.temperatureScaleFixed}
                guideScale={this.props.settings.temperatureScaleGuide} lowFreqScale={this.props.settings.temperatureScaleLowFreq} highFreqScale={this.props.settings.temperatureScaleHighFreq} showGuideSelection={this.showTemperatureGuideSelection.bind(this)} changed={this.temperatureChanged.bind(this)} />
            <hr/>
            <GenerationField name="Precipitation" guide={this.props.settings.precipitationGuide} fixedValue={this.props.settings.fixedPrecipitation} fixedScale={this.props.settings.precipitationScaleFixed}
                guideScale={this.props.settings.precipitationScaleGuide} lowFreqScale={this.props.settings.precipitationScaleLowFreq} highFreqScale={this.props.settings.precipitationScaleHighFreq} showGuideSelection={this.showPrecipitationGuideSelection.bind(this)} changed={this.precipitationChanged.bind(this)} />
            <hr/>
            <p>Later in development, you'll choose a wind guide instead of precipitation, and preciptation will be entirely calculated.</p>

            <p>For now the whole map will be generated, but you might want to only generate over empty cells.</p>
            
            <div role="group">
                <button type="submit">Generate</button>
                <button type="button" onClick={this.randomizeSettings.bind(this)}>Randomize settings</button>
            </div>
        </form>
    }
    private renderGuideSelection(selectedValue: GenerationGuide, onSelected: (guide: GenerationGuide) => void, intro: string) {
        return <form>
            <p>{intro}</p>
            <div className="palleteList">
                {Guides.scalarGuides.map(function(guide, id) {
                    let classes = guide == selectedValue ? 'selected' : undefined;
                    return <GuideView guide={guide} key={id.toString()} className={classes} onClick={onSelected} />;
                })}
            </div>
        </form>;
    }
    private showHeightGuideSelection(guide: GenerationGuide) {
        this.setState({
            selectingHeightGuide: true,
        });
    }
    private heightGuideSelected(guide: GenerationGuide) {
        this.props.settings.heightGuide = guide;
        this.props.settingsChanged();

        this.setState({
            selectingHeightGuide: false,
        });
    }
    private showTemperatureGuideSelection(guide: GenerationGuide) {
        this.setState({
            selectingTemperatureGuide: true,
        });
    }
    private temperatureGuideSelected(guide: GenerationGuide) {
        this.props.settings.temperatureGuide = guide;
        this.props.settingsChanged();

        this.setState({
            selectingTemperatureGuide: false,
        });
    }
    private showPrecipitationGuideSelection(guide: GenerationGuide) {
        this.setState({
            selectingPrecipitationGuide: true,
        });
    }
    private precipitationGuideSelected(guide: GenerationGuide) {
        this.props.settings.precipitationGuide = guide;
        this.props.settingsChanged();

        this.setState({
            selectingPrecipitationGuide: false,
        });
    }

    private heightChanged(fixedValue: number, fixedScale: number, guideScale: number, lowFreqScale: number, highFreqScale: number) {
        let settings = this.props.settings;

        settings.fixedHeight = fixedValue;
        settings.heightScaleFixed = fixedScale;
        settings.heightScaleGuide = guideScale;
        settings.heightScaleLowFreq = lowFreqScale;
        settings.heightScaleHighFreq = highFreqScale;
        
        this.props.settingsChanged();

        this.setState({
            selectingHeightGuide: false,
        });
    }
    private temperatureChanged(fixedValue: number, fixedScale: number, guideScale: number, lowFreqScale: number, highFreqScale: number) {
        let settings = this.props.settings;

        settings.fixedTemperature = fixedValue;
        settings.temperatureScaleFixed = fixedScale;
        settings.temperatureScaleGuide = guideScale;
        settings.temperatureScaleLowFreq = lowFreqScale;
        settings.temperatureScaleHighFreq = highFreqScale;
        
        this.props.settingsChanged();

        this.setState({
            selectingTemperatureGuide: false,
        });
    }
    private precipitationChanged(fixedValue: number, fixedScale: number, guideScale: number, lowFreqScale: number, highFreqScale: number) {
        let settings = this.props.settings;
        
        settings.fixedPrecipitation = fixedValue;
        settings.precipitationScaleFixed = fixedScale;
        settings.precipitationScaleGuide = guideScale;
        settings.precipitationScaleLowFreq = lowFreqScale;
        settings.precipitationScaleHighFreq = highFreqScale;
        
        this.props.settingsChanged();
        
        this.setState({
            selectingPrecipitationGuide: false,
        });
    }

    private randomizeSettings() {
        this.props.settings.randomize();
        this.props.settingsChanged();
    }

    private generate(e: Event) {
        e.preventDefault();
        // to start with, just generate a "height" simplex noise of the same size as the map, and allocate cell types based on that.

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