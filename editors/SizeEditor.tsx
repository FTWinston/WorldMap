interface IEditorProps {
    mapChanged: () => void;
    map: MapData;
}

interface ISizeEditorState {
    newWidth: number;
    newHeight: number;
    resizeAnchor: ResizeAnchorMode;
}

class SizeEditor extends React.Component<IEditorProps, ISizeEditorState> {
    constructor(props: IEditorProps) {
        super(props);

        this.state = {
            newWidth: props.map.width,
            newHeight: props.map.height,
            resizeAnchor: ResizeAnchorMode.TopLeft,
        };
    }
    render() {
        let sameSize = this.state.newWidth == this.props.map.width && this.state.newHeight == this.props.map.height;

        return <form onSubmit={this.changeSize.bind(this)}>
            <div role="group"><label htmlFor="txtResizeWidth">Width</label><input type="number" id="txtResizeWidth" value={this.state.newWidth.toString()} onChange={this.widthChanged.bind(this)} /></div>
            <div role="group"><label htmlFor="txtResizeHeight">Height</label><input type="number" id="txtResizeHeight" value={this.state.newHeight.toString()} onChange={this.heightChanged.bind(this)} /></div>
            <div role="group"><label>Anchor</label>
                <ResizeAnchorInput oldWidth={this.props.map.width} newWidth={this.state.newWidth}
                                   oldHeight={this.props.map.height} newHeight={this.state.newHeight}
                                   mode={this.state.resizeAnchor} setMode={this.setMode.bind(this)} />
            </div>
            <div role="group">
                <button type="submit" disabled={sameSize}>Change size</button>
            </div>
        </form>;
    }
    private widthChanged(e: any) {
        this.setState({newWidth: e.target.value, newHeight: this.state.newHeight, resizeAnchor: this.state.resizeAnchor});
    }
    private heightChanged(e: any) {
        this.setState({newWidth: this.state.newWidth, newHeight: e.target.value, resizeAnchor: this.state.resizeAnchor});
    }
    private setMode(mode: ResizeAnchorMode) {
        this.setState({newWidth: this.state.newWidth, newHeight: this.state.newHeight, resizeAnchor: mode});
    }
    private changeSize(e: Event) {
        e.preventDefault();

        let deltaWidth = this.state.newWidth - this.props.map.width;
        let deltaHeight = this.state.newWidth - this.props.map.width;

        switch (this.state.resizeAnchor) {
            case ResizeAnchorMode.TopLeft:
                this.props.map.changeWidth(deltaWidth, true);
                this.props.map.changeHeight(deltaHeight, true);
                break;
            case ResizeAnchorMode.TopMiddle:
                this.props.map.changeWidth(Math.floor(deltaWidth/2), true);
                this.props.map.changeWidth(Math.ceil(deltaWidth/2), false);
                this.props.map.changeHeight(deltaHeight, true);
                break;
            case ResizeAnchorMode.TopRight:
                this.props.map.changeWidth(deltaWidth, false);
                this.props.map.changeHeight(deltaHeight, true);
                break;
            case ResizeAnchorMode.CenterLeft:
                this.props.map.changeWidth(deltaWidth, true);
                this.props.map.changeHeight(Math.floor(deltaHeight/2), true);
                this.props.map.changeHeight(Math.ceil(deltaHeight/2), false);
                break;
            case ResizeAnchorMode.Center:
                this.props.map.changeWidth(Math.floor(deltaWidth/2), true);
                this.props.map.changeWidth(Math.ceil(deltaWidth/2), false);
                this.props.map.changeHeight(Math.floor(deltaHeight/2), true);
                this.props.map.changeHeight(Math.ceil(deltaHeight/2), false);
                break;
            case ResizeAnchorMode.CenterRight:
                this.props.map.changeWidth(deltaWidth, false);
                this.props.map.changeHeight(Math.floor(deltaHeight/2), true);
                this.props.map.changeHeight(Math.ceil(deltaHeight/2), false);
                break;
            case ResizeAnchorMode.BottomLeft:
                this.props.map.changeWidth(deltaWidth, true);
                this.props.map.changeHeight(deltaHeight, false);
                break;
            case ResizeAnchorMode.BottomMiddle:
                this.props.map.changeWidth(Math.floor(deltaWidth/2), true);
                this.props.map.changeWidth(Math.ceil(deltaWidth/2), false);
                this.props.map.changeHeight(deltaHeight, false);
                break;
            case ResizeAnchorMode.BottomRight:
                this.props.map.changeWidth(deltaWidth, false);
                this.props.map.changeHeight(deltaHeight, false);
                break;
        }

        this.props.mapChanged();
    }
}