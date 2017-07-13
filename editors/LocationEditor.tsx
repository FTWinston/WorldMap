interface ILocationEditorProps {
    selectedLocation: MapLocation;
    isNew: boolean;
    locationTypes: LocationType[];
    locations: MapLocation[];
    updateLocations: (locations: MapLocation[]) => void;
}

interface ILocationEditorState {
    name: string;
    type: LocationType;
}

class LocationEditor extends React.Component<ILocationEditorProps, ILocationEditorState> {
    componentWillMount() {
        let loc = this.props.selectedLocation;
        this.setState({
            name: loc.name,
            type: loc.type,
        });
    }
    componentWillReceiveProps(nextProps: ILocationEditorProps) {
        let loc = nextProps.selectedLocation;
        this.setState({
            name: loc.name,
            type: loc.type,
        });
    }
    render() {
        let cancelButton = this.props.isNew ? undefined : <button type="button" onClick={this.cancelEdit.bind(this)}>Cancel</button>;
        let that = this;

        return <form onSubmit={this.saveLocation.bind(this)}>
            <div role="group"><label htmlFor="txtName">Name</label><input type="text" id="txtName" value={this.state.name} onChange={this.nameChanged.bind(this)} /></div>
            <div role="group"><label htmlFor="ddlType">Type</label>
                <select value={this.props.locationTypes.indexOf(this.state.type).toString()} onChange={this.typeChanged.bind(this)}>
                    {this.props.locationTypes.map(function(type, id) {
                        return <option key={id.toString()} value={id.toString()}>{type.name}</option>;
                    })}
                </select>
            </div>
            <div role="group">
                <button type="submit">Save location</button>
                {cancelButton}
                <button type="button" onClick={this.deleteType.bind(this)}>Delete</button>
            </div>
        </form>;
    }
    private nameChanged(e: any) {
        this.setState({
            name: e.target.value,
            type: this.state.type,
        });
    }
    private typeChanged(e: any) {
        this.setState({
            name: this.state.name,
            type: this.props.locationTypes[e.target.value],
        });
    }
    private saveLocation(e: Event) {
        e.preventDefault();

        let name = this.state.name === undefined ? '' : this.state.name.trim();
        if (name == '')
            return;
        
        let editLocation = this.props.selectedLocation;
        editLocation.name = name;
        editLocation.type = this.state.type;
        
        let locations;
        let pos = this.props.locations.indexOf(editLocation);
        if (pos == -1) {
            locations = this.props.locations.slice();
            locations.push(editLocation);
        }
        else
            locations = this.props.locations;

        this.props.updateLocations(locations);
    }
    cancelEdit() {
        this.props.updateLocations(this.props.locations);
    }
    deleteType() {
        let locationTypes = this.props.locations.slice();

        let pos = locationTypes.indexOf(this.props.selectedLocation);
        if (pos != -1)
            locationTypes.splice(pos, 1);
        
        this.props.updateLocations(locationTypes);
    }
}