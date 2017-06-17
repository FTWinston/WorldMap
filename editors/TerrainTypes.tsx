interface ITerrainEditorState {
    cellTypes: CellType[];
    editingType?: CellType;
    editName?: string;
    editColor?: string;
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
        this.setState({
            cellTypes: newProps.cellTypes.slice(),
            editingType: undefined,
        });
    }
    render() {
        if (this.state.editName === undefined)
            return this.renderAllTypes();
        else
            return this.renderTypeEdit();
    }
    private renderAllTypes() {
        let that = this;
        return <div>
            <div className="palleteList">
                {this.state.cellTypes.map(function(type, id) {
                    return <div key={id.toString()} style={{'backgroundColor': type.color}} onClick={that.showEdit.bind(that, type)}>{type.name}</div>;
                })}
            </div>
            <p className="prompt">Click a terrain type to edit it.</p>
            <button type="button" onClick={this.showEdit.bind(this, undefined)}>Add new type</button>
        </div>;
    }
    private renderTypeEdit() {
        let deleteButton = this.state.editingType === undefined ? undefined : <button type="button" onClick={this.deleteType.bind(this)}>Delete</button>;

        return <form onSubmit={this.saveType.bind(this)}>
            <div role="group"><label htmlFor="txtName">Name</label><input type="text" id="txtName" value={this.state.editName} onChange={this.nameChanged.bind(this)} /></div>
            <div role="group"><label htmlFor="inColor">Color</label><input type="color" id="inColor" value={this.state.editColor} onChange={this.colorChanged.bind(this)} /></div>
            <div role="group">
                <button type="submit">Save type</button>
                <button type="button" onClick={this.cancelEdit.bind(this)}>Cancel</button>
                {deleteButton}
            </div>
        </form>;
    }
    private nameChanged(e: any) {
        this.setState({
            editName: e.target.value,
            cellTypes: this.state.cellTypes,
        });
    }
    private colorChanged(e: any) {
        this.setState({
            editColor: e.target.value,
            cellTypes: this.state.cellTypes,
        });
    }
    private showEdit(type?: CellType) {
        let name: string, color: string;
        if (type === undefined) {
            name = '';
            color = '#666666';
        }
        else {
            name = type.name;
            color = type.color;
        }

        this.setState({
            cellTypes: this.state.cellTypes,
            editingType: type,
            editName: name,
            editColor: color,
        });
    }
    private saveType(e: Event) {
        e.preventDefault();

        let name = this.state.editName === undefined ? '' : this.state.editName.trim();
        if (name == '')
            return;
        
        let color = this.state.editColor === undefined ? '' : this.state.editColor;
        if (color == '')
            return;

        let editType = this.state.editingType;
        this.setState(function (state) {
            let cellTypes = state.cellTypes;
            if (editType === undefined) {
                cellTypes.push(new CellType(name, color));
            }
            else {
                editType.name = name;
                editType.color = color;
            }

            this.props.updateCellTypes(cellTypes);
            return {
                cellTypes: cellTypes,
                editingType: undefined,
                editName: undefined,
                editColor: undefined,
            };
        });
    }
    cancelEdit() {
        this.setState({
            editingType: undefined,
            editName: undefined,
            editColor: undefined,
            cellTypes: this.state.cellTypes,
        });
    }
    deleteType() {
        this.setState(function (state) {
            let cellTypes = state.cellTypes;
            if (state.editingType !== undefined) {
                let pos = cellTypes.indexOf(state.editingType);
                cellTypes.splice(pos, 1);
            }

            this.props.updateCellTypes(cellTypes);
            return {
                editingType: undefined,
                editName: undefined,
                editColor: undefined,
                cellTypes: cellTypes,
            }
        });
    }
}