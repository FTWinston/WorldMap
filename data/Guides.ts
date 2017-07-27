interface ScalarGuide {
    name: string;
    generation: (x: number, y: number, width: number, height: number) => number;
}

interface VectorGuide {
    name: string;
    generation: (x: number, y: number, width: number, height: number) => [number, number];
}

class Guides {
    static scalarGuides: ScalarGuide[] = [
        {
            name: 'Linear gradient, increasing west to east',
            generation: (x: number, y: number, width: number, height: number) => x / width,
        },
        {
            name: 'Linear gradient, increasing east to west',
            generation: (x: number, y: number, width: number, height: number) => (width - x) / width,
        },
        {
            name: 'Linear gradient, increasing north to south',
            generation: (x: number, y: number, width: number, height: number) => y / height,
        },
        {
            name: 'Linear gradient, increasing south to north',
            generation: (x: number, y: number, width: number, height: number) => (height - y) / height,
        }
    ];

    static vectorGuides: VectorGuide[] = [

    ];
}