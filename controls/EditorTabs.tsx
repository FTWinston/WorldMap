interface IEditorControlsProps {
    activeEditor?: EditorType;
    editorSelected: (editor?: EditorType, name?: string) => void;
}

class EditorControls extends React.Component<IEditorControlsProps, {}> { 
    render() {
        return <div id="editorControls">
            {this.renderButton(EditorType.Download, 'Download', // download
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
    <path d="M3 17v3a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3"></path>
    <polyline points="8 12 12 16 16 12"></polyline>
    <line x1="12" y1="2" x2="12" y2="16"></line>
</svg>)}
            {this.renderButton(EditorType.Overview, 'Overview', // info
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="16" x2="12" y2="12"/>
    <line x1="12" y1="8" x2="12" y2="8"/>
</svg>)}
            {this.renderButton(EditorType.Size, 'Size', // move
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
    <polyline points="5 9 2 12 5 15"/>
    <polyline points="9 5 12 2 15 5"/>
    <polyline points="15 19 12 22 9 19"/>
    <polyline points="19 9 22 12 19 15"/>
    <line x1="2" y1="12" x2="22" y2="12"/>
    <line x1="12" y1="2" x2="12" y2="22"/>
</svg>)}
            {this.renderButton(EditorType.Terrain, 'Terrain', // globe
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="2" y1="12" x2="22" y2="12"></line>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
</svg>)}
            {this.renderButton(EditorType.Lines, 'Lines', // edit-3
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
    <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline>
    <polyline points="17 18 23 18 23 12"></polyline>
</svg>)}
            {this.renderButton(EditorType.Locations, 'Locations', // map-pin
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
</svg>)}
            {this.renderButton(EditorType.Generation, 'Auto-generation', // zap
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
</svg>)}
            <div className="filler" />
        </div>;
    }
    private renderButton(editor: EditorType, text: string, image: JSX.Element) {
        let classes = this.props.activeEditor === editor ? 'active' : undefined;
        return <button className={classes} title={text} onClick={this.selectEditor.bind(this, editor, text)}>{image}</button>;
    }
    private selectEditor(editor: EditorType, name: string) {
        if (this.props.activeEditor != editor)
            this.props.editorSelected(editor, name);
    }
}