const enum EditorType {
    Download,
    Overview,
    Size,
    Terrain,
    Lines,
    Locations,
    Generation,
}

interface IMapEditor {
    render: () => void;
    mouseDown?: (cell: MapCell) => void;
    mouseUp?: (cell: MapCell) => void;
    mouseEnter?: (cell: MapCell) => void;
    mouseLeave?: (cell: MapCell) => void;
    replacingMap?: (map: MapData) => void;
}

interface IWorldMapProps {
    editable: boolean;
}

interface IWorldMapState {
    map: MapData;
    activeEditor?: EditorType;
    editorHeading?: string;
    selectedLine?: MapLine;
    generationSettings: GenerationSettings;
    showGenerationSettings: boolean;
}

class WorldMap extends React.Component<IWorldMapProps, IWorldMapState> {
    static init() {
        let editable = SaveLoad.getQueryParam('readonly') === undefined;
        WorldMap.instance = ReactDOM.render(
            <WorldMap editable={editable} />,
            document.getElementById('uiRoot') as HTMLElement
        ) as WorldMap;
    }
    static instance: WorldMap;
    
    constructor(props: IWorldMapProps) {
        super(props);
        this.state = {
            map: new MapData(0, 0, false),
            generationSettings: new GenerationSettings(),
            showGenerationSettings: false,
        };
    }

    private changes: ChangeHistory;
    private mapView: MapView | null;
    componentDidMount() {
        SaveLoad.loadData(this.initializeMap.bind(this));
    }
    initializeMap(dataJson: string) {
        let map = dataJson === null ? new MapData(25, 25) : MapData.loadFromJSON(dataJson);    
        this.setState({
            map: map,
            activeEditor: this.props.editable ? EditorType.Overview : undefined,
        });
        
        if (this.changes !== undefined) {
            if (dataJson !== null)
                this.changes.recordChangeData(dataJson);
            else
                this.changes.recordMapChange(map);
        }
        
        MapGenerator.constructCellTypeLookup(map.cellTypes);
    }

    componentDidUpdate(prevProps: IWorldMapProps, prevState: IWorldMapState) {
        if (prevState.activeEditor != this.state.activeEditor && this.mapView !== null)
            this.mapView.redraw();
    }

    render() {
        if (this.state.map === undefined)
            return <div id="worldRoot" />;

        let mapOrSettings = this.state.showGenerationSettings
            ? <GenerationSettingsEditor settings={this.state.generationSettings} settingsChanged={this.generationSettingsChanged.bind(this)} />
            : <MapView map={this.state.map} scrollUI={true} renderGrid={true} ref={(c) => this.mapView = c}
                    editor={this.state.activeEditor} selectedLine={this.state.selectedLine}
                    cellMouseDown={this.cellMouseDown.bind(this)} cellMouseUp={this.cellMouseUp.bind(this)}
                    cellMouseEnter={this.cellMouseEnter.bind(this)} cellMouseLeave={this.cellMouseLeave.bind(this)} />;

        if (!this.props.editable)
            return <div id="worldRoot">
            {mapOrSettings}
        </div>

        let activeEditor = this.state.activeEditor === undefined ? undefined : this.renderEditor(this.state.activeEditor);
        return <div id="worldRoot">
            {mapOrSettings}
            <EditorControls activeEditor={this.state.activeEditor} editorSelected={this.selectEditor.bind(this)} />
            <div id="editor">
                <h1>{this.state.editorHeading}</h1>
                {activeEditor}
                <ChangeHistory ref={(c) => {if (c !== null) this.changes = c}} updateMap={this.replaceMap.bind(this)} />
            </div>
        </div>;
    }
    private renderEditor(editor: EditorType): JSX.Element {
        if (this.state.map === undefined)
            return <div>No map</div>;

        const props = {
            ref: (c: IMapEditor | null) => this.activeEditor = (c === null) ? undefined : c
        };
        
        switch(editor) {
            case EditorType.Download:
                return <DownloadEditor {...props} map={this.state.map} />;
            case EditorType.Overview:
                return <OverviewEditor {...props} name={this.state.map.name} description={this.state.map.description} saveChanges={this.updateDetails.bind(this)} />;
            case EditorType.Size:
                return <SizeEditor {...props} width={this.state.map.width} height={this.state.map.height} changeSize={this.changeSize.bind(this)} />;
            case EditorType.Terrain:
                return <TerrainEditor {...props} cellTypes={this.state.map.cellTypes} hasDrawn={this.terrainEdited.bind(this)} findCellsInRange={this.state.map.getCellsInRange.bind(this.state.map)} updateCellTypes={this.updateCellTypes.bind(this)} />;
            case EditorType.Lines:
                return <LinesEditor {...props} lines={this.state.map.lines} lineTypes={this.state.map.lineTypes} updateLines={this.updateLines.bind(this)} updateLineTypes={this.updateLineTypes.bind(this)} selectedLine={this.state.selectedLine} lineSelected={this.lineSelected.bind(this)} />;
            case EditorType.Locations:
                return <LocationsEditor {...props} locations={this.state.map.locations} locationTypes={this.state.map.locationTypes} locationsChanged={this.updateLocations.bind(this)} typesChanged={this.updateLocationTypes.bind(this)} />;
            case EditorType.Generation:
                return <GenerationEditor {...props} map={this.state.map} settings={this.state.generationSettings} mapChanged={this.mapGenerated.bind(this)} settingsChanged={this.generationSettingsChanged.bind(this)} showingSettings={this.state.showGenerationSettings} showSettings={this.showGenerationSettings.bind(this)} />;
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
        if (this.mapView !== null)
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
        MapGenerator.constructCellTypeLookup(cellTypes);
    }
    private terrainEdited(endOfStroke: boolean = true) {
        // batch all "drawing" in the one stroke into a single undo step
        if (endOfStroke)
            this.mapChanged();
        else if (this.mapView !== null)
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
        });

        if (this.mapView !== null)
            this.mapView.redraw();
    }
    private updateLines(lines: MapLine[]) {
        this.state.map.lines = lines;
        this.mapChanged();
    }
    private mapGenerated() {
        this.mapChanged();
    }
    private mapChanged() {
        this.setState({
            map: this.state.map,
        });
        if (this.mapView !== null)
            this.mapView.redraw();
        this.changes.recordMapChange(this.state.map);
    }
    private generationSettingsChanged() {
        this.setState({
            generationSettings: this.state.generationSettings,
        })
    }
    private showGenerationSettings(show: boolean) {
        this.setState({
            showGenerationSettings: show,
        })
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

        if (this.mapView !== null)
            this.mapView.redraw();
    }
    private selectEditor(editor: EditorType, name: string) {
        this.setState({
            activeEditor: editor,
            editorHeading: name,
        });
    }
}

WorldMap.init();