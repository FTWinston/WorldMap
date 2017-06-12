interface IEditorControlsProps {
    activeEditor?: EditorType;
    editorSelected: (editor?: EditorType) => void;
}

interface IEditorControlsState {
    
}

class EditorControls extends React.Component<IEditorControlsProps, IEditorControlsState> { 
    render() {
        return <div id="editorControls">
            {this.renderButton(EditorType.Overview, 'Overview') /* info.svg */}
            {this.renderButton(EditorType.Size, 'Size') /* move.svg */}
            {this.renderButton(EditorType.TerrainTypes, 'Terrain Types') /* grid.svg */}
            {this.renderButton(EditorType.Terrain, 'Terrain') /* edit.svg */}
            {this.renderButton(EditorType.Lines, 'Lines') /*edit-3.svg*/}
            {this.renderButton(EditorType.Locations, 'Locations') /* map-pin.svg */}
            {this.renderButton(EditorType.Locations, 'Layers') /* layers.svg */}
            <div className="filler" />
        </div>;
    }
    private renderButton(editor: EditorType, text: string) {
        let classes = this.props.activeEditor === editor ? 'active' : undefined;
        return <button className={classes} onClick={this.selectEditor.bind(this, editor)}><span>{text}</span></button>;
    }
    private selectEditor(editor: EditorType) {
        this.props.editorSelected(this.props.activeEditor === editor ? undefined : editor);
    }
}