interface ITexture {
    color: string,
    noiseScale: number,
    noiseIntensity: number,
    noiseDensity: number,
}

interface ICellDetail {
    name: string;
    draw: (ctx: CanvasRenderingContext2D, random: Random) => void;
}

interface IDetail {
    detail?: string,
    detailColor?: string,
    detailNumberPerCell?: number,
    detailSize?: number,
}