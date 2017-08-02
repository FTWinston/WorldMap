interface IGenerationFieldProps {
    name: string,
    guide: GenerationGuide;
    minValue: number;
    maxValue: number;
    absMinValue: number;
    absMaxValue: number;
    guideScale: number;
    highFreqScale: number;
    lowFreqScale: number;
    showGuideSelection: () => void;
    changed: (
        minValue: number,
        maxValue: number,
        guideScale: number,
        lowFreqScale: number,
        highFreqScale: number,
    ) => void
}

class GenerationField extends React.Component<IGenerationFieldProps, {}> {
    render() {
        let lowerName = this.props.name.toLowerCase();
        return <div>
            <h2>{this.props.name}</h2>
            <div role="group" className="vertical">
                <p>The {lowerName} guide controls the overall {lowerName} of generated terrain. Click below to change the selected {lowerName} guide.</p>
                <div className="palleteList">
                    <GuideView guide={this.props.guide} onClick={this.props.showGuideSelection} />
                </div>
            </div>
            <p>Fine tune the {lowerName} by specifying a "fixed" {lowerName}, and scaling how much this, the {lowerName} guide and randomness contribute to the generated map.</p>
            <div role="group" className="vertical"><label>Min {lowerName} <input type="range" value={this.props.minValue.toString()} onChange={this.minChanged.bind(this)} step="0.01" min={this.props.absMinValue.toString()} max={this.props.absMaxValue.toString()} /></label></div>
            <div role="group" className="vertical"><label>Max {lowerName} <input type="range" value={this.props.maxValue.toString()} onChange={this.maxChanged.bind(this)} step="0.01" min={this.props.absMinValue.toString()} max={this.props.absMaxValue.toString()} /></label></div>
            <div role="group" className="vertical"><label>Scale: Guide <input type="range" value={this.props.guideScale.toString()} onChange={this.guideScaleChanged.bind(this)} step="0.01" min="0" max="1" /></label></div>
            <div role="group" className="vertical"><label>Large variations <input type="range" value={this.props.lowFreqScale.toString()} onChange={this.lowFreqScaleChanged.bind(this)} step="0.01" min="0" max="1" /></label></div>
            <div role="group" className="vertical"><label>Small variations <input type="range" value={this.props.highFreqScale.toString()} onChange={this.highFreqScaleChanged.bind(this)} step="0.01" min="0" max="1" /></label></div>
        </div>;
    }

    private minChanged(e: any) {
        let val = parseFloat(e.target.value);
        this.props.changed(
            val,
            Math.max(this.props.maxValue, val),
            this.props.guideScale,
            this.props.lowFreqScale,
            this.props.highFreqScale,
        );
    }
    private maxChanged(e: any) {
        let val = parseFloat(e.target.value);
        this.props.changed(
            Math.min(this.props.minValue, val),
            val,
            this.props.guideScale,
            this.props.lowFreqScale,
            this.props.highFreqScale,
        );
    }
    private guideScaleChanged(e: any) {
        this.props.changed(
            this.props.minValue,
            this.props.maxValue,
            parseFloat(e.target.value),
            this.props.lowFreqScale,
            this.props.highFreqScale,
        );
    }
    private lowFreqScaleChanged(e: any) {
        this.props.changed(
            this.props.minValue,
            this.props.maxValue,
            this.props.guideScale,
            parseFloat(e.target.value),
            this.props.highFreqScale,
        );
    }
    private highFreqScaleChanged(e: any) {
        this.props.changed(
            this.props.minValue,
            this.props.maxValue,
            this.props.guideScale,
            this.props.lowFreqScale,
            parseFloat(e.target.value),
        );
    }
}