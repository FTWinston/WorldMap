const enum EditorType {
    Save,
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
}

interface IWorldMapProps {
    editable: boolean;
}

interface IWorldMapState {
    map: MapData;
    activeEditor?: EditorType;
    editorHeading?: string;
}

class WorldMap extends React.Component<IWorldMapProps, IWorldMapState> {
    constructor(props: IWorldMapProps) {
        super(props);

        let dataJson = window.localStorage.getItem(SaveEditor.localStorageName);
        let map = dataJson === null ? new MapData(50, 50) : MapData.loadFromJSON(dataJson);

        this.state = {
            map: map,
            activeEditor: props.editable ? EditorType.Overview : undefined,
        }
    }
    private changes: ChangeHistory;
    private mapView: MapView;
    componentDidMount() {
        this.changes.recordChange(this.state.map); // TODO: this is an inefficient way of populating initial map state when loading a saved map. Avoid re-serializing, as that just came from text
    }
    render() {
        if (this.state.map === undefined)
            return <div id="worldRoot" />;

        let map = <MapView map={this.state.map} scrollUI={true} renderGrid={true} ref={(c) => this.mapView = c}
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
            case EditorType.Save:
                return <SaveEditor {...props} map={this.state.map} />;
            case EditorType.Download:
                return <DownloadEditor {...props} map={this.state.map} />;
            case EditorType.Overview:
                return <OverviewEditor {...props} name={this.state.map.name} description={this.state.map.description} saveChanges={this.updateDetails.bind(this)} />;
            case EditorType.Size:
                return <SizeEditor {...props} width={this.state.map.width} height={this.state.map.height} changeSize={this.changeSize.bind(this)} />;
            case EditorType.Terrain:
                return <TerrainEditor {...props} cellTypes={this.state.map.cellTypes} hasDrawn={this.terrainEdited.bind(this)} updateCellTypes={this.updateCellTypes.bind(this)} />;
            case EditorType.Lines:
                return <LinesEditor {...props} />;
            case EditorType.Locations:
                return <LocationsEditor {...props} />;
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
        if (this.state.map === undefined || cellTypes.length == 0)
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
    private mapChanged() {
        this.mapView.redraw();
        this.changes.recordChange(this.state.map);
    }
    private replaceMap(map: MapData){ 
        this.setState({
            map: map
        });
        this.mapView.redraw();
    }
    private selectEditor(editor: EditorType, name: string) {
        this.setState({activeEditor: editor, editorHeading: name, map: this.state.map});
    }
}

let editable = document.location.search != '?readonly';
let worldMap = ReactDOM.render(
    <WorldMap editable={editable} />,
    document.getElementById('uiRoot') as HTMLElement
) as WorldMap;