interface IChangeHistoryProps {
    updateMap: (map: MapData) => void;
}

interface IChangeHistoryState {
    lastAppliedChangeIndex: number;
    lastSavedChangedIndex?: number;
    saveInProgress: boolean;
}

class ChangeHistory extends React.Component<IChangeHistoryProps, IChangeHistoryState> {
    changes: string[] = [];
    private readonly maxUndoSteps = 10;

    constructor(props: IChangeHistoryProps) {
        super(props);
        this.state = {
            lastAppliedChangeIndex: -1,
            lastSavedChangedIndex: 0,
            saveInProgress: false,
        }
    }
    render() {
        let undoClasses = this.canUndo() ? 'roundLeft' : 'roundLeft disabled';
        let redoClasses = this.canRedo() ? 'roundRight' : 'roundRight disabled';
        let saveClasses = this.state.lastSavedChangedIndex == this.state.lastAppliedChangeIndex ? 'disabled' : undefined;
        
        let saveButton = this.state.saveInProgress
            ? <button className="spinner" title="Saving...">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                    <line x1="12" y1="2" x2="12" y2="6"></line>
                    <line x1="12" y1="18" x2="12" y2="22"></line>
                    <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
                    <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
                    <line x1="2" y1="12" x2="6" y2="12"></line>
                    <line x1="18" y1="12" x2="22" y2="12"></line>
                    <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
                    <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
                </svg>
            </button>
            : <button className={saveClasses} title="Save the map" onClick={this.save.bind(this)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                    <polyline points="17 21 17 13 7 13 7 21"></polyline>
                    <polyline points="7 3 7 8 15 8"></polyline>
                </svg>
            </button>

        return <div id="undoRedo">
            <button className={undoClasses} title="Undo the last change" onClick={this.undo.bind(this)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                    <polygon points="19 20 9 12 19 4 19 20"></polygon>
                    <line x1="5" y1="19" x2="5" y2="5"></line>
                </svg>
            </button>
            {saveButton}
            <button className={redoClasses} title="Redo the next change" onClick={this.redo.bind(this)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                    <polygon points="5 4 15 12 5 20 5 4"></polygon>
                    <line x1="19" y1="5" x2="19" y2="19"></line>
                </svg>
            </button>
        </div>;
    }

    recordMapChange(map: MapData) {
        this.recordChangeData(map.saveToJSON());
    }

    recordChangeData(data: string) {
        // if changes have been undone, clear the queue after this point, as they can't now be redone
        if (this.changes.length > this.state.lastAppliedChangeIndex - 1)
            this.changes.splice(this.state.lastAppliedChangeIndex + 1, this.changes.length);

        // if the queue is full, remove the first item. otherwise, note that we've moved up one.
        let diff: number;
        if (this.changes.length > this.maxUndoSteps) {
            this.changes.shift();
            
            this.setState(function (prevState) {
                return {
                    lastSavedChangedIndex: prevState.lastAppliedChangeIndex - 1,
                }
            });
        }
        else
            this.setState(function (prevState) {
                return {
                    lastAppliedChangeIndex: prevState.lastAppliedChangeIndex + 1,
                }
            });

        this.changes.push(data);
    }
    undo() {
        if (this.canUndo())
            this.restoreSavedChange(this.state.lastAppliedChangeIndex - 1);
    }
    redo() {
        if (this.canRedo())
            this.restoreSavedChange(this.state.lastAppliedChangeIndex + 1);
    }
    private restoreSavedChange(changeIndex: number) {
        let map = MapData.loadFromJSON(this.changes[changeIndex]);
        this.props.updateMap(map);
        MapGenerator.constructCellTypeLookup(map.cellTypes);
        
        this.setState(function (prevState) {
            return {
                lastAppliedChangeIndex: changeIndex,
            }
        });
    }
    canUndo() {
        return this.state.lastAppliedChangeIndex > 0;
    }
    canRedo() {
        return this.state.lastAppliedChangeIndex < this.changes.length - 1;
    }
    save() {
        let currentData = this.changes[this.state.lastAppliedChangeIndex];
        SaveLoad.saveData(currentData, function(success: boolean) {
            this.setState(function (prevState: IChangeHistoryState) {
                return {
                    saveInProgress: false,
                }
            });
        }.bind(this));

        this.setState(function (prevState: IChangeHistoryState) {
            return {
                lastSavedChangedIndex: prevState.lastAppliedChangeIndex,
                saveInProgress: true,
            }
        });
    }
}