interface ILinesEditorProps {
    lineTypes: LineType[];
    lines: MapLine[];
    updateLineTypes: (lineTypes: LineType[]) => void;
    updateLines: (lines: MapLine[]) => void;
    drawingLine: () => void;
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
    private lineTypesChanged(lineTypes: LineType[]) {
        this.setState({
            isEditingLineType: false,
            isDrawingOnMap: false,
        })
        this.props.updateLineTypes(lineTypes);
    }
    mouseUp(cell: MapCell) {
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
    }
}