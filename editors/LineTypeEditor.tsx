interface ILineTypeEditorProps {
    editingType?: LineType;
    lineTypes: LineType[];
    updateLineTypes: (lineTypes: LineType[]) => void;
}

interface ILineTypeEditorState {
    name?: string;
    color?: string;
    width?: number;
    startWidth?: number;
    endWidth?: number;
}

class LineTypeEditor extends React.Component<ILineTypeEditorProps, ILineTypeEditorState> {
    componentWillMount() {
        if (this.props.editingType === undefined)
            this.setState({
                name: '',
                color: '#666666',
                width: 6,
                startWidth: 6,
                endWidth: 6,
            });
        else
            this.setState({
                name: this.props.editingType.name,
                color: this.props.editingType.color,
                width: this.props.editingType.width,
                startWidth: this.props.editingType.startWidth,
                endWidth: this.props.editingType.endWidth,
            });
    }
    render() {
        let deleteButton = this.props.editingType === undefined || this.props.lineTypes.length < 2 ? undefined : <button type="button" onClick={this.deleteType.bind(this)}>Delete</button>;

        let width = this.state.width === undefined ? '' : this.state.width;
        let startWidth = this.state.startWidth === undefined ? '' : this.state.startWidth;
        let endWidth = this.state.endWidth === undefined ? '' : this.state.endWidth;

        return <form onSubmit={this.saveType.bind(this)}>
            <div role="group"><label htmlFor="txtName">Name</label><input type="text" id="txtName" value={this.state.name} onChange={this.nameChanged.bind(this)} /></div>
            <div role="group"><label htmlFor="inColor">Color</label><input type="color" id="inColor" value={this.state.color} onChange={this.colorChanged.bind(this)} /></div>
            <div role="group"><label htmlFor="txtWidth">Width</label><input type="number" id="txtWidth" value={width.toString()} onChange={this.widthChanged.bind(this)} /></div>
            <div role="group"><label htmlFor="txtStartWidth">Start width</label><input type="number" id="txtStartWidth" value={startWidth.toString()} onChange={this.startWidthChanged.bind(this)} /></div>
            <div role="group"><label htmlFor="txtEndWidth">End width</label><input type="number" id="txtEndWidth" value={endWidth.toString()} onChange={this.endWidthChanged.bind(this)} /></div>
            <div role="group">
                <button type="submit">Save type</button>
                <button type="button" onClick={this.cancelEdit.bind(this)}>Cancel</button>
                {deleteButton}
            </div>
        </form>;
    }
    private nameChanged(e: any) {
        this.setState({
            name: e.target.value
        });
    }
    private colorChanged(e: any) {
        this.setState({
            color: e.target.value
        });
    }
    private widthChanged(e: any) {
        this.setState({
            width: e.target.value
        });
    }
    private startWidthChanged(e: any) {
        this.setState({
            startWidth: e.target.value
        });
    }
    private endWidthChanged(e: any) {
        this.setState({
            endWidth: e.target.value
        });
    }
    private saveType(e: Event) {
        e.preventDefault();

        let name = this.state.name === undefined ? '' : this.state.name.trim();
        if (name == '')
            return;
        
        let color = this.state.color === undefined ? '' : this.state.color;
        if (color == '')
            return;

        if (this.state.width === undefined || this.state.startWidth === undefined || this.state.endWidth === undefined)
            return;

        let editType = this.props.editingType;
        let lineTypes = this.props.lineTypes.slice();
        if (editType === undefined) {
            lineTypes.push(new LineType(name, color, this.state.width, this.state.startWidth, this.state.endWidth));
        }
        else {
            editType.name = name;
            editType.color = color;
            editType.width = this.state.width;
            editType.startWidth = this.state.startWidth;
            editType.endWidth = this.state.endWidth;
        }

        this.props.updateLineTypes(lineTypes);
    }
    cancelEdit() {
        this.props.updateLineTypes(this.props.lineTypes);
    }
    deleteType() {
        let lineTypes = this.props.lineTypes.slice();

        if (this.props.editingType !== undefined) {
            let pos = lineTypes.indexOf(this.props.editingType);
            lineTypes.splice(pos, 1);
        }
        
        this.props.updateLineTypes(lineTypes);
    }
}