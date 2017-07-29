interface IOverviewEditorProps {
    name: string;
    description: string;    
    saveChanges: (name: string, desc: string) => void;
}

class OverviewEditor extends React.Component<IOverviewEditorProps, {}> {
    constructor(props: IOverviewEditorProps) {
        super(props);
    }
    private name: HTMLInputElement;
    private desc: HTMLTextAreaElement;
    private detectPropChange: boolean = false;
    
    componentWillReceiveProps() {
        // This is a hack: updating the key of the inputs when the props change causes them to render their defaultValue again, which has just changed.
        // This allows undo/redo to visibly change the name / description.
        this.detectPropChange = !this.detectPropChange;
    }

    render() {
        return <form>
            <div role="group" className="vertical"><label htmlFor="txtName">Name</label><input type="text" defaultValue={this.props.name} key={this.detectPropChange ? 'txtA' : 'txtB'} ref={(c) => { if (c !== null) this.name = c}} onBlur={this.nameChanged.bind(this)} /></div>
            <div role="group" className="vertical"><label htmlFor="txtDesc">Description</label><textarea defaultValue={this.props.description} key={this.detectPropChange ? 'descA' : 'descB'} ref={(c) => {if (c !== null) this.desc = c}} onBlur={this.descChanged.bind(this)} rows={20} /></div>
        </form>;
    }
    private nameChanged(e: any) {
        let value: string = e.target.value;
        if (this.props.name != value)
            this.props.saveChanges(value, this.props.description);
    }
    private descChanged(e: any) {
        let value: string = e.target.value;
        if (this.props.description != value)
            this.props.saveChanges(this.props.name, value);
    }
}