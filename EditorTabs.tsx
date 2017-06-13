interface IEditorControlsProps {
    activeEditor?: EditorType;
    editorSelected: (editor?: EditorType) => void;
}

class EditorControls extends React.Component<IEditorControlsProps, {}> { 
    render() {
        return <div id="editorControls">
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
            {this.renderButton(EditorType.TerrainTypes, 'Terrain Types', // grid
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
</svg>)}
            {this.renderButton(EditorType.Terrain, 'Terrain', // edit
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
    <path d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34"/>
    <polygon points="18 2 22 6 12 16 8 16 8 12 18 2"/>
</svg>)}
            {this.renderButton(EditorType.Lines, 'Lines', // edit-3
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
    <polygon points="14 2 18 6 7 17 3 17 3 13 14 2" />
    <line x1="3" y1="22" x2="21" y2="22" />
</svg>)}
            {this.renderButton(EditorType.Locations, 'Locations', // map-pin
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
</svg>)}
            {this.renderButton(EditorType.Layers, 'Layers', // layers
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
    <polygon points="12 2 2 7 12 12 22 7 12 2"/>
    <polyline points="2 17 12 22 22 17"/>
    <polyline points="2 12 12 17 22 12"/>
</svg>)}
            <div className="filler" />
        </div>;
    }
    private renderButton(editor: EditorType, text: string, image: JSX.Element) {
        let classes = this.props.activeEditor === editor ? 'active' : undefined;
        return <button className={classes} onClick={this.selectEditor.bind(this, editor)}>{image}</button>;
    }
    private selectEditor(editor: EditorType) {
        this.props.editorSelected(this.props.activeEditor === editor ? undefined : editor);
    }
}