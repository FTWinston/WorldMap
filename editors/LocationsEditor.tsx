interface ILocationsEditorProps {
    locationTypes: LocationType[];
    locations: MapLocation[];
    typesChanged: (types: LocationType[]) => void;
    locationsChanged: (locations: MapLocation[]) => void;
}

interface ILocationsEditorState {
    isEditingLocationType: boolean;
    isEditingLocation: boolean;
    selectedCell?: MapCell;
    selectedType?: LocationType;
}

class LocationsEditor extends React.Component<ILocationsEditorProps, ILocationsEditorState> {
    constructor(props: ILocationsEditorProps) {
        super(props);

        this.state = {
            isEditingLocation: false,
            isEditingLocationType: false,
        };
    }
    componentWillReceiveProps(newProps: ILocationsEditorProps) {
        if (this.state.selectedType === undefined || newProps.locationTypes.indexOf(this.state.selectedType) == -1)
            this.setState(function (prevState) {
                return {
                    isEditingLocation: prevState.isEditingLocation,
                    isEditingLocationType: false,
                    selectedTerrainType: undefined,
                }
            });
    }
    render() {
        if (this.state.isEditingLocationType)
            return <LocationTypeEditor editingType={this.state.selectedType} locationTypes={this.props.locationTypes} updateLocationTypes={this.locationTypesChanged.bind(this)} />;
        if (this.state.isEditingLocation && this.state.selectedCell !== undefined)
            return <LocationEditor selectedCell={this.state.selectedCell} locations={this.props.locations} locationTypes={this.props.locationTypes} updateLocations={this.locationChanged.bind(this)} />;
            
        let that = this;
        return <form>
            <p>Click on the map to place a new location. Select a location type to edit it.</p>
            <div className="palleteList">
                {this.props.locationTypes.map(function(type, id) {
                    let classes = type == that.state.selectedType ? 'selected' : undefined;
                    return <div key={id.toString()} className={classes} style={{'color': type.textColor}} onClick={that.showTypeEditor.bind(that, type)}>{type.name}</div>;
                })}
            </div>
            <div role="group" className="vertical">
                <button type="button" onClick={this.showTypeEditor.bind(this, undefined)}>Add new type</button>
            </div>
        </form>;
    }
    private showTypeEditor(type: LocationType) {
        this.setState({
            isEditingLocationType: true,
            isEditingLocation: false,
            selectedType: type,
        });
    }
    private locationTypesChanged(types: LocationType[]) {
        this.setState({
            isEditingLocationType: false,
            isEditingLocation: false,
            selectedType: undefined,
        })
        this.props.typesChanged(types);
    }
    private locationChanged(locations: MapLocation[]) {
        this.setState({
            isEditingLocationType: false,
            isEditingLocation: false,
            selectedType: undefined,
        })
        this.props.locationsChanged(locations);
    }
    mouseUp(cell: MapCell) {
        this.setState({
            isEditingLocationType: false,
            isEditingLocation: true,
            selectedCell: cell,
        });
    }
}