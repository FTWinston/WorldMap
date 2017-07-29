class GenerationSettings {
    heightGuide: GenerationGuide;
    temperatureGuide: GenerationGuide;
    precipitationGuide: GenerationGuide;

    fixedHeight: number;
    heightScaleFixed: number;
    heightScaleGuide: number;
    heightScaleLowFreq: number;
    heightScaleHighFreq: number;
    
    fixedTemperature: number;
    temperatureScaleFixed: number;
    temperatureScaleGuide: number;
    temperatureScaleLowFreq: number;
    temperatureScaleHighFreq: number;
    
    fixedPrecipitation: number;
    precipitationScaleFixed: number;
    precipitationScaleGuide: number;
    precipitationScaleLowFreq: number;
    precipitationScaleHighFreq: number;

    constructor() {
        this.heightGuide = Guides.scalarGuides[Random.randomIntRange(0, Guides.scalarGuides.length)],
        this.temperatureGuide = Guides.scalarGuides[Random.randomIntRange(0, Guides.scalarGuides.length)],
        this.precipitationGuide = Guides.scalarGuides[Random.randomIntRange(0, Guides.scalarGuides.length)],

        this.fixedHeight = 0.5;
        this.heightScaleFixed = 0;
        this.heightScaleGuide = 0.3;
        this.heightScaleLowFreq = 0.55;
        this.heightScaleHighFreq = 0.15;
          
        this.fixedTemperature = 0.5;
        this.temperatureScaleFixed = 0;
        this.temperatureScaleGuide = 0.55;
        this.temperatureScaleLowFreq = 0.1;
        this.temperatureScaleHighFreq = 0.35;

        this.fixedPrecipitation = 0.5;
        this.precipitationScaleFixed = 0;
        this.precipitationScaleGuide = 0.4;
        this.precipitationScaleLowFreq = 0.5;
        this.precipitationScaleHighFreq = 0.1;
    }

    randomize() {
        this.heightGuide = Guides.scalarGuides[Random.randomIntRange(0, Guides.scalarGuides.length)],
        this.temperatureGuide = Guides.scalarGuides[Random.randomIntRange(0, Guides.scalarGuides.length)],
        this.precipitationGuide = Guides.scalarGuides[Random.randomIntRange(0, Guides.scalarGuides.length)],

        this.fixedHeight = Math.random();
        this.heightScaleFixed = Math.random() * 0.5;
        this.heightScaleGuide = Math.random() * 0.5;
        this.heightScaleLowFreq = Math.random() * 0.5 + 0.2;
        this.heightScaleHighFreq = Math.random() * 0.25;
          
        this.fixedTemperature = Math.random();
        this.temperatureScaleFixed = Math.random() * 0.5;
        this.temperatureScaleGuide = Math.random() * 0.5;
        this.temperatureScaleLowFreq = Math.random() * 0.5 + 0.2;
        this.temperatureScaleHighFreq = Math.random() * 0.25;

        this.fixedPrecipitation = Math.random();
        this.precipitationScaleFixed = Math.random() * 0.5;
        this.precipitationScaleGuide = Math.random() * 0.5;
        this.precipitationScaleLowFreq = Math.random() * 0.5 + 0.2;
        this.precipitationScaleHighFreq = Math.random() * 0.25;
    }
}