interface ILocationsEditorProps {
    dataChanged: () => void;
}

interface ILocationsEditorState {
    isEditingLocationType: boolean;
    isEditingLocation: boolean;
    selectedCell?: MapCell;
    selectedType?: LocationType;
}

class LocationsEditor extends React.Component<ILocationsEditorProps, ILocationsEditorState> {
    constructor(props: ILocationsEditorProps) {
        super(props);

        this.state = {
            isEditingLocation: false,
            isEditingLocationType: false,
        };
    }
    render() {
        return <form></form>;
    }
}