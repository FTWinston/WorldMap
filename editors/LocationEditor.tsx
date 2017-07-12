interface ILocationEditorProps {
    selectedCell: MapCell;
    editing?: MapLocation;
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
        if (this.props.editing === undefined)
            this.setState({
                name: '',
                type: this.props.locationTypes[0],
            });
        else
            this.setState({
                name: this.props.editing.name,
                type: this.props.editing.type,
            });
    }
    render() {
        let deleteButton = this.props.editing === undefined ? undefined : <button type="button" onClick={this.deleteType.bind(this)}>Delete</button>;
        let that = this;

        return <form onSubmit={this.saveLocation.bind(this)}>
            <div role="group"><label htmlFor="txtName">Name</label><input type="text" id="txtName" value={this.state.name} onChange={this.nameChanged.bind(this)} /></div>
            <div role="group"><label htmlFor="ddlType">Type</label>
                <select value={this.props.locationTypes.indexOf(this.state.type).toString()} onChange={this.typeChanged.bind(this)}>
                    {this.props.locationTypes.map(function(type, id) {
                        let selected = that.props.editing !== undefined && that.props.editing.type == type;
                        return <option selected={selected} key={id.toString()} value={id.toString()}>{type.name}</option>;
                    })}
                </select>
            </div>
            <div role="group">
                <button type="submit">Save type</button>
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
        
        let editType = this.props.editing;
        let locationTypes = this.props.locations.slice();
        if (editType === undefined) {
            locationTypes.push(new MapLocation(this.props.selectedCell, name, this.state.type));
        }
        else {
            editType.name = name;
            editType.type = this.state.type;
        }

        this.props.updateLocations(locationTypes);
    }
    cancelEdit() {
        this.props.updateLocations(this.props.locations);
    }
    deleteType() {
        let locationTypes = this.props.locations.slice();

        if (this.props.editing !== undefined) {
            let pos = locationTypes.indexOf(this.props.editing);
            locationTypes.splice(pos, 1);
        }
        
        this.props.updateLocations(locationTypes);
    }
}