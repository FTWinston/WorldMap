interface ICellPattern {
    name: string;
    draw: (ctx: CanvasRenderingContext2D, random: Random) => void;
}

class CellType {
    constructor(public name: string, public color: string, public pattern?: string, public patternColor?: string, public patternNumberPerCell?: number, public patternSize?: number) {
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
    
    constructor(readonly map: MapData, public cellType: CellType) {}

    static patterns: {[key:string]:ICellPattern} = {};
}

MapCell.patterns['marsh'] = {
    name: 'Marsh',
    draw(ctx: CanvasRenderingContext2D, random: Random) {
        ctx.beginPath();
        ctx.moveTo(-1, 0.2);
        ctx.lineTo(1, 0.2);

        if (random.next() > 0.2) {
            ctx.moveTo(0, 0.2);
            ctx.lineTo(0, -0.6);

            ctx.moveTo(0.3, 0.2);
            ctx.lineTo(0.4, -0.35);
            ctx.moveTo(-0.3, 0.2);
            ctx.lineTo(-0.4, -0.35);

            ctx.moveTo(-0.6, 0.2);
            ctx.lineTo(-0.75, -0.05);
            ctx.moveTo(0.6, 0.2);
            ctx.lineTo(0.75, -0.05);
        }

        ctx.stroke();
    }
};