interface IGenerationEditorProps {
    map: MapData;
    settings: GenerationSettings;
    showingSettings: boolean;
    mapChanged: () => void;
    settingsChanged: () => void;
    showSettings: (show: boolean) => void;
}

class GenerationEditor extends React.Component<IGenerationEditorProps, {}> implements IMapEditor {
    render() {
        let showHide = this.props.showingSettings
         ? <button type="button" onClick={this.showSettings.bind(this, false)}>Close settings</button>
         : <button type="button" onClick={this.showSettings.bind(this, true)}>Edit settings</button>;

        return <form onSubmit={this.generate.bind(this)}>
            <p>Each cell type has value for its associated height, temperature and precipitation. These are used to decide what type to use for each cell.</p>
            <p>A number of settings are available to control the height, temperature and precipitation of the generated map.</p>
            <p>For now the whole map will be generated, but in the future you might be able to only generate over empty cells.</p>
            <div role="group" className="vertical">
                {showHide}
                <button type="submit">Generate map using settings</button>
                <button type="button" onClick={this.randomizeSettings.bind(this)}>Randomize settings &amp; generate</button>
            </div>
        </form>
    }

    componentWillUnmount() {
        this.props.showSettings(false);
    }

    private showSettings(show: boolean) {
        this.props.showSettings(show);
    }

    private randomizeSettings() {
        this.props.settings.randomize();
        this.props.settingsChanged();
        MapGenerator.generate(this.props.map, this.props.settings);
        this.props.mapChanged();
        this.props.showSettings(false);
    }

    private generate(e: Event) {
        e.preventDefault();
        MapGenerator.generate(this.props.map, this.props.settings);
        this.props.mapChanged();
        this.props.showSettings(false);
    }
}