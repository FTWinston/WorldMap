interface IGenerationSettingsEditorProps {
    settings: GenerationSettings;
    settingsChanged: () => void;
}

interface IGenerationSettingsEditorState {
    selectingHeightGuide: boolean;
    selectingTemperatureGuide: boolean;
    selectingPrecipitationGuide: boolean;
}

class GenerationSettingsEditor extends React.Component<IGenerationSettingsEditorProps, IGenerationSettingsEditorState> {
    constructor(props: IGenerationSettingsEditorProps) {
        super(props);

        this.state = {
            selectingHeightGuide: false,
            selectingTemperatureGuide: false,
            selectingPrecipitationGuide: false,
        };
    }

    render() {
        let height = this.state.selectingHeightGuide
            ? this.renderGuideSelection(this.props.settings.heightGuide, this.heightGuideSelected.bind(this), 'Select an elevation guide, which controls the overall shape of generated terrain.')
            : <GenerationField name="Height" guide={this.props.settings.heightGuide} fixedValue={this.props.settings.fixedHeight} fixedScale={this.props.settings.heightScaleFixed}
                guideScale={this.props.settings.heightScaleGuide} lowFreqScale={this.props.settings.heightScaleLowFreq} highFreqScale={this.props.settings.heightScaleHighFreq} showGuideSelection={this.showHeightGuideSelection.bind(this)} changed={this.heightChanged.bind(this)} />;

        let temperature = this.state.selectingTemperatureGuide
            ? this.renderGuideSelection(this.props.settings.temperatureGuide, this.temperatureGuideSelected.bind(this), 'Select a temperature guide, which controls the overall temperature of generated terrain.')
            : <GenerationField name="Temperature" guide={this.props.settings.temperatureGuide} fixedValue={this.props.settings.fixedTemperature} fixedScale={this.props.settings.temperatureScaleFixed}
                guideScale={this.props.settings.temperatureScaleGuide} lowFreqScale={this.props.settings.temperatureScaleLowFreq} highFreqScale={this.props.settings.temperatureScaleHighFreq} showGuideSelection={this.showTemperatureGuideSelection.bind(this)} changed={this.temperatureChanged.bind(this)} />;

        let precipitation = this.state.selectingPrecipitationGuide
            ? this.renderGuideSelection(this.props.settings.precipitationGuide, this.precipitationGuideSelected.bind(this), 'Select a precipitation guide, which controls the overall rainfall / humidity of generated terrain.')
            : <GenerationField name="Precipitation" guide={this.props.settings.precipitationGuide} fixedValue={this.props.settings.fixedPrecipitation} fixedScale={this.props.settings.precipitationScaleFixed}
                guideScale={this.props.settings.precipitationScaleGuide} lowFreqScale={this.props.settings.precipitationScaleLowFreq} highFreqScale={this.props.settings.precipitationScaleHighFreq} showGuideSelection={this.showPrecipitationGuideSelection.bind(this)} changed={this.precipitationChanged.bind(this)} />;

        return <div id="settingsRoot">
            {height}
            {temperature}
            {precipitation}
        </div>
    }

    private renderGuideSelection(selectedValue: GenerationGuide, onSelected: (guide: GenerationGuide) => void, intro: string) {
        return <div>
            <p>{intro}</p>
            <div className="palleteList">
                {Guides.scalarGuides.map(function(guide, id) {
                    let classes = guide == selectedValue ? 'selected' : undefined;
                    return <GuideView guide={guide} key={id.toString()} className={classes} onClick={onSelected} />;
                })}
            </div>
        </div>;
    }
    private showHeightGuideSelection(guide: GenerationGuide) {
        this.setState({
            selectingHeightGuide: true,
        });
    }
    private heightGuideSelected(guide: GenerationGuide) {
        this.props.settings.heightGuide = guide;
        this.props.settingsChanged();

        this.setState({
            selectingHeightGuide: false,
        });
    }
    private showTemperatureGuideSelection(guide: GenerationGuide) {
        this.setState({
            selectingTemperatureGuide: true,
        });
    }
    private temperatureGuideSelected(guide: GenerationGuide) {
        this.props.settings.temperatureGuide = guide;
        this.props.settingsChanged();

        this.setState({
            selectingTemperatureGuide: false,
        });
    }
    private showPrecipitationGuideSelection(guide: GenerationGuide) {
        this.setState({
            selectingPrecipitationGuide: true,
        });
    }
    private precipitationGuideSelected(guide: GenerationGuide) {
        this.props.settings.precipitationGuide = guide;
        this.props.settingsChanged();

        this.setState({
            selectingPrecipitationGuide: false,
        });
    }

    private heightChanged(fixedValue: number, fixedScale: number, guideScale: number, lowFreqScale: number, highFreqScale: number) {
        let settings = this.props.settings;

        settings.fixedHeight = fixedValue;
        settings.heightScaleFixed = fixedScale;
        settings.heightScaleGuide = guideScale;
        settings.heightScaleLowFreq = lowFreqScale;
        settings.heightScaleHighFreq = highFreqScale;
        
        this.props.settingsChanged();

        this.setState({
            selectingHeightGuide: false,
        });
    }
    private temperatureChanged(fixedValue: number, fixedScale: number, guideScale: number, lowFreqScale: number, highFreqScale: number) {
        let settings = this.props.settings;

        settings.fixedTemperature = fixedValue;
        settings.temperatureScaleFixed = fixedScale;
        settings.temperatureScaleGuide = guideScale;
        settings.temperatureScaleLowFreq = lowFreqScale;
        settings.temperatureScaleHighFreq = highFreqScale;
        
        this.props.settingsChanged();

        this.setState({
            selectingTemperatureGuide: false,
        });
    }
    private precipitationChanged(fixedValue: number, fixedScale: number, guideScale: number, lowFreqScale: number, highFreqScale: number) {
        let settings = this.props.settings;
        
        settings.fixedPrecipitation = fixedValue;
        settings.precipitationScaleFixed = fixedScale;
        settings.precipitationScaleGuide = guideScale;
        settings.precipitationScaleLowFreq = lowFreqScale;
        settings.precipitationScaleHighFreq = highFreqScale;
        
        this.props.settingsChanged();
        
        this.setState({
            selectingPrecipitationGuide: false,
        });
    }
}