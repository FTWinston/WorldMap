interface ICellTypeEditorProps {
    editingType?: CellType;
    cellTypes: CellType[];
    updateCellTypes: (cellTypes: CellType[]) => void;
}

interface ICellTypeEditorState {
    name?: string;
    color?: string;
    pattern?: string;
    patternColor?: string;
}

class CellTypeEditor extends React.Component<ICellTypeEditorProps, ICellTypeEditorState> {
    componentWillMount() {
        if (this.props.editingType === undefined)
            this.setState({
                name: '',
                color: '#666666',
                pattern: undefined,
                patternColor: '#666666',
            });
        else
            this.setState({
                name: this.props.editingType.name,
                color: this.props.editingType.color,
                pattern: this.props.editingType.pattern,
                patternColor: this.props.editingType.patternColor === undefined ? '#666666' : this.props.editingType.patternColor,
            });
    }
    render() {
        let deleteButton = this.props.editingType === undefined || this.props.editingType == CellType.empty ? undefined : <button type="button" onClick={this.deleteType.bind(this)}>Delete</button>;
        let patternName = this.state.pattern === undefined ? '' : this.state.pattern;

        return <form onSubmit={this.saveType.bind(this)}>
            <div role="group"><label htmlFor="txtName">Name</label><input type="text" id="txtName" value={this.state.name} onChange={this.nameChanged.bind(this)} /></div>
            <div role="group"><label htmlFor="inColor">Fill Color</label><input type="color" id="inColor" value={this.state.color} onChange={this.colorChanged.bind(this)} /></div>
            <div role="group"><label htmlFor="ddlPattern">Pattern</label>
                <select id="ddlIcon" value={patternName} onChange={this.patternChanged.bind(this)}>
                    <option value="">(No pattern)</option>
                    {Object.keys(MapCell.patterns).map(function(key) {
                        let pattern = MapCell.patterns[key];
                        return <option key={key} value={key}>{pattern.name}</option>;
                    })}
                </select>
            </div>
            <div role="group"><label htmlFor="inPatColor">Pattern Color</label><input disabled={patternName == ''} type="color" id="inPatColor" value={this.state.patternColor === undefined ? '' : this.state.patternColor} onChange={this.patternColorChanged.bind(this)} /></div>
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
    private patternChanged(e: any) {
        this.setState({
            pattern: e.target.value
        });
    }
    private patternColorChanged(e: any) {
        this.setState({
            patternColor: e.target.value
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

        let pattern = this.state.pattern == '' ? undefined : this.state.pattern; // yes this is the other way round

        let patternColor = this.state.patternColor === '' || pattern === undefined ? undefined : this.state.patternColor;

        let editType = this.props.editingType;
        let cellTypes = this.props.cellTypes.slice();
        if (editType === undefined) {
            cellTypes.push(new CellType(name, color, pattern, patternColor));
        }
        else {
            editType.name = name;
            editType.color = color;
            editType.pattern = pattern;
            editType.patternColor = patternColor;
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
        }
        
        this.props.updateCellTypes(cellTypes);
    }
}