interface IGenerationEditorProps {
    cellTypes: CellType[];
    cells: PossibleMapCell[];
    mapChanged: () => void;
}

interface IGenerationEditorState {

}

interface ICellTypeCoordinate {
    genHeight: number,
    genTemperature: number,
    genPrecipitation: number,
}

class GenerationEditor extends React.Component<IGenerationEditorProps, IGenerationEditorState> implements IMapEditor {
    render() {
        return <form onSubmit={this.generate.bind(this)}>
            <p>Each cell type must be given a value for its associated height, temperature and precipitation.</p>

            <p>Select an elevation guide, which controls the overall shape of generated terrain.</p>

            <p>Later in development, temperature and wind guides will also be specified at this point.</p>

            <p>For now the whole map will be generated, but you might want to only generate over empty cells.</p>
            
            <div role="group">
                <button type="submit">Generate</button>
            </div>
        </form>
    }

    private generate(e: Event) {
        e.preventDefault();
        // to start with, just generate a "height" simplex noise of the same size as the map, and allocate cell types based on that.

        let noise = new SimplexNoise();
        let cellTypeLookup = this.constructCellTypeTree();

        for (let cell of this.props.cells) {
            if (cell === null)
                continue;

            let height = noise.noise(cell.xPos, cell.yPos);
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

    private static cellTypeDistanceMetric(a: ICellTypeCoordinate, b: ICellTypeCoordinate) {
        let heightDif = a.genHeight - b.genHeight;
        let tempDif = a.genTemperature - b.genTemperature;
        let precDif = a.genPrecipitation - b.genPrecipitation;

        return Math.sqrt(
            heightDif * heightDif * 25 +
            tempDif * tempDif +
            precDif * precDif
        );
    }
    private constructCellTypeTree() {
        // TODO: this should use innate height/temperature/precipitation properties, not just the cell types' order
        let heightIncrement = 1 / (this.props.cellTypes.length);
        let height = heightIncrement;

        let sortedCellTypes: [number, CellType][] = [];
        for (let cellType of this.props.cellTypes) {
            cellType.genHeight = height;
            cellType.genTemperature = 0;
            cellType.genPrecipitation = 0;
            height += heightIncrement;
        }

        return new kdTree<CellType, ICellTypeCoordinate>(this.props.cellTypes, GenerationEditor.cellTypeDistanceMetric, ['genHeight', 'genTemperature', 'genPrecipitation']);
    }
}