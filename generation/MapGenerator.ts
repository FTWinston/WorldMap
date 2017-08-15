class MapGenerator {
    public static generate(map: MapData, settings: GenerationSettings) {
        // clear down all lines, locations and cell data
        map.lines = [];
        map.locations = [];

        for (let cell of map.cells) {
            if (cell === null)
                continue;
            
            cell.height = -0.1;
            cell.temperature = 0.5;
            cell.precipitation = 1;
            cell.cellType = CellType.empty;
        }
        
        // firstly, decide which cells are land and which are sea
        CoastlineGenerator.generate(map, settings);

        // generate height, temperate and precipitation values for all land cells
        TerrainGenerator.generate(map, settings);

        // create river lines and allow them to erode the map.
        RiverGenerator.generate(map, settings);

        // create locations, which currently all prefer the lowest nearby point
        LocationGenerator.generate(map, settings);

        // create roads, only once locations are in place
        RoadGenerator.generate(map, settings);
        
        // TODO: calculate wind, use that to modify precipitation and temperature

        // finally, allocate types to cells based on their generation properties
        for (let cell of map.cells) {
            if (cell === null)
                continue;

            MapGenerator.updateCellType(cell);
        }
    }

    private static cellTypeLookup: kdTree<CellType, MapCell>;

    static updateCellType(cell: MapCell) {
        let type = cell.height < 0
            ? CellType.empty
            : MapGenerator.cellTypeLookup.nearest(cell);

        if (type !== undefined)
            cell.cellType = type;
    }

    private static cellTypeDistanceMetric(a: MapCell, b: CellType) {
        let heightDif = (a.height - b.height) * 5;
        let tempDif = a.temperature - b.temperature;
        let precDif = a.precipitation - b.precipitation;

        return Math.sqrt(
            heightDif * heightDif +
            tempDif * tempDif +
            precDif * precDif
        );
    }

    static constructCellTypeLookup(cellTypes: CellType[]) {
        MapGenerator.cellTypeLookup = new kdTree<CellType, MapCell>(cellTypes.slice(1), MapGenerator.cellTypeDistanceMetric, ['height', 'temperature', 'precipitation']);
    }

    static removeSuperfluousLineCells(cells: MapCell[], linesToKeepJunctionsWith: MapLine[] = []) {
        if (cells.length <= 3)
            return;

        let first = cells[0];
        let last = cells[cells.length - 1];

        let canRemove = false;
        for (let i=1; i<cells.length - 1; i++) {
            canRemove = !canRemove;
            if (!canRemove)
                continue; // keep alternate cells
            
            // don't remove a key cell if another line ends there
            let cell = cells[i];
            for (let line of linesToKeepJunctionsWith)
                if (line.keyCells === cells)
                    continue;
                else if (cell == line.getStartCell() || cell == line.getEndCell()) {
                    canRemove = false;
                    break;
                }

            if (canRemove) {
                cells.splice(i, 1);
                i--;
            }
        }
    }

    static renderAndErodeLine(map: MapData, line: MapLine) {
        line.updateRenderPoints();

        // erode the terrain this line passes through, if needed
        if (line.type.erosionAmount != 0) {
            let erosionAmount = line.type.erosionAmount;
            let cellsToErode = line.getErosionAffectedCells(map);
            for (let cell of cellsToErode)
                cell.height -= erosionAmount;
        }

        return line;
    }

    static pickHighestCell(cells: MapCell[]) {
        let returnCell = cells[0];

        for (let i=1;i<cells.length; i++) {
            let testCell = cells[i];
            if (testCell.height > returnCell.height)
                returnCell = testCell;
        }

        return returnCell;
    }

    static pickLowestCell(cells: MapCell[], mustBeAboveSeaLevel: boolean = false) {
        let returnCell = cells[0];
        let bestHeight = Number.MAX_VALUE;

        for (let i=0;i<cells.length; i++) {
            let testCell = cells[i];
            if (testCell.height < bestHeight && (!mustBeAboveSeaLevel || testCell.height > 0)) {
                returnCell = testCell;
                bestHeight = testCell.height;
            }
        }

        return returnCell;
    }
}