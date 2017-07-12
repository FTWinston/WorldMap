class LocationType {
    constructor(
        public name: string,
        public textSize: number,
        public textColor: string,
        public icon: string,
        public minDrawCellRadius?: number,
    ) {}

    static createDefaults(types: LocationType[]) {
        types.push(new LocationType('Town', 16, '#000000', 'small', 10));
        types.push(new LocationType('City', 24, '#000000', 'large'));
    }
}

class MapLocation {
    constructor(
        public cell: MapCell,
        public name: string,
        public type: LocationType,
    ) { }
}