interface IGenerationFieldProps {
    name: string,
    guide: GenerationGuide;
    fixedValue: number;
    fixedScale: number;
    guideScale: number;
    highFreqScale: number;
    lowFreqScale: number;
    showGuideSelection: () => void;
    changed: (
        fixedValue: number,
        fixedScale: number,
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
            <div role="group" className="vertical"><label htmlFor="txtFixedHeight">Fixed {lowerName}</label><input type="range" id="txtFixedHeight" value={this.props.fixedValue.toString()} onChange={this.fixedChanged.bind(this)} step="0.01" min="0" max="1" /></div>
            <div role="group" className="vertical"><label htmlFor="txtHeightScaleFixed">Scale: Fixed {lowerName}</label><input type="range" id="txtHeightScaleFixed" value={this.props.fixedScale.toString()} onChange={this.fixedScaleChanged.bind(this)} step="0.01" min="0" max="1" /></div>
            <div role="group" className="vertical"><label htmlFor="txtHeightScaleGuide">Scale: Guide</label><input type="range" id="txtHeightScaleGuide" value={this.props.guideScale.toString()} onChange={this.guideScaleChanged.bind(this)} step="0.01" min="0" max="1" /></div>
            <div role="group" className="vertical"><label htmlFor="txtHeightScaleLowFreq">Large variations</label><input type="range" id="txtHeightScaleLowFreq" value={this.props.lowFreqScale.toString()} onChange={this.lowFreqScaleChanged.bind(this)} step="0.01" min="0" max="1" /></div>
            <div role="group" className="vertical"><label htmlFor="txtHeightScaleHighFreq">Small variations</label><input type="range" id="txtHeightScaleHighFreq" value={this.props.highFreqScale.toString()} onChange={this.highFreqScaleChanged.bind(this)} step="0.01" min="0" max="1" /></div>
        </div>;
    }

    private fixedChanged(e: any) {
        this.props.changed(
            parseFloat(e.target.value),
            this.props.fixedScale,
            this.props.guideScale,
            this.props.lowFreqScale,
            this.props.highFreqScale,
        );
    }
    private fixedScaleChanged(e: any) {
        this.props.changed(
            this.props.fixedValue,
            parseFloat(e.target.value),
            this.props.guideScale,
            this.props.lowFreqScale,
            this.props.highFreqScale,
        );
    }
    private guideScaleChanged(e: any) {
        this.props.changed(
            this.props.fixedValue,
            this.props.fixedScale,
            parseFloat(e.target.value),
            this.props.lowFreqScale,
            this.props.highFreqScale,
        );
    }
    private lowFreqScaleChanged(e: any) {
        this.props.changed(
            this.props.fixedValue,
            this.props.fixedScale,
            this.props.guideScale,
            parseFloat(e.target.value),
            this.props.highFreqScale,
        );
    }
    private highFreqScaleChanged(e: any) {
        this.props.changed(
            this.props.fixedValue,
            this.props.fixedScale,
            this.props.guideScale,
            this.props.lowFreqScale,
            parseFloat(e.target.value),
        );
    }
}