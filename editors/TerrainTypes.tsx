interface ITerrainEditorState {
    cellTypes: CellType[];
}

interface ITerrainEditorProps extends ITerrainEditorState {
    updateCellTypes: (cellTypes: CellType[]) => void;
}

class TerrainTypesEditor extends React.Component<ITerrainEditorProps, ITerrainEditorState> {
    constructor(props: ITerrainEditorProps) {
        super(props);

        this.state = {
            cellTypes: props.cellTypes.slice(),
        };
    }
    componentWillReceiveProps(newProps: ITerrainEditorProps) {
        this.setState({ cellTypes: newProps.cellTypes.slice() });
    }
    render() {
        return <div>
            <div className="typeList">
                {this.state.cellTypes.map(function(type, id) {
                    return <div ref={id.toString()} className="cellType" style={{'background-color': type.color}}>{type.name}</div>;
                })}
            </div>

        </div>; // TODO: add link, click-to-edit prompt
    }
    private changeSize(e: Event) {
        e.preventDefault();

        this.props.updateCellTypes(this.state.cellTypes);
    }
}