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
        return <form onSubmit={this.updateDetails.bind(this)}>
            <div role="group"><label htmlFor="txtName">Name</label><input type="text" id="txtName" value={this.state.name} onChange={this.nameChanged.bind(this)} /></div>
            <div role="group"><label htmlFor="txtDesc">Info</label><textarea id="txtDesc" onChange={this.descChanged.bind(this)} rows={20} value={this.state.description} /></div>
            <div role="group">
                <button type="submit">Save details</button>
            </div>
        </form>;
    }
    private nameChanged(e: any) {
        this.setState({name: e.target.value, description: this.state.description});
    }
    private descChanged(e: any) {
        this.setState({name: this.state.name, description: e.target.value});
    }
    private updateDetails(e: Event) {
        e.preventDefault();

        this.props.saveChanges(this.state.name, this.state.description);
    }
}