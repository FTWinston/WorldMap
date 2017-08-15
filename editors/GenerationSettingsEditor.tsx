const enum SettingsEditorSection {
    Overview,
    Coastline,
    Terrain,
}

interface IGenerationSettingsEditorProps {
    settings: GenerationSettings;
    settingsChanged: () => void;
}

interface IGenerationSettingsEditorState {
    activeSection: SettingsEditorSection;
    selectingHeightGuide: boolean;
    selectingTemperatureGuide: boolean;
    selectingPrecipitationGuide: boolean;
}

class GenerationSettingsEditor extends React.Component<IGenerationSettingsEditorProps, IGenerationSettingsEditorState> {
    constructor(props: IGenerationSettingsEditorProps) {
        super(props);

        this.state = {
            activeSection: SettingsEditorSection.Overview,
            selectingHeightGuide: false,
            selectingTemperatureGuide: false,
            selectingPrecipitationGuide: false,
        };
    }

    render() {
        let section;
        let heading;

        let prevNextBack: JSX.Element | undefined = <div>
            <button onClick={this.selectSection.bind(this, SettingsEditorSection.Overview)}>Back to Overview</button>
            <button onClick={this.selectSection.bind(this, this.state.activeSection - 1)}>Previous section</button>
            <button onClick={this.selectSection.bind(this, this.state.activeSection + 1)}>Next section</button>
        </div>;

        switch (this.state.activeSection) {
            case SettingsEditorSection.Coastline:
                heading = 'Coastline';
                section = this.renderCoastline();
                break;
            case SettingsEditorSection.Terrain:
                heading = 'Terrain';
                section = this.renderTerrain();
                break;
            default:
                heading = 'Overview';
                section = this.renderOverview();
                prevNextBack = undefined;
                break;
        }

        return <div id="settingsRoot">
            <h1>{heading}</h1>
            {section}
            {prevNextBack}
        </div>
    }

    private renderOverview() {
        return <div className="section" role="group">
            <p>
                The different aspects of terrain generation can all be configured; select one to change its settings.
                <br/>Note that the steps below are listed in the order they are applied during generation.
            </p>
            <ol>
                <li><button onClick={this.selectSection.bind(this, SettingsEditorSection.Coastline)}>Coastline</button></li>
                <li><button onClick={this.selectSection.bind(this, SettingsEditorSection.Terrain)}>Terrain</button></li>
            </ol>
        </div>
    }

    private selectSection(section: SettingsEditorSection) {
        this.setState({
            activeSection: section,
        });
    }

    private renderCoastline() {
        return <div className="section" role="group">
            
        </div>
    }

    private renderTerrain() {
        let height = this.state.selectingHeightGuide
            ? this.renderGuideSelection(this.props.settings.heightGuide, this.heightGuideSelected.bind(this), 'Height', 'shape')
            : <GenerationField name="Height" guide={this.props.settings.heightGuide} minValue={this.props.settings.minHeight} maxValue={this.props.settings.maxHeight}
                guideScale={this.props.settings.heightScaleGuide} lowFreqScale={this.props.settings.heightScaleLowFreq} highFreqScale={this.props.settings.heightScaleHighFreq} showGuideSelection={this.showHeightGuideSelection.bind(this)} changed={this.heightChanged.bind(this)} />;

        let temperature = this.state.selectingTemperatureGuide
            ? this.renderGuideSelection(this.props.settings.temperatureGuide, this.temperatureGuideSelected.bind(this), 'Temperature')
            : <GenerationField name="Temperature" guide={this.props.settings.temperatureGuide} minValue={this.props.settings.minTemperature} maxValue={this.props.settings.maxTemperature}
                guideScale={this.props.settings.temperatureScaleGuide} lowFreqScale={this.props.settings.temperatureScaleLowFreq} highFreqScale={this.props.settings.temperatureScaleHighFreq} showGuideSelection={this.showTemperatureGuideSelection.bind(this)} changed={this.temperatureChanged.bind(this)} />;

        let precipitation = this.state.selectingPrecipitationGuide
            ? this.renderGuideSelection(this.props.settings.precipitationGuide, this.precipitationGuideSelected.bind(this), 'Precipitation', 'rainfall / humidity')
            : <GenerationField name="Precipitation" guide={this.props.settings.precipitationGuide} minValue={this.props.settings.minPrecipitation} maxValue={this.props.settings.maxPrecipitation}
                guideScale={this.props.settings.precipitationScaleGuide} lowFreqScale={this.props.settings.precipitationScaleLowFreq} highFreqScale={this.props.settings.precipitationScaleHighFreq} showGuideSelection={this.showPrecipitationGuideSelection.bind(this)} changed={this.precipitationChanged.bind(this)} />;

        return <div className="section multiple" role="group">
            {height}
            {temperature}
            {precipitation}
        </div>
    }

    private renderGuideSelection(selectedValue: GenerationGuide, onSelected: (guide: GenerationGuide) => void, propertyName: string, propertyEffects: string = propertyName.toLowerCase()) {
        let intro = `Select a ${propertyName.toLowerCase()} guide, which controls the overall ${propertyEffects} of generated terrain.`;
        
        return <div>
            <h2>{propertyName}</h2>
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

    private heightChanged(minValue: number, maxValue: number, guideScale: number, lowFreqScale: number, highFreqScale: number) {
        let settings = this.props.settings;

        settings.minHeight = minValue;
        settings.maxHeight = maxValue;
        settings.heightScaleGuide = guideScale;
        settings.heightScaleLowFreq = lowFreqScale;
        settings.heightScaleHighFreq = highFreqScale;
        
        this.props.settingsChanged();

        this.setState({
            selectingHeightGuide: false,
        });
    }
    private temperatureChanged(minValue: number, maxValue: number, guideScale: number, lowFreqScale: number, highFreqScale: number) {
        let settings = this.props.settings;

        settings.minTemperature = minValue;
        settings.maxTemperature = maxValue;
        settings.temperatureScaleGuide = guideScale;
        settings.temperatureScaleLowFreq = lowFreqScale;
        settings.temperatureScaleHighFreq = highFreqScale;
        
        this.props.settingsChanged();

        this.setState({
            selectingTemperatureGuide: false,
        });
    }
    private precipitationChanged(minValue: number, maxValue: number, guideScale: number, lowFreqScale: number, highFreqScale: number) {
        let settings = this.props.settings;
        
        settings.minPrecipitation = minValue;
        settings.maxPrecipitation = maxValue;
        settings.precipitationScaleGuide = guideScale;
        settings.precipitationScaleLowFreq = lowFreqScale;
        settings.precipitationScaleHighFreq = highFreqScale;
        
        this.props.settingsChanged();
        
        this.setState({
            selectingPrecipitationGuide: false,
        });
    }
}