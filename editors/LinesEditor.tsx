interface ILinesEditorProps {
    lineTypes: LineType[];
    lines: MapLine[];
    selectedLine?: MapLine;
    updateLineTypes: (lineTypes: LineType[]) => void;
    updateLines: (lines: MapLine[]) => void;
    lineSelected: (line?: MapLine) => void;
}

interface ILinesEditorState {
    isEditingLineType: boolean;
    selectedLineType?: LineType;
}

class LinesEditor extends React.Component<ILinesEditorProps, ILinesEditorState> {
    constructor(props: ILinesEditorProps) {
        super(props);

        this.state = {
            isEditingLineType: false,
            selectedLineType: props.lineTypes[0],
        };
    }
    componentDidUpdate(prevProps: ILinesEditorProps, prevState: ILinesEditorState) {
        if (this.state.selectedLineType !== undefined && this.props.lineTypes.indexOf(this.state.selectedLineType) == -1) {
            this.setState(function (prevState) {
                return {
                    isEditingLineType: prevState.isEditingLineType,
                    selectedLineType: this.props.lineTypes[0],
                }
            });
        }
    }
    lineEditor: LineEditor | null = null;
    render() {
        if (this.state.isEditingLineType)
            return <LineTypeEditor editingType={this.state.selectedLineType} lineTypes={this.props.lineTypes} updateLineTypes={this.lineTypesChanged.bind(this)} />;
        else if (this.props.selectedLine !== undefined)
            return <LineEditor line={this.props.selectedLine} lineTypes={this.props.lineTypes} lineEdited={this.lineEdited.bind(this)} deleteLine={this.deleteLine.bind(this)} close={this.closeLineEditor.bind(this)} ref={(c) => this.lineEditor = c} />

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

    private closeLineEditor() {
        this.props.lineSelected(undefined);
    }
    private lineEdited() {
        this.props.updateLines(this.props.lines);
    }
    private deleteLine() {
        if (this.props.selectedLine === undefined)
            return;
        
        let lines = this.props.lines.slice();

        let pos = lines.indexOf(this.props.selectedLine);
        lines.splice(pos, 1);
        
        this.props.updateLines(lines);
        this.closeLineEditor();
    }
    private createNewLine(cell: MapCell) {
        if (this.state.isEditingLineType)
            return;

        let line = MapLine.getByCell(cell, this.props.lines);
        if (line !== undefined) {
            this.props.lineSelected(line);
            return;
        }

        if (this.state.selectedLineType === undefined)
            return;

        let lines = this.props.lines.slice();

        // create new line, currently with only one point
        line = new MapLine(this.state.selectedLineType);
        line.keyCells.push(cell);
        lines.push(line);
        
        this.props.lineSelected(line);        
        this.props.updateLines(lines);
    }

    mouseDown(cell: MapCell) {
        if (this.lineEditor !== null)
            this.lineEditor.mouseDown(cell);
    }
    mouseUp(cell: MapCell) {
        if (this.lineEditor !== null)
            this.lineEditor.mouseUp(cell);
        else
            this.createNewLine(cell);
    }
    mouseEnter(cell: MapCell) {
        if (this.lineEditor !== null)
            this.lineEditor.mouseEnter(cell);
    }

    replacingMap(map: MapData) {
        if (this.state.selectedLineType !== undefined) {
            let index = this.props.lineTypes.indexOf(this.state.selectedLineType);
            let lineType = map.lineTypes[index];
            this.setState({
                isEditingLineType: this.state.isEditingLineType && lineType !== undefined,
                selectedLineType: lineType,
            });
        }
    }
}