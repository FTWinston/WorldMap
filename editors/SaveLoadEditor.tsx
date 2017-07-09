interface ISaveLoadEditorProps {
    map: MapData;
}

class SaveLoadEditor extends React.Component<ISaveLoadEditorProps, {}> {
    render() {
        let clearButton = window.localStorage.length == 0 ? undefined : <div role="group">
            <p>Saving the map will overwrite any existing map saved in your browser.</p>
            <button type="button" onClick={this.clearSavedData.bind(this)}>Clear saved map</button>
        </div>;

        return <form onSubmit={this.updateDetails.bind(this)}>
            <div role="group">
                <p>Saving the map will overwrite any existing map saved in your browser.</p>
                <button type="submit">Save map</button>
            </div>
            {clearButton}
        </form>;
    }
    private updateDetails(e: React.FormEvent) {
        e.preventDefault();
        window.localStorage.setItem(SaveLoadEditor.localStorageName, this.props.map.saveToJSON());
        this.forceUpdate();
    }
    private clearSavedData() {
        window.localStorage.removeItem(SaveLoadEditor.localStorageName);
        location.reload();
    }
    public static readonly localStorageName = 'savedMap';
}