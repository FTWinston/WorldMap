class CoastlineGenerator {
    public static generate(map: MapData, settings: GenerationSettings) {
        let coastGuide = settings.coastGuide;
        let lowFreqNoiseX = new SimplexNoise(), highFreqNoiseX = new SimplexNoise();
        let lowFreqNoiseY = new SimplexNoise(), highFreqNoiseY = new SimplexNoise();
        let lowFreqNoiseScale = settings.coastNoiseLowFreq, highFreqNoiseScale = settings.coastNoiseHighFreq;
        let seaLevelCutoff = settings.seaLevel;

        let maxX = map.width * MapData.packedWidthRatio;
        let maxY = map.height * MapData.packedHeightRatio;

        // allocate height to each cell, specify if it is land or sea
        for (let cell of map.cells) {
            if (cell === null)
                continue;

            let x = cell.xPos, y = cell.yPos;

            if (coastGuide.generation(x, y, maxX, maxY) < seaLevelCutoff)
                continue;

            let tmpX = x;
            x += (lowFreqNoiseX.noise(x / 10, y / 10) - 0.5) * lowFreqNoiseScale * 2 + (highFreqNoiseX.noise(x, y) - 0.5) * highFreqNoiseScale * 2;
            y += (lowFreqNoiseY.noise(tmpX / 10, y / 10) - 0.5) * lowFreqNoiseScale * 2 + (highFreqNoiseY.noise(tmpX, y) - 0.5) * highFreqNoiseScale * 2;
            cell.height = 0.1;
        }
    }
}