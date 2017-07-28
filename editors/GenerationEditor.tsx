interface IGenerationEditorProps {
    map: MapData;
    mapChanged: () => void;
}

interface IGenerationEditorState {
    heightGuide: GenerationGuide;
    selectingHeightGuide: boolean;
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
            heightGuide: Guides.scalarGuides[0],
            selectingHeightGuide: false,
        };
    }
    render() {
        let that = this;
        if (this.state.selectingHeightGuide)
            return <form>
                <p>Select an elevation guide, which controls the overall shape of generated terrain.</p>
                <div className="palleteList">
                    {Guides.scalarGuides.map(function(guide, id) {
                        let classes = guide == that.state.heightGuide ? 'selected' : undefined;
                        return <GuideView guide={guide} key={id.toString()} className={classes} onClick={that.heightGuideSelected.bind(that)} />;
                    })}
                </div>
            </form>;
        
        return <form onSubmit={this.generate.bind(this)}>
            <p>Each cell type must be given a value for its associated height, temperature and precipitation.</p>

            <div role="group" className="vertical">
                <p>The elevation guide controls the overall shape of generated terrain. Click below to change the selected height guide.</p>
                <div className="palleteList">
                    <GuideView guide={this.state.heightGuide} onClick={that.showHeightGuideSelection.bind(that)} />
                </div>
            </div>

            <p>Later in development, temperature and wind guides will also be specified at this point.</p>

            <p>For now the whole map will be generated, but you might want to only generate over empty cells.</p>
            
            <div role="group">
                <button type="submit">Generate</button>
            </div>
        </form>
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
        });
    }
    private generate(e: Event) {
        e.preventDefault();
        // to start with, just generate a "height" simplex noise of the same size as the map, and allocate cell types based on that.

        let highFreqNoise = new SimplexNoise();
        let lowFreqNoise = new SimplexNoise();
        let cellTypeLookup = GenerationEditor.constructCellTypeTree(this.props.map.cellTypes);

        let heightGuide = this.state.heightGuide.generation;
        let maxX = this.props.map.width * MapData.packedWidthRatio;
        let maxY = this.props.map.height * MapData.packedHeightRatio;

        for (let cell of this.props.map.cells) {
            if (cell === null)
                continue;

            let height = 0.15 * highFreqNoise.noise(cell.xPos, cell.yPos) 
                       + 0.55 * lowFreqNoise.noise(cell.xPos / 10, cell.yPos / 10)
                       + 0.30 * heightGuide(cell.xPos, cell.yPos, maxX, maxY);

            let nearestType = cellTypeLookup.nearest({
                genHeight: height,
                genTemperature: 0,
                genPrecipitation: 0,
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
        // TODO: this should use innate height/temperature/precipitation properties, not just the cell types' order
        let heightIncrement = 1 / cellTypes.length;
        let height = heightIncrement / 2;

        for (let cellType of cellTypes) {
            cellType.genHeight = height;
            cellType.genTemperature = 0;
            cellType.genPrecipitation = 0;
            height += heightIncrement;
        }

        return new kdTree<CellType, ICellTypeCoordinate>(cellTypes, GenerationEditor.cellTypeDistanceMetric, ['genHeight', 'genTemperature', 'genPrecipitation']);
    }
}