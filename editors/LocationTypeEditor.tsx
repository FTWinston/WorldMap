interface ILocationTypeEditorProps {
    editingType?: LocationType;
    locationTypes: LocationType[];
    updateLocationTypes: (locationTypes: LocationType[]) => void;
}

interface ILocationTypeEditorState {
    name?: string,
    textSize?: number,
    textColor?: string,
    icon?: string,
    minDrawCellRadius?: number,
}

class LocationTypeEditor extends React.Component<ILocationTypeEditorProps, ILocationTypeEditorState> {
    componentWillMount() {
        if (this.props.editingType === undefined)
            this.setState({
                name: '',
                textSize: 18,
                textColor: '#000000',
                icon: 'small',
            });
        else
            this.setState({
                name: this.props.editingType.name,
                textSize: this.props.editingType.textSize,
                textColor: this.props.editingType.textColor,
                icon: this.props.editingType.icon,
                minDrawCellRadius: this.props.editingType.minDrawCellRadius,
            });
    }
    render() {
        let deleteButton = this.props.editingType === undefined || this.props.locationTypes.length < 2 ? undefined : <button type="button" onClick={this.deleteType.bind(this)}>Delete</button>;

        for (let id in MapLocation.icons) {
            
        }

        let that = this;
        return <form onSubmit={this.saveType.bind(this)}>
            <div role="group"><label htmlFor="txtName">Name</label><input type="text" id="txtName" value={this.state.name} onChange={this.nameChanged.bind(this)} /></div>
            <div role="group"><label htmlFor="txtSize">Text Size</label><input type="number" id="txtSize" value={this.state.textSize === undefined ? '' : this.state.textSize.toString()} onChange={this.textSizeChanged.bind(this)} /></div>
            <div role="group"><label htmlFor="inColor">Color</label><input type="color" id="inColor" value={this.state.textColor} onChange={this.colorChanged.bind(this)} /></div>
            <div role="group"><label htmlFor="ddlIcon">Icon</label>
                <select id="ddlIcon" value={this.state.icon} onChange={this.iconChanged.bind(this)}>
                    {Object.keys(MapLocation.icons).map(function(key) {
                        let icon = MapLocation.icons[key];
                        return <option selected={that.state.icon == key} value={key}>{icon.name}</option>;
                    })}
                </select>
            </div>
            <div role="group"><label htmlFor="minDrawRadius">Threshold</label><input type="number" id="minDrawRadius" value={this.state.minDrawCellRadius === undefined ? '' : this.state.minDrawCellRadius.toString()} onChange={this.minDrawRadiusChanged.bind(this)} /></div>
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
            textColor: e.target.value
        });
    }
    private textSizeChanged(e: any) {
        this.setState({
            textSize: e.target.value
        });
    }
    private iconChanged(e: any) {
        this.setState({
            icon: e.target.value
        });
    }
    private minDrawRadiusChanged(e: any) {
        this.setState({
            minDrawCellRadius: e.target.value
        });
    }
    private saveType(e: Event) {
        e.preventDefault();

        let name = this.state.name === undefined ? '' : this.state.name.trim();
        if (name == '')
            return;
        
        let textSize = this.state.textSize === undefined ? 0 : this.state.textSize;
        if (textSize <= 0)
            return;

        let textColor = this.state.textColor === undefined ? '' : this.state.textColor;
        if (textColor == '')
            return;

        let icon = this.state.icon === undefined ? '' : this.state.icon;
        if (icon == '')
            return;

        let minDrawRadius = this.state.minDrawCellRadius;
        if (minDrawRadius !== undefined && minDrawRadius < 0)
            return;

        let editType = this.props.editingType;
        let locationTypes = this.props.locationTypes.slice();
        if (editType === undefined) {
            locationTypes.push(new LocationType(name, textSize, textColor, icon, minDrawRadius));
        }
        else {
            editType.name = name;
            editType.textColor = textColor;
        }

        this.props.updateLocationTypes(locationTypes);
    }
    cancelEdit() {
        this.props.updateLocationTypes(this.props.locationTypes);
    }
    deleteType() {
        let locationTypes = this.props.locationTypes.slice();

        if (this.props.editingType !== undefined) {
            let pos = locationTypes.indexOf(this.props.editingType);
            locationTypes.splice(pos, 1);
        }
        
        this.props.updateLocationTypes(locationTypes);
    }
}