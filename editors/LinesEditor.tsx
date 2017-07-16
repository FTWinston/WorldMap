interface ILinesEditorProps {
    lineTypes: LineType[];
    lines: MapLine[];
    updateLineTypes: (lineTypes: LineType[]) => void;
    updateLines: (lines: MapLine[]) => void;
    drawingLine: (finished: boolean) => void;
}

interface ILinesEditorState {
    isEditingLineType: boolean;
    isDrawingOnMap: boolean;
    selectedLineType?: LineType;
    selectedLine?: MapLine;
}

class LinesEditor extends React.Component<ILinesEditorProps, ILinesEditorState> {
    constructor(props: ILinesEditorProps) {
        super(props);

        this.state = {
            isEditingLineType: false,
            isDrawingOnMap: false,
            selectedLineType: props.lineTypes[0],
            selectedLine: undefined,
        };
    }
    componentWillReceiveProps(newProps: ILinesEditorProps) {
        if (this.state.selectedLineType === undefined || newProps.lineTypes.indexOf(this.state.selectedLineType) == -1)
            this.setState(function (prevState) {
                return {
                    isEditingLineType: prevState.isEditingLineType,
                    isDrawingOnMap: prevState.isDrawingOnMap,
                    selectedLineType: newProps.lineTypes[0],
                }
            });
    }
    render() {
        if (this.state.isEditingLineType)
            return <LineTypeEditor editingType={this.state.selectedLineType} lineTypes={this.props.lineTypes} updateLineTypes={this.lineTypesChanged.bind(this)} />;

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
            isDrawingOnMap: false,
            selectedLineType: type,
        });
    }
    private showLineTypeEdit(type?: LineType) {
        this.setState({
            isEditingLineType: true,
            isDrawingOnMap: false,
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
            isDrawingOnMap: false,
        })
        this.props.updateLineTypes(lineTypes);
    }
    lastClicked?: MapCell;
    drawingLine?: MapLine;
    mouseUp(cell: MapCell) {
        if (this.drawingLine === undefined)
        {
            if (this.state.selectedLineType === undefined)
                return;

            // create new line, currently with only one point
            this.drawingLine = new MapLine(this.state.selectedLineType);
            this.drawingLine.keyCells.push(cell);

            let lines = this.props.lines.slice();
            lines.push(this.drawingLine);

            this.props.updateLines(lines);
        }
        else {
            if (cell == this.lastClicked) {
                // end the line
                this.drawingLine = undefined;
                this.props.drawingLine(true);
            }
            else {
                // add control point to existing line
                this.drawingLine.keyCells.push(cell);
                this.drawingLine.updateRenderPoints();
                this.props.drawingLine(false);
            }
        }

        /*
        if (!this.state.isDrawingOnMap)
            return;

        this.setState(function (prevState) {
            return {
                isEditingLineType: prevState.isEditingLineType,
                isDrawingOnMap: false,
            }
        });
        this.props.hasDrawn(false);
        */

        this.lastClicked = cell;
    }
}