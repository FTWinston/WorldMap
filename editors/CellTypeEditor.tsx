interface ICellTypeEditorProps {
    editingType?: CellType;
    cellTypes: CellType[];
    updateCellTypes: (cellTypes: CellType[]) => void;
}

interface ICellTypeEditorState {
    name?: string;
    color?: string;
    detail?: string;
    detailColor?: string;
    detailNumPerCell?: number;
    detailSize?: number;
}

class CellTypeEditor extends React.Component<ICellTypeEditorProps, ICellTypeEditorState> {
    componentWillMount() {
        if (this.props.editingType === undefined)
            this.setState({
                name: '',
                color: '#666666',
                detail: undefined,
                detailColor: '#666666',
                detailNumPerCell: 1,
                detailSize: 1,
            });
        else
            this.setState({
                name: this.props.editingType.name,
                color: this.props.editingType.color,
                detail: this.props.editingType.detail,
                detailColor: this.props.editingType.detailColor === undefined ? '#666666' : this.props.editingType.detailColor,
                detailNumPerCell: this.props.editingType.detailNumberPerCell === undefined ? 1 : this.props.editingType.detailNumberPerCell,
                detailSize: this.props.editingType.detailSize === undefined ? 1 : this.props.editingType.detailSize,
            });
    }
    render() {
        let deleteButton = this.props.editingType === undefined || this.props.editingType == CellType.empty ? undefined : <button type="button" onClick={this.deleteType.bind(this)}>Delete</button>;
        let detailName = this.state.detail === undefined ? '' : this.state.detail;
        let numPerCell = this.state.detailNumPerCell === undefined ? '' : this.state.detailNumPerCell.toString();
        let detailSize = this.state.detailSize === undefined ? '' : this.state.detailSize.toString();

        return <form onSubmit={this.saveType.bind(this)}>
            <div role="group"><label htmlFor="txtName">Name</label><input type="text" id="txtName" value={this.state.name} onChange={this.nameChanged.bind(this)} /></div>
            <div role="group"><label htmlFor="inColor">Fill Color</label><input type="color" id="inColor" value={this.state.color} onChange={this.colorChanged.bind(this)} /></div>
            <div role="group"><label htmlFor="ddlDetail">Detail</label>
                <select id="ddlDetail" value={detailName} onChange={this.detailChanged.bind(this)}>
                    <option value="">(No detail)</option>
                    {Object.keys(MapCell.details).map(function(key) {
                        let detail = MapCell.details[key];
                        return <option key={key} value={key}>{detail.name}</option>;
                    })}
                </select>
            </div>
            <div role="group"><label htmlFor="inDetColor">Detail Color</label><input disabled={detailName == ''} type="color" id="inDetColor" value={this.state.detailColor === undefined ? '' : this.state.detailColor} onChange={this.detailColorChanged.bind(this)} /></div>
            <div role="group"><label htmlFor="txtDetNum">Number per Cell</label><input disabled={detailName == ''} type="number" id="txtDetNum" value={numPerCell} onChange={this.detailNumChanged.bind(this)} min="1" max="10" /></div>
            <div role="group"><label htmlFor="txtDetSize">Detail Size</label><input disabled={detailName == ''} type="number" id="txtDetSize" value={detailSize} onChange={this.detailSizeChanged.bind(this)} step="0.01" min="0" max="1" /></div>
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
    private detailChanged(e: any) {
        this.setState({
            detail: e.target.value
        });
    }
    private detailColorChanged(e: any) {
        this.setState({
            detailColor: e.target.value
        });
    }
    private detailNumChanged(e: any) {
        this.setState({
            detailNumPerCell: e.target.value
        });
    }
    private detailSizeChanged(e: any) {
        this.setState({
            detailSize: e.target.value
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

        let detail = this.state.detail == '' ? undefined : this.state.detail; // yes this is the other way round
        let detailColor = this.state.detailColor === '' || detail === undefined ? undefined : this.state.detailColor;

        let editType = this.props.editingType;
        let cellTypes = this.props.cellTypes.slice();
        if (editType === undefined) {
            cellTypes.push(new CellType(name, color, detail, detailColor, this.state.detailNumPerCell, this.state.detailSize));
        }
        else {
            editType.name = name;
            editType.color = color;
            editType.detail = detail;
            editType.detailColor = detailColor;
            editType.detailNumberPerCell = this.state.detailNumPerCell;
            editType.detailSize = this.state.detailSize;
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