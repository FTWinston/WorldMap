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

    private getKeyIndexAt(cell: MapCell) {
        let cells =  this.props.line.keyCells;
        for (let i=0; i<cells.length; i++)
            if (cells[i] == cell)
                return i;
        return undefined;
    }

    draggingCellIndex?: number;
    hasDragged: boolean = false;
    mouseUp(cell: MapCell) {
        if (!this.hasDragged) {
            // add control point to existing line, if we weren't dragging
            this.props.line.keyCells.push(cell);
            this.props.line.updateRenderPoints();
            this.props.lineEdited();
            
            this.hasDragged = false;
        }
        
        this.draggingCellIndex = undefined;
    }
    mouseDown(cell: MapCell) {
        this.draggingCellIndex = this.getKeyIndexAt(cell);
        this.hasDragged = false;
    }
    mouseEnter(cell: MapCell) {
        // change a line's key cells by dragging them
        if (this.draggingCellIndex !== undefined) {
            this.hasDragged = true;
            this.props.line.keyCells[this.draggingCellIndex] = cell;
            this.props.line.updateRenderPoints();
            this.props.lineEdited();
        }
    }
}