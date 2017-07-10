interface IChangeHistoryProps {
    updateMap: (map: MapData) => void;
}

interface IChangeHistoryState {
    lastAppliedChangeIndex: number;
}

class ChangeHistory extends React.Component<IChangeHistoryProps, IChangeHistoryState> {
    changes: string[] = [];
    private readonly maxUndoSteps = 10;

    constructor(props: IChangeHistoryProps) {
        super(props);
        this.state = {
            lastAppliedChangeIndex: -1,
        }
    }
    render() {
        let undoClasses = this.canUndo() ? 'roundLeft' : 'roundLeft disabled';
        let redoClasses = this.canRedo() ? 'roundRight' : 'roundRight disabled';

        return <div id="undoRedo">
            <button className={undoClasses} title="Undo the last change" onClick={this.undo.bind(this)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                    <polygon points="19 20 9 12 19 4 19 20"></polygon>
                    <line x1="5" y1="19" x2="5" y2="5"></line>
                </svg>
            </button>
            <button className={redoClasses} title="Redo the next change" onClick={this.redo.bind(this)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                    <polygon points="5 4 15 12 5 20 5 4"></polygon>
                    <line x1="19" y1="5" x2="19" y2="19"></line>
                </svg>
            </button>
        </div>;
    }

    recordChange(map: MapData) {
        // if changes have been undone, clear the queue after this point, as they can't now be redone
        if (this.changes.length > this.state.lastAppliedChangeIndex - 1)
            this.changes.splice(this.state.lastAppliedChangeIndex + 1, this.changes.length);

        // if the queue is full, remove the first item. otherwise, note that we've moved up one.
        if (this.changes.length > this.maxUndoSteps)
            this.changes.shift();
        else
            this.setState(function (prevState) {
                return {
                    lastAppliedChangeIndex: prevState.lastAppliedChangeIndex + 1
                }
            });

        this.changes.push(map.saveToJSON());
    }
    undo() {
        if (!this.canUndo())
            return null;
        
        this.props.updateMap(MapData.loadFromJSON(this.changes[this.state.lastAppliedChangeIndex - 1]));
        
        this.setState(function (prevState) {
            return {
                lastAppliedChangeIndex: prevState.lastAppliedChangeIndex - 1
            }
        });
    }
    redo() {
        if (!this.canRedo())
            return;
        
        this.props.updateMap(MapData.loadFromJSON(this.changes[this.state.lastAppliedChangeIndex + 1]));

        this.setState(function (prevState) {
                return {
                    lastAppliedChangeIndex: prevState.lastAppliedChangeIndex + 1
                }
            });
    }
    canUndo() {
        return this.state.lastAppliedChangeIndex > 0;
    }
    canRedo() {
        return this.state.lastAppliedChangeIndex < this.changes.length - 1;
    }
}