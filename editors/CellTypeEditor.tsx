interface ICellTypeEditorProps {
    editingType?: CellType;
    cellTypes: CellType[];
    updateCellTypes: (cellTypes: CellType[]) => void;
}

interface ICellTypeEditorState {
    name: string;
    color: string;
    height: number;
    temperature: number;
    precipitation: number;
    noiseScale: number;
    noiseIntensity: number;
    noiseDensity: number;
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
                height: 0.5,
                temperature: 0.5,
                precipitation: 0.5,
                noiseScale: 4,
                noiseIntensity: 0.1,
                noiseDensity: 0.3,
                detail: undefined,
                detailColor: '#666666',
                detailNumPerCell: 1,
                detailSize: 1,
            });
        else
            this.setState({
                name: this.props.editingType.name,
                color: this.props.editingType.color,
                height: this.props.editingType.genHeight,
                temperature: this.props.editingType.genTemperature,
                precipitation: this.props.editingType.genPrecipitation,
                noiseScale: this.props.editingType.noiseScale,
                noiseIntensity: this.props.editingType.noiseIntensity,
                noiseDensity: this.props.editingType.noiseDensity,
                detail: this.props.editingType.detail,
                detailColor: this.props.editingType.detailColor === undefined ? '#666666' : this.props.editingType.detailColor,
                detailNumPerCell: this.props.editingType.detailNumberPerCell === undefined ? 1 : this.props.editingType.detailNumberPerCell,
                detailSize: this.props.editingType.detailSize === undefined ? 1 : this.props.editingType.detailSize,
            });
    }
    render() {
        let deleteButton = this.props.editingType === undefined || this.props.editingType == CellType.empty ? undefined : <button type="button" onClick={this.deleteType.bind(this)}>Delete</button>;
        
        let height = this.state.height.toString();
        let temperature = this.state.temperature.toString();
        let precipitation = this.state.precipitation.toString();

        let noiseScale = this.state.noiseScale.toString();
        let noiseIntensity = this.state.noiseIntensity.toString();
        let noiseDensity = this.state.noiseDensity.toString();
        
        let detailName = this.state.detail === undefined ? '' : this.state.detail;
        let numPerCell = this.state.detailNumPerCell === undefined ? '' : this.state.detailNumPerCell.toString();
        let detailSize = this.state.detailSize === undefined ? '' : this.state.detailSize.toString();

        return <form onSubmit={this.saveType.bind(this)}>
            <div role="group"><label htmlFor="txtName">Name</label><input type="text" id="txtName" value={this.state.name} onChange={this.nameChanged.bind(this)} /></div>
            <div role="group"><label htmlFor="inColor">Fill Color</label><input type="color" id="inColor" value={this.state.color} onChange={this.colorChanged.bind(this)} /></div>
            <hr />
            <div role="group"><label htmlFor="txtNoiseScale">Noise scale</label><input type="number" id="txtNoiseScale" value={noiseScale} onChange={this.noiseScaleChanged.bind(this)} step="0.5" min="1" max="25" /></div>
            <div role="group"><label htmlFor="txtNoiseIntensity">Noise intensity</label><input type="number" id="txtNoiseIntensity" value={noiseIntensity} onChange={this.noiseIntensityChanged.bind(this)} step="0.025" min="0" max="1" /></div>
            <div role="group"><label htmlFor="txtNoiseDensity">Noise density</label><input type="number" id="txtNoiseDensity" value={noiseDensity} onChange={this.noiseDensityChanged.bind(this)} step="0.05" min="0" max="1" /></div>
            <hr />
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
            <div role="group"><label htmlFor="txtDetSize">Detail Size</label><input disabled={detailName == ''} type="range" id="txtDetSize" value={detailSize} onChange={this.detailSizeChanged.bind(this)} step="0.01" min="0" max="1" /></div>
            <hr />
            <p>The following settings only affect auto-generation</p>
            <div role="group"><label htmlFor="txtHeight">Height</label><input type="range" id="txtHeight" value={height} onChange={this.heightChanged.bind(this)} step="0.01" min="0" max="1" /></div>
            <div role="group"><label htmlFor="txtTemperature">Temperature</label><input type="range" id="txtTemperature" value={temperature} onChange={this.temperatureChanged.bind(this)} step="0.01" min="0" max="1" /></div>
            <div role="group"><label htmlFor="txtPrecipitation">Precipitation</label><input type="range" id="txtPrecipitation" value={precipitation} onChange={this.precipitationChanged.bind(this)} step="0.01" min="0" max="1" /></div>
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
    private heightChanged(e: any) {
        this.setState({
            height: parseFloat(e.target.value),
        });
    }
    private temperatureChanged(e: any) {
        this.setState({
            temperature: parseFloat(e.target.value),
        });
    }
    private precipitationChanged(e: any) {
        this.setState({
            precipitation: parseFloat(e.target.value),
        });
    }
    private noiseScaleChanged(e: any) {
        this.setState({
            noiseScale: parseFloat(e.target.value),
        });
    }
    private noiseIntensityChanged(e: any) {
        this.setState({
            noiseIntensity: parseFloat(e.target.value),
        });
    }
    private noiseDensityChanged(e: any) {
        this.setState({
            noiseDensity: parseFloat(e.target.value),
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
            detailNumPerCell: parseInt(e.target.value),
        });
    }
    private detailSizeChanged(e: any) {
        this.setState({
            detailSize: parseFloat(e.target.value),
        });
    }
    private saveType(e: Event) {
        e.preventDefault();

        let name = this.state.name.trim();
        let color = this.state.color;

        if (name.length == 0 || color.length == 0)
            return;

        let detail = this.state.detail == '' ? undefined : this.state.detail; // yes this is the other way round
        let detailColor = this.state.detailColor === '' || detail === undefined ? undefined : this.state.detailColor;

        let editType = this.props.editingType;
        let cellTypes = this.props.cellTypes.slice();
        if (editType === undefined) {
            cellTypes.push(new CellType(name, color, this.state.height, this.state.temperature, this.state.precipitation, this.state.noiseScale, this.state.noiseIntensity, this.state.noiseDensity, detail, detailColor, this.state.detailNumPerCell, this.state.detailSize));
        }
        else {
            editType.name = name;
            editType.color = color;
            editType.genHeight = this.state.height;
            editType.genTemperature = this.state.temperature;
            editType.genPrecipitation = this.state.precipitation;
            editType.noiseScale = this.state.noiseScale;
            editType.noiseIntensity = this.state.noiseIntensity;
            editType.noiseDensity = this.state.noiseDensity;
            editType.detail = detail;
            editType.detailColor = detailColor;
            editType.detailNumberPerCell = this.state.detailNumPerCell;
            editType.detailSize = this.state.detailSize;
            editType.updateTexture();
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