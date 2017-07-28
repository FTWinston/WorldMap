interface IGuideViewProps {
    guide: GenerationGuide;
    className?: string;
    onClick?: (view: GenerationGuide) => void;
}

class GuideView extends React.Component<IGuideViewProps, {}> {
    private canvas: HTMLCanvasElement;
    componentDidMount() {
        let ctx = this.canvas.getContext('2d');
        if (ctx !== null) {
            if (this.props.guide.isVector)
                this.drawVector(ctx, this.props.guide);
            else
                this.drawScalar(ctx, this.props.guide);
        }
    }
    render() {
        return <canvas width={50} height={50} ref={(c) => this.canvas = c} title={this.props.guide.name} className={this.props.className} onClick={this.clicked.bind(this)}></canvas>;
    }
    private clicked() {
        if (this.props.onClick !== undefined)
            this.props.onClick(this.props.guide);
    }
    private drawScalar(ctx: CanvasRenderingContext2D, guide: GenerationGuide) {
        let width = this.canvas.width;
        let height = this.canvas.height;

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
    private drawVector(ctx: CanvasRenderingContext2D, guide: GenerationGuide) {
        
    }
}