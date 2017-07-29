interface IDownloadEditorProps {
    map: MapData;
}

interface IDownloadEditorState {
    showGrid: boolean;
    gridSize: number;
}

class DownloadEditor extends React.Component<IDownloadEditorProps, IDownloadEditorState> {
    constructor(props: IDownloadEditorProps) {
        super(props);

        this.state = {
            showGrid: true,
            gridSize: 60,
        };
    }
    private view: MapView;
    render() {
        return <form id="setupDownload" onSubmit={this.prepareDownload.bind(this)}>
            <p>Save your map to an image file, for use elsewhere.</p>
            <div role="group"><label>Show grid <input type="checkbox" checked={this.state.showGrid} onChange={this.toggleGrid.bind(this)} /></label></div>
            <div role="group"><label htmlFor="txtCellSize">Cell size</label><input type="number" id="txtCellSize" value={this.state.gridSize.toString()} onChange={this.cellSizeChanged.bind(this)} /></div>
            <div role="group" className="vertical">
                <button type="submit">Download map</button>
            </div>

            <MapView map={this.props.map} scrollUI={false} renderGrid={this.state.showGrid} fixedCellRadius={this.state.gridSize/2} ref={(c) => { if (c !== null) this.view = c}} />
        </form>;
    }
    private cellSizeChanged(e: any) {
        this.setState({
            showGrid: this.state.showGrid,
            gridSize: e.target.value,
        });
        this.view.redraw();
    }
    private toggleGrid(e: Event) {
        this.setState({
            showGrid: !this.state.showGrid,
            gridSize: this.state.gridSize,
        });
        this.view.redraw();
    }
    private prepareDownload(e: React.FormEvent<string>) {
        e.preventDefault();
        this.view.downloadImage();
    }
}