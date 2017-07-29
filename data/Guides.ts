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
                let hw = width/2;
                let xComponent = x <= hw
                    ? x / hw
                    : (width - x) / hw;

                let hh = height/2;
                let yComponent = y <= hh
                    ? y / hh
                    : (height - y) / hh;

                return xComponent * yComponent;
            },
        },
        {
            name: 'Linear gradient, increasing west to east',
            isVector: false,
            generation: (x: number, y: number, width: number, height: number) => x / width,
        },
        {
            name: 'Linear gradient, increasing east to west',
            isVector: false,
            generation: (x: number, y: number, width: number, height: number) => (width - x) / width,
        },
        {
            name: 'Linear gradient, increasing north to south',
            isVector: false,
            generation: (x: number, y: number, width: number, height: number) => y / height,
        },
        {
            name: 'Linear gradient, increasing south to north',
            isVector: false,
            generation: (x: number, y: number, width: number, height: number) => (height - y) / height,
        },
        {
            name: 'Linear gradient, increasing northwest to southeast',
            isVector: false,
            generation: (x: number, y: number, width: number, height: number) => y / height * 0.5 + x / width * 0.5,
        },
        {
            name: 'Linear gradient, increasing northeast to southwest',
            isVector: false,
            generation: (x: number, y: number, width: number, height: number) => y / height * 0.5 + (width - x) / width * 0.5,
        },
        {
            name: 'Linear gradient, increasing southwest to northeast',
            isVector: false,
            generation: (x: number, y: number, width: number, height: number) => (height - y) / height * 0.5 + x / width * 0.5,
        },
        {
            name: 'Linear gradient, increasing southeast to northwest',
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