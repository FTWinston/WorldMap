interface ICellDetail {
    name: string;
    draw: (ctx: CanvasRenderingContext2D, random: Random) => void;
}

class VegetationType implements IDetail {
    constructor(public name: string, public isLand: boolean, public temperature: number, public precipitation: number,
                public color: string, public noiseScale: number, public noiseIntensity: number, public noiseDensity: number,
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

    static createDefaults(types: VegetationType[]) {
        types.push(new VegetationType(
            'Water', false, 0.5, 1.0,
            '#179ce6', 5, 0.1, 0.4,
            'Wave (large)', '#9fe8ff', 1, 0.5,
        ));
        types.push(new VegetationType(
            'Grass', true, 0.55, 0.35,
            '#a1e94d', 2, 0.1, 0.8,
        ));
        types.push(new VegetationType(
            'Forest', true, 0.3, 0.5,
            '#189b11', 8, 0.4, 0.3,
            'Tree (coniferous)', '#305b09', 4, 0.35,
        ));
        types.push(new VegetationType(
            'Marsh', true, 0.4, 0.7,
            '#7bac46', 10, 0.3, 0.2,
            'Marsh', '#607860', 6, 0.2,
        ));
        types.push(new VegetationType(
            'Desert', true, 0.8, 0,
            '#ebd178', 1, 0.08, 0.7,
            'Wave (small)', '#e4c045', 3, 0.5
        ));
    }
}