interface ILineEditorProps {
    editingLine: MapLine;
    lines: MapLine[];
    lineTypes: LineType[];
    updateLines: (lines: MapLine[]) => void;
}

interface ILineEditorState {
    type: LineType
}

class LineEditor extends React.Component<ILineEditorProps, ILineEditorState> {
    componentWillMount() {
        this.setState({
            type: this.props.editingLine.type,
        });
    }
    render() {
        let deleteButton = <button type="button" onClick={this.deleteLine.bind(this)}>Delete</button>;

        return <form onSubmit={this.saveType.bind(this)}>
            <p>Click the map to add points to the current line.</p>
            <div role="group"><label htmlFor="ddlType">Line Type</label>
                <select value={this.props.lineTypes.indexOf(this.state.type).toString()} onChange={this.typeChanged.bind(this)}>
                    {this.props.lineTypes.map(function(type, id) {
                        return <option key={id.toString()} value={id.toString()}>{type.name}</option>;
                    })}
                </select>
            </div>
            <div role="group">
                <button type="submit">Save line</button>
                <button type="button" onClick={this.cancelEdit.bind(this)}>Cancel</button>
                {deleteButton}
            </div>
        </form>;
    }
    private typeChanged(e: any) {
        this.setState({
            type: this.props.lineTypes[e.target.value],
        });
    }
    private saveType(e: Event) {
        e.preventDefault();

        this.props.editingLine.type = this.state.type;
        this.props.updateLines(this.props.lines);
    }
    cancelEdit() {
        this.props.updateLines(this.props.lines);
    }
    deleteLine() {
        let lines = this.props.lines.slice();

        let pos = lines.indexOf(this.props.editingLine);
        lines.splice(pos, 1);
        
        this.props.updateLines(lines);
    }
}