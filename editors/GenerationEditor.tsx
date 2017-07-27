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
        let cellTypeLookup = GenerationEditor.constructCellTypeTree(this.props.cellTypes);

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