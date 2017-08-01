

class TerrainType implements IDetail {
    constructor(public name: string, public height: number,
        public detail?: string, public detailColor?: string,
        public detailNumberPerCell?: number, public detailSize?: number) {
    }

    static createDefaults(types: TerrainType[]) {
        types.push(new TerrainType('Water', 0));
        types.push(new TerrainType('Flat', 0.2));
        types.push(new TerrainType('Hills', 0.6, 'Hill', '#607860', 1, 0.75));
        types.push(new TerrainType('Mountain', 0.9, 'Mountain', '#565B42', 1, 0.8));
    }
}
