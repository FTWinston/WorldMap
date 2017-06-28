interface ITerrainEditorProps {
    cellTypes: CellType[];
    redraw: () => void;
}

interface ITerrainEditorState {
    selectedTerrainType: CellType;
}

class TerrainEditor extends React.Component<ITerrainEditorProps, ITerrainEditorState> implements IMapEditor {
    constructor(props: ITerrainEditorProps) {
        super(props);

        this.state = {
            selectedTerrainType: props.cellTypes[0],
        };
    }
    componentWillReceiveProps(newProps: ITerrainEditorProps) {
        this.setState({
            selectedTerrainType: newProps.cellTypes[0],
        });
    }
    render() {
        let that = this;
        return <div>
            <div className="palleteList">
                {this.props.cellTypes.map(function(type, id) {
                    let classes = type == that.state.selectedTerrainType ? 'selected' : undefined;
                    return <div key={id.toString()} className={classes} style={{'backgroundColor': type.color}} onClick={that.selectTerrainType.bind(that, type)}>{type.name}</div>;
                })}
            </div>
        </div>;
    }
    private selectTerrainType(type: CellType) {
        this.setState({
            selectedTerrainType: type,
        });
    }
    mouseDown(cell: MapCell) {
        cell.cellType = this.state.selectedTerrainType;
        this.props.redraw();
    }
    mouseEnter(cell: MapCell) {
        cell.cellType = this.state.selectedTerrainType;
        this.props.redraw();
    }
}