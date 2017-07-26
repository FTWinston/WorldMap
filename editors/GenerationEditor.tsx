interface IGenerationEditorProps {
    cellTypes: CellType[];
    cells: PossibleMapCell[];
    mapChanged: () => void;
}

interface IGenerationEditorState {
    
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
        let cellTypesByHeight = this.arrangeCellTypesByHeight();

        for (let cell of this.props.cells) {
            if (cell === null)
                continue;

            let height = noise.noise(cell.xPos, cell.yPos);
            for (let sortedCellType of cellTypesByHeight)
                if (height <= sortedCellType[0]) {
                    cell.cellType = sortedCellType[1];
                    break;
                }
        }

        this.props.mapChanged();
    }
    private arrangeCellTypesByHeight() {
        // TODO: this should use an innate height property, not just the cell types' order
        let heightIncrement = 1 / (this.props.cellTypes.length);
        let height = heightIncrement;

        let sortedCellTypes: [number, CellType][] = [];
        for (let cellType of this.props.cellTypes) {
            sortedCellTypes.push([height, cellType]);
            height += heightIncrement;
        }

        sortedCellTypes[sortedCellTypes.length - 1][0] = 1;
        return sortedCellTypes;
    }
}