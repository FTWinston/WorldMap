interface IGuideViewProps {
    guide: GenerationGuide;
    className?: string;
    onClick?: (view: GenerationGuide) => void;
}

class GuideView extends React.Component<IGuideViewProps, {}> {
    private canvas: HTMLCanvasElement;
    componentDidMount() {
        this.redraw();
    }
    componentDidUpdate(prevProps: IGuideViewProps) {
        if (prevProps.guide !== this.props.guide)
            this.redraw();
    }
    private redraw() {
        let ctx = this.canvas.getContext('2d');
        if (ctx === null)
            return;

        if (this.props.guide.isVector)
            this.drawVector(ctx, this.props.guide, this.canvas.width, this.canvas.height);
        else
            this.drawScalar(ctx, this.props.guide, this.canvas.width, this.canvas.height);
    }
    render() {
        return <canvas width={50} height={50} ref={(c) => { if (c !== null) this.canvas = c}} title={this.props.guide.name} className={this.props.className} onClick={this.clicked.bind(this)}></canvas>;
    }
    private clicked() {
        if (this.props.onClick !== undefined)
            this.props.onClick(this.props.guide);
    }
    private drawScalar(ctx: CanvasRenderingContext2D, guide: GenerationGuide, width: number, height: number) {
        let image = ctx.createImageData(width, height);
        let imageData = image.data;
        
        let writePos = 0;
        for (let y=0; y < height; y++)
            for (let x=0; x < width; x++) {
                let rgb = Math.floor(guide.generation(x, y, width, height) * 255);
                imageData[writePos++] = rgb;
                imageData[writePos++] = rgb;
                imageData[writePos++] = rgb;
                imageData[writePos++] = 255;
            }

        ctx.putImageData(image, 0, 0);

    }
    private drawVector(ctx: CanvasRenderingContext2D, guide: GenerationGuide, width: number, height: number) {
        
    }
}