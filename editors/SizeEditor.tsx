interface ISizeEditorProps {
    width: number;
    height: number;
    changeSize: (width: number, height: number, mode: ResizeAnchorMode) => void;
}

interface ISizeEditorState {
    newWidth: number;
    newHeight: number;
    resizeAnchor: ResizeAnchorMode;
}

class SizeEditor extends React.Component<ISizeEditorProps, ISizeEditorState> {
    constructor(props: ISizeEditorProps) {
        super(props);

        this.state = {
            newWidth: props.width,
            newHeight: props.height,
            resizeAnchor: ResizeAnchorMode.TopLeft,
        };
    }
    render() {
        let sameSize = this.state.newWidth == this.props.width && this.state.newHeight == this.props.height;

        return <form onSubmit={this.changeSize.bind(this)}>
            <p>Adjust the overall size of the map, and control what edges have cells are added or removed.</p>
            <div role="group"><label htmlFor="txtResizeWidth">Width</label><input type="number" id="txtResizeWidth" value={this.state.newWidth.toString()} onChange={this.widthChanged.bind(this)} /></div>
            <div role="group"><label htmlFor="txtResizeHeight">Height</label><input type="number" id="txtResizeHeight" value={this.state.newHeight.toString()} onChange={this.heightChanged.bind(this)} /></div>
            <div role="group"><label>Anchor</label>
                <ResizeAnchorInput oldWidth={this.props.width} newWidth={this.state.newWidth}
                                   oldHeight={this.props.height} newHeight={this.state.newHeight}
                                   mode={this.state.resizeAnchor} setMode={this.setMode.bind(this)} />
            </div>
            <div role="group" className="vertical">
                <button type="submit" disabled={sameSize}>Change size</button>
            </div>
        </form>;
    }
    private widthChanged(e: any) {
        this.setState({
            newWidth: e.target.value
        });
    }
    private heightChanged(e: any) {
        this.setState({
            newHeight: e.target.value
        });
    }
    private setMode(mode: ResizeAnchorMode) {
        this.setState({
            resizeAnchor: mode
        });
    }
    private changeSize(e: Event) {
        e.preventDefault();

        this.props.changeSize(this.state.newWidth, this.state.newHeight, this.state.resizeAnchor);
    }
    
}