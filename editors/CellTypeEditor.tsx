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
    patternNumPerCell?: number;
    patternSize?: number;
}

class CellTypeEditor extends React.Component<ICellTypeEditorProps, ICellTypeEditorState> {
    componentWillMount() {
        if (this.props.editingType === undefined)
            this.setState({
                name: '',
                color: '#666666',
                pattern: undefined,
                patternColor: '#666666',
                patternNumPerCell: 1,
                patternSize: 1,
            });
        else
            this.setState({
                name: this.props.editingType.name,
                color: this.props.editingType.color,
                pattern: this.props.editingType.pattern,
                patternColor: this.props.editingType.patternColor === undefined ? '#666666' : this.props.editingType.patternColor,
                patternNumPerCell: this.props.editingType.patternNumberPerCell === undefined ? 1 : this.props.editingType.patternNumberPerCell,
                patternSize: this.props.editingType.patternSize === undefined ? 1 : this.props.editingType.patternSize,
            });
    }
    render() {
        let deleteButton = this.props.editingType === undefined || this.props.editingType == CellType.empty ? undefined : <button type="button" onClick={this.deleteType.bind(this)}>Delete</button>;
        let patternName = this.state.pattern === undefined ? '' : this.state.pattern;
        let numPerCell = this.state.patternNumPerCell === undefined ? '' : this.state.patternNumPerCell.toString();
        let patternSize = this.state.patternSize === undefined ? '' : this.state.patternSize.toString();

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
            <div role="group"><label htmlFor="txtPatNum">Number per Cell</label><input disabled={patternName == ''} type="number" id="txtPatNum" value={numPerCell} onChange={this.patternNumChanged.bind(this)} min="1" max="10" /></div>
            <div role="group"><label htmlFor="txtPatSize">Pattern Size</label><input disabled={patternName == ''} type="number" id="txtPatSize" value={patternSize} onChange={this.patternSizeChanged.bind(this)} step="0.01" min="0" max="1" /></div>
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
    private patternNumChanged(e: any) {
        this.setState({
            patternNumPerCell: e.target.value
        });
    }
    private patternSizeChanged(e: any) {
        this.setState({
            patternSize: e.target.value
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
            cellTypes.push(new CellType(name, color, pattern, patternColor, this.state.patternNumPerCell, this.state.patternSize));
        }
        else {
            editType.name = name;
            editType.color = color;
            editType.pattern = pattern;
            editType.patternColor = patternColor;
            editType.patternNumberPerCell = this.state.patternNumPerCell;
            editType.patternSize = this.state.patternSize;
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