interface IEditorControlsProps {
    activeEditor?: EditorType;
    editorSelected: (editor?: EditorType) => void;
}

interface IEditorControlsState {
    
}

class EditorControls extends React.Component<IEditorControlsProps, IEditorControlsState> { 
    render() {
        return <div id="editorControls">
            {this.renderButton(EditorType.Terrain, 'Terrain')}
            {this.renderButton(EditorType.Lines, 'Lines')}
            {this.renderButton(EditorType.Locations, 'Locations')}
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