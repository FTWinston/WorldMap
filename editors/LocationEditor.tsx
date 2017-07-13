interface ILocationEditorProps {
    selectedCell: MapCell;
    locationTypes: LocationType[];
    locations: MapLocation[];
    updateLocations: (locations: MapLocation[]) => void;
}

interface ILocationEditorState {
    editing?: MapLocation;
    name: string;
    type: LocationType;
}

class LocationEditor extends React.Component<ILocationEditorProps, ILocationEditorState> {
    private getLocationByCell(cell: MapCell) {
        for (let location of this.props.locations)
            if (location.cell == cell)
                return location;
        return undefined;
    }
    private setLocationFromCell(cell: MapCell) {
        let editingLoc = this.getLocationByCell(cell);
        if (editingLoc === undefined)
            this.setState({
                name: '',
                type: this.props.locationTypes[0],
                editing: undefined,
            });
        else
            this.setState({
                name: editingLoc.name,
                type: editingLoc.type,
                editing: editingLoc,
            });
    }
    componentWillMount() {
        this.setLocationFromCell(this.props.selectedCell);
    }
    componentWillReceiveProps(nextProps: ILocationEditorProps) {
        this.setLocationFromCell(nextProps.selectedCell);
    }
    render() {
        let deleteButton = this.state.editing === undefined ? undefined : <button type="button" onClick={this.deleteType.bind(this)}>Delete</button>;
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
                <button type="button" onClick={this.cancelEdit.bind(this)}>Cancel</button>
                {deleteButton}
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
        
        let editLocation = this.state.editing;
        let locationTypes = this.props.locations.slice();
        if (editLocation === undefined) {
            locationTypes.push(new MapLocation(this.props.selectedCell, name, this.state.type));
        }
        else {
            editLocation.name = name;
            editLocation.type = this.state.type;
        }

        this.props.updateLocations(locationTypes);
    }
    cancelEdit() {
        this.props.updateLocations(this.props.locations);
    }
    deleteType() {
        let locationTypes = this.props.locations.slice();

        if (this.state.editing !== undefined) {
            let pos = locationTypes.indexOf(this.state.editing);
            locationTypes.splice(pos, 1);
        }
        
        this.props.updateLocations(locationTypes);
    }
}