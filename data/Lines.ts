class LineType {
    constructor(
        public name: string,
        public color: string,
        public width: number,
        public startWidth: number,
        public endWidth: number,
    ) {}

    static createDefaults(types: LineType[]) {
        types.push(new LineType('River', '#179ce6', 6, 0, 9));
        types.push(new LineType('Road', '#bbad65', 4, 4, 4));
    }
}

class MapLine {
    readonly cells: MapCell[];

    constructor(public type: LineType) {
        this.cells = [];
    }
}