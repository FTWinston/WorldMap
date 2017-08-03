interface ITerrainEditorProps {
    cellTypes: CellType[];
    updateCellTypes: (cellTypes: CellType[]) => void;
    hasDrawn: (endOfStroke: boolean) => void;
}

const enum TerrainEditorMode {
    CellTypes,
    TerrainProperties,
}

const enum TerrainProperty {
    Height,
    Temperature,
    Precipitation,
}

interface ITerrainEditorState {
    isEditingTerrainType: boolean;
    isDrawingOnMap: boolean;
    selectedTerrainType?: CellType;
    editorMode: TerrainEditorMode;
    selectedTerrainProperty: TerrainProperty;
    selectedTerrainAdjustment: number;
}

class TerrainEditor extends React.Component<ITerrainEditorProps, ITerrainEditorState> implements IMapEditor {
    constructor(props: ITerrainEditorProps) {
        super(props);

        this.state = {
            isEditingTerrainType: false,
            isDrawingOnMap: false,
            selectedTerrainType: props.cellTypes[0],
            editorMode: TerrainEditorMode.CellTypes,
            selectedTerrainProperty: TerrainProperty.Height,
            selectedTerrainAdjustment: 1,
        };
    }
    componentWillUpdate(nextProps: ITerrainEditorProps, nextState: ITerrainEditorState) {
        if (this.state.isDrawingOnMap && !nextState.isDrawingOnMap)
            this.props.hasDrawn(true);
    }
    componentDidUpdate(prevProps: ITerrainEditorProps, prevState: ITerrainEditorState) {
        if (this.state.selectedTerrainType === undefined || this.props.cellTypes.indexOf(this.state.selectedTerrainType) == -1) {
            this.setState(function (prevState) {
                return {
                    isEditingTerrainType: false,
                    isDrawingOnMap: false,
                    selectedTerrainType: this.props.cellTypes[0],
                }
            });
        }
    }
    render() {
        if (this.state.isEditingTerrainType)
            return <CellTypeEditor editingType={this.state.selectedTerrainType} cellTypes={this.props.cellTypes} updateCellTypes={this.cellTypesChanged.bind(this)} />;

        let that = this;
        const propertyAdjustmentScale = 0.1;

        let editorPallete =
            this.state.editorMode == TerrainEditorMode.CellTypes ? [
                <p key="prompt">Select a terrain type to draw onto the map. Double click/tap on a terrain type to edit it.</p>,
                <div key="palette" className="palleteList">
                    {this.props.cellTypes.map(function(type, id) {
                        let classes = type == that.state.selectedTerrainType ? 'selected' : undefined;
                        return <div key={id.toString()} className={classes} style={{'backgroundColor': type.color}} onClick={that.selectTerrainType.bind(that, type)} onDoubleClick={that.showTerrainEdit.bind(that, type)}>{type.name}</div>;
                    })}
                </div>,
                <div key="actions" role="group" className="vertical">
                    <button type="button" onClick={this.showTerrainEdit.bind(this, undefined)}>Add new type</button>
                </div>
            ] : [
                <p key="prompt">Adjust properties of the terrain by drawing on the map. Cells will change their type to keep up to date with their properties.</p>,
                <div key="palette" className="palleteList">
                    <div className={this.state.selectedTerrainProperty == TerrainProperty.Height && this.state.selectedTerrainAdjustment == propertyAdjustmentScale ? 'selected' : undefined} onClick={that.selectTerrainProperties.bind(that, TerrainProperty.Height, propertyAdjustmentScale)}>Increase height</div>
                    <div className={this.state.selectedTerrainProperty == TerrainProperty.Height && this.state.selectedTerrainAdjustment == -propertyAdjustmentScale ? 'selected' : undefined} onClick={that.selectTerrainProperties.bind(that, TerrainProperty.Height, -propertyAdjustmentScale)}>Decrease height</div>
                    <div className={this.state.selectedTerrainProperty == TerrainProperty.Temperature && this.state.selectedTerrainAdjustment == propertyAdjustmentScale ? 'selected' : undefined} onClick={that.selectTerrainProperties.bind(that, TerrainProperty.Temperature, propertyAdjustmentScale)}>Increase temperature</div>
                    <div className={this.state.selectedTerrainProperty == TerrainProperty.Temperature && this.state.selectedTerrainAdjustment == -propertyAdjustmentScale ? 'selected' : undefined} onClick={that.selectTerrainProperties.bind(that, TerrainProperty.Temperature, -propertyAdjustmentScale)}>Decrease temperature</div>
                    <div className={this.state.selectedTerrainProperty == TerrainProperty.Precipitation && this.state.selectedTerrainAdjustment == propertyAdjustmentScale ? 'selected' : undefined} onClick={that.selectTerrainProperties.bind(that, TerrainProperty.Precipitation, propertyAdjustmentScale)}>Increase precipitation</div>
                    <div className={this.state.selectedTerrainProperty == TerrainProperty.Precipitation && this.state.selectedTerrainAdjustment == -propertyAdjustmentScale ? 'selected' : undefined} onClick={that.selectTerrainProperties.bind(that, TerrainProperty.Precipitation, -propertyAdjustmentScale)}>Decrease precipitation</div>
                </div>,
            ];

        return <form>
            <div role="group" className="vertical">
                <label>
                    <input type="radio" name="drawMode" checked={this.state.editorMode == TerrainEditorMode.CellTypes} onChange={this.setEditorMode.bind(this, TerrainEditorMode.CellTypes)} /> Set cell types
                </label>
                <label>
                    <input type="radio" name="drawMode" checked={this.state.editorMode == TerrainEditorMode.TerrainProperties} onChange={this.setEditorMode.bind(this, TerrainEditorMode.TerrainProperties)} /> Adjust terrain properties
                </label>
            </div>
            {editorPallete}
        </form>;
    }
    private setEditorMode(mode: TerrainEditorMode) {
        this.setState({
            editorMode: mode,
        })
    }
    private selectTerrainType(type: CellType) {
        this.setState({
            isEditingTerrainType: false,
            isDrawingOnMap: false,
            selectedTerrainType: type,
        });
    }
    private selectTerrainProperties(property: TerrainProperty, adjustment: number) {
        this.setState({
            selectedTerrainProperty: property,
            selectedTerrainAdjustment: adjustment,
        });
    }
    private showTerrainEdit(type?: CellType) {
        this.setState({
            isEditingTerrainType: true,
            isDrawingOnMap: false,
            selectedTerrainType: type,
        });
    }
    private cellTypesChanged(cellTypes: CellType[]) {
        this.setState({
            isEditingTerrainType: false,
            isDrawingOnMap: false,
        })
        this.props.updateCellTypes(cellTypes);
    }
    mouseDown(cell: MapCell) {
        if (this.state.isDrawingOnMap || this.state.selectedTerrainType === undefined)
            return;
        
        this.setState({
            isDrawingOnMap: true,
        });
        this.drawOnCell(cell);
        this.props.hasDrawn(false);
    }
    mouseUp(cell: MapCell) {
        if (!this.state.isDrawingOnMap)
            return;

        this.setState({
            isDrawingOnMap: false,
        });
    }
    mouseEnter(cell: MapCell) {
        if (!this.state.isDrawingOnMap || this.state.selectedTerrainType === undefined)
            return;

        this.drawOnCell(cell);
        this.props.hasDrawn(false);
    }
    private drawOnCell(cell: MapCell) {
        if (this.state.editorMode == TerrainEditorMode.CellTypes) {
            if (this.state.selectedTerrainType !== undefined)
                cell.cellType = this.state.selectedTerrainType;
        }
        else {
            switch (this.state.selectedTerrainProperty) {
                case TerrainProperty.Height:
                    cell.height = Math.min(1, Math.max(-1, cell.height + this.state.selectedTerrainAdjustment));
                    break;
                case TerrainProperty.Temperature:
                    cell.temperature = Math.min(1, Math.max(0, cell.temperature + this.state.selectedTerrainAdjustment));
                    break;
                case TerrainProperty.Precipitation:
                    cell.precipitation = Math.min(1, Math.max(0, cell.precipitation + this.state.selectedTerrainAdjustment));
                    break;
            }

            MapGenerator.updateCellType(cell);
        }
    }

    replacingMap(map: MapData) {
        let cellType: CellType | undefined;
        let editingType = this.state.isEditingTerrainType;

        if (this.state.selectedTerrainType !== undefined) {
            let index = this.props.cellTypes.indexOf(this.state.selectedTerrainType);
            cellType = map.cellTypes[index];
        }
        if (cellType === undefined) {
            cellType = map.cellTypes[0];
            editingType = false;
        }

        this.setState({
            isEditingTerrainType: editingType,
            selectedTerrainType: cellType,
            isDrawingOnMap: false, 
        });
    }
}