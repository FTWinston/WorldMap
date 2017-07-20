interface ILineEditorProps {
    line: MapLine;
    lineTypes: LineType[];
    close: () => void;
    lineEdited: () => void;
    deleteLine: () => void;
}

interface ILineEditorState {
    type: LineType
}

class LineEditor extends React.Component<ILineEditorProps, ILineEditorState> {
    componentWillMount() {
        this.setState({
            type: this.props.line.type,
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

        this.props.line.type = this.state.type;
        this.props.lineEdited();

        this.props.close();
    }
    deleteLine() {
        this.props.deleteLine();
    }

    lastClicked?: MapCell;
    mouseUp(cell: MapCell) {
        if (cell == this.lastClicked) {
            this.props.close(); // TODO: no longer click last cell to close. Want to allow dragging etc.
        }
        else {
            // add control point to existing line
            this.props.line.keyCells.push(cell);
            this.props.line.updateRenderPoints();
            this.props.lineEdited();
        }
    }
    mouseDown(cell: MapCell) {

    }
    mouseMove(cell: MapCell) {

    }
}