class LocationGenerator {
    public static generate(map: MapData, settings: GenerationSettings) {
        // create locations, which currently all prefer the lowest nearby point
        for (let locationType of map.locationTypes) {
            const onePerNCells = 50; // TODO: to be specified per location type. Make this only consider LAND cells?
            let numLocations = Math.round(map.width * map.height / onePerNCells);
            for (let iLoc = 0; iLoc<numLocations; iLoc++) {
                let loc = LocationGenerator.generateLocation(map, locationType);

                if (loc === undefined)
                    continue;

                map.locations.push(loc);
            }
        }
    }

    private static generateLocation(map: MapData, locationType: LocationType) {
        let cell = map.getRandomCell(true);
        if (cell === undefined)
            return undefined;
        
        cell = MapGenerator.pickLowestCell(map.getCellsInRange(cell, 2), true);
        for (let other of map.locations) {
            let minDist = Math.min(locationType.minDistanceToOther, other.type.minDistanceToOther);
            if (cell.distanceTo(other.cell) < minDist)
                return undefined;
        }

        let location = new MapLocation(cell, locationType.name, locationType);
        return location;
    }
}