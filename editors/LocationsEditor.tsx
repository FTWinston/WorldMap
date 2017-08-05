interface ILocationsEditorProps {
    locationTypes: LocationType[];
    locations: MapLocation[];
    typesChanged: (types: LocationType[]) => void;
    locationsChanged: (locations: MapLocation[]) => void;
}

interface ILocationsEditorState {
    isEditingLocationType: boolean;
    isEditingLocation: boolean;
    isNewLocation: boolean;
    selectedLocation?: MapLocation;
    selectedLocationType: LocationType;
}

class LocationsEditor extends React.Component<ILocationsEditorProps, ILocationsEditorState> {
    constructor(props: ILocationsEditorProps) {
        super(props);

        this.state = {
            isEditingLocation: false,
            isEditingLocationType: false,
            isNewLocation: false,
            selectedLocationType: props.locationTypes[0],
        };
    }
    componentDidUpdate(prevProps: ILocationsEditorProps, prevState: ILocationsEditorState) {
        if (this.state.selectedLocationType !== undefined && this.props.locationTypes.indexOf(this.state.selectedLocationType) == -1) {
            this.setState(function (prevState) {
                return {
                    isEditingLocationType: false,
                    isNewLocation: false,
                    selectedLocationType: this.props.locationTypes[0],
                }
            });
        }
    }
    componentWillReceiveProps(newProps: ILocationsEditorProps) {
        if (this.state.selectedLocationType !== undefined && newProps.locationTypes.indexOf(this.state.selectedLocationType) == -1)
            this.setState(function (prevState) {
                return {
                    isEditingLocationType: false,
                    isNewLocation: false,
                    selectedLocationType: newProps.locationTypes[0],
                }
            });
    }
    render() {
        if (this.state.isEditingLocationType)
            return <LocationTypeEditor editingType={this.state.selectedLocationType} locationTypes={this.props.locationTypes} updateLocationTypes={this.locationTypesChanged.bind(this)} />;
        if (this.state.isEditingLocation && this.state.selectedLocation !== undefined)
            return <LocationEditor selectedLocation={this.state.selectedLocation} isNew={this.state.isNewLocation} locations={this.props.locations} locationTypes={this.props.locationTypes} updateLocations={this.locationChanged.bind(this)} />;
            
        let that = this;
        return <form>
            <p>Select a location type to place onto the map. Double click/tap on a terrain type to edit it.</p>
            <div className="palleteList">
                {this.props.locationTypes.map(function(type, id) {
                    let classes = type == that.state.selectedLocationType ? 'selected' : undefined;
                    return <div key={id.toString()} className={classes} onClick={that.selectLocationType.bind(that, type)} onDoubleClick={that.showTypeEditor.bind(that, type)}>{type.name}</div>;
                })}
            </div>
            <div role="group" className="vertical">
                <button type="button" onClick={this.showTypeEditor.bind(this, undefined)}>Add new type</button>
            </div>
        </form>;
    }
    private selectLocationType(type: LocationType) {
        this.setState({
            isEditingLocationType: false,
            isEditingLocation: false,
            isNewLocation: false,
            selectedLocationType: type,
        });
    }
    private showTypeEditor(type: LocationType) {
        this.setState({
            isEditingLocationType: true,
            isEditingLocation: false,
            isNewLocation: false,
            selectedLocationType: type,
        });
    }
    private locationTypesChanged(types: LocationType[]) {
        this.setState({
            isEditingLocationType: false,
            isEditingLocation: false,
            isNewLocation: false,
        })
        this.props.typesChanged(types);
    }
    private locationChanged(locations: MapLocation[]) {
        this.setState({
            isEditingLocationType: false,
            isEditingLocation: false,
            isNewLocation: false,
        })
        this.props.locationsChanged(locations);
    }
    mouseUp(cell: MapCell) {
        let locations = this.props.locations;

        let loc = MapLocation.getByCell(cell, locations);
        let isNew;
        if (loc === undefined) {
            loc = new MapLocation(cell, 'New ' + this.state.selectedLocationType.name, this.state.selectedLocationType);
            isNew = true;

            locations.push(loc);
            this.props.locationsChanged(locations);
        }
        else
            isNew = false;

        this.setState({
            isEditingLocationType: false,
            isEditingLocation: true,
            isNewLocation: isNew,
            selectedLocation: loc,
        });
    }

    replacingMap(map: MapData) {
        let locationType: LocationType | undefined;
        let editingType = this.state.isEditingLocationType;

        if (this.state.selectedLocationType !== undefined) {
            let index = this.props.locationTypes.indexOf(this.state.selectedLocationType);
            locationType = map.locationTypes[index];
        }
        if (locationType === undefined) {
            locationType = map.locationTypes[0];
            editingType = false;
        }

        let location: MapLocation | undefined;
        let editingLocation = this.state.isEditingLocation;
        
        if (this.state.selectedLocation !== undefined) {
            let index = this.props.locations.indexOf(this.state.selectedLocation);
            location = map.locations[index];
        }
        if (location === undefined)
            editingLocation = false;

        this.setState({
            isEditingLocationType: editingType,
            isEditingLocation: editingLocation,
            selectedLocationType: locationType,
        });
    }
}