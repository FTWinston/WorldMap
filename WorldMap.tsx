const enum EditorType {
    SaveLoad,
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
    map?: MapData;
    activeEditor?: EditorType;
    editorHeading?: string;
}

class WorldMap extends React.Component<IWorldMapProps, IWorldMapState> {
    constructor(props: IWorldMapProps) {
        super(props);

        let dataJson = window.localStorage.getItem(SaveLoadEditor.localStorageName);
        let map = dataJson === null ? new MapData(50, 50) : MapData.loadFromJSON(dataJson);

        this.state = {
            map: map,
            activeEditor: props.editable ? EditorType.Overview : undefined,
        }
    }
    mapView: MapView;
    render() {
        if (this.state.map === undefined)
            return <div id="worldRoot" />;

        if (!this.props.editable)
            return <div id="worldRoot">
            <MapView map={this.state.map} ref={(c) => this.mapView = c} cellMouseDown={this.cellMouseDown.bind(this)} cellMouseUp={this.cellMouseUp.bind(this)} cellMouseEnter={this.cellMouseEnter.bind(this)} cellMouseLeave={this.cellMouseLeave.bind(this)} />
        </div>

        let activeEditor = this.state.activeEditor === undefined ? undefined : this.renderEditor(this.state.activeEditor);
        return <div id="worldRoot">
            <MapView map={this.state.map} ref={(c) => this.mapView = c} cellMouseDown={this.cellMouseDown.bind(this)} cellMouseUp={this.cellMouseUp.bind(this)} cellMouseEnter={this.cellMouseEnter.bind(this)} cellMouseLeave={this.cellMouseLeave.bind(this)} />
            <EditorControls activeEditor={this.state.activeEditor} editorSelected={this.selectEditor.bind(this)} />
            <div id="editor">
                <h1>{this.state.editorHeading}</h1>
                {activeEditor}
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
            case EditorType.SaveLoad:
                return <SaveLoadEditor {...props} map={this.state.map} />;
            case EditorType.Overview:
                return <OverviewEditor {...props} name={this.state.map.name} description={this.state.map.description} saveChanges={this.updateDetails.bind(this)} />;
            case EditorType.Size:
                return <SizeEditor {...props} width={this.state.map.width} height={this.state.map.height} changeSize={this.changeSize.bind(this)} />;
            case EditorType.Terrain:
                return <TerrainEditor {...props} cellTypes={this.state.map.cellTypes} redraw={this.mapView.redraw.bind(this.mapView)} updateCellTypes={this.updateCellTypes.bind(this)} />;
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
        this.setState({map: this.state.map});
    }
    private changeSize(width: number, height: number, mode: ResizeAnchorMode) {
        if (this.state.map === undefined)
            return;
        
        this.state.map.changeSize(width, height, mode);
        this.mapView.redraw();
        this.setState({map: this.state.map});
    }
    private updateCellTypes(cellTypes: CellType[]) {
        if (this.state.map === undefined)
            return;
        
        // TODO: surely check that a cell type isn't in use before we get this far?
        // or just clear all cells of a "removed" type, but the user should be warned first.
        this.state.map.cellTypes = cellTypes;
        this.mapView.redraw();
        this.setState({map: this.state.map});
    }
    private mapChanged() {
        this.mapView.redraw();
        this.setState({map: this.state.map});
    }
    private selectEditor(editor: EditorType, name: string) {
        this.setState({activeEditor: editor, editorHeading: name});
    }
}

let editable = document.location.search != '?readonly';
let worldMap = ReactDOM.render(
    <WorldMap editable={editable} />,
    document.getElementById('uiRoot') as HTMLElement
) as WorldMap;