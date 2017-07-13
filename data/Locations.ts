class LocationType {
    constructor(
        public name: string,
        public textSize: number,
        public textColor: string,
        public icon: string,
        public minDrawCellRadius?: number,
    ) {}

    static createDefaults(types: LocationType[]) {
        types.push(new LocationType('Town', 16, '#000000', 'smBlack', 10));
        types.push(new LocationType('City', 24, '#000000', 'lgBlack'));
    }
}

class MapLocation {
    constructor(
        public cell: MapCell,
        public name: string,
        public type: LocationType,
    ) { }

    static getByCell(cell: MapCell, allLocations: MapLocation[]) {
        for (let location of allLocations)
            if (location.cell == cell)
                return location;
        return undefined;
    }

    static icons: {[key:string]:IDrawable} = {};

    static setDarkColors(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = '#000000';
        ctx.strokeStyle = '#ffffff';
    }
    static setLightColors(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#000000';
    }

    static drawDot(ctx: CanvasRenderingContext2D, radius: number) {
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fill();
    }
}

MapLocation.icons['smBlack'] = {
    name: 'Small black dot',
    draw(ctx: CanvasRenderingContext2D) { MapLocation.setDarkColors(ctx); MapLocation.drawDot(ctx, 4); }
};

MapLocation.icons['mdBlack'] = {
    name: 'Medium black dot',
    draw(ctx: CanvasRenderingContext2D) { MapLocation.setDarkColors(ctx); MapLocation.drawDot(ctx, 7); }
};

MapLocation.icons['lgBlack'] = {
    name: 'Large black dot',
    draw(ctx: CanvasRenderingContext2D) { MapLocation.setDarkColors(ctx); MapLocation.drawDot(ctx, 10); }
};

MapLocation.icons['smWhite'] = {
    name: 'Small white dot',
    draw(ctx: CanvasRenderingContext2D) { MapLocation.setLightColors(ctx); MapLocation.drawDot(ctx, 4); }
};

MapLocation.icons['mdWhite'] = {
    name: 'Medium white dot',
    draw(ctx: CanvasRenderingContext2D) { MapLocation.setLightColors(ctx); MapLocation.drawDot(ctx, 7); }
};

MapLocation.icons['lgWhite'] = {
    name: 'Large white dot',
    draw(ctx: CanvasRenderingContext2D) { MapLocation.setLightColors(ctx); MapLocation.drawDot(ctx, 10); }
};