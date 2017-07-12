class CellType {
    constructor(public name: string, public color: string) {
    }

    public static empty = new CellType('Empty', '#ffffff');

    static createDefaults(types: CellType[]) {
        types.push(new CellType('Water', '#179ce6'));
        types.push(new CellType('Grass', '#a1e94d'));
        types.push(new CellType('Forest', '#189b11'));
        types.push(new CellType('Hills', '#7bac46'));
        types.push(new CellType('Mountain', '#7c7c4b'));
        types.push(new CellType('Desert', '#ebd178'));
    }
}

class MapCell {
    row: number;
    col: number;
    xPos: number;
    yPos: number;
    selected: boolean;
    
    constructor(readonly map: MapData, public cellType: CellType) {
        this.selected = false;
    }
}