interface IGenerationEditorProps {
    map: MapData;
    mapChanged: () => void;
}

interface IGenerationEditorState {
    heightGuide: GenerationGuide;
    temperatureGuide: GenerationGuide;
    precipitationGuide: GenerationGuide;
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
            heightGuide: Guides.scalarGuides[Random.randomIntRange(0, Guides.scalarGuides.length)],
            temperatureGuide: Guides.scalarGuides[Random.randomIntRange(0, Guides.scalarGuides.length)],
            precipitationGuide: Guides.scalarGuides[Random.randomIntRange(0, Guides.scalarGuides.length)],
            selectingHeightGuide: false,
            selectingTemperatureGuide: false,
            selectingPrecipitationGuide: false,
        };
    }
    render() {
        if (this.state.selectingHeightGuide)
            return this.renderGuideSelection(this.state.heightGuide, this.heightGuideSelected.bind(this), 'Select an elevation guide, which controls the overall shape of generated terrain.');
        if (this.state.selectingTemperatureGuide)
            return this.renderGuideSelection(this.state.temperatureGuide, this.temperatureGuideSelected.bind(this), 'Select a temperature guide, which controls the overall temperature of generated terrain.');
        if (this.state.selectingPrecipitationGuide)
            return this.renderGuideSelection(this.state.precipitationGuide, this.precipitationGuideSelected.bind(this), 'Select a precipitation guide, which controls the overall rainfall / humidity of generated terrain.');
        
        return <form onSubmit={this.generate.bind(this)}>
            <p>Each cell type has value for its associated height, temperature and precipitation. Ensure you're happy with these before continuing.</p>

            <div role="group" className="vertical">
                <p>The elevation guide controls the overall shape of generated terrain. Click below to change the selected height guide.</p>
                <div className="palleteList">
                    <GuideView guide={this.state.heightGuide} onClick={this.showHeightGuideSelection.bind(this)} />
                </div>
            </div>

            <div role="group" className="vertical">
                <p>The temperature guide controls the overall temperature of generated terrain. Click below to change the selected temperature guide.</p>
                <div className="palleteList">
                    <GuideView guide={this.state.temperatureGuide} onClick={this.showTemperatureGuideSelection.bind(this)} />
                </div>
            </div>

            <div role="group" className="vertical">
                <p>The precipitation guide controls the overall rainfall / humidity of generated terrain. Click below to change the selected precipitation guide.</p>
                <div className="palleteList">
                    <GuideView guide={this.state.precipitationGuide} onClick={this.showPrecipitationGuideSelection.bind(this)} />
                </div>
            </div>

            <p>Later in development, you'll choose a wind guide instead of precipitation, and preciptation will be entirely calculated.</p>

            <p>For now the whole map will be generated, but you might want to only generate over empty cells.</p>
            
            <div role="group">
                <button type="submit">Generate</button>
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
        } as any);
    }
    private heightGuideSelected(guide: GenerationGuide) {
        this.setState({
            heightGuide: guide,
            selectingHeightGuide: false,
        } as any);
    }
    private showTemperatureGuideSelection(guide: GenerationGuide) {
        this.setState({
            selectingTemperatureGuide: true,
        } as any);
    }
    private temperatureGuideSelected(guide: GenerationGuide) {
        this.setState({
            temperatureGuide: guide,
            selectingTemperatureGuide: false,
        } as any);
    }
    private showPrecipitationGuideSelection(guide: GenerationGuide) {
        this.setState({
            selectingPrecipitationGuide: true,
        } as any);
    }
    private precipitationGuideSelected(guide: GenerationGuide) {
        this.setState({
            precipitationGuide: guide,
            selectingPrecipitationGuide: false,
        } as any);
    }
    private generate(e: Event) {
        e.preventDefault();
        // to start with, just generate a "height" simplex noise of the same size as the map, and allocate cell types based on that.

        let cellTypeLookup = GenerationEditor.constructCellTypeTree(this.props.map.cellTypes);
        
        let heightGuide = this.state.heightGuide.generation;
        let lowFreqHeightNoise = new SimplexNoise();
        let highFreqHeightNoise = new SimplexNoise();

        let temperatureGuide = this.state.temperatureGuide.generation;
        let lowFreqTemperatureNoise = new SimplexNoise();
        let highFreqTemperatureNoise = new SimplexNoise();
        
        let precipitationGuide = this.state.precipitationGuide.generation;
        let lowFreqPrecipitationNoise = new SimplexNoise();
        let highFreqPrecipitationNoise = new SimplexNoise();

        let maxX = this.props.map.width * MapData.packedWidthRatio;
        let maxY = this.props.map.height * MapData.packedHeightRatio;

        for (let cell of this.props.map.cells) {
            if (cell === null)
                continue;

            let height = 0.15 * highFreqHeightNoise.noise(cell.xPos, cell.yPos) 
                       + 0.55 * lowFreqHeightNoise.noise(cell.xPos / 10, cell.yPos / 10)
                       + 0.30 * heightGuide(cell.xPos, cell.yPos, maxX, maxY);

            let temper = 0.10 * highFreqTemperatureNoise.noise(cell.xPos, cell.yPos) 
                       + 0.35 * lowFreqTemperatureNoise.noise(cell.xPos / 10, cell.yPos / 10)
                       + 0.55 * temperatureGuide(cell.xPos, cell.yPos, maxX, maxY);

            let precip = 0.10 * highFreqPrecipitationNoise.noise(cell.xPos, cell.yPos) 
                       + 0.50 * lowFreqPrecipitationNoise.noise(cell.xPos / 10, cell.yPos / 10)
                       + 0.40 * precipitationGuide(cell.xPos, cell.yPos, maxX, maxY);

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
        let heightDif = (a.genHeight - b.genHeight);// * 5;
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