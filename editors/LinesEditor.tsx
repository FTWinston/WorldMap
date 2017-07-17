interface ILinesEditorProps {
    lineTypes: LineType[];
    lines: MapLine[];
    updateLineTypes: (lineTypes: LineType[]) => void;
    updateLines: (lines: MapLine[]) => void;
}

interface ILinesEditorState {
    isEditingLineType: boolean;
    selectedLineType?: LineType;
    selectedLine?: MapLine;
}

class LinesEditor extends React.Component<ILinesEditorProps, ILinesEditorState> {
    constructor(props: ILinesEditorProps) {
        super(props);

        this.state = {
            isEditingLineType: false,
            selectedLineType: props.lineTypes[0],
            selectedLine: undefined,
        };
    }
    componentWillReceiveProps(newProps: ILinesEditorProps) {
        if (this.state.selectedLineType === undefined || newProps.lineTypes.indexOf(this.state.selectedLineType) == -1)
            this.setState(function (prevState) {
                return {
                    isEditingLineType: prevState.isEditingLineType,
                    selectedLineType: newProps.lineTypes[0],
                }
            });
    }
    render() {
        if (this.state.isEditingLineType)
            return <LineTypeEditor editingType={this.state.selectedLineType} lineTypes={this.props.lineTypes} updateLineTypes={this.lineTypesChanged.bind(this)} />;
        else if (this.state.selectedLine !== undefined)
            return <LineEditor editingLine={this.state.selectedLine} lines={this.props.lines} lineTypes={this.props.lineTypes} updateLines={this.linesUpdated.bind(this)} />

        let that = this;
        return <form>
            <p>Select a line type to draw onto the map, then click cells to draw it. Double click/tap on a line type to edit it.</p>
            <div className="palleteList">
                {this.props.lineTypes.map(function(type, id) {
                    let classes = type == that.state.selectedLineType ? 'selected' : undefined;
                    return <div key={id.toString()} className={classes} style={{'backgroundColor': type.color}} onClick={that.selectLineType.bind(that, type)} onDoubleClick={that.showLineTypeEdit.bind(that, type)}>{type.name}</div>;
                })}
            </div>
            <div role="group" className="vertical">
                <button type="button" onClick={this.showLineTypeEdit.bind(this, undefined)}>Add new type</button>
            </div>
        </form>;
    }
    private selectLineType(type: LineType) {
        this.setState({
            isEditingLineType: false,
            selectedLineType: type,
        });
    }
    private showLineTypeEdit(type?: LineType) {
        this.setState({
            isEditingLineType: true,
            selectedLineType: type,
        });
    }
    private lineTypesChanged(lineTypes: LineType[], recalculateType?: LineType) {
        // if a type's curviture has changed, recalculate all lines of that type
        if (recalculateType !== undefined)
            for (let line of this.props.lines)
                if (line.type == recalculateType)
                    line.updateRenderPoints();

        this.setState({
            isEditingLineType: false,
        });
        this.props.updateLineTypes(lineTypes);
    }
    private linesUpdated(lines: MapLine[]) {
        this.props.updateLines(lines);
        this.setState({
            selectedLine: undefined,
            isEditingLineType: false,
        });
    }

    lastClicked?: MapCell;
    mouseUp(cell: MapCell) {
        if (this.state.isEditingLineType)
            return;
        
        let lines = this.props.lines.slice();

        if (this.state.selectedLine === undefined)
        {
            let line = MapLine.getByCell(cell, this.props.lines);
            if (line !== undefined) {
                this.setState({
                    selectedLine: line,
                    isEditingLineType: false,
                });
                return;
            }

            if (this.state.selectedLineType === undefined)
                return;

            // create new line, currently with only one point
            line = new MapLine(this.state.selectedLineType);
            line.keyCells.push(cell);
            lines.push(line);

            this.setState({
                selectedLine: line,
                isEditingLineType: false,
            });
        }
        else {
            if (cell == this.lastClicked) {
                // end the line
                this.setState({
                    selectedLine: undefined,
                    isEditingLineType: false,
                });
            }
            else {
                // add control point to existing line
                this.state.selectedLine.keyCells.push(cell);
                this.state.selectedLine.updateRenderPoints();
            }
        }
        
        this.props.updateLines(lines);
        this.lastClicked = cell;
    }
}