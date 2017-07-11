interface ITerrainEditorProps {
    cellTypes: CellType[];
    updateCellTypes: (cellTypes: CellType[]) => void;
    hasDrawn: (endOfStroke: boolean) => void;
}

interface ITerrainEditorState {
    isEditingTerrainType: boolean;
    isDrawingOnMap: boolean;
    selectedTerrainType?: CellType;
}

class TerrainEditor extends React.Component<ITerrainEditorProps, ITerrainEditorState> implements IMapEditor {
    constructor(props: ITerrainEditorProps) {
        super(props);

        this.state = {
            isEditingTerrainType: false,
            isDrawingOnMap: false,
            selectedTerrainType: props.cellTypes[0],
        };
    }
    componentWillReceiveProps(newProps: ITerrainEditorProps) {
        if (this.state.selectedTerrainType === undefined || newProps.cellTypes.indexOf(this.state.selectedTerrainType) == -1)
            this.setState(function (prevState) {
                return {
                    isEditingTerrainType: prevState.isEditingTerrainType,
                    isDrawingOnMap: prevState.isDrawingOnMap,
                    selectedTerrainType: newProps.cellTypes[0],
                }
            });
    }
    componentWillUpdate(nextProps: ITerrainEditorProps, nextState: ITerrainEditorState) {
        if (this.state.isDrawingOnMap && !nextState.isDrawingOnMap)
            this.props.hasDrawn(true);
    }
    render() {
        if (this.state.isEditingTerrainType)
            return <CellTypeEditor editingType={this.state.selectedTerrainType} cellTypes={this.props.cellTypes} updateCellTypes={this.cellTypesChanged.bind(this)} />;

        let that = this;
        return <form>
            <p>Select a terrain type to draw onto the map. Double click/tap on a terrain type to edit it.</p>
            <div className="palleteList">
                {this.props.cellTypes.map(function(type, id) {
                    let classes = type == that.state.selectedTerrainType ? 'selected' : undefined;
                    return <div key={id.toString()} className={classes} style={{'backgroundColor': type.color}} onClick={that.selectTerrainType.bind(that, type)} onDoubleClick={that.showTerrainEdit.bind(that, type)}>{type.name}</div>;
                })}
            </div>
            <div role="group" className="vertical">
                <button type="button" onClick={this.showTerrainEdit.bind(this, undefined)}>Add new type</button>
            </div>
        </form>;
    }
    private selectTerrainType(type: CellType) {
        this.setState({
            isEditingTerrainType: false,
            isDrawingOnMap: false,
            selectedTerrainType: type,
        });
    }
    private showTerrainEdit(type?: CellType) {
        this.setState({
            isEditingTerrainType: true,
            isDrawingOnMap: false,
            selectedTerrainType: type,
        });
    }
    private cellTypesChanged(cellTypes: CellType[]) {
        this.setState({
            isEditingTerrainType: false,
            isDrawingOnMap: false,
        })
        this.props.updateCellTypes(cellTypes);
    }
    mouseDown(cell: MapCell) {
        if (this.state.isDrawingOnMap || this.state.selectedTerrainType === undefined)
            return;
        this.setState(function (prevState) {
            return {
                isEditingTerrainType: prevState.isEditingTerrainType,
                isDrawingOnMap: true,
            }
        });
        cell.cellType = this.state.selectedTerrainType;
        this.props.hasDrawn(false);
    }
    mouseUp(cell: MapCell) {
        if (!this.state.isDrawingOnMap)
            return;

        this.setState(function (prevState) {
            return {
                isEditingTerrainType: prevState.isEditingTerrainType,
                isDrawingOnMap: false,
            }
        });
    }
    mouseEnter(cell: MapCell) {
        if (!this.state.isDrawingOnMap || this.state.selectedTerrainType === undefined)
            return;

        cell.cellType = this.state.selectedTerrainType;
        this.props.hasDrawn(false);
    }
}