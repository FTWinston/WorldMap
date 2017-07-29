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
    componentWillUpdate(nextProps: ITerrainEditorProps, nextState: ITerrainEditorState) {
        if (this.state.isDrawingOnMap && !nextState.isDrawingOnMap)
            this.props.hasDrawn(true);
    }
    componentDidUpdate(prevProps: ITerrainEditorProps, prevState: ITerrainEditorState) {
        if (this.state.selectedTerrainType === undefined || this.props.cellTypes.indexOf(this.state.selectedTerrainType) == -1) {
            this.setState(function (prevState) {
                return {
                    isEditingTerrainType: false,
                    isDrawingOnMap: false,
                    selectedTerrainType: this.props.cellTypes[0],
                }
            });
        }
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
        
        this.setState({
            isDrawingOnMap: true,
        });
        cell.cellType = this.state.selectedTerrainType;
        this.props.hasDrawn(false);
    }
    mouseUp(cell: MapCell) {
        if (!this.state.isDrawingOnMap)
            return;

        this.setState({
            isDrawingOnMap: false,
        });
    }
    mouseEnter(cell: MapCell) {
        if (!this.state.isDrawingOnMap || this.state.selectedTerrainType === undefined)
            return;

        cell.cellType = this.state.selectedTerrainType;
        this.props.hasDrawn(false);
    }

    replacingMap(map: MapData) {
        let cellType: CellType | undefined;
        let editingType = this.state.isEditingTerrainType;

        if (this.state.selectedTerrainType !== undefined) {
            let index = this.props.cellTypes.indexOf(this.state.selectedTerrainType);
            cellType = map.cellTypes[index];
        }
        if (cellType === undefined) {
            cellType = map.cellTypes[0];
            editingType = false;
        }

        this.setState({
            isEditingTerrainType: editingType,
            selectedTerrainType: cellType,
            isDrawingOnMap: false, 
        });
    }
}