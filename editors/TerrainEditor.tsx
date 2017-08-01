interface ITerrainEditorProps {
    terrainTypes: TerrainType[];
    vegetationTypes: VegetationType[];
    updateTerrainTypes: (types: TerrainType[]) => void;
    updateVegetationTypes: (types: VegetationType[]) => void;
    hasDrawn: (endOfStroke: boolean) => void;
}

interface ITerrainEditorState {
    isEditingTerrainType: boolean;
    isEditingVegetationType: boolean;
    isDrawingOnMap: boolean;
    selectedTerrainType?: TerrainType;
    selectedVegetationType?: VegetationType;
}

class TerrainEditor extends React.Component<ITerrainEditorProps, ITerrainEditorState> implements IMapEditor {
    constructor(props: ITerrainEditorProps) {
        super(props);

        this.state = {
            isEditingTerrainType: false,
            isEditingVegetationType: false,
            isDrawingOnMap: false,
            selectedTerrainType: props.terrainTypes[0],
            selectedVegetationType: props.vegetationTypes[0],
        };
    }
    componentWillUpdate(nextProps: ITerrainEditorProps, nextState: ITerrainEditorState) {
        if (this.state.isDrawingOnMap && !nextState.isDrawingOnMap)
            this.props.hasDrawn(true);
    }
    componentDidUpdate(prevProps: ITerrainEditorProps, prevState: ITerrainEditorState) {
        if (this.state.selectedTerrainType === undefined || this.props.terrainTypes.indexOf(this.state.selectedTerrainType) == -1)
            this.setState({
                isEditingTerrainType: false,
                isDrawingOnMap: false,
                selectedTerrainType: this.props.terrainTypes[0],
            });

        if (this.state.selectedVegetationType === undefined || this.props.vegetationTypes.indexOf(this.state.selectedVegetationType) == -1)
            this.setState({
                isEditingVegetationType: false,
                isDrawingOnMap: false,
                selectedVegetationType: this.props.vegetationTypes[0],
            });
    }
    render() {
        if (this.state.isEditingTerrainType)
            return <CellTypeEditor editingType={this.state.selectedTerrainType} cellTypes={this.props.terrainTypes} updateCellTypes={this.terrainTypesChanged.bind(this)} />; // TODO: terrain type editor

        if (this.state.isEditingVegetationType)
            return <CellTypeEditor editingType={this.state.selectedTerrainType} cellTypes={this.props.terrainTypes} updateCellTypes={this.vegetationTypesChanged.bind(this)} />; // TODO: vegetation type editor

        let that = this;
        return <form>
            <p>Select a terrain type to draw onto the map. Double click/tap on a terrain type to edit it.</p>
            <div className="palleteList">
                {this.props.terrainTypes.map(function(type, id) {
                    let classes = type == that.state.selectedTerrainType ? 'selected' : undefined;
                    return <div key={id.toString()} className={classes} onClick={that.selectTerrainType.bind(that, type)} onDoubleClick={that.showTerrainTypeEdit.bind(that, type)}>{type.name}</div>;
                })}
            </div>
            <div role="group" className="vertical">
                <button type="button" onClick={this.showTerrainTypeEdit.bind(this, undefined)}>Add new terrain type</button>
            </div>
            <hr/>
            <p>Select a vegetation type to draw onto the map. Double click/tap on a vegetation type to edit it.</p>
            <div className="palleteList">
                {this.props.vegetationTypes.map(function(type, id) {
                    let classes = type == that.state.selectedVegetationType ? 'selected' : undefined;
                    return <div key={id.toString()} className={classes} style={{'backgroundColor': type.color}} onClick={that.selectVegetationType.bind(that, type)} onDoubleClick={that.showVegetationTypeEdit.bind(that, type)}>{type.name}</div>;
                })}
            </div>
            <div role="group" className="vertical">
                <button type="button" onClick={this.showVegetationTypeEdit.bind(this, undefined)}>Add new vegetation type</button>
            </div>
            <hr/>
        </form>;
    }
    private selectTerrainType(type: TerrainType) {
        this.setState({
            isEditingTerrainType: false,
            isDrawingOnMap: false,
            selectedTerrainType: type,
        });
    }
    private showTerrainTypeEdit(type?: TerrainType) {
        this.setState({
            isEditingTerrainType: true,
            isDrawingOnMap: false,
            selectedTerrainType: type,
        });
    }
    private selectVegetationType(type: VegetationType) {
        this.setState({
            isEditingVegetationType: false,
            isDrawingOnMap: false,
            selectedVegetationType: type,
        });
    }
    private showVegetationTypeEdit(type?: VegetationType) {
        this.setState({
            isEditingVegetationType: true,
            isDrawingOnMap: false,
            selectedVegetationType: type,
        });
    }
    private terrainTypesChanged(terrainTypes: TerrainType[]) {
        this.setState({
            isEditingTerrainType: false,
            isDrawingOnMap: false,
        })
        this.props.updateTerrainTypes(terrainTypes);
    }
    private vegetationTypesChanged(vegetationTypes: VegetationType[]) {
        this.setState({
            isEditingVegetationType: false,
            isDrawingOnMap: false,
        })
        this.props.updateVegetationTypes(vegetationTypes);
    }
    mouseDown(cell: MapCell) {
        if (this.state.isDrawingOnMap || this.state.selectedTerrainType === undefined)
            return;
        
        this.setState({
            isDrawingOnMap: true,
        });
        
        this.draw(cell);
    }
    mouseUp(cell: MapCell) {
        if (!this.state.isDrawingOnMap)
            return;

        this.setState({
            isDrawingOnMap: false,
        });
    }
    mouseEnter(cell: MapCell) {
        if (!this.state.isDrawingOnMap || this.state.selectedTerrainType === undefined)
            return;

        this.draw(cell);
    }
    private draw(cell: MapCell) {
        if (this.state.selectedTerrainType !== undefined)
            cell.terrain = this.state.selectedTerrainType;
        if (this.state.selectedVegetationType !== undefined)
            cell.vegetation = this.state.selectedVegetationType;

        this.props.hasDrawn(false);
    }

    onReplacingMap(map: MapData) {
        let terrainType: TerrainType | undefined;
        let editingTerrainType = this.state.isEditingTerrainType;

        if (this.state.selectedTerrainType !== undefined) {
            let index = this.props.terrainTypes.indexOf(this.state.selectedTerrainType);
            terrainType = map.terrainTypes[index];
        }
        if (terrainType === undefined) {
            terrainType = map.terrainTypes[0];
            editingTerrainType = false;
        }

        let vegetationType: VegetationType | undefined;
        let editingVegetationType = this.state.isEditingVegetationType;

        if (this.state.selectedVegetationType !== undefined) {
            let index = this.props.vegetationTypes.indexOf(this.state.selectedVegetationType);
            vegetationType = map.vegetationTypes[index];
        }
        if (vegetationType === undefined) {
            vegetationType = map.vegetationTypes[0];
            editingVegetationType = false;
        }

        this.setState({
            isEditingTerrainType: editingTerrainType,
            isEditingVegetationType: editingVegetationType,
            selectedTerrainType: terrainType,
            selectedVegetationType: vegetationType,
            isDrawingOnMap: false, 
        });
    }
}