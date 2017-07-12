class CellType {
    constructor(public name: string, public color: string) {
    }

    public static empty = new CellType('Empty', '#ffffff');
}

class MapCell {
    row: number;
    col: number;
    xPos: number;
    yPos: number;
    selected: boolean;
    typeID: number;
    constructor(readonly map: MapData, public cellType: CellType) {
        this.selected = false;
    }
}