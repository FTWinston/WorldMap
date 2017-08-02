interface ICellDetail {
    name: string;
    draw: (ctx: CanvasRenderingContext2D, random: Random) => void;
}

class CellType {
    constructor(public name: string, public color: string,
                public genHeight: number, public genTemperature: number, public genPrecipitation: number,
                public noiseScale: number, public noiseIntensity: number, public noiseDensity: number,
                public detail?: string, public detailColor?: string, public detailNumberPerCell?: number, public detailSize?: number) {
        this.updateTexture();
    }

    private textureCanvas?: HTMLCanvasElement;
    texturePattern?: CanvasPattern;
    updateTexture() {
        if (this.noiseIntensity <= 0) {
            this.textureCanvas = undefined;
            this.texturePattern = undefined;
            return;
        }

        this.textureCanvas = document.createElement('canvas');
        let textureCtx = this.textureCanvas.getContext('2d') as CanvasRenderingContext2D;
        let textureSize = this.textureCanvas.width = this.textureCanvas.height = 100;
        let sizeSq = textureSize * textureSize;
        let image = textureCtx.createImageData(textureSize, textureSize);
        let imageData = image.data;
        
        let writePos = 0, fillChance = 0.25, maxAlpha = 32;
        for (let i=0; i < sizeSq; i++) {
            if (Math.random() > this.noiseDensity) {
                writePos += 4;
                continue;
            }

            let rgb = Math.floor(Math.random() * 256);
            let a = Math.floor(Math.random() * this.noiseIntensity * 256);
            imageData[writePos++] = rgb;
            imageData[writePos++] = rgb;
            imageData[writePos++] = rgb;
            imageData[writePos++] = a;
        }
        textureCtx.putImageData(image, 0, 0);

        // Note: pattern isn't being created in the destination context. Does that work in all browsers?
        this.texturePattern = textureCtx.createPattern(this.textureCanvas, 'repeat');
    }

    public static empty = new CellType('Water', '#179ce6',
        -1, 0.5, 1.0,
        5, 0.1, 0.4,
        'Wave (large)', '#9fe8ff', 1, 0.5
    );

    static createDefaults(types: CellType[]) {
        types.push(new CellType('Grass', '#a1e94d',
            0.3, 0.55, 0.35,
            2, 0.1, 0.8
        ));
        types.push(new CellType('Forest', '#189b11',
            0.3, 0.3, 0.5,
            8, 0.4, 0.3,
            'Tree (coniferous)', '#305b09', 4, 0.35
        ));
        types.push(new CellType('Forest Hills', '#189b11',
            0.6, 0.3, 0.5,
            8, 0.4, 0.3,
            'Hill', '#305b09', 1, 0.75
        ));
        types.push(new CellType('Hills', '#7bac46',
            0.6, 0.55, 0.35,
            10, 0.3, 0.2,
            'Hill', '#607860', 1, 0.75
        ));
        types.push(new CellType('Mountain', '#7c7c4b',
            0.85, 0.25, 0.4,
            10, 0.2, 0.3,
            'Mountain', '#565B42', 1, 0.8
        ));
        types.push(new CellType(
            'Desert', '#ebd178',
            0.3, 0.8, 0,
            1, 0.08, 0.7,
            'Wave (small)', '#e4c045', 3, 0.5
        ));
    }
}

class MapCell {
    row: number;
    col: number;
    xPos: number;
    yPos: number;
    
    constructor(readonly map: MapData, public cellType: CellType) {}

    static details: {[key:string]:ICellDetail} = {};

    static addDetail(pattern: ICellDetail) {
        MapCell.details[pattern.name] = pattern;
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