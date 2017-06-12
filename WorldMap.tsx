const enum EditorType {
    Size,
    Terrain,
    //Generation,
    Lines,
    Locations,
}

interface IWorldMapProps {
    
}

interface IWorldMapState {
    map?: MapData;
    activeEditor?: EditorType;
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
                {activeEditor}
            </div>
        </div>;
    }
    private renderEditor(editor: EditorType): JSX.Element {
        let mapChanged = this.mapView.redraw.bind(this.mapView);
        if (this.state.map === undefined)
            return <div>No map</div>;

        switch(editor) {
            case EditorType.Size:
                return <SizeEditor mapChanged={mapChanged} map={this.state.map} />;
            case EditorType.Terrain:
                return <TerrainEditor mapChanged={mapChanged} map={this.state.map} />;
            case EditorType.Lines:
                return <LinesEditor mapChanged={mapChanged} map={this.state.map} />;
            case EditorType.Locations:
                return <LocationsEditor mapChanged={mapChanged} map={this.state.map} />;
        }
    }
    private selectEditor(editor: EditorType) {
        this.setState({activeEditor: editor});
        window.setTimeout(this.mapView.resize.bind(this.mapView), 1510);
    }
}

let worldMap = ReactDOM.render(
    <WorldMap />,
    document.getElementById('uiRoot') as HTMLElement
) as WorldMap;