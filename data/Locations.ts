interface ILocationIcon {
    name: string;
    draw: (ctx: CanvasRenderingContext2D) => void;
}

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

    draw(ctx: CanvasRenderingContext2D, markerX: number, markerY: number) {
        ctx.translate(markerX, markerY);
        MapLocation.icons[this.type.icon].draw(ctx);

        let labelOffset = this.type.textSize * 1.5;
        ctx.translate(0, -labelOffset);

        ctx.fillStyle = this.type.textColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = this.type.textSize + 'pt serif';
        ctx.fillText(this.name, 0, 0);

        ctx.translate(-markerX, -markerY + labelOffset);
    }

    static getByCell(cell: MapCell, allLocations: MapLocation[]) {
        for (let location of allLocations)
            if (location.cell == cell)
                return location;
        return undefined;
    }

    static icons: {[key:string]:ILocationIcon} = {};

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