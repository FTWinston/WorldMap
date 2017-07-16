interface ICellPattern {
    name: string;
    draw: (ctx: CanvasRenderingContext2D, random: object) => void;
}

class CellType {
    constructor(public name: string, public color: string, public pattern?: string, public patternColor?: string) {
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
    draw(ctx: CanvasRenderingContext2D, random: object) {
        ctx.beginPath();
        ctx.moveTo(-10, 2);
        ctx.lineTo(10, 2);

        ctx.moveTo(0, 2);
        ctx.lineTo(0, -6);

        ctx.moveTo(3, 2);
        ctx.lineTo(4, -3.5);
        ctx.moveTo(-3, 2);
        ctx.lineTo(-4, -3.5);

        ctx.moveTo(-6, 2);
        ctx.lineTo(-7.5, -0.5);
        ctx.moveTo(6, 2);
        ctx.lineTo(7.5, -0.5);

        ctx.stroke();
    }
};