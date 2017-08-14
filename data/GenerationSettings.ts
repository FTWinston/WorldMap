class GenerationSettings {
    coastGuide: GenerationGuide;
    coastNoiseLowFreq: number;
    coastNoiseHighFreq: number;

    heightGuide: GenerationGuide;
    minHeight: number;
    maxHeight: number;
    heightScaleGuide: number;
    heightScaleLowFreq: number;
    heightScaleHighFreq: number;
    
    temperatureGuide: GenerationGuide;
    minTemperature: number;
    maxTemperature: number;
    temperatureScaleGuide: number;
    temperatureScaleLowFreq: number;
    temperatureScaleHighFreq: number;
    
    precipitationGuide: GenerationGuide;
    minPrecipitation: number;
    maxPrecipitation: number;
    precipitationScaleGuide: number;
    precipitationScaleLowFreq: number;
    precipitationScaleHighFreq: number;

    constructor() {
        this.coastGuide = Guides.scalarGuides[0],
        this.coastNoiseLowFreq = 0.2;
        this.coastNoiseHighFreq = 0.15;

        this.heightGuide = Guides.scalarGuides[10],
        this.minHeight = 0;
        this.maxHeight = 1;
        this.heightScaleGuide = 1;
        this.heightScaleLowFreq = 0.40;
        this.heightScaleHighFreq = 0.15;
          
        this.temperatureGuide = Guides.scalarGuides[4],
        this.minTemperature = 0;
        this.maxTemperature = 1;
        this.temperatureScaleGuide = 0.55;
        this.temperatureScaleLowFreq = 0.1;
        this.temperatureScaleHighFreq = 0.35;

        this.precipitationGuide = Guides.scalarGuides[3],
        this.minPrecipitation = 0;
        this.maxPrecipitation = 1;
        this.precipitationScaleGuide = 0.4;
        this.precipitationScaleLowFreq = 0.5;
        this.precipitationScaleHighFreq = 0.1;
    }

    randomize() {
        if (Math.random() <= 0.6) // islands should be a likely outcome
            this.coastGuide = Guides.scalarGuides[0];
        else
            this.coastGuide = Guides.scalarGuides[Random.randomIntRange(0, Guides.scalarGuides.length)],
        this.coastNoiseLowFreq = Math.random();
        this.coastNoiseHighFreq = Math.random();

        this.heightGuide = Guides.scalarGuides[Random.randomIntRange(0, Guides.scalarGuides.length)],
        this.minHeight = Random.randomRange(0, 0.25);
        this.maxHeight = Random.randomRange(Math.max(this.minHeight + 0.2, 0.25), 1);
        this.heightScaleGuide = Math.random() * 0.5;
        this.heightScaleLowFreq = Math.random() * 0.5 + 0.2;
        this.heightScaleHighFreq = Math.random() * 0.25;

        this.temperatureGuide = Guides.scalarGuides[Random.randomIntRange(0, Guides.scalarGuides.length)],
        this.minTemperature = Random.randomRange(0, 0.4);
        this.maxTemperature = Random.randomRange(0.6, 1);
        this.temperatureScaleGuide = Math.random() * 0.5;
        this.temperatureScaleLowFreq = Math.random() * 0.5 + 0.2;
        this.temperatureScaleHighFreq = Math.random() * 0.25;

        this.precipitationGuide = Guides.scalarGuides[Random.randomIntRange(0, Guides.scalarGuides.length)],
        this.minPrecipitation = Random.randomRange(0, 0.4);
        this.maxPrecipitation = Random.randomRange(0.6, 1);
        this.precipitationScaleGuide = Math.random() * 0.5;
        this.precipitationScaleLowFreq = Math.random() * 0.5 + 0.2;
        this.precipitationScaleHighFreq = Math.random() * 0.25;
    }
}