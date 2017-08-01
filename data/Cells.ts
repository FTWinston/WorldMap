class MapCell {
    row: number;
    col: number;
    xPos: number;
    yPos: number;
    
    constructor(readonly map: MapData, public terrain: TerrainType, public vegetation: VegetationType) {}

    static details: {[key:string]:ICellDetail} = {};

    static addDetail(detail: ICellDetail) {
        MapCell.details[detail.name] = detail;
    }
}

MapCell.addDetail({
    name: 'Circle',
    draw(ctx: CanvasRenderingContext2D, random: Random) {
        ctx.beginPath();
        ctx.arc(0, 0, 1, 0, Math.PI * 2);
        ctx.stroke();
    }
});
MapCell.addDetail({
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
});
MapCell.addDetail({
    name: 'Wave (large)',
    draw(ctx: CanvasRenderingContext2D, random: Random) {
        // vary the direction (down-up vs up-down) and intensity of each wave
        let yScale = (random.next() > 0.5 ? -1 : 1) * random.nextInRange(0.75, 1.2);

        ctx.beginPath();
        ctx.moveTo(-1,0);
        ctx.bezierCurveTo(-0.1, -1 * yScale, 0.1, 1 * yScale, 1, 0);
        ctx.stroke();
    }
});
MapCell.addDetail({
    name: 'Wave (small)',
    draw(ctx: CanvasRenderingContext2D, random: Random) {
        // vary the direction (down-up vs up-down) and intensity of each wave
        let yScale = (random.next() > 0.5 ? -1 : 1) * random.nextInRange(0.3, 0.7);

        ctx.beginPath();
        ctx.moveTo(-1,0);
        ctx.bezierCurveTo(-0.1, -1 * yScale, 0.1, 1 * yScale, 1, 0);
        ctx.stroke();
    }
});
MapCell.addDetail({
    name: 'Hill',
    draw(ctx: CanvasRenderingContext2D, random: Random) {
        // vary the height and shape of each hill
        let x1 = random.nextInRange(-0.6, 0.2);
        let x2 = random.nextInRange(-0.2, 0.6);
        let yScale = random.nextInRange(0.75, 1.2);
        let yMin = yScale / 2;

        ctx.beginPath();
        ctx.moveTo(-1,yMin);
        ctx.bezierCurveTo(x1, -yMin, x2, -yMin, 1, yMin);
        ctx.stroke();
    }
});
MapCell.addDetail({
    name: 'Mountain',
    draw(ctx: CanvasRenderingContext2D, random: Random) {
        // vary the height and shape of each mountain
        let x1 = random.nextInRange(0.1, 0.9);
        let x2 = random.nextInRange(-0.9, -0.1);
        let yScale = random.nextInRange(1.4, 2);
        let yMin = yScale / 3;
        let yMax = yMin - yScale;

        ctx.beginPath();
        ctx.moveTo(-0.9,yMin);
        ctx.bezierCurveTo(x1, yMax, x2, yMax, 0.9, yMin);
        ctx.stroke();
    }
});
MapCell.addDetail({
    name: 'Tree (coniferous)',
    draw(ctx: CanvasRenderingContext2D, random: Random) {
        ctx.beginPath();
        ctx.moveTo(0,-1);
        ctx.lineTo(0,1);
        
        ctx.moveTo(-0.6, 0.5)
        ctx.lineTo(0, 0.4);
        ctx.lineTo( 0.6, 0.5);

        ctx.moveTo(-0.5, 0.3)
        ctx.lineTo(0, 0.2);
        ctx.lineTo( 0.5, 0.3);

        ctx.moveTo(-0.4, 0.1)
        ctx.lineTo(0, 0);
        ctx.lineTo( 0.4, 0.1);

        ctx.moveTo(-0.3, -0.1)
        ctx.lineTo(0, -0.2);
        ctx.lineTo( 0.3, -0.1);

        ctx.moveTo(-0.2, -0.3)
        ctx.lineTo(0, -0.4);
        ctx.lineTo( 0.2, -0.3);

        ctx.moveTo(-0.1, -0.5)
        ctx.lineTo(0, -0.6);
        ctx.lineTo( 0.1, -0.5);

        ctx.stroke();
    }
});