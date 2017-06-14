const enum EditorType {
    Overview,
    Size,
    TerrainTypes,
    Terrain,
    Lines,
    Locations,
    Layers,
}

interface IWorldMapProps {
    
}

interface IWorldMapState {
    map?: MapData;
    activeEditor?: EditorType;
    editorHeading?: string;
}

class WorldMap extends React.Component<IWorldMapProps, IWorldMapState> {
    constructor(props: IWorldMapProps) {
        super(props);

        this.state = {
            map: new MapData(50, 50),
        }
    }
    mapView: MapView;
    render() {
        let editorClass = this.state.activeEditor === undefined ? 'hidden' : undefined;
        let activeEditor = this.state.activeEditor === undefined ? undefined : this.renderEditor(this.state.activeEditor);
        if (this.state.map === undefined)
            return <div id="worldRoot" />;

        return <div id="worldRoot">
            <MapView map={this.state.map} ref={(c) => this.mapView = c} />
            <EditorControls activeEditor={this.state.activeEditor} editorSelected={this.selectEditor.bind(this)} />
            <div id="editor" className={editorClass}>
                <h1>{this.state.editorHeading}</h1>
                {activeEditor}
            </div>
        </div>;
    }
    private renderEditor(editor: EditorType): JSX.Element {
        if (this.state.map === undefined)
            return <div>No map</div>;

        switch(editor) {
            case EditorType.Overview:
                return <OverviewEditor name={this.state.map.name} description={this.state.map.description} saveChanges={this.updateDetails.bind(this)} />;
            case EditorType.Size:
                return <SizeEditor width={this.state.map.width} height={this.state.map.height} changeSize={this.changeSize.bind(this)} />;
            case EditorType.TerrainTypes:
                return <TerrainTypesEditor cellTypes={this.state.map.cellTypes} updateCellTypes={this.updateCellTypes.bind(this)} />;
            case EditorType.Terrain:
                return <TerrainEditor mapChanged={this.mapChanged.bind(this)} map={this.state.map} />;
            case EditorType.Lines:
                return <LinesEditor mapChanged={this.mapChanged.bind(this)} map={this.state.map} />;
            case EditorType.Locations:
                return <LocationsEditor mapChanged={this.mapChanged.bind(this)} map={this.state.map} />;
            case EditorType.Layers:
                return <LayersEditor mapChanged={this.mapChanged.bind(this)} map={this.state.map} />;
        }
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
        window.setTimeout(this.mapView.resize.bind(this.mapView), 1510);
    }
}

let worldMap = ReactDOM.render(
    <WorldMap />,
    document.getElementById('uiRoot') as HTMLElement
) as WorldMap;