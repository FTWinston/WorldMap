interface ICellTypeEditorProps {
    editingType?: CellType;
    cellTypes: CellType[];
    updateCellTypes: (cellTypes: CellType[]) => void;
}

interface ICellTypeEditorState {
    name?: string;
    color?: string;
}

class CellTypeEditor extends React.Component<ICellTypeEditorProps, ICellTypeEditorState> {
    componentWillMount() {
        if (this.props.editingType === undefined)
            this.setState({
                name: '',
                color: '#666666',
            });
        else
            this.setState({
                name: this.props.editingType.name,
                color: this.props.editingType.color,
            });
    }
    render() {
        let deleteButton = this.props.editingType === undefined || this.props.editingType == CellType.empty ? undefined : <button type="button" onClick={this.deleteType.bind(this)}>Delete</button>;

        return <form onSubmit={this.saveType.bind(this)}>
            <div role="group"><label htmlFor="txtName">Name</label><input type="text" id="txtName" value={this.state.name} onChange={this.nameChanged.bind(this)} /></div>
            <div role="group"><label htmlFor="inColor">Color</label><input type="color" id="inColor" value={this.state.color} onChange={this.colorChanged.bind(this)} /></div>
            <div role="group">
                <button type="submit">Save type</button>
                <button type="button" onClick={this.cancelEdit.bind(this)}>Cancel</button>
                {deleteButton}
            </div>
        </form>;
    }
    private nameChanged(e: any) {
        this.setState({
            name: e.target.value
        });
    }
    private colorChanged(e: any) {
        this.setState({
            color: e.target.value
        });
    }
    private saveType(e: Event) {
        e.preventDefault();

        let name = this.state.name === undefined ? '' : this.state.name.trim();
        if (name == '')
            return;
        
        let color = this.state.color === undefined ? '' : this.state.color;
        if (color == '')
            return;

        let editType = this.props.editingType;
        let cellTypes = this.props.cellTypes.slice();
        if (editType === undefined) {
            cellTypes.push(new CellType(name, color));
        }
        else {
            editType.name = name;
            editType.color = color;
        }

        this.props.updateCellTypes(cellTypes);
    }
    cancelEdit() {
        this.props.updateCellTypes(this.props.cellTypes);
    }
    deleteType() {
        let cellTypes = this.props.cellTypes.slice();

        if (this.props.editingType !== undefined) {
            let pos = cellTypes.indexOf(this.props.editingType);
            cellTypes.splice(pos, 1);
            // TODO: deleting a cell type should convert all cells using that type to "empty"
        }
        
        this.props.updateCellTypes(cellTypes);
    }
}