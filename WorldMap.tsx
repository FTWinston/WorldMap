const enum EditorType {
    Download,
    Overview,
    Size,
    Terrain,
    Lines,
    Locations,
    Layers,
}

interface IMapEditor {
    mouseDown?: (cell: MapCell) => void;
    mouseUp?: (cell: MapCell) => void;
    mouseEnter?: (cell: MapCell) => void;
    mouseLeave?: (cell: MapCell) => void;
    replacingMap?: (map: MapData) => void;
}

interface IWorldMapProps {
    editable: boolean;
    map: MapData;
}

interface IWorldMapState {
    map: MapData;
    activeEditor?: EditorType;
    editorHeading?: string;
    selectedLine?: MapLine;
}

class WorldMap extends React.Component<IWorldMapProps, IWorldMapState> {
    static init() {
        SaveLoad.loadData(WorldMap.display);
    }

    static instance: WorldMap;
    static display(dataJson: string|null) {
        let map = dataJson === null ? new MapData(25, 25) : MapData.loadFromJSON(dataJson);
        let editable = SaveLoad.getQueryParam('readonly') === undefined;
        WorldMap.instance = ReactDOM.render(
            <WorldMap editable={editable} map={map} />,
            document.getElementById('uiRoot') as HTMLElement
        ) as WorldMap;
    }

    constructor(props: IWorldMapProps) {
        super(props);

        this.state = {
            map: props.map,
            activeEditor: props.editable ? EditorType.Overview : undefined,
        }
    }
    private changes: ChangeHistory;
    private mapView: MapView;
    componentDidMount() {
        if (this.changes !== undefined)
            this.changes.recordChange(this.state.map); // TODO: this is an inefficient way of populating initial map state when loading a saved map. Avoid re-serializing, as that just came from text
    }
    componentDidUpdate(prevProps: IWorldMapProps, prevState: IWorldMapState) {
        if (prevState.activeEditor != this.state.activeEditor)
            this.mapView.redraw();
    }
    render() {
        if (this.state.map === undefined)
            return <div id="worldRoot" />;

        let map = <MapView map={this.state.map} scrollUI={true} renderGrid={true} ref={(c) => this.mapView = c}
                    editor={this.state.activeEditor} selectedLine={this.state.selectedLine}
                    cellMouseDown={this.cellMouseDown.bind(this)} cellMouseUp={this.cellMouseUp.bind(this)}
                    cellMouseEnter={this.cellMouseEnter.bind(this)} cellMouseLeave={this.cellMouseLeave.bind(this)} />;

        if (!this.props.editable)
            return <div id="worldRoot">
            {map}
        </div>

        let activeEditor = this.state.activeEditor === undefined ? undefined : this.renderEditor(this.state.activeEditor);
        return <div id="worldRoot">
            {map}
            <EditorControls activeEditor={this.state.activeEditor} editorSelected={this.selectEditor.bind(this)} />
            <div id="editor">
                <h1>{this.state.editorHeading}</h1>
                {activeEditor}
                <ChangeHistory ref={(c) => this.changes = c} updateMap={this.replaceMap.bind(this)} />
            </div>
        </div>;
    }
    private renderEditor(editor: EditorType): JSX.Element {
        if (this.state.map === undefined)
            return <div>No map</div>;

        const props = {
            ref: (c: IMapEditor) => this.activeEditor = c
        };
        
        switch(editor) {
            case EditorType.Download:
                return <DownloadEditor {...props} map={this.state.map} />;
            case EditorType.Overview:
                return <OverviewEditor {...props} name={this.state.map.name} description={this.state.map.description} saveChanges={this.updateDetails.bind(this)} />;
            case EditorType.Size:
                return <SizeEditor {...props} width={this.state.map.width} height={this.state.map.height} changeSize={this.changeSize.bind(this)} />;
            case EditorType.Terrain:
                return <TerrainEditor {...props} cellTypes={this.state.map.cellTypes} hasDrawn={this.terrainEdited.bind(this)} updateCellTypes={this.updateCellTypes.bind(this)} />;
            case EditorType.Lines:
                return <LinesEditor {...props} lines={this.state.map.lines} lineTypes={this.state.map.lineTypes} updateLines={this.updateLines.bind(this)} updateLineTypes={this.updateLineTypes.bind(this)} selectedLine={this.state.selectedLine} lineSelected={this.lineSelected.bind(this)} />;
            case EditorType.Locations:
                return <LocationsEditor {...props} locations={this.state.map.locations} locationTypes={this.state.map.locationTypes} locationsChanged={this.updateLocations.bind(this)} typesChanged={this.updateLocationTypes.bind(this)} />;
            case EditorType.Layers:
                return <LayersEditor {...props} />;
        }
    }
    private activeEditor?: IMapEditor;
    private cellMouseDown(cell: MapCell) {
        if (this.activeEditor !== undefined && this.activeEditor.mouseDown !== undefined)
            this.activeEditor.mouseDown(cell);
    }
    private cellMouseUp(cell: MapCell) {
        if (this.activeEditor !== undefined && this.activeEditor.mouseUp !== undefined)
            this.activeEditor.mouseUp(cell);
    }
    private cellMouseEnter(cell: MapCell) {
        if (this.activeEditor !== undefined && this.activeEditor.mouseEnter !== undefined)
            this.activeEditor.mouseEnter(cell);
    }
    private cellMouseLeave(cell: MapCell) {
        if (this.activeEditor !== undefined && this.activeEditor.mouseLeave !== undefined)
            this.activeEditor.mouseLeave(cell);
    }
    private updateDetails(name: string, desc: string) {
        if (this.state.map === undefined)
            return;
        
        this.state.map.name = name;
        this.state.map.description = desc;
        this.mapChanged();
    }
    private changeSize(width: number, height: number, mode: ResizeAnchorMode) {
        if (this.state.map === undefined)
            return;
        
        this.state.map.changeSize(width, height, mode);
        this.mapView.updateSize();
        this.mapChanged();
    }
    private updateCellTypes(cellTypes: CellType[]) {
        if (cellTypes.length == 0)
            return;
        
        // if a cell type is removed from the map, replace it with the "empty" type
        for (let currentType of this.state.map.cellTypes)
            if (cellTypes.indexOf(currentType) == -1)
                this.state.map.replaceCellType(currentType, cellTypes[0]);

        this.state.map.cellTypes = cellTypes;
        this.mapChanged();
    }
    private terrainEdited(endOfStroke: boolean = true) {
        // batch all "drawing" in the one stroke into a single undo step
        if (endOfStroke)
            this.mapChanged();
        else
            this.mapView.redraw();
    }
    private updateLocationTypes(types: LocationType[]) {
        if (types.length == 0)
            return;
        
        // if a location type is removed from the map, replace it with the first available type
        for (let currentType of this.state.map.locationTypes)
            if (types.indexOf(currentType) == -1)
                this.state.map.replaceLocationType(currentType, types[0]);

        this.state.map.locationTypes = types;
        this.mapChanged();
    }
    private updateLocations(locations: MapLocation[]) {
        this.state.map.locations = locations;
        this.mapChanged();
    }
    private updateLineTypes(types: LineType[]) {
        if (types.length == 0)
            return;
        
        // if a location type is removed from the map, replace it with the first available type
        for (let currentType of this.state.map.lineTypes)
            if (types.indexOf(currentType) == -1)
                this.state.map.replaceLineType(currentType, types[0]);

        this.state.map.lineTypes = types;
        this.mapChanged();
    }
    private lineSelected(line?: MapLine) {
        this.setState({
            selectedLine: line,
            map: this.state.map
        });
        this.mapView.redraw();
    }
    private updateLines(lines: MapLine[]) {
        this.state.map.lines = lines;
        this.mapChanged();
    }
    private mapChanged() {
        this.setState({
            map: this.state.map
        });
        this.mapView.redraw();
        this.changes.recordChange(this.state.map);
    }
    private replaceMap(map: MapData){
        // don't hold onto a line from the "old" map; find the equivalent
        let selectedLine = this.state.selectedLine;
        if (selectedLine !== undefined) {
            let index = this.state.map.lines.indexOf(selectedLine);
            selectedLine = map.lines[index];
        }

        // similarly, allow editors to update their selected values to come from the new map
        if (this.activeEditor !== undefined && this.activeEditor.replacingMap !== undefined)
            this.activeEditor.replacingMap(map);

        this.setState({
            map: map,
            selectedLine: selectedLine,
        });
        this.mapView.redraw();
    }
    private selectEditor(editor: EditorType, name: string) {
        this.setState({activeEditor: editor, editorHeading: name, map: this.state.map});
    }
}

WorldMap.init();