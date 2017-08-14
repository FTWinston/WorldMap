class CoastlineGenerator {
    public static generate(map: MapData, settings: GenerationSettings) {
        let coastGuide = settings.coastGuide;
        let lowFreqNoiseX = new SimplexNoise(), highFreqNoiseX = new SimplexNoise();
        let lowFreqNoiseY = new SimplexNoise(), highFreqNoiseY = new SimplexNoise();
        let lowFreqNoiseScale = settings.coastNoiseLowFreq, highFreqNoiseScale = settings.coastNoiseHighFreq;

        let seaLevelCutoff = 0.5;

        let maxX = map.width * MapData.packedWidthRatio;
        let maxY = map.height * MapData.packedHeightRatio;

        // allocate height to each cell, specify if it is land or sea
        for (let cell of map.cells) {
            if (cell === null)
                continue;

            let x = cell.xPos, y = cell.yPos;

            if (coastGuide.generation(x, y, maxX, maxY) < seaLevelCutoff) {
                cell.height = -0.1;
                continue;
            }
/*
            let tmpX = x;
            x += lowFreqNoiseX.noise(x, y) * lowFreqNoiseScale + highFreqNoiseX.noise(x, y) * highFreqNoiseScale;
            y += lowFreqNoiseY.noise(tmpX, y) * lowFreqNoiseScale + highFreqNoiseY.noise(tmpX, y) * highFreqNoiseScale;
*/        
            let otherCell = map.cells[map.getCellIndexAtPoint(x, y)];
            if (otherCell === null)
                continue;

            console.log('started at ' + cell.col + ', ' + cell.row);
            console.log('ended up at ' + otherCell.col + ', ' + otherCell.row);
            otherCell.height = 0.1;
        }
    }
}