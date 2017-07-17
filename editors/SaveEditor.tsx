interface ISaveEditorProps {
    map: MapData;
}

class SaveEditor extends React.Component<ISaveEditorProps, {}> {
    render() {
        let clearButton = window.localStorage.length == 0 ? undefined : <div role="group" className="vertical">
            <p>Saving the map will overwrite any existing map saved in your browser.</p>
            <button type="button" onClick={this.clearSavedData.bind(this)}>Clear saved map</button>
        </div>;

        return <form onSubmit={this.updateDetails.bind(this)}>
            <div role="group" className="vertical">
                <p>Saving the map will overwrite any existing map saved in your browser.</p>
                <button type="submit">Save map</button>
            </div>
            {clearButton}
        </form>;
    }
    private updateDetails(e: React.FormEvent) {
        e.preventDefault();
        SaveLoad.saveData(this.props.map.saveToJSON(), (success: boolean) => console.log('save succeeded'));
        this.forceUpdate();
    }
    private clearSavedData() {
        SaveLoad.clearSaved();
        location.reload();
    }
}