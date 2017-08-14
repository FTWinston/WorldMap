interface GenerationGuide {
    name: string;
    isVector: boolean;
    generation: (x: number, y: number, width: number, height: number) => number;
}

class Guides {
    static scalarGuides: GenerationGuide[] = [
        {
            name: 'Raised center',
            isVector: false,
            generation: (x: number, y: number, width: number, height: number) => { 
                let halfWidth = width/2;
                let xFactor = (x - halfWidth) / halfWidth;
                
                let halfHeight = height/2;
                let yFactor = (y - halfHeight) / halfHeight;

                return 1 - Math.sqrt(xFactor * xFactor + yFactor * yFactor);
            },
        },
        {
            name: 'Lowered center',
            isVector: false,
            generation: (x: number, y: number, width: number, height: number) => { 
                let halfWidth = width/2;
                let xFactor = (x - halfWidth) / halfWidth;
                
                let halfHeight = height/2;
                let yFactor = (y - halfHeight) / halfHeight;

                return Math.sqrt(xFactor * xFactor + yFactor * yFactor);
            },
        },
        {
            name: 'Gradient, increasing west to east',
            isVector: false,
            generation: (x: number, y: number, width: number, height: number) => x / width,
        },
        {
            name: 'Gradient, increasing east to west',
            isVector: false,
            generation: (x: number, y: number, width: number, height: number) => (width - x) / width,
        },
        {
            name: 'Gradient, increasing north to south',
            isVector: false,
            generation: (x: number, y: number, width: number, height: number) => y / height,
        },
        {
            name: 'Gradient, increasing south to north',
            isVector: false,
            generation: (x: number, y: number, width: number, height: number) => (height - y) / height,
        },
        {
            name: 'Gradient, increasing northwest to southeast',
            isVector: false,
            generation: (x: number, y: number, width: number, height: number) => y / height * 0.5 + x / width * 0.5,
        },
        {
            name: 'Gradient, increasing northeast to southwest',
            isVector: false,
            generation: (x: number, y: number, width: number, height: number) => y / height * 0.5 + (width - x) / width * 0.5,
        },
        {
            name: 'Gradient, increasing southwest to northeast',
            isVector: false,
            generation: (x: number, y: number, width: number, height: number) => (height - y) / height * 0.5 + x / width * 0.5,
        },
        {
            name: 'Gradient, increasing southeast to northwest',
            isVector: false,
            generation: (x: number, y: number, width: number, height: number) => (height - y) / height * 0.5 + (width - x) / width * 0.5,
        },
        {
            name: 'North-south ridge',
            isVector: false,
            generation: (x: number, y: number, width: number, height: number) => {
                let hw = width/2;
                if (x <= hw)
                    return x / hw;
                else
                    return (width - x) / hw;
            },
        },
        {
            name: 'North-south ravine',
            isVector: false,
            generation: (x: number, y: number, width: number, height: number) => {
                let hw = width/2;
                if (x <= hw)
                    return 1 - x / hw;
                else
                    return 1 - (width - x) / hw;
            },
        },
        {
            name: 'East-west ridge',
            isVector: false,
            generation: (x: number, y: number, width: number, height: number) => {
                let hh = height/2;
                if (y <= hh)
                    return y / hh;
                else
                    return (height - y) / hh;
            },
        },
        {
            name: 'East-west ravine',
            isVector: false,
            generation: (x: number, y: number, width: number, height: number) => {
                let hh = height/2;
                if (y <= hh)
                    return 1 - y / hh;
                else
                    return 1 - (height - y) / hh;
            },
        }
    ];

    static vectorGuides: GenerationGuide[] = [

    ];
}