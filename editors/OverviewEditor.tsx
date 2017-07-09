interface IOverviewEditorProps extends IOverviewEditorState {
    saveChanges: (name: string, desc: string) => void;
}

interface IOverviewEditorState {
    name: string;
    description: string;    
}

class OverviewEditor extends React.Component<IOverviewEditorProps, IOverviewEditorState> {
    constructor(props: IOverviewEditorProps) {
        super(props);

        this.state = {
            name: props.name,
            description: props.description,
        };
    }

    render() {
        return <form>
            <div role="group" className="vertical"><label htmlFor="txtName">Name</label><input type="text" id="txtName" value={this.state.name} onChange={this.nameChanged.bind(this)} /></div>
            <div role="group" className="vertical"><label htmlFor="txtDesc">Description</label><textarea id="txtDesc" onChange={this.descChanged.bind(this)} rows={20} value={this.state.description} /></div>
        </form>;
    }
    private nameChanged(e: any) {
        this.setState({name: e.target.value, description: this.state.description});
    }
    private descChanged(e: any) {
        this.setState({name: this.state.name, description: e.target.value});
    }
    componentDidUpdate(prevProps: IOverviewEditorProps, prevState: IOverviewEditorState) {
        if (this.state.name != prevState.name || this.state.description != prevState.description)
            this.props.saveChanges(this.state.name, this.state.description);
    }
}