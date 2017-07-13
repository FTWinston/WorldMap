interface IDrawable {
    name: string;
    draw: (ctx: CanvasRenderingContext2D) => void;
}