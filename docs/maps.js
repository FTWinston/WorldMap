var MapData = (function () {
    function MapData(width, height, createCells) {
        if (createCells === void 0) { createCells = true; }
        this.underlyingWidth = width + Math.floor(height / 2) - 1;
        this.width = width;
        this.height = height;
        this.cells = new Array(this.underlyingWidth * this.height);
        this.cellTypes = [CellType.empty];
        this.name = '';
        this.description = '';
        this.locationTypes = [];
        this.locations = [];
        this.lineTypes = [];
        this.lines = [];
        if (createCells !== false) {
            for (var i = 0; i < this.cells.length; i++)
                this.cells[i] = this.shouldIndexHaveCell(i) ? new MapCell(this, CellType.empty) : null;
            CellType.createDefaults(this.cellTypes);
            LocationType.createDefaults(this.locationTypes);
            LineType.createDefaults(this.lineTypes);
            this.positionCells();
        }
    }
    MapData.prototype.positionCells = function () {
        this.minX = MapData.packedWidthRatio * (this.height / 2 - 1);
        for (var i = 0; i < this.cells.length; i++) {
            var cell = this.cells[i];
            if (cell == null)
                continue;
            cell.row = Math.floor(i / this.underlyingWidth);
            cell.col = i % this.underlyingWidth;
            cell.xPos = MapData.packedWidthRatio * (cell.col + cell.row / 2) - this.minX;
            cell.yPos = MapData.packedHeightRatio * cell.row;
        }
    };
    MapData.prototype.shouldIndexHaveCell = function (index) {
        var row = Math.floor(index / this.underlyingWidth);
        var col = index % this.underlyingWidth;
        if (2 * col + row < this.height - 2)
            return false; // chop left to get square edge
        if (row + 2 * col > 2 * this.underlyingWidth - 1)
            return false; // chop right to get square edge
        return true;
    };
    MapData.prototype.getCellIndex = function (row, col) {
        return col + row * this.underlyingWidth;
    };
    MapData.prototype.getRandomCell = function (aboveSeaLevel, attempts) {
        if (attempts === void 0) { attempts = 100; }
        do {
            var index = Random.randomIntRange(0, this.cells.length);
            var cell = this.cells[index];
            if (cell !== null) {
                if (!aboveSeaLevel || cell.height > 0)
                    return cell;
            }
        } while (--attempts > 0);
        return undefined;
    };
    MapData.prototype.getCellIndexAtPoint = function (mapX, mapY) {
        var fCol = ((mapX + this.minX) * MapData.packedWidthRatio - mapY) / 3;
        var fRow = mapY * 2 / 3;
        var fThirdCoord = -fCol - fRow;
        var rCol = Math.round(fCol);
        var rRow = Math.round(fRow);
        var rThird = Math.round(fThirdCoord);
        var colDiff = Math.abs(rCol - fCol);
        var rowDiff = Math.abs(rRow - fRow);
        var thirdDiff = Math.abs(rThird - fThirdCoord);
        if (colDiff > rowDiff && colDiff > thirdDiff)
            rCol = -rRow - rThird;
        else if (rowDiff > thirdDiff)
            rRow = -rCol - rThird;
        return this.getCellIndex(rRow, rCol);
    };
    MapData.prototype.getNeighbours = function (cell) {
        var neighbours = [];
        for (var _i = 0, _a = MapCell.orthogonalDirections; _i < _a.length; _i++) {
            var offset = _a[_i];
            var row = cell.row + offset.dRow;
            var col = cell.col + offset.dCol;
            if (row >= 0 && row < this.height && col >= 0 && col <= this.underlyingWidth) {
                var cell_1 = this.cells[this.getCellIndex(row, col)];
                if (cell_1 !== null)
                    neighbours.push(cell_1);
            }
        }
        return neighbours;
    };
    MapData.prototype.getCellsInRange = function (center, distance) {
        var results = [];
        var minDc = -distance, maxDc = +distance;
        for (var dc = minDc; dc <= maxDc; dc++) {
            var col = center.col + dc;
            if (col < 0 || col >= this.underlyingWidth)
                continue; // out of bounds
            var minRow = Math.max(0, center.row + Math.max(-distance, -dc - distance)), maxRow = Math.min(this.height - 1, center.row + Math.min(+distance, -dc + distance));
            for (var row = minRow; row <= maxRow; row++) {
                var index = this.getCellIndex(row, col);
                var cell = this.cells[index];
                if (cell !== null)
                    results.push(cell);
            }
        }
        return results;
    };
    MapData.prototype.changeSize = function (newWidth, newHeight, mode) {
        var deltaWidth = newWidth - this.width;
        var deltaHeight = newHeight - this.height;
        switch (mode) {
            case 0 /* TopLeft */:
                this.performWidthChange(deltaWidth, true, false);
                this.changeHeight(deltaHeight, true);
                break;
            case 1 /* TopMiddle */:
                this.performWidthChange(Math.floor(deltaWidth / 2), true, false);
                this.performWidthChange(Math.ceil(deltaWidth / 2), false, false);
                this.changeHeight(deltaHeight, true);
                break;
            case 2 /* TopRight */:
                this.performWidthChange(deltaWidth, false, false);
                this.changeHeight(deltaHeight, true);
                break;
            case 3 /* CenterLeft */:
                this.performWidthChange(deltaWidth, true, false);
                this.changeHeight(Math.floor(deltaHeight / 2), true);
                this.changeHeight(Math.ceil(deltaHeight / 2), false);
                break;
            case 4 /* Center */:
                this.performWidthChange(Math.floor(deltaWidth / 2), true, false);
                this.performWidthChange(Math.ceil(deltaWidth / 2), false, false);
                this.changeHeight(Math.floor(deltaHeight / 2), true);
                this.changeHeight(Math.ceil(deltaHeight / 2), false);
                break;
            case 5 /* CenterRight */:
                this.performWidthChange(deltaWidth, false, false);
                this.changeHeight(Math.floor(deltaHeight / 2), true);
                this.changeHeight(Math.ceil(deltaHeight / 2), false);
                break;
            case 6 /* BottomLeft */:
                this.performWidthChange(deltaWidth, true, false);
                this.changeHeight(deltaHeight, false);
                break;
            case 7 /* BottomMiddle */:
                this.performWidthChange(Math.floor(deltaWidth / 2), true, false);
                this.performWidthChange(Math.ceil(deltaWidth / 2), false, false);
                this.changeHeight(deltaHeight, false);
                break;
            case 8 /* BottomRight */:
                this.performWidthChange(deltaWidth, false, false);
                this.changeHeight(deltaHeight, false);
                break;
        }
        this.width += deltaWidth; // this is a "display only" property, and isn't affected by underlying calculations
        this.positionCells();
    };
    MapData.prototype.changeHeight = function (delta, topEdgeFixed) {
        var increment = delta > 0 ? 1 : -1;
        var increasing = delta > 0 ? 1 : 0;
        for (var i = 0; i != delta; i += increment) {
            if ((this.height + increasing) % 2 == 0)
                this.performWidthChange(increment, !topEdgeFixed, true);
            this.performHeightChange(increment, topEdgeFixed);
        }
    };
    MapData.prototype.performWidthChange = function (delta, leftEdgeFixed, forHeightChange) {
        var overallDelta = 0;
        if (delta > 0) {
            for (var row = 0; row < this.height; row++) {
                var rowInsertIndex = void 0; // this is complicated on account of the "chopping" we did to get square edges
                if (leftEdgeFixed)
                    rowInsertIndex = this.underlyingWidth - Math.floor(row / 2);
                else
                    rowInsertIndex = Math.floor((this.height - row - 1) / 2);
                var rowStart = row * this.underlyingWidth;
                var insertPos = rowStart + rowInsertIndex + overallDelta;
                for (var i = 0; i < delta; i++)
                    this.cells.splice(insertPos, 0, forHeightChange ? null : new MapCell(this, CellType.empty));
                overallDelta += delta;
            }
        }
        else if (delta < 0) {
            for (var row = 0; row < this.height; row++) {
                var rowChopPos = void 0;
                if (forHeightChange) {
                    if (leftEdgeFixed)
                        rowChopPos = this.underlyingWidth + delta;
                    else
                        rowChopPos = 0;
                }
                else if (leftEdgeFixed)
                    rowChopPos = this.underlyingWidth - Math.floor(row / 2) + delta;
                else
                    rowChopPos = Math.floor((this.height - row - 1) / 2);
                var rowStart = row * this.underlyingWidth;
                var chopPos = rowStart + rowChopPos + overallDelta;
                this.cells.splice(chopPos, -delta);
                overallDelta += delta;
            }
        }
        this.underlyingWidth += delta;
    };
    MapData.prototype.performHeightChange = function (delta, topEdgeFixed) {
        if (delta > 0) {
            var diff = delta * this.underlyingWidth;
            for (var i = 0; i < diff; i++) {
                if (this.cells.length + 1 > this.underlyingWidth * this.height)
                    this.height++;
                var globalIndex = topEdgeFixed ? this.cells.length : diff - i - 1;
                this.cells.splice(topEdgeFixed ? this.cells.length : 0, 0, this.shouldIndexHaveCell(globalIndex) ? new MapCell(this, CellType.empty) : null);
            }
        }
        else if (delta < 0) {
            var diff = -delta * this.underlyingWidth;
            this.height += delta;
            this.cells.splice(topEdgeFixed ? this.cells.length - diff : 0, diff);
        }
    };
    MapData.prototype.replaceCellType = function (find, replace) {
        for (var _i = 0, _a = this.cells; _i < _a.length; _i++) {
            var cell = _a[_i];
            if (cell !== null && cell.cellType === find)
                cell.cellType = replace;
        }
    };
    MapData.prototype.replaceLocationType = function (find, replace) {
        for (var _i = 0, _a = this.locations; _i < _a.length; _i++) {
            var loc = _a[_i];
            if (loc !== null && loc.type === find)
                loc.type = replace;
        }
    };
    MapData.prototype.replaceLineType = function (find, replace) {
        for (var _i = 0, _a = this.lines; _i < _a.length; _i++) {
            var loc = _a[_i];
            if (loc !== null && loc.type === find)
                loc.type = replace;
        }
    };
    MapData.prototype.saveToJSON = function () {
        for (var _i = 0, _a = this.cells; _i < _a.length; _i++) {
            var cell = _a[_i];
            if (cell !== null)
                cell.typeID = this.cellTypes.indexOf(cell.cellType);
        }
        for (var _b = 0, _c = this.locations; _b < _c.length; _b++) {
            var location_1 = _c[_b];
            location_1.typeID = this.locationTypes.indexOf(location_1.type);
            location_1.cellID = this.cells.indexOf(location_1.cell);
        }
        var that = this;
        for (var _d = 0, _e = this.lines; _d < _e.length; _d++) {
            var line = _e[_d];
            line.typeID = this.lineTypes.indexOf(line.type);
            line.cellIDs = line.keyCells.map(function (cell, id) {
                return that.cells.indexOf(cell);
            });
        }
        var map = this;
        var json = JSON.stringify(this, function (key, value) {
            if (key == 'row' || key == 'col' || key == 'xPos' || key == 'yPos'
                || key == 'map' || key == 'cellType' || key == 'underlyingWidth' || key == 'cell'
                || key == 'keyCells' || key == 'type' || key == 'renderPoints' || key == 'isLoop'
                || key == 'textureCanvas' || key == 'texturePattern')
                return undefined;
            return value;
        });
        return json;
    };
    MapData.loadFromJSON = function (json) {
        var data = JSON.parse(json);
        var map = new MapData(data.width, data.height, false);
        map.name = data.name;
        map.description = data.description;
        if (data.cellTypes !== undefined)
            map.cellTypes = data.cellTypes.map(function (type) {
                var genHeight = type.genHeight === undefined ? 0.5 : type.genHeight;
                var genTemperature = type.genTemperature === undefined ? 0.5 : type.genTemperature;
                var genPrecipitation = type.genPrecipitation === undefined ? 0.5 : type.genPrecipitation;
                var noiseScale = type.noiseScale === undefined ? 1 : type.noiseScale;
                var noiseIntensity = type.noiseIntensity === undefined ? 0 : type.noiseIntensity;
                var noiseDensity = type.noiseDensity === undefined ? 0 : type.noiseDensity;
                return new CellType(type.name, type.color, genHeight, genTemperature, genPrecipitation, noiseScale, noiseIntensity, noiseDensity, type.detail, type.detailColor, type.detailNumberPerCell, type.detailSize);
            });
        if (data.cells !== undefined)
            map.cells = data.cells.map(function (cell) {
                if (cell == null)
                    return null;
                var cellType = map.cellTypes[cell.typeID == -1 ? 0 : cell.typeID];
                return new MapCell(map, cellType);
            });
        if (data.locationTypes !== undefined)
            map.locationTypes = data.locationTypes.map(function (type) {
                return new LocationType(type.name, type.textSize, type.textColor, type.icon, type.minDistanceToOther, type.minDrawCellRadius);
            });
        if (data.locations !== undefined)
            for (var _i = 0, _a = data.locations; _i < _a.length; _i++) {
                var location_2 = _a[_i];
                var type = map.locationTypes[location_2.typeID == -1 ? 0 : location_2.typeID];
                var cell = map.cells[location_2.cellID];
                if (cell !== null)
                    map.locations.push(new MapLocation(cell, location_2.name, type));
            }
        if (data.lineTypes !== undefined)
            map.lineTypes = data.lineTypes.map(function (type) {
                return new LineType(type.name, type.color, type.width, type.startWidth, type.endWidth, type.curviture, type.erosionAmount, type.adjacentErosionDistance, type.canErodeToSeaLevel, type.positionMode);
            });
        map.positionCells();
        if (data.lines !== undefined)
            for (var _b = 0, _c = data.lines; _b < _c.length; _b++) {
                var line = _c[_b];
                var type = map.lineTypes[line.typeID === -1 ? 0 : line.typeID];
                var mapLine = new MapLine(type);
                for (var _d = 0, _e = line.cellIDs; _d < _e.length; _d++) {
                    var cellID = _e[_d];
                    var cell = map.cells[cellID];
                    if (cell !== null)
                        mapLine.keyCells.push(cell);
                }
                mapLine.updateRenderPoints();
                map.lines.push(mapLine);
            }
        return map;
    };
    return MapData;
}());
MapData.packedWidthRatio = 1.7320508075688772; // Math.sqrt(3);
MapData.packedHeightRatio = 1.5;
var CellType = (function () {
    function CellType(name, color, height, temperature, precipitation, noiseScale, noiseIntensity, noiseDensity, detail, detailColor, detailNumberPerCell, detailSize) {
        this.name = name;
        this.color = color;
        this.height = height;
        this.temperature = temperature;
        this.precipitation = precipitation;
        this.noiseScale = noiseScale;
        this.noiseIntensity = noiseIntensity;
        this.noiseDensity = noiseDensity;
        this.detail = detail;
        this.detailColor = detailColor;
        this.detailNumberPerCell = detailNumberPerCell;
        this.detailSize = detailSize;
        this.updateTexture();
    }
    CellType.prototype.updateTexture = function () {
        if (this.noiseIntensity <= 0) {
            this.textureCanvas = undefined;
            this.texturePattern = undefined;
            return;
        }
        this.textureCanvas = document.createElement('canvas');
        var textureCtx = this.textureCanvas.getContext('2d');
        var textureSize = this.textureCanvas.width = this.textureCanvas.height = 100;
        var sizeSq = textureSize * textureSize;
        var image = textureCtx.createImageData(textureSize, textureSize);
        var imageData = image.data;
        var writePos = 0, fillChance = 0.25, maxAlpha = 32;
        for (var i = 0; i < sizeSq; i++) {
            if (Math.random() > this.noiseDensity) {
                writePos += 4;
                continue;
            }
            var rgb = Math.floor(Math.random() * 256);
            var a = Math.floor(Math.random() * this.noiseIntensity * 256);
            imageData[writePos++] = rgb;
            imageData[writePos++] = rgb;
            imageData[writePos++] = rgb;
            imageData[writePos++] = a;
        }
        textureCtx.putImageData(image, 0, 0);
        // Note: pattern isn't being created in the destination context. Does that work in all browsers?
        this.texturePattern = textureCtx.createPattern(this.textureCanvas, 'repeat');
    };
    CellType.createDefaults = function (types) {
        types.push(new CellType('Grass', '#a1e94d', 0.3, 0.55, 0.35, 2, 0.1, 0.8), new CellType('Hills', '#7bac46', 0.6, 0.55, 0.35, 10, 0.3, 0.2, 'Hill', '#607860', 1, 0.75), new CellType('Forest', '#189b11', 0.3, 0.3, 0.5, 8, 0.4, 0.3, 'Tree (coniferous)', '#305b09', 4, 0.35), new CellType('Forest Hills', '#189b11', 0.6, 0.3, 0.5, 8, 0.4, 0.3, 'Hill', '#305b09', 1, 0.75), new CellType('Desert', '#ebd178', 0.3, 0.8, 0, 1, 0.08, 0.7, 'Wave (small)', '#e4c045', 3, 0.5), new CellType('Desert Hills', '#ebd178', 0.6, 0.8, 0, 1, 0.08, 0.7, 'Hill', '#867A23', 1, 0.75), new CellType('Mountain', '#7c7c4b', 0.85, 0.25, 0.4, 10, 0.2, 0.3, 'Mountain', '#565B42', 1, 0.8));
    };
    return CellType;
}());
CellType.empty = new CellType('Water', '#179ce6', -1, 0.5, 1.0, 5, 0.1, 0.4, 'Wave (large)', '#9fe8ff', 1, 0.5);
var MapCell = (function () {
    function MapCell(map, cellType) {
        this.map = map;
        this.cellType = cellType;
        this.height = cellType.height;
        this.temperature = cellType.temperature;
        this.precipitation = cellType.precipitation;
    }
    MapCell.prototype.draw = function (ctx, radius, randomSeed, outlineColor, fillContent) {
        ctx.beginPath();
        var angle, x, y;
        for (var point = 0; point < 6; point++) {
            angle = 2 * Math.PI / 6 * (point + 0.5);
            x = radius * Math.cos(angle);
            y = radius * Math.sin(angle);
            if (point === 0)
                ctx.moveTo(x, y);
            else
                ctx.lineTo(x, y);
        }
        if (outlineColor !== undefined) {
            ctx.strokeStyle = outlineColor;
            ctx.stroke();
        }
        if (fillContent) {
            var cellType = this.cellType;
            if (cellType == null)
                ctx.fillStyle = '#666';
            else
                ctx.fillStyle = this.cellType.color;
            ctx.fill();
            if (cellType.texturePattern !== undefined) {
                var scale = cellType.noiseScale;
                ctx.scale(scale, scale);
                ctx.fillStyle = cellType.texturePattern;
                ctx.fill();
                ctx.scale(1 / scale, 1 / scale);
            }
            if (cellType.detail !== undefined
                && cellType.detailColor !== undefined
                && cellType.detailNumberPerCell !== undefined
                && cellType.detailSize !== undefined) {
                this.drawPattern(ctx, randomSeed, radius);
            }
        }
    };
    MapCell.prototype.drawPattern = function (ctx, randomSeed, cellRadius) {
        var cellType = this.cellType;
        var random = new Random(randomSeed);
        var pattern = MapCell.details[cellType.detail];
        var numToDraw = cellType.detailNumberPerCell;
        var patternSize = cellType.detailSize;
        ctx.lineWidth = 0.1;
        ctx.strokeStyle = cellType.detailColor;
        // all patterns are drawn in the range -1 to 1, for x & y. Scale of 1 is exactly the width of a cell.
        var halfCellWidth = cellRadius * 0.855;
        var scale = halfCellWidth * patternSize;
        // offset so that pattern always fits within the cell radius, based on patternSize.
        var maxOffset = (halfCellWidth - halfCellWidth * patternSize) / scale;
        ctx.scale(scale, scale);
        for (var iPattern = 0; iPattern < numToDraw; iPattern++) {
            var dist = maxOffset * Math.sqrt(random.next());
            var angle = Math.PI * 2 * random.next();
            var xOffset = dist * Math.cos(angle);
            var yOffset = dist * Math.sin(angle);
            ctx.translate(xOffset, yOffset);
            pattern.draw(ctx, random);
            ctx.translate(-xOffset, -yOffset);
        }
        ctx.scale(1 / scale, 1 / scale);
    };
    MapCell.prototype.distanceTo = function (other) {
        return (Math.abs(this.col - other.col)
            + Math.abs(this.col + this.row - other.col - other.row)
            + Math.abs(this.row - other.row)) / 2;
    };
    MapCell.addDetail = function (pattern) {
        MapCell.details[pattern.name] = pattern;
    };
    return MapCell;
}());
MapCell.orthogonalDirections = [
    { dCol: +1, dRow: 0 }, { dCol: +1, dRow: -1 }, { dCol: 0, dRow: -1 },
    { dCol: -1, dRow: 0 }, { dCol: -1, dRow: +1 }, { dCol: 0, dRow: +1 },
];
MapCell.diagonalDirections = [
    { dCol: +2, dRow: -1 }, { dCol: +1, dRow: +1 }, { dCol: -1, dRow: +2 },
    { dCol: -2, dRow: +1 }, { dCol: -1, dRow: -1 }, { dCol: +1, dRow: -2 },
];
MapCell.details = {};
MapCell.addDetail({
    name: 'Circle',
    draw: function (ctx, random) {
        ctx.beginPath();
        ctx.arc(0, 0, 1, 0, Math.PI * 2);
        ctx.stroke();
    }
});
MapCell.addDetail({
    name: 'Marsh',
    draw: function (ctx, random) {
        ctx.beginPath();
        ctx.moveTo(-1, 0.2);
        ctx.lineTo(1, 0.2);
        if (random.next() > 0.2) {
            ctx.moveTo(0, 0.2);
            ctx.lineTo(0, -0.6);
            ctx.moveTo(0.3, 0.2);
            ctx.lineTo(0.4, -0.35);
            ctx.moveTo(-0.3, 0.2);
            ctx.lineTo(-0.4, -0.35);
            ctx.moveTo(-0.6, 0.2);
            ctx.lineTo(-0.75, -0.05);
            ctx.moveTo(0.6, 0.2);
            ctx.lineTo(0.75, -0.05);
        }
        ctx.stroke();
    }
});
MapCell.addDetail({
    name: 'Wave (large)',
    draw: function (ctx, random) {
        // vary the direction (down-up vs up-down) and intensity of each wave
        var yScale = (random.next() > 0.5 ? -1 : 1) * random.nextInRange(0.75, 1.2);
        ctx.beginPath();
        ctx.moveTo(-1, 0);
        ctx.bezierCurveTo(-0.1, -1 * yScale, 0.1, 1 * yScale, 1, 0);
        ctx.stroke();
    }
});
MapCell.addDetail({
    name: 'Wave (small)',
    draw: function (ctx, random) {
        // vary the direction (down-up vs up-down) and intensity of each wave
        var yScale = (random.next() > 0.5 ? -1 : 1) * random.nextInRange(0.3, 0.7);
        ctx.beginPath();
        ctx.moveTo(-1, 0);
        ctx.bezierCurveTo(-0.1, -1 * yScale, 0.1, 1 * yScale, 1, 0);
        ctx.stroke();
    }
});
MapCell.addDetail({
    name: 'Hill',
    draw: function (ctx, random) {
        // vary the height and shape of each hill
        var x1 = random.nextInRange(-0.6, 0.2);
        var x2 = random.nextInRange(-0.2, 0.6);
        var yScale = random.nextInRange(0.75, 1.2);
        var yMin = yScale / 2;
        ctx.beginPath();
        ctx.moveTo(-1, yMin);
        ctx.bezierCurveTo(x1, -yMin, x2, -yMin, 1, yMin);
        ctx.stroke();
    }
});
MapCell.addDetail({
    name: 'Mountain',
    draw: function (ctx, random) {
        // vary the height and shape of each mountain
        var x1 = random.nextInRange(0.1, 0.9);
        var x2 = random.nextInRange(-0.9, -0.1);
        var yScale = random.nextInRange(1.4, 2);
        var yMin = yScale / 3;
        var yMax = yMin - yScale;
        ctx.beginPath();
        ctx.moveTo(-0.9, yMin);
        ctx.bezierCurveTo(x1, yMax, x2, yMax, 0.9, yMin);
        ctx.stroke();
    }
});
MapCell.addDetail({
    name: 'Tree (coniferous)',
    draw: function (ctx, random) {
        ctx.beginPath();
        ctx.moveTo(0, -1);
        ctx.lineTo(0, 1);
        ctx.moveTo(-0.6, 0.5);
        ctx.lineTo(0, 0.4);
        ctx.lineTo(0.6, 0.5);
        ctx.moveTo(-0.5, 0.3);
        ctx.lineTo(0, 0.2);
        ctx.lineTo(0.5, 0.3);
        ctx.moveTo(-0.4, 0.1);
        ctx.lineTo(0, 0);
        ctx.lineTo(0.4, 0.1);
        ctx.moveTo(-0.3, -0.1);
        ctx.lineTo(0, -0.2);
        ctx.lineTo(0.3, -0.1);
        ctx.moveTo(-0.2, -0.3);
        ctx.lineTo(0, -0.4);
        ctx.lineTo(0.2, -0.3);
        ctx.moveTo(-0.1, -0.5);
        ctx.lineTo(0, -0.6);
        ctx.lineTo(0.1, -0.5);
        ctx.stroke();
    }
});
var LocationType = (function () {
    function LocationType(name, textSize, textColor, icon, minDistanceToOther, minDrawCellRadius) {
        this.name = name;
        this.textSize = textSize;
        this.textColor = textColor;
        this.icon = icon;
        this.minDistanceToOther = minDistanceToOther;
        this.minDrawCellRadius = minDrawCellRadius;
    }
    LocationType.createDefaults = function (types) {
        types.push(new LocationType('Town', 16, '#000000', 'smBlack', 3, 10));
        types.push(new LocationType('City', 24, '#000000', 'lgBlack', 5));
    };
    return LocationType;
}());
var MapLocation = (function () {
    function MapLocation(cell, name, type) {
        this.cell = cell;
        this.name = name;
        this.type = type;
    }
    MapLocation.prototype.draw = function (ctx, markerX, markerY) {
        ctx.save();
        ctx.translate(markerX, markerY);
        MapLocation.icons[this.type.icon].draw(ctx);
        var labelOffset = this.type.textSize * 1.5;
        ctx.translate(0, -labelOffset);
        ctx.fillStyle = this.type.textColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = this.type.textSize + 'pt serif';
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 3;
        ctx.lineWidth = 2;
        ctx.fillStyle = '#000000';
        ctx.fillText(this.name, 0, 0);
        ctx.restore();
    };
    MapLocation.getByCell = function (cell, allLocations) {
        for (var _i = 0, allLocations_1 = allLocations; _i < allLocations_1.length; _i++) {
            var location_3 = allLocations_1[_i];
            if (location_3.cell == cell)
                return location_3;
        }
        return undefined;
    };
    MapLocation.setDarkColors = function (ctx) {
        ctx.fillStyle = '#000000';
        ctx.strokeStyle = '#ffffff';
    };
    MapLocation.setLightColors = function (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#000000';
    };
    MapLocation.drawDot = function (ctx, radius) {
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fill();
    };
    return MapLocation;
}());
MapLocation.icons = {};
MapLocation.icons['smBlack'] = {
    name: 'Small black dot',
    draw: function (ctx) { MapLocation.setDarkColors(ctx); MapLocation.drawDot(ctx, 4); }
};
MapLocation.icons['mdBlack'] = {
    name: 'Medium black dot',
    draw: function (ctx) { MapLocation.setDarkColors(ctx); MapLocation.drawDot(ctx, 7); }
};
MapLocation.icons['lgBlack'] = {
    name: 'Large black dot',
    draw: function (ctx) { MapLocation.setDarkColors(ctx); MapLocation.drawDot(ctx, 10); }
};
MapLocation.icons['smWhite'] = {
    name: 'Small white dot',
    draw: function (ctx) { MapLocation.setLightColors(ctx); MapLocation.drawDot(ctx, 4); }
};
MapLocation.icons['mdWhite'] = {
    name: 'Medium white dot',
    draw: function (ctx) { MapLocation.setLightColors(ctx); MapLocation.drawDot(ctx, 7); }
};
MapLocation.icons['lgWhite'] = {
    name: 'Large white dot',
    draw: function (ctx) { MapLocation.setLightColors(ctx); MapLocation.drawDot(ctx, 10); }
};
var LineType = (function () {
    function LineType(name, color, width, startWidth, endWidth, curviture, erosionAmount, adjacentErosionDistance, canErodeBelowSeaLevel, positionMode) {
        this.name = name;
        this.color = color;
        this.width = width;
        this.startWidth = startWidth;
        this.endWidth = endWidth;
        this.curviture = curviture;
        this.erosionAmount = erosionAmount;
        this.adjacentErosionDistance = adjacentErosionDistance;
        this.canErodeBelowSeaLevel = canErodeBelowSeaLevel;
        this.positionMode = positionMode;
    }
    LineType.createDefaults = function (types) {
        types.push(new LineType('River', '#179ce6', 6, 0, 9, 1, 0.2, 0, false, 1 /* HighToLow */));
        types.push(new LineType('Road', '#bbad65', 4, 4, 4, 0.5, 0, 0, false, 2 /* BetweenLocations */));
    };
    return LineType;
}());
var MapLine = (function () {
    function MapLine(type) {
        this.type = type;
        this.keyCells = [];
        this.isLoop = false;
    }
    MapLine.prototype.getStartCell = function () {
        return this.keyCells[0];
    };
    MapLine.prototype.getEndCell = function () {
        return this.keyCells[this.keyCells.length - 1];
    };
    MapLine.prototype.draw = function (ctx, cellRadius, highlightKeyCells) {
        var type = this.type;
        if (highlightKeyCells) {
            ctx.strokeStyle = '#ff0000';
            ctx.lineWidth = 2;
            for (var _i = 0, _a = this.keyCells; _i < _a.length; _i++) {
                var cell = _a[_i];
                ctx.beginPath();
                ctx.arc(cell.xPos * cellRadius + cellRadius, cell.yPos * cellRadius + cellRadius, cellRadius * 0.65, 0, Math.PI * 2);
                ctx.stroke();
            }
        }
        if (this.keyCells.length == 1) {
            var cell = this.keyCells[0];
            var x_1 = cell.xPos * cellRadius + cellRadius;
            var y_1 = cell.yPos * cellRadius + cellRadius;
            ctx.fillStyle = type.color;
            ctx.beginPath();
            ctx.arc(x_1, y_1, type.width / 2, 0, Math.PI * 2);
            ctx.fill();
            return;
        }
        var points = this.renderPoints;
        ctx.strokeStyle = type.color;
        var mainWidthStart = this.isLoop || type.width == type.startWidth ? 2 : 16;
        var mainWidthEnd = this.isLoop || type.width == type.endWidth ? points.length - 1 : points.length - 16;
        var x = points[0] * cellRadius + cellRadius;
        var y = points[1] * cellRadius + cellRadius;
        ctx.beginPath();
        ctx.moveTo(x, y);
        // for the initial line segments, line width changes from startWidth to width
        for (var i = 2; i < mainWidthStart; i += 2) {
            ctx.lineCap = 'round';
            var fraction = i / mainWidthStart;
            ctx.lineWidth = type.startWidth * (1 - fraction) + type.width * fraction;
            x = points[i] * cellRadius + cellRadius;
            y = points[i + 1] * cellRadius + cellRadius;
            ctx.lineTo(x, y);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(x, y);
        }
        ctx.lineCap = this.isLoop ? 'butt' : 'round';
        // for the main segment, its always just width, so can draw them all in a single stroke
        ctx.lineWidth = type.width;
        for (var i = mainWidthStart; i < mainWidthEnd; i += 2) {
            x = points[i] * cellRadius + cellRadius;
            y = points[i + 1] * cellRadius + cellRadius;
            ctx.lineTo(x, y);
        }
        ctx.stroke();
        // for the end line segment, line width changes from width to endWidth
        for (var i = mainWidthEnd; i < points.length - 1; i += 2) {
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(x, y);
            var fraction = (points.length - i - 2) / (points.length - mainWidthEnd);
            ctx.lineWidth = type.endWidth * (1 - fraction) + type.width * fraction;
            x = points[i] * cellRadius + cellRadius;
            y = points[i + 1] * cellRadius + cellRadius;
            ctx.lineTo(x, y);
            ctx.stroke();
        }
        ctx.lineCap = 'butt';
    };
    MapLine.getByCell = function (cell, lines) {
        for (var _i = 0, lines_1 = lines; _i < lines_1.length; _i++) {
            var line = lines_1[_i];
            for (var _a = 0, _b = line.keyCells; _a < _b.length; _a++) {
                var testCell = _b[_a];
                if (testCell == cell)
                    return line;
            }
        }
        return undefined;
    };
    MapLine.prototype.updateRenderPoints = function () {
        this.renderPoints = [];
        if (this.keyCells.length < 2)
            return;
        var tension = this.type.curviture;
        var pts = [], x, y, t1x, t2x, t1y, t2y, c1, c2, c3, c4, fraction, step, iPt;
        var firstCell = this.keyCells[0];
        var lastCell = this.keyCells[this.keyCells.length - 1];
        // decide if it's a closed loop, which needs the ends of the array set up differently
        var lastCellIndex;
        if (firstCell == lastCell) {
            this.isLoop = true;
            lastCellIndex = this.keyCells.length - 2; // don't copy the last cell, its the same as the first
            lastCell = this.keyCells[lastCellIndex];
        }
        else {
            this.isLoop = false;
            lastCellIndex = this.keyCells.length - 1;
        }
        for (var iCell = 0; iCell <= lastCellIndex; iCell++) {
            var cell = this.keyCells[iCell];
            pts.push(cell.xPos, cell.yPos);
        }
        if (this.isLoop) {
            // copy last cell onto start, and first cells onto end
            var secondCell = this.keyCells[1];
            pts.push(firstCell.xPos, firstCell.yPos);
            pts.push(secondCell.xPos, secondCell.yPos);
            pts.unshift(lastCell.xPos, lastCell.yPos);
        }
        else {
            // copy first cell onto start, and last cell onto end
            pts.unshift(firstCell.xPos, firstCell.yPos);
            pts.push(lastCell.xPos, lastCell.yPos);
        }
        // loop through key points. Use each set of 4 points p0 p1 p2 p3 to draw segment p1-p2.
        for (iPt = 2; iPt < (pts.length - 4); iPt += 2) {
            for (step = 0; step <= MapLine.stepsPerSegment; step++) {
                // tension vectors
                t1x = (pts[iPt + 2] - pts[iPt - 2]) * tension;
                t2x = (pts[iPt + 4] - pts[iPt]) * tension;
                t1y = (pts[iPt + 3] - pts[iPt - 1]) * tension;
                t2y = (pts[iPt + 5] - pts[iPt + 1]) * tension;
                fraction = step / MapLine.stepsPerSegment;
                // cardinals
                c1 = 2 * Math.pow(fraction, 3) - 3 * Math.pow(fraction, 2) + 1;
                c2 = -(2 * Math.pow(fraction, 3)) + 3 * Math.pow(fraction, 2);
                c3 = Math.pow(fraction, 3) - 2 * Math.pow(fraction, 2) + fraction;
                c4 = Math.pow(fraction, 3) - Math.pow(fraction, 2);
                //x and y coordinates
                x = c1 * pts[iPt] + c2 * pts[iPt + 2] + c3 * t1x + c4 * t2x;
                y = c1 * pts[iPt + 1] + c2 * pts[iPt + 3] + c3 * t1y + c4 * t2y;
                this.renderPoints.push(x);
                this.renderPoints.push(y);
            }
        }
    };
    MapLine.dedupe = function (cells) {
        return cells.filter(function (cell, index, cells) {
            return index == cells.indexOf(cell);
        });
    };
    MapLine.prototype.getErosionAffectedCells = function (map) {
        var cells = [];
        for (var i = 1; i < this.renderPoints.length; i += 2) {
            var cellIndex = map.getCellIndexAtPoint(this.renderPoints[i - 1], this.renderPoints[i]);
            var cell = map.cells[cellIndex];
            if (cell !== null)
                cells.push(cell);
        }
        // deduplicate the affected cells
        cells = MapLine.dedupe(cells);
        if (this.type.adjacentErosionDistance > 0) {
            var passedThroughCells = cells;
            cells = []; // getCellsInRange always includes the center cell, so no need to ensure they're already present
            for (var _i = 0, passedThroughCells_1 = passedThroughCells; _i < passedThroughCells_1.length; _i++) {
                var cell = passedThroughCells_1[_i];
                var adjacent = map.getCellsInRange(cell, this.type.adjacentErosionDistance);
                cells = cells.concat(adjacent);
            }
            cells = MapLine.dedupe(cells);
        }
        return cells;
    };
    return MapLine;
}());
MapLine.stepsPerSegment = 16;
var Guides = (function () {
    function Guides() {
    }
    return Guides;
}());
Guides.scalarGuides = [
    {
        name: 'Raised center',
        isVector: false,
        generation: function (x, y, width, height) {
            var halfWidth = width / 2;
            var xFactor = (x - halfWidth) / halfWidth;
            var halfHeight = height / 2;
            var yFactor = (y - halfHeight) / halfHeight;
            return 1 - Math.sqrt(xFactor * xFactor + yFactor * yFactor);
        },
    },
    {
        name: 'Lowered center',
        isVector: false,
        generation: function (x, y, width, height) {
            var halfWidth = width / 2;
            var xFactor = (x - halfWidth) / halfWidth;
            var halfHeight = height / 2;
            var yFactor = (y - halfHeight) / halfHeight;
            return Math.sqrt(xFactor * xFactor + yFactor * yFactor);
        },
    },
    {
        name: 'Gradient, increasing west to east',
        isVector: false,
        generation: function (x, y, width, height) { return x / width; },
    },
    {
        name: 'Gradient, increasing east to west',
        isVector: false,
        generation: function (x, y, width, height) { return (width - x) / width; },
    },
    {
        name: 'Gradient, increasing north to south',
        isVector: false,
        generation: function (x, y, width, height) { return y / height; },
    },
    {
        name: 'Gradient, increasing south to north',
        isVector: false,
        generation: function (x, y, width, height) { return (height - y) / height; },
    },
    {
        name: 'Gradient, increasing northwest to southeast',
        isVector: false,
        generation: function (x, y, width, height) { return y / height * 0.5 + x / width * 0.5; },
    },
    {
        name: 'Gradient, increasing northeast to southwest',
        isVector: false,
        generation: function (x, y, width, height) { return y / height * 0.5 + (width - x) / width * 0.5; },
    },
    {
        name: 'Gradient, increasing southwest to northeast',
        isVector: false,
        generation: function (x, y, width, height) { return (height - y) / height * 0.5 + x / width * 0.5; },
    },
    {
        name: 'Gradient, increasing southeast to northwest',
        isVector: false,
        generation: function (x, y, width, height) { return (height - y) / height * 0.5 + (width - x) / width * 0.5; },
    },
    {
        name: 'North-south ridge',
        isVector: false,
        generation: function (x, y, width, height) {
            var hw = width / 2;
            if (x <= hw)
                return x / hw;
            else
                return (width - x) / hw;
        },
    },
    {
        name: 'North-south ravine',
        isVector: false,
        generation: function (x, y, width, height) {
            var hw = width / 2;
            if (x <= hw)
                return 1 - x / hw;
            else
                return 1 - (width - x) / hw;
        },
    },
    {
        name: 'East-west ridge',
        isVector: false,
        generation: function (x, y, width, height) {
            var hh = height / 2;
            if (y <= hh)
                return y / hh;
            else
                return (height - y) / hh;
        },
    },
    {
        name: 'East-west ravine',
        isVector: false,
        generation: function (x, y, width, height) {
            var hh = height / 2;
            if (y <= hh)
                return 1 - y / hh;
            else
                return 1 - (height - y) / hh;
        },
    }
];
Guides.vectorGuides = [];
var GenerationSettings = (function () {
    function GenerationSettings() {
        this.seaLevel = 0.35;
        this.coastGuide = Guides.scalarGuides[0],
            this.coastNoiseLowFreq = 2;
        this.coastNoiseHighFreq = 1;
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
    GenerationSettings.prototype.randomize = function () {
        this.seaLevel = Random.randomRange(0.05, 0.8);
        if (Math.random() <= 0.5)
            this.coastGuide = Guides.scalarGuides[0];
        else
            this.coastGuide = Guides.scalarGuides[Random.randomIntRange(0, Guides.scalarGuides.length)],
                this.coastNoiseLowFreq = Random.randomRange(0.5, 3);
        this.coastNoiseHighFreq = Random.randomRange(0, 2);
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
    };
    return GenerationSettings;
}());
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var ResizeAnchorInput = (function (_super) {
    __extends(ResizeAnchorInput, _super);
    function ResizeAnchorInput(props) {
        var _this = _super.call(this, props) || this;
        _this.arrows = [
            ['&#8598;', '&#8593;', '&#8599;'],
            ['&#8592;', '', '&#8594;'],
            ['&#8601;', '&#8595;', '&#8600;'],
        ];
        _this.state = {
            mode: 0 /* TopLeft */,
        };
        return _this;
    }
    ResizeAnchorInput.prototype.render = function () {
        var widthChange = this.props.newWidth - this.props.oldWidth;
        var heightChange = this.props.newHeight - this.props.oldHeight;
        var tlIcon = this.decideIcon(0 /* TopLeft */, widthChange, heightChange);
        var tmIcon = this.decideIcon(1 /* TopMiddle */, widthChange, heightChange);
        var trIcon = this.decideIcon(2 /* TopRight */, widthChange, heightChange);
        var clIcon = this.decideIcon(3 /* CenterLeft */, widthChange, heightChange);
        var cmIcon = this.decideIcon(4 /* Center */, widthChange, heightChange);
        var crIcon = this.decideIcon(5 /* CenterRight */, widthChange, heightChange);
        var blIcon = this.decideIcon(6 /* BottomLeft */, widthChange, heightChange);
        var bmIcon = this.decideIcon(7 /* BottomMiddle */, widthChange, heightChange);
        var brIcon = this.decideIcon(8 /* BottomRight */, widthChange, heightChange);
        return React.createElement("div", { className: "resizeAnchor" },
            React.createElement("div", null,
                React.createElement("button", { type: "button", onClick: this.setMode.bind(this, 0 /* TopLeft */), dangerouslySetInnerHTML: tlIcon }),
                React.createElement("button", { type: "button", onClick: this.setMode.bind(this, 1 /* TopMiddle */), dangerouslySetInnerHTML: tmIcon }),
                React.createElement("button", { type: "button", onClick: this.setMode.bind(this, 2 /* TopRight */), dangerouslySetInnerHTML: trIcon })),
            React.createElement("div", null,
                React.createElement("button", { type: "button", onClick: this.setMode.bind(this, 3 /* CenterLeft */), dangerouslySetInnerHTML: clIcon }),
                React.createElement("button", { type: "button", onClick: this.setMode.bind(this, 4 /* Center */), dangerouslySetInnerHTML: cmIcon }),
                React.createElement("button", { type: "button", onClick: this.setMode.bind(this, 5 /* CenterRight */), dangerouslySetInnerHTML: crIcon })),
            React.createElement("div", null,
                React.createElement("button", { type: "button", onClick: this.setMode.bind(this, 6 /* BottomLeft */), dangerouslySetInnerHTML: blIcon }),
                React.createElement("button", { type: "button", onClick: this.setMode.bind(this, 7 /* BottomMiddle */), dangerouslySetInnerHTML: bmIcon }),
                React.createElement("button", { type: "button", onClick: this.setMode.bind(this, 8 /* BottomRight */), dangerouslySetInnerHTML: brIcon })));
    };
    ResizeAnchorInput.prototype.setMode = function (mode) {
        this.props.setMode(mode);
    };
    ResizeAnchorInput.prototype.decideIcon = function (button, widthChange, heightChange) {
        if (this.props.mode == button)
            return { __html: '&#9974;' }; // picture icon
        if (widthChange == 0 && heightChange == 0)
            return undefined;
        var buttonCoords = this.getCoords(button);
        var stateCoords = this.getCoords(this.props.mode);
        var dx = buttonCoords.x - stateCoords.x;
        var dy = buttonCoords.y - stateCoords.y;
        // only draw arrow if adjacent to selected icon
        if (Math.abs(dx) > 1 || Math.abs(dy) > 1)
            return undefined;
        if (widthChange == 0)
            dx = 0;
        if (heightChange == 0)
            dy = 0;
        // now dx and dy are both in range -1 .. 1
        var arrowX = widthChange >= 0 ? 1 + dx : 1 - dx;
        var arrowY = heightChange >= 0 ? 1 + dy : 1 - dy;
        return { __html: this.arrows[arrowY][arrowX] };
    };
    ResizeAnchorInput.prototype.getCoords = function (mode) {
        switch (mode) {
            case 0 /* TopLeft */:
                return { x: -1, y: -1 };
            case 1 /* TopMiddle */:
                return { x: 0, y: -1 };
            case 2 /* TopRight */:
                return { x: 1, y: -1 };
            case 3 /* CenterLeft */:
                return { x: -1, y: 0 };
            case 4 /* Center */:
                return { x: 0, y: 0 };
            case 5 /* CenterRight */:
                return { x: 1, y: 0 };
            case 6 /* BottomLeft */:
                return { x: -1, y: 1 };
            case 7 /* BottomMiddle */:
                return { x: 0, y: 1 };
            case 8 /* BottomRight */:
                return { x: 1, y: 1 };
        }
    };
    return ResizeAnchorInput;
}(React.Component));
var ChangeHistory = (function (_super) {
    __extends(ChangeHistory, _super);
    function ChangeHistory(props) {
        var _this = _super.call(this, props) || this;
        _this.changes = [];
        _this.maxUndoSteps = 10;
        _this.state = {
            lastAppliedChangeIndex: -1,
            lastSavedChangedIndex: 0,
            saveInProgress: false,
        };
        return _this;
    }
    ChangeHistory.prototype.render = function () {
        var undoClasses = this.canUndo() ? 'roundLeft' : 'roundLeft disabled';
        var redoClasses = this.canRedo() ? 'roundRight' : 'roundRight disabled';
        var saveClasses = this.state.lastSavedChangedIndex == this.state.lastAppliedChangeIndex ? 'disabled' : undefined;
        var saveButton = this.state.saveInProgress
            ? React.createElement("button", { className: "spinner", title: "Saving..." },
                React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24" },
                    React.createElement("line", { x1: "12", y1: "2", x2: "12", y2: "6" }),
                    React.createElement("line", { x1: "12", y1: "18", x2: "12", y2: "22" }),
                    React.createElement("line", { x1: "4.93", y1: "4.93", x2: "7.76", y2: "7.76" }),
                    React.createElement("line", { x1: "16.24", y1: "16.24", x2: "19.07", y2: "19.07" }),
                    React.createElement("line", { x1: "2", y1: "12", x2: "6", y2: "12" }),
                    React.createElement("line", { x1: "18", y1: "12", x2: "22", y2: "12" }),
                    React.createElement("line", { x1: "4.93", y1: "19.07", x2: "7.76", y2: "16.24" }),
                    React.createElement("line", { x1: "16.24", y1: "7.76", x2: "19.07", y2: "4.93" })))
            : React.createElement("button", { className: saveClasses, title: "Save the map", onClick: this.save.bind(this) },
                React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24" },
                    React.createElement("path", { d: "M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" }),
                    React.createElement("polyline", { points: "17 21 17 13 7 13 7 21" }),
                    React.createElement("polyline", { points: "7 3 7 8 15 8" })));
        return React.createElement("div", { id: "undoRedo" },
            React.createElement("button", { className: undoClasses, title: "Undo the last change", onClick: this.undo.bind(this) },
                React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24" },
                    React.createElement("polygon", { points: "19 20 9 12 19 4 19 20" }),
                    React.createElement("line", { x1: "5", y1: "19", x2: "5", y2: "5" }))),
            saveButton,
            React.createElement("button", { className: redoClasses, title: "Redo the next change", onClick: this.redo.bind(this) },
                React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24" },
                    React.createElement("polygon", { points: "5 4 15 12 5 20 5 4" }),
                    React.createElement("line", { x1: "19", y1: "5", x2: "19", y2: "19" }))));
    };
    ChangeHistory.prototype.recordMapChange = function (map) {
        this.recordChangeData(map.saveToJSON());
    };
    ChangeHistory.prototype.recordChangeData = function (data) {
        // if changes have been undone, clear the queue after this point, as they can't now be redone
        if (this.changes.length > this.state.lastAppliedChangeIndex - 1)
            this.changes.splice(this.state.lastAppliedChangeIndex + 1, this.changes.length);
        // if the queue is full, remove the first item. otherwise, note that we've moved up one.
        var diff;
        if (this.changes.length > this.maxUndoSteps) {
            this.changes.shift();
            this.setState(function (prevState) {
                return {
                    lastSavedChangedIndex: prevState.lastAppliedChangeIndex - 1,
                };
            });
        }
        else
            this.setState(function (prevState) {
                return {
                    lastAppliedChangeIndex: prevState.lastAppliedChangeIndex + 1,
                };
            });
        this.changes.push(data);
    };
    ChangeHistory.prototype.undo = function () {
        if (this.canUndo())
            this.restoreSavedChange(this.state.lastAppliedChangeIndex - 1);
    };
    ChangeHistory.prototype.redo = function () {
        if (this.canRedo())
            this.restoreSavedChange(this.state.lastAppliedChangeIndex + 1);
    };
    ChangeHistory.prototype.restoreSavedChange = function (changeIndex) {
        var map = MapData.loadFromJSON(this.changes[changeIndex]);
        this.props.updateMap(map);
        MapGenerator.constructCellTypeLookup(map.cellTypes);
        this.setState(function (prevState) {
            return {
                lastAppliedChangeIndex: changeIndex,
            };
        });
    };
    ChangeHistory.prototype.canUndo = function () {
        return this.state.lastAppliedChangeIndex > 0;
    };
    ChangeHistory.prototype.canRedo = function () {
        return this.state.lastAppliedChangeIndex < this.changes.length - 1;
    };
    ChangeHistory.prototype.save = function () {
        var currentData = this.changes[this.state.lastAppliedChangeIndex];
        SaveLoad.saveData(currentData, function (success) {
            this.setState(function (prevState) {
                return {
                    saveInProgress: false,
                };
            });
        }.bind(this));
        this.setState(function (prevState) {
            return {
                lastSavedChangedIndex: prevState.lastAppliedChangeIndex,
                saveInProgress: true,
            };
        });
    };
    return ChangeHistory;
}(React.Component));
var EditorControls = (function (_super) {
    __extends(EditorControls, _super);
    function EditorControls() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    EditorControls.prototype.render = function () {
        return React.createElement("div", { id: "editorControls" },
            this.renderButton(0 /* Download */, 'Download', // download
            React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24" },
                React.createElement("path", { d: "M3 17v3a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3" }),
                React.createElement("polyline", { points: "8 12 12 16 16 12" }),
                React.createElement("line", { x1: "12", y1: "2", x2: "12", y2: "16" }))),
            this.renderButton(1 /* Overview */, 'Overview', // info
            React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24" },
                React.createElement("circle", { cx: "12", cy: "12", r: "10" }),
                React.createElement("line", { x1: "12", y1: "16", x2: "12", y2: "12" }),
                React.createElement("line", { x1: "12", y1: "8", x2: "12", y2: "8" }))),
            this.renderButton(2 /* Size */, 'Size', // move
            React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24" },
                React.createElement("polyline", { points: "5 9 2 12 5 15" }),
                React.createElement("polyline", { points: "9 5 12 2 15 5" }),
                React.createElement("polyline", { points: "15 19 12 22 9 19" }),
                React.createElement("polyline", { points: "19 9 22 12 19 15" }),
                React.createElement("line", { x1: "2", y1: "12", x2: "22", y2: "12" }),
                React.createElement("line", { x1: "12", y1: "2", x2: "12", y2: "22" }))),
            this.renderButton(3 /* Terrain */, 'Terrain', // globe
            React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24" },
                React.createElement("circle", { cx: "12", cy: "12", r: "10" }),
                React.createElement("line", { x1: "2", y1: "12", x2: "22", y2: "12" }),
                React.createElement("path", { d: "M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" }))),
            this.renderButton(4 /* Lines */, 'Lines', // edit-3
            React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24" },
                React.createElement("polyline", { points: "23 18 13.5 8.5 8.5 13.5 1 6" }),
                React.createElement("polyline", { points: "17 18 23 18 23 12" }))),
            this.renderButton(5 /* Locations */, 'Locations', // map-pin
            React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24" },
                React.createElement("path", { d: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" }),
                React.createElement("circle", { cx: "12", cy: "10", r: "3" }))),
            this.renderButton(6 /* Generation */, 'Auto-generation', // zap
            React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24" },
                React.createElement("polygon", { points: "13 2 3 14 12 14 11 22 21 10 12 10 13 2" }))),
            React.createElement("div", { className: "filler" }));
    };
    EditorControls.prototype.renderButton = function (editor, text, image) {
        var classes = this.props.activeEditor === editor ? 'active' : undefined;
        return React.createElement("button", { className: classes, title: text, onClick: this.selectEditor.bind(this, editor, text) }, image);
    };
    EditorControls.prototype.selectEditor = function (editor, name) {
        if (this.props.activeEditor != editor)
            this.props.editorSelected(editor, name);
    };
    return EditorControls;
}(React.Component));
var MapView = (function (_super) {
    __extends(MapView, _super);
    function MapView(props) {
        var _this = _super.call(this, props) || this;
        _this.backgroundColor = '#ccc';
        _this.resizeEvent = _this.resize.bind(_this);
        _this.edgePadding = 20; // pixels, regardless of zoom
        _this.redrawing = false;
        _this.resizing = false;
        var scrollSize = props.scrollUI ? _this.getScrollbarSize() : { width: 0, height: 0 };
        _this.state = {
            cellRadius: props.fixedCellRadius === undefined ? 30 : props.fixedCellRadius,
            cellDrawInterval: 1,
            viewWidth: 1,
            viewHeight: 1,
            mapWidth: 1,
            mapHeight: 1,
            scrollbarWidth: scrollSize.width,
            scrollbarHeight: scrollSize.height,
        };
        return _this;
    }
    MapView.prototype.componentDidMount = function () {
        if (this.props.scrollUI)
            window.addEventListener('resize', this.resizeEvent);
        var ctx = this.canvas.getContext('2d');
        if (ctx !== null)
            this.ctx = ctx;
        if (this.props.scrollUI)
            this.setupTouch();
        this.resize();
    };
    MapView.prototype.componentWillUnmount = function () {
        if (this.props.scrollUI)
            window.removeEventListener('resize', this.resizeEvent);
        if (this.hammer !== undefined) {
            this.hammer.destroy();
            this.hammer = undefined;
        }
    };
    MapView.prototype.componentWillReceiveProps = function (nextProps) {
        if (nextProps.fixedCellRadius !== undefined && nextProps.fixedCellRadius != this.props.fixedCellRadius)
            this.setState({
                cellRadius: nextProps.fixedCellRadius,
                cellDrawInterval: this.state.cellDrawInterval,
            });
    };
    MapView.prototype.setupTouch = function () {
        if (this.scrollPane === undefined)
            return;
        this.hammer = new Hammer.Manager(this.scrollPane);
        var zoom = new Hammer.Pinch({ event: 'zoom', threshold: 0.1 });
        this.hammer.add(zoom);
        var prevScale = 1;
        this.hammer.on('zoom', function (ev) {
            var touchZoomScale = ev.scale / prevScale;
            if (touchZoomScale > 0.9 && touchZoomScale < 1.1)
                return;
            prevScale = ev.scale;
            this.zoom(touchZoomScale);
        }.bind(this));
        this.hammer.on('zoomend', function (ev) {
            prevScale = 1;
        });
        var pan = new Hammer.Pan({ event: 'pan', threshold: 10, pointers: 3, direction: Hammer.DIRECTION_ALL });
        this.hammer.add(pan);
        var lastX = 0, lastY = 0, panScale = 1.5;
        this.hammer.on('pan', function (ev) {
            var dX = ev.deltaX - lastX;
            lastX = ev.deltaX;
            var dY = ev.deltaY - lastY;
            lastY = ev.deltaY;
            this.scrollPane.scrollLeft -= dX * panScale;
            this.scrollPane.scrollTop -= dY * panScale;
            this.redraw();
        }.bind(this));
        this.hammer.on('panend', function (ev) {
            lastX = lastY = 0;
        }.bind(this));
        var touch = new Hammer.Pan({ event: 'touch', threshold: 10, pointers: 1, direction: Hammer.DIRECTION_ALL });
        this.hammer.add(touch);
        this.hammer.on('touchstart', function (ev) {
            this.startCellInteract(ev.center.x, ev.center.y);
        }.bind(this));
        this.hammer.on('touch', function (ev) {
            this.hoverCellAt(ev.center.x, ev.center.y);
        }.bind(this));
        this.hammer.on('touchend', function (ev) {
            this.endCellInteract(ev.center.x, ev.center.y);
        }.bind(this));
        pan.requireFailure(zoom);
        zoom.requireFailure(pan);
        touch.requireFailure(pan);
        touch.requireFailure(zoom);
    };
    MapView.prototype.render = function () {
        var _this = this;
        if (!this.props.scrollUI) {
            return React.createElement("canvas", { ref: function (c) { if (c !== null)
                    _this.canvas = c; }, width: this.state.mapWidth, height: this.state.mapHeight });
        }
        var canvasWidth = this.state.viewWidth;
        canvasWidth -= this.state.scrollbarWidth;
        var canvasHeight = this.state.viewHeight;
        canvasHeight -= this.state.scrollbarHeight;
        return React.createElement("div", { id: "mapRoot", ref: function (c) { if (c !== null)
                _this.root = c; } },
            React.createElement("canvas", { ref: function (c) { if (c !== null)
                    _this.canvas = c; }, width: canvasWidth, height: canvasHeight }),
            React.createElement("div", { ref: function (c) { if (c !== null)
                    _this.scrollPane = c; }, className: "scrollPane", style: {
                    width: this.state.viewWidth,
                    height: this.state.viewHeight,
                }, onScroll: this.redraw.bind(this), onWheel: this.mouseScroll.bind(this), onMouseMove: this.mouseMove.bind(this), onMouseEnter: this.mouseMove.bind(this), onMouseDown: this.mouseDown.bind(this), onMouseUp: this.mouseUp.bind(this) },
                React.createElement("div", { ref: function (c) { if (c !== null)
                        _this.scrollSize = c; }, className: "scrollSize", style: {
                        width: this.state.mapWidth + 'px',
                        height: this.state.mapHeight + 'px'
                    } })));
    };
    MapView.prototype.redraw = function () {
        if (this.redrawing)
            return;
        requestAnimationFrame(this.draw.bind(this));
        this.redrawing = true;
    };
    MapView.prototype.draw = function () {
        this.ctx.fillStyle = this.backgroundColor;
        this.ctx.fillRect(0, 0, this.canvas.clientWidth, this.canvas.clientHeight);
        if (this.scrollPane !== undefined)
            this.ctx.translate(-this.scrollPane.scrollLeft + this.edgePadding, -this.scrollPane.scrollTop + this.edgePadding);
        var twoLevels = this.props.renderGrid && this.state.cellRadius < 40;
        var drawInterval = this.state.cellDrawInterval === undefined ? 1 : this.state.cellDrawInterval;
        var outline = this.props.renderGrid && !twoLevels;
        this.drawCells(drawInterval, outline, true);
        this.drawLines();
        if (twoLevels) {
            // outline of next zoom level
            this.drawCells(drawInterval * 2, true, false);
        }
        this.drawLocations();
        if (this.scrollPane !== undefined)
            this.ctx.translate(this.scrollPane.scrollLeft - this.edgePadding, this.scrollPane.scrollTop - this.edgePadding);
        this.redrawing = false;
    };
    MapView.prototype.getDrawExtent = function (drawCellRadius) {
        if (this.scrollPane !== undefined && this.root !== undefined)
            return {
                minX: this.scrollPane.scrollLeft - drawCellRadius - this.edgePadding,
                minY: this.scrollPane.scrollTop - drawCellRadius - this.edgePadding,
                maxX: this.scrollPane.scrollLeft + this.root.offsetWidth + drawCellRadius - this.edgePadding,
                maxY: this.scrollPane.scrollTop + this.root.offsetHeight + drawCellRadius - this.edgePadding,
            };
        else
            return {
                minX: Number.MIN_VALUE,
                minY: Number.MIN_VALUE,
                maxX: Number.MAX_VALUE,
                maxY: Number.MAX_VALUE,
            };
    };
    MapView.prototype.drawCells = function (cellDrawInterval, outline, fillContent) {
        this.ctx.lineWidth = 1;
        var drawCellRadius = this.state.cellRadius * cellDrawInterval;
        if (fillContent)
            if (outline)
                drawCellRadius -= 0.4; // ensure there's always a 1px border left between cells
            else
                drawCellRadius += 0.4; // overlap cells slightly so there's no gap
        var drawExtent = this.getDrawExtent(drawCellRadius);
        var map = this.props.map;
        var cellRadius = this.state.cellRadius;
        var halfInterval = Math.ceil(cellDrawInterval / 2);
        var xOffset = cellDrawInterval <= 2 ? 0 : Math.floor(cellDrawInterval / 2) - 1;
        for (var iCell = 0; iCell < map.cells.length; iCell++) {
            var cell = map.cells[iCell];
            if (cell == null)
                continue;
            if (this.getCellDisplayY(cell) % cellDrawInterval != 0)
                continue;
            var alternateRowOffset = this.getCellDisplayY(cell) % (2 * cellDrawInterval) == 0 ? halfInterval : 0;
            if ((this.getCellDisplayX(cell) + alternateRowOffset + xOffset) % cellDrawInterval != 0)
                continue;
            var centerX = cell.xPos * cellRadius + cellRadius;
            if (centerX < drawExtent.minX || centerX > drawExtent.maxX)
                continue;
            var centerY = cell.yPos * cellRadius + cellRadius;
            if (centerY < drawExtent.minY || centerY > drawExtent.maxY)
                continue;
            this.ctx.translate(centerX, centerY);
            cell.draw(this.ctx, drawCellRadius, iCell, outline ? this.backgroundColor : undefined, fillContent);
            this.ctx.translate(-centerX, -centerY);
        }
    };
    MapView.prototype.getCellDisplayX = function (cell) {
        return cell.col + 2 + Math.floor((cell.row - this.props.map.height) / 2);
    };
    MapView.prototype.getCellDisplayY = function (cell) {
        return cell.row + 1;
    };
    MapView.prototype.drawLocations = function () {
        var cellRadius = this.state.cellRadius;
        var drawExtent = this.getDrawExtent(cellRadius);
        var map = this.props.map;
        for (var _i = 0, _a = map.locations; _i < _a.length; _i++) {
            var loc = _a[_i];
            if (loc.type.minDrawCellRadius !== undefined && cellRadius < loc.type.minDrawCellRadius)
                continue; // don't draw this location if not zoomed in enough to see it
            var centerX = loc.cell.xPos * cellRadius + cellRadius;
            if (centerX < drawExtent.minX || centerX > drawExtent.maxX)
                continue;
            var centerY = loc.cell.yPos * cellRadius + cellRadius;
            if (centerY < drawExtent.minY || centerY > drawExtent.maxY)
                continue;
            loc.draw(this.ctx, centerX, centerY);
        }
    };
    MapView.prototype.drawLines = function () {
        var cellRadius = this.state.cellRadius;
        var drawExtent = this.getDrawExtent(cellRadius);
        var map = this.props.map;
        for (var _i = 0, _a = map.lines; _i < _a.length; _i++) {
            var line = _a[_i];
            // use min / max X & Y of all keyCells to decide whether to draw or not. Possible that a line will wrap around the screen without cross it, but not worrying about that.
            var firstCell = line.keyCells[0];
            var minX = firstCell.xPos, minY = firstCell.yPos, maxX = firstCell.xPos, maxY = firstCell.yPos;
            for (var _b = 0, _c = line.keyCells; _b < _c.length; _b++) {
                var cell = _c[_b];
                if (minX > cell.xPos)
                    minX = cell.xPos;
                else if (maxX < cell.xPos)
                    maxX = cell.xPos;
                if (minY > cell.yPos)
                    minY = cell.yPos;
                else if (maxY < cell.yPos)
                    maxY = cell.yPos;
            }
            minX = minX * cellRadius + cellRadius;
            maxX = maxX * cellRadius + cellRadius;
            if (maxX < drawExtent.minX || minX > drawExtent.maxX)
                continue;
            minY = minY * cellRadius + cellRadius;
            maxY = maxY * cellRadius + cellRadius;
            if (maxY < drawExtent.minY || minY > drawExtent.maxY)
                continue;
            line.draw(this.ctx, cellRadius, this.props.editor == 4 /* Lines */ && (this.props.selectedLine === undefined || this.props.selectedLine == line));
        }
    };
    MapView.prototype.resize = function () {
        if (this.resizing)
            return;
        requestAnimationFrame(this.updateSize.bind(this));
        this.redraw();
        this.resizing = true;
    };
    MapView.prototype.updateSize = function () {
        var viewWidth, viewHeight;
        if (this.root === undefined) {
            viewWidth = viewHeight = 0;
        }
        else {
            viewWidth = this.root.offsetWidth;
            viewHeight = this.root.offsetHeight;
        }
        var widthInCells = this.props.map.width % 2 == 0
            ? MapData.packedWidthRatio * this.props.map.width + 2 - MapData.packedWidthRatio / 2
            : MapData.packedWidthRatio * this.props.map.width + 2 - MapData.packedWidthRatio;
        var heightInCells = 1.5 * this.props.map.height + 0.5;
        var mapWidth = widthInCells * this.state.cellRadius + this.edgePadding + this.edgePadding;
        var mapHeight = heightInCells * this.state.cellRadius + this.edgePadding + this.edgePadding;
        this.setState(function (prevState) {
            return {
                viewWidth: viewWidth,
                viewHeight: viewHeight,
                mapWidth: mapWidth,
                mapHeight: mapHeight,
                cellRadius: prevState.cellRadius,
                cellDrawInterval: prevState.cellDrawInterval,
            };
        }.bind(this));
        var screenFocusX, screenFocusY;
        if (this.mouseX !== undefined && this.mouseY !== undefined) {
            screenFocusX = this.mouseX;
            screenFocusY = this.mouseY;
        }
        else {
            screenFocusX = this.canvas.width / 2;
            screenFocusY = this.canvas.height / 2;
        }
        if (this.scrollSize !== undefined && this.scrollPane !== undefined) {
            var scrollBounds = this.scrollSize.getBoundingClientRect();
            var scrollFractionX = scrollBounds.width == 0 ? 0 : (this.scrollPane.scrollLeft + screenFocusX) / scrollBounds.width;
            var scrollFractionY = scrollBounds.height == 0 ? 0 : (this.scrollPane.scrollTop + screenFocusY) / scrollBounds.height;
            this.scrollPane.scrollLeft = scrollFractionX * mapWidth - screenFocusX;
            this.scrollPane.scrollTop = scrollFractionY * mapHeight - screenFocusY;
        }
        this.resizing = false;
    };
    MapView.prototype.mouseScroll = function (e) {
        if (!e.ctrlKey || e.deltaY == 0)
            return;
        e.preventDefault();
        this.zoom(e.deltaY < 0 ? 1.1 : 0.9);
    };
    MapView.prototype.zoom = function (scale) {
        this.setCellRadius(Math.min(200, Math.ceil(this.state.cellRadius * scale)));
    };
    MapView.prototype.setCellRadius = function (radius) {
        var displayRadius = radius;
        var cellDrawInterval = 1;
        var minRadius = 20;
        while (displayRadius < minRadius) {
            displayRadius *= 2;
            cellDrawInterval *= 2;
        }
        this.setState({
            cellRadius: radius,
            cellDrawInterval: cellDrawInterval
        });
    };
    MapView.prototype.componentDidUpdate = function (prevProps, prevState) {
        if (prevState.cellRadius != this.state.cellRadius) {
            this.updateSize();
            this.redraw();
        }
    };
    MapView.prototype.mouseMove = function (e) {
        this.mouseX = e.clientX;
        this.mouseY = e.clientY;
        this.hoverCellAt(e.clientX, e.clientY);
    };
    MapView.prototype.mouseDown = function (e) {
        if (e.button == 0)
            this.startCellInteract(e.clientX, e.clientY);
    };
    MapView.prototype.mouseUp = function (e) {
        if (e.button == 0)
            this.endCellInteract(e.clientX, e.clientY);
    };
    MapView.prototype.hoverCellAt = function (x, y) {
        if (this.mouseDownCell === null)
            return;
        var cellIndex = this.getCellIndexAtPoint(x, y);
        var cell = cellIndex >= 0 && cellIndex < this.props.map.cells.length ? this.props.map.cells[cellIndex] : null;
        if (cell !== this.mouseDownCell) {
            if (this.props.cellMouseLeave !== undefined)
                this.props.cellMouseLeave(this.mouseDownCell);
            this.mouseDownCell = cell;
            if (cell !== null && this.props.cellMouseEnter !== undefined)
                this.props.cellMouseEnter(cell);
        }
    };
    MapView.prototype.startCellInteract = function (x, y) {
        var cellIndex = this.getCellIndexAtPoint(x, y);
        if (cellIndex >= 0 && cellIndex < this.props.map.cells.length) {
            var cell = this.props.map.cells[cellIndex];
            if (cell !== null && this.props.cellMouseDown !== undefined && cell !== this.mouseDownCell)
                this.props.cellMouseDown(cell);
            this.mouseDownCell = cell;
        }
    };
    MapView.prototype.endCellInteract = function (x, y) {
        if (this.mouseDownCell === null)
            return;
        var cellIndex = this.getCellIndexAtPoint(x, y);
        if (cellIndex >= 0 && cellIndex < this.props.map.cells.length) {
            var cell = this.props.map.cells[cellIndex];
            if (cell !== null && this.props.cellMouseUp !== undefined)
                this.props.cellMouseUp(cell);
        }
        this.mouseDownCell = null;
    };
    MapView.prototype.getCellIndexAtPoint = function (screenX, screenY) {
        if (this.scrollPane === undefined)
            return -1;
        var mapX = screenX - this.canvas.offsetLeft + this.scrollPane.scrollLeft - this.state.cellRadius - this.edgePadding;
        var mapY = screenY - this.canvas.offsetTop + this.scrollPane.scrollTop - this.state.cellRadius - this.edgePadding;
        return this.props.map.getCellIndexAtPoint(mapX / this.state.cellRadius, mapY / this.state.cellRadius);
    };
    MapView.prototype.getScrollbarSize = function () {
        var outer = document.createElement('div');
        outer.style.visibility = 'hidden';
        outer.style.width = '100px';
        outer.style.height = '100px';
        outer.style.msOverflowStyle = 'scrollbar'; // needed for WinJS apps
        document.body.appendChild(outer);
        var widthNoScroll = outer.offsetWidth;
        var heightNoScroll = outer.offsetHeight;
        // force scrollbars
        outer.style.overflow = 'scroll';
        // add innerdiv
        var inner = document.createElement('div');
        inner.style.width = '100%';
        inner.style.height = '100%';
        outer.appendChild(inner);
        var widthWithScroll = inner.offsetWidth;
        var heightWithScroll = inner.offsetHeight;
        // remove divs
        if (outer.parentNode !== null)
            outer.parentNode.removeChild(outer);
        return {
            width: widthNoScroll - widthWithScroll,
            height: heightNoScroll - heightWithScroll
        };
    };
    MapView.prototype.downloadImage = function () {
        this.canvas.toBlob(function (blob) {
            saveAs(blob, this.props.map.name + '.png');
        }.bind(this));
    };
    return MapView;
}(React.Component));
var GuideView = (function (_super) {
    __extends(GuideView, _super);
    function GuideView() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    GuideView.prototype.componentDidMount = function () {
        this.redraw();
    };
    GuideView.prototype.componentDidUpdate = function (prevProps) {
        if (prevProps.guide !== this.props.guide)
            this.redraw();
    };
    GuideView.prototype.redraw = function () {
        var ctx = this.canvas.getContext('2d');
        if (ctx === null)
            return;
        if (this.props.guide.isVector)
            this.drawVector(ctx, this.props.guide, this.canvas.width, this.canvas.height);
        else
            this.drawScalar(ctx, this.props.guide, this.canvas.width, this.canvas.height);
    };
    GuideView.prototype.render = function () {
        var _this = this;
        return React.createElement("canvas", { width: 50, height: 50, ref: function (c) { if (c !== null)
                _this.canvas = c; }, title: this.props.guide.name, className: this.props.className, onClick: this.clicked.bind(this) });
    };
    GuideView.prototype.clicked = function () {
        if (this.props.onClick !== undefined)
            this.props.onClick(this.props.guide);
    };
    GuideView.prototype.drawScalar = function (ctx, guide, width, height) {
        var image = ctx.createImageData(width, height);
        var imageData = image.data;
        var writePos = 0;
        for (var y = 0; y < height; y++)
            for (var x = 0; x < width; x++) {
                var rgb = Math.floor(guide.generation(x, y, width, height) * 255);
                imageData[writePos++] = rgb;
                imageData[writePos++] = rgb;
                imageData[writePos++] = rgb;
                imageData[writePos++] = 255;
            }
        ctx.putImageData(image, 0, 0);
    };
    GuideView.prototype.drawVector = function (ctx, guide, width, height) {
    };
    return GuideView;
}(React.Component));
var GenerationField = (function (_super) {
    __extends(GenerationField, _super);
    function GenerationField() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    GenerationField.prototype.render = function () {
        var lowerName = this.props.name.toLowerCase();
        return React.createElement("form", { className: "genField" },
            React.createElement("h2", null, this.props.name),
            React.createElement("div", { role: "group", className: "vertical" },
                React.createElement("p", null,
                    "The ",
                    lowerName,
                    " guide controls the overall ",
                    lowerName,
                    " of generated terrain. Click below to change the selected ",
                    lowerName,
                    " guide."),
                React.createElement("div", { className: "palleteList" },
                    React.createElement(GuideView, { guide: this.props.guide, onClick: this.props.showGuideSelection }))),
            React.createElement("p", null,
                "Fine tune the ",
                lowerName,
                " by specifying a \"fixed\" ",
                lowerName,
                ", and scaling how much this, the ",
                lowerName,
                " guide and randomness contribute to the generated map."),
            React.createElement("div", { role: "group" },
                React.createElement("div", { className: "fieldLabel" },
                    "Min ",
                    lowerName),
                React.createElement("input", { type: "range", value: this.props.minValue.toString(), onChange: this.minChanged.bind(this), step: "0.01", min: "0", max: "1" })),
            React.createElement("div", { role: "group" },
                React.createElement("div", { className: "fieldLabel" },
                    "Max ",
                    lowerName),
                React.createElement("input", { type: "range", value: this.props.maxValue.toString(), onChange: this.maxChanged.bind(this), step: "0.01", min: "0", max: "1" })),
            React.createElement("div", { role: "group" },
                React.createElement("div", { className: "fieldLabel" }, "Scale: Guide"),
                React.createElement("input", { type: "range", value: this.props.guideScale.toString(), onChange: this.guideScaleChanged.bind(this), step: "0.01", min: "0", max: "1" })),
            React.createElement("div", { role: "group" },
                React.createElement("div", { className: "fieldLabel" }, "Large variations"),
                React.createElement("input", { type: "range", value: this.props.lowFreqScale.toString(), onChange: this.lowFreqScaleChanged.bind(this), step: "0.01", min: "0", max: "1" })),
            React.createElement("div", { role: "group" },
                React.createElement("div", { className: "fieldLabel" }, "Small variations"),
                React.createElement("input", { type: "range", value: this.props.highFreqScale.toString(), onChange: this.highFreqScaleChanged.bind(this), step: "0.01", min: "0", max: "1" })));
    };
    GenerationField.prototype.minChanged = function (e) {
        var val = parseFloat(e.target.value);
        this.props.changed(val, Math.max(this.props.maxValue, val), this.props.guideScale, this.props.lowFreqScale, this.props.highFreqScale);
    };
    GenerationField.prototype.maxChanged = function (e) {
        var val = parseFloat(e.target.value);
        this.props.changed(Math.min(this.props.minValue, val), val, this.props.guideScale, this.props.lowFreqScale, this.props.highFreqScale);
    };
    GenerationField.prototype.guideScaleChanged = function (e) {
        this.props.changed(this.props.minValue, this.props.maxValue, parseFloat(e.target.value), this.props.lowFreqScale, this.props.highFreqScale);
    };
    GenerationField.prototype.lowFreqScaleChanged = function (e) {
        this.props.changed(this.props.minValue, this.props.maxValue, this.props.guideScale, parseFloat(e.target.value), this.props.highFreqScale);
    };
    GenerationField.prototype.highFreqScaleChanged = function (e) {
        this.props.changed(this.props.minValue, this.props.maxValue, this.props.guideScale, this.props.lowFreqScale, parseFloat(e.target.value));
    };
    return GenerationField;
}(React.Component));
var DownloadEditor = (function (_super) {
    __extends(DownloadEditor, _super);
    function DownloadEditor(props) {
        var _this = _super.call(this, props) || this;
        _this.state = {
            showGrid: true,
            gridSize: 60,
        };
        return _this;
    }
    DownloadEditor.prototype.render = function () {
        var _this = this;
        return React.createElement("form", { id: "setupDownload", onSubmit: this.prepareDownload.bind(this) },
            React.createElement("p", null, "Save your map to an image file, for use elsewhere."),
            React.createElement("div", { role: "group" },
                React.createElement("label", null,
                    "Show grid ",
                    React.createElement("input", { type: "checkbox", checked: this.state.showGrid, onChange: this.toggleGrid.bind(this) }))),
            React.createElement("div", { role: "group" },
                React.createElement("label", { htmlFor: "txtCellSize" }, "Cell size"),
                React.createElement("input", { type: "number", id: "txtCellSize", value: this.state.gridSize.toString(), onChange: this.cellSizeChanged.bind(this) })),
            React.createElement("div", { role: "group", className: "vertical" },
                React.createElement("button", { type: "submit" }, "Download map")),
            React.createElement(MapView, { map: this.props.map, scrollUI: false, renderGrid: this.state.showGrid, fixedCellRadius: this.state.gridSize / 2, ref: function (c) { if (c !== null)
                    _this.view = c; } }));
    };
    DownloadEditor.prototype.cellSizeChanged = function (e) {
        this.setState({
            showGrid: this.state.showGrid,
            gridSize: e.target.value,
        });
        this.view.redraw();
    };
    DownloadEditor.prototype.toggleGrid = function (e) {
        this.setState({
            showGrid: !this.state.showGrid,
            gridSize: this.state.gridSize,
        });
        this.view.redraw();
    };
    DownloadEditor.prototype.prepareDownload = function (e) {
        e.preventDefault();
        this.view.downloadImage();
    };
    return DownloadEditor;
}(React.Component));
var OverviewEditor = (function (_super) {
    __extends(OverviewEditor, _super);
    function OverviewEditor(props) {
        var _this = _super.call(this, props) || this;
        _this.detectPropChange = false;
        return _this;
    }
    OverviewEditor.prototype.componentWillReceiveProps = function () {
        // This is a hack: updating the key of the inputs when the props change causes them to render their defaultValue again, which has just changed.
        // This allows undo/redo to visibly change the name / description.
        this.detectPropChange = !this.detectPropChange;
    };
    OverviewEditor.prototype.render = function () {
        var _this = this;
        return React.createElement("form", null,
            React.createElement("div", { role: "group", className: "vertical" },
                React.createElement("label", { htmlFor: "txtName" }, "Name"),
                React.createElement("input", { type: "text", defaultValue: this.props.name, key: this.detectPropChange ? 'txtA' : 'txtB', ref: function (c) { if (c !== null)
                        _this.name = c; }, onBlur: this.nameChanged.bind(this) })),
            React.createElement("div", { role: "group", className: "vertical" },
                React.createElement("label", { htmlFor: "txtDesc" }, "Description"),
                React.createElement("textarea", { defaultValue: this.props.description, key: this.detectPropChange ? 'descA' : 'descB', ref: function (c) { if (c !== null)
                        _this.desc = c; }, onBlur: this.descChanged.bind(this), rows: 20 })));
    };
    OverviewEditor.prototype.nameChanged = function (e) {
        var value = e.target.value;
        if (this.props.name != value)
            this.props.saveChanges(value, this.props.description);
    };
    OverviewEditor.prototype.descChanged = function (e) {
        var value = e.target.value;
        if (this.props.description != value)
            this.props.saveChanges(this.props.name, value);
    };
    return OverviewEditor;
}(React.Component));
var SizeEditor = (function (_super) {
    __extends(SizeEditor, _super);
    function SizeEditor(props) {
        var _this = _super.call(this, props) || this;
        _this.state = {
            newWidth: props.width,
            newHeight: props.height,
            resizeAnchor: 0 /* TopLeft */,
        };
        return _this;
    }
    SizeEditor.prototype.render = function () {
        var sameSize = this.state.newWidth == this.props.width && this.state.newHeight == this.props.height;
        return React.createElement("form", { onSubmit: this.changeSize.bind(this) },
            React.createElement("p", null, "Adjust the overall size of the map, and control what edges have cells are added or removed."),
            React.createElement("div", { role: "group" },
                React.createElement("label", { htmlFor: "txtResizeWidth" }, "Width"),
                React.createElement("input", { type: "number", id: "txtResizeWidth", value: this.state.newWidth.toString(), onChange: this.widthChanged.bind(this) })),
            React.createElement("div", { role: "group" },
                React.createElement("label", { htmlFor: "txtResizeHeight" }, "Height"),
                React.createElement("input", { type: "number", id: "txtResizeHeight", value: this.state.newHeight.toString(), onChange: this.heightChanged.bind(this) })),
            React.createElement("div", { role: "group" },
                React.createElement("label", null, "Anchor"),
                React.createElement(ResizeAnchorInput, { oldWidth: this.props.width, newWidth: this.state.newWidth, oldHeight: this.props.height, newHeight: this.state.newHeight, mode: this.state.resizeAnchor, setMode: this.setMode.bind(this) })),
            React.createElement("div", { role: "group", className: "vertical" },
                React.createElement("button", { type: "submit", disabled: sameSize }, "Change size")));
    };
    SizeEditor.prototype.widthChanged = function (e) {
        this.setState({
            newWidth: e.target.value
        });
    };
    SizeEditor.prototype.heightChanged = function (e) {
        this.setState({
            newHeight: e.target.value
        });
    };
    SizeEditor.prototype.setMode = function (mode) {
        this.setState({
            resizeAnchor: mode
        });
    };
    SizeEditor.prototype.changeSize = function (e) {
        e.preventDefault();
        this.props.changeSize(this.state.newWidth, this.state.newHeight, this.state.resizeAnchor);
    };
    return SizeEditor;
}(React.Component));
var CellTypeEditor = (function (_super) {
    __extends(CellTypeEditor, _super);
    function CellTypeEditor() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    CellTypeEditor.prototype.componentWillMount = function () {
        if (this.props.editingType === undefined)
            this.setState({
                name: '',
                color: '#666666',
                height: 0.5,
                temperature: 0.5,
                precipitation: 0.5,
                noiseScale: 4,
                noiseIntensity: 0.1,
                noiseDensity: 0.3,
                detail: undefined,
                detailColor: '#666666',
                detailNumPerCell: 1,
                detailSize: 1,
            });
        else
            this.setState({
                name: this.props.editingType.name,
                color: this.props.editingType.color,
                height: this.props.editingType.height,
                temperature: this.props.editingType.temperature,
                precipitation: this.props.editingType.precipitation,
                noiseScale: this.props.editingType.noiseScale,
                noiseIntensity: this.props.editingType.noiseIntensity,
                noiseDensity: this.props.editingType.noiseDensity,
                detail: this.props.editingType.detail,
                detailColor: this.props.editingType.detailColor === undefined ? '#666666' : this.props.editingType.detailColor,
                detailNumPerCell: this.props.editingType.detailNumberPerCell === undefined ? 1 : this.props.editingType.detailNumberPerCell,
                detailSize: this.props.editingType.detailSize === undefined ? 1 : this.props.editingType.detailSize,
            });
    };
    CellTypeEditor.prototype.render = function () {
        var deleteButton = this.props.editingType === undefined || this.props.editingType == CellType.empty ? undefined : React.createElement("button", { type: "button", onClick: this.deleteType.bind(this) }, "Delete");
        var height = this.state.height.toString();
        var temperature = this.state.temperature.toString();
        var precipitation = this.state.precipitation.toString();
        var noiseScale = this.state.noiseScale.toString();
        var noiseIntensity = this.state.noiseIntensity.toString();
        var noiseDensity = this.state.noiseDensity.toString();
        var detailName = this.state.detail === undefined ? '' : this.state.detail;
        var numPerCell = this.state.detailNumPerCell === undefined ? '' : this.state.detailNumPerCell.toString();
        var detailSize = this.state.detailSize === undefined ? '' : this.state.detailSize.toString();
        return React.createElement("form", { onSubmit: this.saveType.bind(this) },
            React.createElement("div", { role: "group" },
                React.createElement("label", { htmlFor: "txtName" }, "Name"),
                React.createElement("input", { type: "text", id: "txtName", value: this.state.name, onChange: this.nameChanged.bind(this) })),
            React.createElement("div", { role: "group" },
                React.createElement("label", { htmlFor: "inColor" }, "Fill Color"),
                React.createElement("input", { type: "color", id: "inColor", value: this.state.color, onChange: this.colorChanged.bind(this) })),
            React.createElement("hr", null),
            React.createElement("div", { role: "group" },
                React.createElement("label", { htmlFor: "txtNoiseScale" }, "Noise scale"),
                React.createElement("input", { type: "number", id: "txtNoiseScale", value: noiseScale, onChange: this.noiseScaleChanged.bind(this), step: "0.5", min: "1", max: "25" })),
            React.createElement("div", { role: "group" },
                React.createElement("label", { htmlFor: "txtNoiseIntensity" }, "Noise intensity"),
                React.createElement("input", { type: "number", id: "txtNoiseIntensity", value: noiseIntensity, onChange: this.noiseIntensityChanged.bind(this), step: "0.025", min: "0", max: "1" })),
            React.createElement("div", { role: "group" },
                React.createElement("label", { htmlFor: "txtNoiseDensity" }, "Noise density"),
                React.createElement("input", { type: "number", id: "txtNoiseDensity", value: noiseDensity, onChange: this.noiseDensityChanged.bind(this), step: "0.05", min: "0", max: "1" })),
            React.createElement("hr", null),
            React.createElement("div", { role: "group" },
                React.createElement("label", { htmlFor: "ddlDetail" }, "Detail"),
                React.createElement("select", { id: "ddlDetail", value: detailName, onChange: this.detailChanged.bind(this) },
                    React.createElement("option", { value: "" }, "(No detail)"),
                    Object.keys(MapCell.details).map(function (key) {
                        var detail = MapCell.details[key];
                        return React.createElement("option", { key: key, value: key }, detail.name);
                    }))),
            React.createElement("div", { role: "group" },
                React.createElement("label", { htmlFor: "inDetColor" }, "Detail Color"),
                React.createElement("input", { disabled: detailName == '', type: "color", id: "inDetColor", value: this.state.detailColor === undefined ? '' : this.state.detailColor, onChange: this.detailColorChanged.bind(this) })),
            React.createElement("div", { role: "group" },
                React.createElement("label", { htmlFor: "txtDetNum" }, "Number per Cell"),
                React.createElement("input", { disabled: detailName == '', type: "number", id: "txtDetNum", value: numPerCell, onChange: this.detailNumChanged.bind(this), min: "1", max: "10" })),
            React.createElement("div", { role: "group" },
                React.createElement("label", { htmlFor: "txtDetSize" }, "Detail Size"),
                React.createElement("input", { disabled: detailName == '', type: "range", id: "txtDetSize", value: detailSize, onChange: this.detailSizeChanged.bind(this), step: "0.01", min: "0", max: "1" })),
            React.createElement("hr", null),
            React.createElement("p", null, "The following settings only affect auto-generation"),
            React.createElement("div", { role: "group" },
                React.createElement("label", { htmlFor: "txtHeight" }, "Height"),
                React.createElement("input", { type: "range", id: "txtHeight", value: height, onChange: this.heightChanged.bind(this), step: "0.01", min: "0", max: "1" })),
            React.createElement("div", { role: "group" },
                React.createElement("label", { htmlFor: "txtTemperature" }, "Temperature"),
                React.createElement("input", { type: "range", id: "txtTemperature", value: temperature, onChange: this.temperatureChanged.bind(this), step: "0.01", min: "0", max: "1" })),
            React.createElement("div", { role: "group" },
                React.createElement("label", { htmlFor: "txtPrecipitation" }, "Precipitation"),
                React.createElement("input", { type: "range", id: "txtPrecipitation", value: precipitation, onChange: this.precipitationChanged.bind(this), step: "0.01", min: "0", max: "1" })),
            React.createElement("div", { role: "group" },
                React.createElement("button", { type: "submit" }, "Save type"),
                React.createElement("button", { type: "button", onClick: this.cancelEdit.bind(this) }, "Cancel"),
                deleteButton));
    };
    CellTypeEditor.prototype.nameChanged = function (e) {
        this.setState({
            name: e.target.value
        });
    };
    CellTypeEditor.prototype.colorChanged = function (e) {
        this.setState({
            color: e.target.value
        });
    };
    CellTypeEditor.prototype.heightChanged = function (e) {
        this.setState({
            height: parseFloat(e.target.value),
        });
    };
    CellTypeEditor.prototype.temperatureChanged = function (e) {
        this.setState({
            temperature: parseFloat(e.target.value),
        });
    };
    CellTypeEditor.prototype.precipitationChanged = function (e) {
        this.setState({
            precipitation: parseFloat(e.target.value),
        });
    };
    CellTypeEditor.prototype.noiseScaleChanged = function (e) {
        this.setState({
            noiseScale: parseFloat(e.target.value),
        });
    };
    CellTypeEditor.prototype.noiseIntensityChanged = function (e) {
        this.setState({
            noiseIntensity: parseFloat(e.target.value),
        });
    };
    CellTypeEditor.prototype.noiseDensityChanged = function (e) {
        this.setState({
            noiseDensity: parseFloat(e.target.value),
        });
    };
    CellTypeEditor.prototype.detailChanged = function (e) {
        this.setState({
            detail: e.target.value
        });
    };
    CellTypeEditor.prototype.detailColorChanged = function (e) {
        this.setState({
            detailColor: e.target.value
        });
    };
    CellTypeEditor.prototype.detailNumChanged = function (e) {
        this.setState({
            detailNumPerCell: parseInt(e.target.value),
        });
    };
    CellTypeEditor.prototype.detailSizeChanged = function (e) {
        this.setState({
            detailSize: parseFloat(e.target.value),
        });
    };
    CellTypeEditor.prototype.saveType = function (e) {
        e.preventDefault();
        var name = this.state.name.trim();
        var color = this.state.color;
        if (name.length == 0 || color.length == 0)
            return;
        var detail = this.state.detail == '' ? undefined : this.state.detail; // yes this is the other way round
        var detailColor = this.state.detailColor === '' || detail === undefined ? undefined : this.state.detailColor;
        var editType = this.props.editingType;
        var cellTypes = this.props.cellTypes.slice();
        if (editType === undefined) {
            cellTypes.push(new CellType(name, color, this.state.height, this.state.temperature, this.state.precipitation, this.state.noiseScale, this.state.noiseIntensity, this.state.noiseDensity, detail, detailColor, this.state.detailNumPerCell, this.state.detailSize));
        }
        else {
            editType.name = name;
            editType.color = color;
            editType.height = this.state.height;
            editType.temperature = this.state.temperature;
            editType.precipitation = this.state.precipitation;
            editType.noiseScale = this.state.noiseScale;
            editType.noiseIntensity = this.state.noiseIntensity;
            editType.noiseDensity = this.state.noiseDensity;
            editType.detail = detail;
            editType.detailColor = detailColor;
            editType.detailNumberPerCell = this.state.detailNumPerCell;
            editType.detailSize = this.state.detailSize;
            editType.updateTexture();
        }
        this.props.updateCellTypes(cellTypes);
    };
    CellTypeEditor.prototype.cancelEdit = function () {
        this.props.updateCellTypes(this.props.cellTypes);
    };
    CellTypeEditor.prototype.deleteType = function () {
        var cellTypes = this.props.cellTypes.slice();
        if (this.props.editingType !== undefined) {
            var pos = cellTypes.indexOf(this.props.editingType);
            cellTypes.splice(pos, 1);
        }
        this.props.updateCellTypes(cellTypes);
    };
    return CellTypeEditor;
}(React.Component));
var TerrainEditor = (function (_super) {
    __extends(TerrainEditor, _super);
    function TerrainEditor(props) {
        var _this = _super.call(this, props) || this;
        _this.state = {
            isEditingTerrainType: false,
            isDrawingOnMap: false,
            selectedTerrainType: props.cellTypes[0],
            editorMode: 0 /* CellTypes */,
            selectedTerrainProperty: 0 /* Height */,
            selectedTerrainAdjustment: 1,
            brushSize: 0,
        };
        return _this;
    }
    TerrainEditor.prototype.componentWillUpdate = function (nextProps, nextState) {
        if (this.state.isDrawingOnMap && !nextState.isDrawingOnMap)
            this.props.hasDrawn(true);
    };
    TerrainEditor.prototype.componentDidUpdate = function (prevProps, prevState) {
        if (this.state.selectedTerrainType !== undefined && this.props.cellTypes.indexOf(this.state.selectedTerrainType) == -1) {
            console.log('clearing isEditingTerrainType cos selectedTerrainType === undefined');
            this.setState(function (prevState) {
                return {
                    isEditingTerrainType: false,
                    isDrawingOnMap: false,
                    selectedTerrainType: this.props.cellTypes[0],
                };
            });
        }
    };
    TerrainEditor.prototype.render = function () {
        if (this.state.isEditingTerrainType)
            return React.createElement(CellTypeEditor, { editingType: this.state.selectedTerrainType, cellTypes: this.props.cellTypes, updateCellTypes: this.cellTypesChanged.bind(this) });
        var that = this;
        var propertyAdjustmentScale = 0.1;
        var brushSizes = [0, 1, 2, 3, 4];
        var editorPallete = this.state.editorMode == 0 /* CellTypes */ ? [
            React.createElement("p", { key: "prompt" }, "Select a terrain type to draw onto the map. Double click/tap on a terrain type to edit it."),
            React.createElement("div", { key: "palette", className: "palleteList" }, this.props.cellTypes.map(function (type, id) {
                var classes = type == that.state.selectedTerrainType ? 'selected' : undefined;
                return React.createElement("div", { key: id.toString(), className: classes, style: { 'backgroundColor': type.color }, onClick: that.selectTerrainType.bind(that, type), onDoubleClick: that.showTerrainEdit.bind(that, type) }, type.name);
            })),
            React.createElement("div", { key: "actions", role: "group", className: "vertical" },
                React.createElement("button", { type: "button", onClick: this.showTerrainEdit.bind(this, undefined) }, "Add new type"))
        ] : [
            React.createElement("p", { key: "prompt" }, "Adjust properties of the terrain by drawing on the map. Cells will change their type to keep up to date with their properties."),
            React.createElement("div", { key: "palette", className: "palleteList" },
                React.createElement("div", { className: this.state.selectedTerrainProperty == 0 /* Height */ && this.state.selectedTerrainAdjustment == propertyAdjustmentScale ? 'selected' : undefined, onClick: that.selectTerrainProperties.bind(that, 0 /* Height */, propertyAdjustmentScale) }, "Increase height"),
                React.createElement("div", { className: this.state.selectedTerrainProperty == 0 /* Height */ && this.state.selectedTerrainAdjustment == -propertyAdjustmentScale ? 'selected' : undefined, onClick: that.selectTerrainProperties.bind(that, 0 /* Height */, -propertyAdjustmentScale) }, "Decrease height"),
                React.createElement("div", { className: this.state.selectedTerrainProperty == 1 /* Temperature */ && this.state.selectedTerrainAdjustment == propertyAdjustmentScale ? 'selected' : undefined, onClick: that.selectTerrainProperties.bind(that, 1 /* Temperature */, propertyAdjustmentScale) }, "Increase temperature"),
                React.createElement("div", { className: this.state.selectedTerrainProperty == 1 /* Temperature */ && this.state.selectedTerrainAdjustment == -propertyAdjustmentScale ? 'selected' : undefined, onClick: that.selectTerrainProperties.bind(that, 1 /* Temperature */, -propertyAdjustmentScale) }, "Decrease temperature"),
                React.createElement("div", { className: this.state.selectedTerrainProperty == 2 /* Precipitation */ && this.state.selectedTerrainAdjustment == propertyAdjustmentScale ? 'selected' : undefined, onClick: that.selectTerrainProperties.bind(that, 2 /* Precipitation */, propertyAdjustmentScale) }, "Increase precipitation"),
                React.createElement("div", { className: this.state.selectedTerrainProperty == 2 /* Precipitation */ && this.state.selectedTerrainAdjustment == -propertyAdjustmentScale ? 'selected' : undefined, onClick: that.selectTerrainProperties.bind(that, 2 /* Precipitation */, -propertyAdjustmentScale) }, "Decrease precipitation")),
        ];
        return React.createElement("form", null,
            React.createElement("div", { role: "group", className: "vertical" },
                React.createElement("label", null,
                    React.createElement("input", { type: "radio", name: "drawMode", checked: this.state.editorMode == 0 /* CellTypes */, onChange: this.setEditorMode.bind(this, 0 /* CellTypes */) }),
                    " Set cell types"),
                React.createElement("label", null,
                    React.createElement("input", { type: "radio", name: "drawMode", checked: this.state.editorMode == 1 /* TerrainProperties */, onChange: this.setEditorMode.bind(this, 1 /* TerrainProperties */) }),
                    " Adjust terrain properties")),
            editorPallete,
            React.createElement("hr", null),
            React.createElement("p", null, "Select a brush size to draw with:"),
            React.createElement("div", { className: "palleteList horizontal" }, brushSizes.map(function (size, id) {
                return React.createElement("div", { key: id, className: that.state.brushSize == size ? 'selected' : undefined, onClick: that.selectBrushSize.bind(that, size) }, size * 2 + 1);
            })),
            ",");
    };
    TerrainEditor.prototype.setEditorMode = function (mode) {
        this.setState({
            editorMode: mode,
        });
    };
    TerrainEditor.prototype.selectTerrainType = function (type) {
        this.setState({
            isEditingTerrainType: false,
            isDrawingOnMap: false,
            selectedTerrainType: type,
        });
    };
    TerrainEditor.prototype.selectTerrainProperties = function (property, adjustment) {
        this.setState({
            selectedTerrainProperty: property,
            selectedTerrainAdjustment: adjustment,
        });
    };
    TerrainEditor.prototype.selectBrushSize = function (size) {
        this.setState({
            brushSize: size,
        });
    };
    TerrainEditor.prototype.showTerrainEdit = function (type) {
        this.setState({
            isEditingTerrainType: true,
            isDrawingOnMap: false,
            selectedTerrainType: type,
        });
    };
    TerrainEditor.prototype.cellTypesChanged = function (cellTypes) {
        this.setState({
            isEditingTerrainType: false,
            isDrawingOnMap: false,
        });
        this.props.updateCellTypes(cellTypes);
    };
    TerrainEditor.prototype.mouseDown = function (cell) {
        if (this.state.isDrawingOnMap || this.state.selectedTerrainType === undefined)
            return;
        this.setState({
            isDrawingOnMap: true,
        });
        this.drawOnCell(cell);
        this.props.hasDrawn(false);
    };
    TerrainEditor.prototype.mouseUp = function (cell) {
        if (!this.state.isDrawingOnMap)
            return;
        this.setState({
            isDrawingOnMap: false,
        });
    };
    TerrainEditor.prototype.mouseEnter = function (cell) {
        if (!this.state.isDrawingOnMap || this.state.selectedTerrainType === undefined)
            return;
        this.drawOnCell(cell);
        this.props.hasDrawn(false);
    };
    TerrainEditor.prototype.drawOnCell = function (cell) {
        if (this.state.brushSize == 0) {
            this.modifyCell(cell);
            return;
        }
        var cellsToChange = this.props.findCellsInRange(cell, this.state.brushSize);
        for (var _i = 0, cellsToChange_1 = cellsToChange; _i < cellsToChange_1.length; _i++) {
            var cell_2 = cellsToChange_1[_i];
            this.modifyCell(cell_2);
        }
    };
    TerrainEditor.prototype.modifyCell = function (cell) {
        if (this.state.editorMode == 0 /* CellTypes */) {
            if (this.state.selectedTerrainType !== undefined)
                cell.cellType = this.state.selectedTerrainType;
        }
        else {
            switch (this.state.selectedTerrainProperty) {
                case 0 /* Height */:
                    cell.height = Math.min(1, Math.max(-1, cell.height + this.state.selectedTerrainAdjustment));
                    break;
                case 1 /* Temperature */:
                    cell.temperature = Math.min(1, Math.max(0, cell.temperature + this.state.selectedTerrainAdjustment));
                    break;
                case 2 /* Precipitation */:
                    cell.precipitation = Math.min(1, Math.max(0, cell.precipitation + this.state.selectedTerrainAdjustment));
                    break;
            }
            MapGenerator.updateCellType(cell);
        }
    };
    TerrainEditor.prototype.replacingMap = function (map) {
        var cellType;
        var editingType = this.state.isEditingTerrainType;
        if (this.state.selectedTerrainType !== undefined) {
            var index = this.props.cellTypes.indexOf(this.state.selectedTerrainType);
            cellType = map.cellTypes[index];
        }
        if (cellType === undefined) {
            cellType = map.cellTypes[0];
            editingType = false;
        }
        this.setState({
            isEditingTerrainType: editingType,
            selectedTerrainType: cellType,
            isDrawingOnMap: false,
        });
    };
    return TerrainEditor;
}(React.Component));
var LineTypeEditor = (function (_super) {
    __extends(LineTypeEditor, _super);
    function LineTypeEditor() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    LineTypeEditor.prototype.componentWillMount = function () {
        if (this.props.editingType === undefined)
            this.setState({
                name: '',
                color: '#666666',
                width: 6,
                startWidth: 6,
                endWidth: 6,
                curviture: 0.5,
            });
        else
            this.setState({
                name: this.props.editingType.name,
                color: this.props.editingType.color,
                width: this.props.editingType.width,
                startWidth: this.props.editingType.startWidth,
                endWidth: this.props.editingType.endWidth,
                curviture: this.props.editingType.curviture,
            });
    };
    LineTypeEditor.prototype.render = function () {
        var deleteButton = this.props.editingType === undefined || this.props.lineTypes.length < 2 ? undefined : React.createElement("button", { type: "button", onClick: this.deleteType.bind(this) }, "Delete");
        var width = this.state.width.toString();
        var startWidth = this.state.startWidth.toString();
        var endWidth = this.state.endWidth.toString();
        var curviture = this.state.curviture.toString();
        return React.createElement("form", { onSubmit: this.saveType.bind(this) },
            React.createElement("div", { role: "group" },
                React.createElement("label", { htmlFor: "txtName" }, "Name"),
                React.createElement("input", { type: "text", id: "txtName", value: this.state.name, onChange: this.nameChanged.bind(this) })),
            React.createElement("div", { role: "group" },
                React.createElement("label", { htmlFor: "inColor" }, "Color"),
                React.createElement("input", { type: "color", id: "inColor", value: this.state.color, onChange: this.colorChanged.bind(this) })),
            React.createElement("div", { role: "group" },
                React.createElement("label", { htmlFor: "txtWidth" }, "Width"),
                React.createElement("input", { type: "number", id: "txtWidth", value: width, onChange: this.widthChanged.bind(this) })),
            React.createElement("div", { role: "group" },
                React.createElement("label", { htmlFor: "txtStartWidth" }, "Start width"),
                React.createElement("input", { type: "number", id: "txtStartWidth", value: startWidth, onChange: this.startWidthChanged.bind(this) })),
            React.createElement("div", { role: "group" },
                React.createElement("label", { htmlFor: "txtEndWidth" }, "End width"),
                React.createElement("input", { type: "number", id: "txtEndWidth", value: endWidth, onChange: this.endWidthChanged.bind(this) })),
            React.createElement("div", { role: "group" },
                React.createElement("label", { htmlFor: "selCurviture" }, "Curviture"),
                React.createElement("select", { id: "selCurviture", value: curviture, onChange: this.curvitureChanged.bind(this) },
                    React.createElement("option", { value: "1" }, "High"),
                    React.createElement("option", { value: "0.5" }, "Medium"),
                    React.createElement("option", { value: "0.2" }, "Low"),
                    React.createElement("option", { value: "0" }, "None"))),
            React.createElement("div", { role: "group" },
                React.createElement("button", { type: "submit" }, "Save type"),
                React.createElement("button", { type: "button", onClick: this.cancelEdit.bind(this) }, "Cancel"),
                deleteButton));
    };
    LineTypeEditor.prototype.nameChanged = function (e) {
        this.setState({
            name: e.target.value
        });
    };
    LineTypeEditor.prototype.colorChanged = function (e) {
        this.setState({
            color: e.target.value
        });
    };
    LineTypeEditor.prototype.widthChanged = function (e) {
        this.setState({
            width: parseInt(e.target.value),
        });
    };
    LineTypeEditor.prototype.startWidthChanged = function (e) {
        this.setState({
            startWidth: parseInt(e.target.value),
        });
    };
    LineTypeEditor.prototype.endWidthChanged = function (e) {
        this.setState({
            endWidth: parseInt(e.target.value),
        });
    };
    LineTypeEditor.prototype.curvitureChanged = function (e) {
        this.setState({
            curviture: parseFloat(e.target.value),
        });
    };
    LineTypeEditor.prototype.saveType = function (e) {
        e.preventDefault();
        var name = this.state.name.trim();
        var color = this.state.color;
        if (name == '' || color == '')
            return;
        var changedCurviture = undefined;
        var editType = this.props.editingType;
        var lineTypes = this.props.lineTypes.slice();
        if (editType === undefined) {
            var erosionAmount = 0.2, adjacentErosionDistance = 1, canErodeBelowSeaLevel = false, positionMode = 0 /* Random */; // TODO: allow editing these
            lineTypes.push(new LineType(name, color, this.state.width, this.state.startWidth, this.state.endWidth, this.state.curviture, erosionAmount, adjacentErosionDistance, canErodeBelowSeaLevel, positionMode));
        }
        else {
            if (editType.curviture != this.state.curviture)
                changedCurviture = editType;
            editType.name = name;
            editType.color = color;
            editType.width = this.state.width;
            editType.startWidth = this.state.startWidth;
            editType.endWidth = this.state.endWidth;
            editType.curviture = this.state.curviture;
        }
        this.props.updateLineTypes(lineTypes, changedCurviture);
    };
    LineTypeEditor.prototype.cancelEdit = function () {
        this.props.updateLineTypes(this.props.lineTypes);
    };
    LineTypeEditor.prototype.deleteType = function () {
        var lineTypes = this.props.lineTypes.slice();
        if (this.props.editingType !== undefined) {
            var pos = lineTypes.indexOf(this.props.editingType);
            lineTypes.splice(pos, 1);
        }
        this.props.updateLineTypes(lineTypes);
    };
    return LineTypeEditor;
}(React.Component));
var LineEditor = (function (_super) {
    __extends(LineEditor, _super);
    function LineEditor() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.hasDragged = false;
        return _this;
    }
    LineEditor.prototype.componentWillMount = function () {
        this.setState({
            type: this.props.line.type,
        });
    };
    LineEditor.prototype.render = function () {
        var deleteButton = React.createElement("button", { type: "button", onClick: this.deleteLine.bind(this) }, "Delete line");
        var notMultiplePoints = this.props.line.keyCells.length <= 1;
        return React.createElement("form", { onSubmit: this.saveType.bind(this) },
            React.createElement("p", null, "Click the map to add points to the current line. Existing points can be dragged around the map."),
            React.createElement("div", { role: "group" },
                React.createElement("label", { htmlFor: "ddlType" }, "Line Type"),
                React.createElement("select", { value: this.props.lineTypes.indexOf(this.state.type).toString(), onChange: this.typeChanged.bind(this) }, this.props.lineTypes.map(function (type, id) {
                    return React.createElement("option", { key: id.toString(), value: id.toString() }, type.name);
                }))),
            React.createElement("div", { role: "group" },
                React.createElement("button", { type: "button", disabled: notMultiplePoints, onClick: this.removeFirst.bind(this) }, "Remove start point"),
                React.createElement("button", { type: "button", disabled: notMultiplePoints, onClick: this.removeLast.bind(this) }, "Remove end point")),
            React.createElement("div", { role: "group" },
                React.createElement("button", { type: "submit" }, "Save line"),
                deleteButton));
    };
    LineEditor.prototype.typeChanged = function (e) {
        this.setState({
            type: this.props.lineTypes[e.target.value],
        });
    };
    LineEditor.prototype.saveType = function (e) {
        e.preventDefault();
        this.props.line.type = this.state.type;
        this.props.lineEdited();
        this.props.close();
    };
    LineEditor.prototype.deleteLine = function () {
        this.props.deleteLine();
    };
    LineEditor.prototype.removeFirst = function () {
        this.props.line.keyCells.splice(0, 1);
        this.props.line.updateRenderPoints();
        this.props.lineEdited();
    };
    LineEditor.prototype.removeLast = function () {
        this.props.line.keyCells.splice(this.props.line.keyCells.length - 1, 1);
        this.props.line.updateRenderPoints();
        this.props.lineEdited();
    };
    LineEditor.prototype.getKeyIndexAt = function (cell) {
        var cells = this.props.line.keyCells;
        for (var i = 0; i < cells.length; i++)
            if (cells[i] == cell)
                return i;
        return undefined;
    };
    LineEditor.prototype.mouseUp = function (cell) {
        if (!this.hasDragged) {
            // add control point to existing line, if we weren't dragging
            this.props.line.keyCells.push(cell);
            this.props.line.updateRenderPoints();
            this.props.lineEdited();
            this.hasDragged = false;
        }
        this.draggingCellIndex = undefined;
    };
    LineEditor.prototype.mouseDown = function (cell) {
        this.draggingCellIndex = this.getKeyIndexAt(cell);
        this.hasDragged = false;
    };
    LineEditor.prototype.mouseEnter = function (cell) {
        // change a line's key cells by dragging them
        if (this.draggingCellIndex !== undefined) {
            this.hasDragged = true;
            this.props.line.keyCells[this.draggingCellIndex] = cell;
            this.props.line.updateRenderPoints();
            this.props.lineEdited();
        }
    };
    return LineEditor;
}(React.Component));
var LinesEditor = (function (_super) {
    __extends(LinesEditor, _super);
    function LinesEditor(props) {
        var _this = _super.call(this, props) || this;
        _this.lineEditor = null;
        _this.state = {
            isEditingLineType: false,
            selectedLineType: props.lineTypes[0],
        };
        return _this;
    }
    LinesEditor.prototype.componentDidUpdate = function (prevProps, prevState) {
        if (this.state.selectedLineType !== undefined && this.props.lineTypes.indexOf(this.state.selectedLineType) == -1) {
            this.setState(function (prevState) {
                return {
                    isEditingLineType: prevState.isEditingLineType,
                    selectedLineType: this.props.lineTypes[0],
                };
            });
        }
    };
    LinesEditor.prototype.render = function () {
        var _this = this;
        if (this.state.isEditingLineType)
            return React.createElement(LineTypeEditor, { editingType: this.state.selectedLineType, lineTypes: this.props.lineTypes, updateLineTypes: this.lineTypesChanged.bind(this) });
        else if (this.props.selectedLine !== undefined)
            return React.createElement(LineEditor, { line: this.props.selectedLine, lineTypes: this.props.lineTypes, lineEdited: this.lineEdited.bind(this), deleteLine: this.deleteLine.bind(this), close: this.closeLineEditor.bind(this), ref: function (c) { return _this.lineEditor = c; } });
        var that = this;
        return React.createElement("form", null,
            React.createElement("p", null, "Select a line type to draw onto the map, then click cells to draw it. Double click/tap on a line type to edit it."),
            React.createElement("div", { className: "palleteList" }, this.props.lineTypes.map(function (type, id) {
                var classes = type == that.state.selectedLineType ? 'selected' : undefined;
                return React.createElement("div", { key: id.toString(), className: classes, style: { 'backgroundColor': type.color }, onClick: that.selectLineType.bind(that, type), onDoubleClick: that.showLineTypeEdit.bind(that, type) }, type.name);
            })),
            React.createElement("div", { role: "group", className: "vertical" },
                React.createElement("button", { type: "button", onClick: this.showLineTypeEdit.bind(this, undefined) }, "Add new type")));
    };
    LinesEditor.prototype.selectLineType = function (type) {
        this.setState({
            isEditingLineType: false,
            selectedLineType: type,
        });
    };
    LinesEditor.prototype.showLineTypeEdit = function (type) {
        this.setState({
            isEditingLineType: true,
            selectedLineType: type,
        });
    };
    LinesEditor.prototype.lineTypesChanged = function (lineTypes, recalculateType) {
        // if a type's curviture has changed, recalculate all lines of that type
        if (recalculateType !== undefined)
            for (var _i = 0, _a = this.props.lines; _i < _a.length; _i++) {
                var line = _a[_i];
                if (line.type == recalculateType)
                    line.updateRenderPoints();
            }
        this.setState({
            isEditingLineType: false,
        });
        this.props.updateLineTypes(lineTypes);
    };
    LinesEditor.prototype.closeLineEditor = function () {
        this.props.lineSelected(undefined);
    };
    LinesEditor.prototype.lineEdited = function () {
        this.props.updateLines(this.props.lines);
    };
    LinesEditor.prototype.deleteLine = function () {
        if (this.props.selectedLine === undefined)
            return;
        var lines = this.props.lines.slice();
        var pos = lines.indexOf(this.props.selectedLine);
        lines.splice(pos, 1);
        this.props.updateLines(lines);
        this.closeLineEditor();
    };
    LinesEditor.prototype.createNewLine = function (cell) {
        if (this.state.isEditingLineType)
            return;
        var line = MapLine.getByCell(cell, this.props.lines);
        if (line !== undefined) {
            this.props.lineSelected(line);
            return;
        }
        if (this.state.selectedLineType === undefined)
            return;
        var lines = this.props.lines.slice();
        // create new line, currently with only one point
        line = new MapLine(this.state.selectedLineType);
        line.keyCells.push(cell);
        lines.push(line);
        this.props.lineSelected(line);
        this.props.updateLines(lines);
    };
    LinesEditor.prototype.mouseDown = function (cell) {
        if (this.lineEditor !== null)
            this.lineEditor.mouseDown(cell);
    };
    LinesEditor.prototype.mouseUp = function (cell) {
        if (this.lineEditor !== null)
            this.lineEditor.mouseUp(cell);
        else
            this.createNewLine(cell);
    };
    LinesEditor.prototype.mouseEnter = function (cell) {
        if (this.lineEditor !== null)
            this.lineEditor.mouseEnter(cell);
    };
    LinesEditor.prototype.replacingMap = function (map) {
        if (this.state.selectedLineType !== undefined) {
            var index = this.props.lineTypes.indexOf(this.state.selectedLineType);
            var lineType = map.lineTypes[index];
            this.setState({
                isEditingLineType: this.state.isEditingLineType && lineType !== undefined,
                selectedLineType: lineType,
            });
        }
    };
    return LinesEditor;
}(React.Component));
var LocationTypeEditor = (function (_super) {
    __extends(LocationTypeEditor, _super);
    function LocationTypeEditor() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    LocationTypeEditor.prototype.componentWillMount = function () {
        if (this.props.editingType === undefined)
            this.setState({
                name: '',
                textSize: 18,
                textColor: '#000000',
                icon: 'smBlack',
            });
        else
            this.setState({
                name: this.props.editingType.name,
                textSize: this.props.editingType.textSize,
                textColor: this.props.editingType.textColor,
                icon: this.props.editingType.icon,
                minDrawCellRadius: this.props.editingType.minDrawCellRadius,
            });
    };
    LocationTypeEditor.prototype.render = function () {
        var deleteButton = this.props.editingType === undefined || this.props.locationTypes.length < 2 ? undefined : React.createElement("button", { type: "button", onClick: this.deleteType.bind(this) }, "Delete");
        return React.createElement("form", { onSubmit: this.saveType.bind(this) },
            React.createElement("div", { role: "group" },
                React.createElement("label", { htmlFor: "txtName" }, "Name"),
                React.createElement("input", { type: "text", id: "txtName", value: this.state.name, onChange: this.nameChanged.bind(this) })),
            React.createElement("div", { role: "group" },
                React.createElement("label", { htmlFor: "txtSize" }, "Text Size"),
                React.createElement("input", { type: "number", id: "txtSize", value: this.state.textSize === undefined ? '' : this.state.textSize.toString(), onChange: this.textSizeChanged.bind(this) })),
            React.createElement("div", { role: "group" },
                React.createElement("label", { htmlFor: "inColor" }, "Color"),
                React.createElement("input", { type: "color", id: "inColor", value: this.state.textColor, onChange: this.colorChanged.bind(this) })),
            React.createElement("div", { role: "group" },
                React.createElement("label", { htmlFor: "ddlIcon" }, "Icon"),
                React.createElement("select", { id: "ddlIcon", value: this.state.icon, onChange: this.iconChanged.bind(this) }, Object.keys(MapLocation.icons).map(function (key) {
                    var icon = MapLocation.icons[key];
                    return React.createElement("option", { key: key, value: key }, icon.name);
                }))),
            React.createElement("div", { role: "group" },
                React.createElement("label", { htmlFor: "minDrawRadius" }, "Threshold"),
                React.createElement("input", { type: "number", id: "minDrawRadius", value: this.state.minDrawCellRadius === undefined ? '' : this.state.minDrawCellRadius.toString(), onChange: this.minDrawRadiusChanged.bind(this) })),
            React.createElement("div", { role: "group" },
                React.createElement("button", { type: "submit" }, "Save type"),
                React.createElement("button", { type: "button", onClick: this.cancelEdit.bind(this) }, "Cancel"),
                deleteButton));
    };
    LocationTypeEditor.prototype.nameChanged = function (e) {
        this.setState({
            name: e.target.value
        });
    };
    LocationTypeEditor.prototype.colorChanged = function (e) {
        this.setState({
            textColor: e.target.value
        });
    };
    LocationTypeEditor.prototype.textSizeChanged = function (e) {
        this.setState({
            textSize: e.target.value
        });
    };
    LocationTypeEditor.prototype.iconChanged = function (e) {
        this.setState({
            icon: e.target.value
        });
    };
    LocationTypeEditor.prototype.minDrawRadiusChanged = function (e) {
        this.setState({
            minDrawCellRadius: e.target.value
        });
    };
    LocationTypeEditor.prototype.saveType = function (e) {
        e.preventDefault();
        var name = this.state.name.trim();
        if (name == '')
            return;
        var textSize = this.state.textSize;
        if (textSize <= 0)
            return;
        var textColor = this.state.textColor;
        if (textColor == '')
            return;
        var icon = this.state.icon;
        if (icon == '')
            return;
        var minDrawRadius = this.state.minDrawCellRadius;
        if (minDrawRadius !== undefined && minDrawRadius < 0)
            return;
        var editType = this.props.editingType;
        var locationTypes = this.props.locationTypes.slice();
        if (editType === undefined) {
            var minDistanceToOther = 3; // TODO: allow editing of this
            locationTypes.push(new LocationType(name, textSize, textColor, icon, minDistanceToOther, minDrawRadius));
        }
        else {
            editType.name = name;
            editType.textSize = textSize;
            editType.textColor = textColor;
            editType.icon = icon;
            editType.minDrawCellRadius = minDrawRadius;
        }
        this.props.updateLocationTypes(locationTypes);
    };
    LocationTypeEditor.prototype.cancelEdit = function () {
        this.props.updateLocationTypes(this.props.locationTypes);
    };
    LocationTypeEditor.prototype.deleteType = function () {
        var locationTypes = this.props.locationTypes.slice();
        if (this.props.editingType !== undefined) {
            var pos = locationTypes.indexOf(this.props.editingType);
            locationTypes.splice(pos, 1);
        }
        this.props.updateLocationTypes(locationTypes);
    };
    return LocationTypeEditor;
}(React.Component));
var LocationEditor = (function (_super) {
    __extends(LocationEditor, _super);
    function LocationEditor() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    LocationEditor.prototype.componentWillMount = function () {
        var loc = this.props.selectedLocation;
        this.setState({
            name: loc.name,
            type: loc.type,
        });
    };
    LocationEditor.prototype.componentWillReceiveProps = function (nextProps) {
        var loc = nextProps.selectedLocation;
        this.setState({
            name: loc.name,
            type: loc.type,
        });
    };
    LocationEditor.prototype.render = function () {
        var cancelButton = this.props.isNew ? undefined : React.createElement("button", { type: "button", onClick: this.cancelEdit.bind(this) }, "Cancel");
        var that = this;
        return React.createElement("form", { onSubmit: this.saveLocation.bind(this) },
            React.createElement("div", { role: "group" },
                React.createElement("label", { htmlFor: "txtName" }, "Name"),
                React.createElement("input", { type: "text", id: "txtName", value: this.state.name, onChange: this.nameChanged.bind(this) })),
            React.createElement("div", { role: "group" },
                React.createElement("label", { htmlFor: "ddlType" }, "Type"),
                React.createElement("select", { value: this.props.locationTypes.indexOf(this.state.type).toString(), onChange: this.typeChanged.bind(this) }, this.props.locationTypes.map(function (type, id) {
                    return React.createElement("option", { key: id.toString(), value: id.toString() }, type.name);
                }))),
            React.createElement("div", { role: "group" },
                React.createElement("button", { type: "submit" }, "Save location"),
                cancelButton,
                React.createElement("button", { type: "button", onClick: this.deleteType.bind(this) }, "Delete")));
    };
    LocationEditor.prototype.nameChanged = function (e) {
        this.setState({
            name: e.target.value,
            type: this.state.type,
        });
    };
    LocationEditor.prototype.typeChanged = function (e) {
        this.setState({
            name: this.state.name,
            type: this.props.locationTypes[e.target.value],
        });
    };
    LocationEditor.prototype.saveLocation = function (e) {
        e.preventDefault();
        var name = this.state.name === undefined ? '' : this.state.name.trim();
        if (name == '')
            return;
        var editLocation = this.props.selectedLocation;
        editLocation.name = name;
        editLocation.type = this.state.type;
        var locations;
        var pos = this.props.locations.indexOf(editLocation);
        if (pos == -1) {
            locations = this.props.locations.slice();
            locations.push(editLocation);
        }
        else
            locations = this.props.locations;
        this.props.updateLocations(locations);
    };
    LocationEditor.prototype.cancelEdit = function () {
        this.props.updateLocations(this.props.locations);
    };
    LocationEditor.prototype.deleteType = function () {
        var locationTypes = this.props.locations.slice();
        var pos = locationTypes.indexOf(this.props.selectedLocation);
        if (pos != -1)
            locationTypes.splice(pos, 1);
        this.props.updateLocations(locationTypes);
    };
    return LocationEditor;
}(React.Component));
var LocationsEditor = (function (_super) {
    __extends(LocationsEditor, _super);
    function LocationsEditor(props) {
        var _this = _super.call(this, props) || this;
        _this.state = {
            isEditingLocation: false,
            isEditingLocationType: false,
            isNewLocation: false,
            selectedLocationType: props.locationTypes[0],
        };
        return _this;
    }
    LocationsEditor.prototype.componentDidUpdate = function (prevProps, prevState) {
        if (this.state.selectedLocationType !== undefined && this.props.locationTypes.indexOf(this.state.selectedLocationType) == -1) {
            this.setState(function (prevState) {
                return {
                    isEditingLocationType: false,
                    isNewLocation: false,
                    selectedLocationType: this.props.locationTypes[0],
                };
            });
        }
    };
    LocationsEditor.prototype.componentWillReceiveProps = function (newProps) {
        if (this.state.selectedLocationType !== undefined && newProps.locationTypes.indexOf(this.state.selectedLocationType) == -1)
            this.setState(function (prevState) {
                return {
                    isEditingLocationType: false,
                    isNewLocation: false,
                    selectedLocationType: newProps.locationTypes[0],
                };
            });
    };
    LocationsEditor.prototype.render = function () {
        if (this.state.isEditingLocationType)
            return React.createElement(LocationTypeEditor, { editingType: this.state.selectedLocationType, locationTypes: this.props.locationTypes, updateLocationTypes: this.locationTypesChanged.bind(this) });
        if (this.state.isEditingLocation && this.state.selectedLocation !== undefined)
            return React.createElement(LocationEditor, { selectedLocation: this.state.selectedLocation, isNew: this.state.isNewLocation, locations: this.props.locations, locationTypes: this.props.locationTypes, updateLocations: this.locationChanged.bind(this) });
        var that = this;
        return React.createElement("form", null,
            React.createElement("p", null, "Select a location type to place onto the map. Double click/tap on a terrain type to edit it."),
            React.createElement("div", { className: "palleteList" }, this.props.locationTypes.map(function (type, id) {
                var classes = type == that.state.selectedLocationType ? 'selected' : undefined;
                return React.createElement("div", { key: id.toString(), className: classes, onClick: that.selectLocationType.bind(that, type), onDoubleClick: that.showTypeEditor.bind(that, type) }, type.name);
            })),
            React.createElement("div", { role: "group", className: "vertical" },
                React.createElement("button", { type: "button", onClick: this.showTypeEditor.bind(this, undefined) }, "Add new type")));
    };
    LocationsEditor.prototype.selectLocationType = function (type) {
        this.setState({
            isEditingLocationType: false,
            isEditingLocation: false,
            isNewLocation: false,
            selectedLocationType: type,
        });
    };
    LocationsEditor.prototype.showTypeEditor = function (type) {
        this.setState({
            isEditingLocationType: true,
            isEditingLocation: false,
            isNewLocation: false,
            selectedLocationType: type,
        });
    };
    LocationsEditor.prototype.locationTypesChanged = function (types) {
        this.setState({
            isEditingLocationType: false,
            isEditingLocation: false,
            isNewLocation: false,
        });
        this.props.typesChanged(types);
    };
    LocationsEditor.prototype.locationChanged = function (locations) {
        this.setState({
            isEditingLocationType: false,
            isEditingLocation: false,
            isNewLocation: false,
        });
        this.props.locationsChanged(locations);
    };
    LocationsEditor.prototype.mouseUp = function (cell) {
        var locations = this.props.locations;
        var loc = MapLocation.getByCell(cell, locations);
        var isNew;
        if (loc === undefined) {
            loc = new MapLocation(cell, 'New ' + this.state.selectedLocationType.name, this.state.selectedLocationType);
            isNew = true;
            locations.push(loc);
            this.props.locationsChanged(locations);
        }
        else
            isNew = false;
        this.setState({
            isEditingLocationType: false,
            isEditingLocation: true,
            isNewLocation: isNew,
            selectedLocation: loc,
        });
    };
    LocationsEditor.prototype.replacingMap = function (map) {
        var locationType;
        var editingType = this.state.isEditingLocationType;
        if (this.state.selectedLocationType !== undefined) {
            var index = this.props.locationTypes.indexOf(this.state.selectedLocationType);
            locationType = map.locationTypes[index];
        }
        if (locationType === undefined) {
            locationType = map.locationTypes[0];
            editingType = false;
        }
        var location;
        var editingLocation = this.state.isEditingLocation;
        if (this.state.selectedLocation !== undefined) {
            var index = this.props.locations.indexOf(this.state.selectedLocation);
            location = map.locations[index];
        }
        if (location === undefined)
            editingLocation = false;
        this.setState({
            isEditingLocationType: editingType,
            isEditingLocation: editingLocation,
            selectedLocationType: locationType,
        });
    };
    return LocationsEditor;
}(React.Component));
var GenerationEditor = (function (_super) {
    __extends(GenerationEditor, _super);
    function GenerationEditor() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    GenerationEditor.prototype.render = function () {
        var showHide = this.props.showingSettings
            ? React.createElement("button", { type: "button", onClick: this.showSettings.bind(this, false) }, "Close settings")
            : React.createElement("button", { type: "button", onClick: this.showSettings.bind(this, true) }, "Edit settings");
        return React.createElement("form", { onSubmit: this.generate.bind(this) },
            React.createElement("p", null, "Each cell type has value for its associated height, temperature and precipitation. These are used to decide what type to use for each cell."),
            React.createElement("p", null, "A number of settings are available to control the height, temperature and precipitation of the generated map."),
            React.createElement("p", null, "For now the whole map will be generated, but in the future you might be able to only generate over empty cells."),
            React.createElement("div", { role: "group", className: "vertical" },
                showHide,
                React.createElement("button", { type: "submit" }, "Generate map using settings"),
                React.createElement("button", { type: "button", onClick: this.randomizeSettings.bind(this) }, "Randomize settings & generate")));
    };
    GenerationEditor.prototype.componentWillUnmount = function () {
        this.props.showSettings(false);
    };
    GenerationEditor.prototype.showSettings = function (show) {
        this.props.showSettings(show);
    };
    GenerationEditor.prototype.randomizeSettings = function () {
        this.props.settings.randomize();
        this.props.settingsChanged();
        MapGenerator.generate(this.props.map, this.props.settings);
        this.props.mapChanged();
        this.props.showSettings(false);
    };
    GenerationEditor.prototype.generate = function (e) {
        e.preventDefault();
        MapGenerator.generate(this.props.map, this.props.settings);
        this.props.mapChanged();
        this.props.showSettings(false);
    };
    return GenerationEditor;
}(React.Component));
var GenerationSettingsEditor = (function (_super) {
    __extends(GenerationSettingsEditor, _super);
    function GenerationSettingsEditor(props) {
        var _this = _super.call(this, props) || this;
        _this.state = {
            activeSection: 0 /* Overview */,
            selectingCoastGuide: false,
            selectingHeightGuide: false,
            selectingTemperatureGuide: false,
            selectingPrecipitationGuide: false,
        };
        return _this;
    }
    GenerationSettingsEditor.prototype.render = function () {
        var section;
        var heading;
        var prevNextBack = React.createElement("div", null,
            React.createElement("button", { onClick: this.selectSection.bind(this, 0 /* Overview */) }, "Back to Overview"),
            React.createElement("button", { onClick: this.selectSection.bind(this, this.state.activeSection - 1) }, "Previous section"),
            React.createElement("button", { onClick: this.selectSection.bind(this, this.state.activeSection + 1) }, "Next section"));
        switch (this.state.activeSection) {
            case 1 /* Coastline */:
                heading = 'Coastline';
                section = this.renderCoastline();
                break;
            case 2 /* Terrain */:
                heading = 'Terrain';
                section = this.renderTerrain();
                break;
            default:
                heading = 'Overview';
                section = this.renderOverview();
                prevNextBack = undefined;
                break;
        }
        return React.createElement("div", { id: "settingsRoot" },
            React.createElement("h1", null, heading),
            section,
            prevNextBack);
    };
    GenerationSettingsEditor.prototype.renderOverview = function () {
        return React.createElement("div", { className: "section", role: "group" },
            React.createElement("p", null,
                "The different aspects of terrain generation can all be configured; select one to change its settings.",
                React.createElement("br", null),
                "Note that the steps below are listed in the order they are applied during generation."),
            React.createElement("ol", null,
                React.createElement("li", null,
                    React.createElement("button", { onClick: this.selectSection.bind(this, 1 /* Coastline */) }, "Coastline")),
                React.createElement("li", null,
                    React.createElement("button", { onClick: this.selectSection.bind(this, 2 /* Terrain */) }, "Terrain"))));
    };
    GenerationSettingsEditor.prototype.selectSection = function (section) {
        this.setState({
            activeSection: section,
        });
    };
    GenerationSettingsEditor.prototype.renderCoastline = function () {
        var guide = this.state.selectingHeightGuide
            ? this.renderGuideSelection(this.props.settings.coastGuide, this.coastGuideSelected.bind(this), 'Coast', 'outline of generated terrain')
            : React.createElement("div", { className: "palleteList" },
                React.createElement(GuideView, { guide: this.props.settings.coastGuide, onClick: this.showCoastGuideSelection.bind(this) }));
        return React.createElement("div", { className: "section", role: "group" },
            guide,
            React.createElement("p", null, "Fine tune the coast outline by changing the sea level, and controlling how much low and high frequency noise are applied to the coastline."),
            React.createElement("div", { role: "group" },
                React.createElement("div", { className: "fieldLabel" }, "Sea level"),
                React.createElement("input", { type: "range", value: this.props.settings.seaLevel.toString(), onChange: this.seaLevelChanged.bind(this), step: "0.01", min: "0", max: "1" })),
            React.createElement("div", { role: "group" },
                React.createElement("div", { className: "fieldLabel" }, "Low frequency"),
                React.createElement("input", { type: "range", value: this.props.settings.coastNoiseLowFreq.toString(), onChange: this.lowFreqCoastScaleChanged.bind(this), step: "0.1", min: "0", max: "5" })),
            React.createElement("div", { role: "group" },
                React.createElement("div", { className: "fieldLabel" }, "High frequency"),
                React.createElement("input", { type: "range", value: this.props.settings.coastNoiseHighFreq.toString(), onChange: this.highFreqCoastScaleChanged.bind(this), step: "0.1", min: "0", max: "5" })));
    };
    GenerationSettingsEditor.prototype.renderTerrain = function () {
        var height = this.state.selectingHeightGuide
            ? this.renderGuideSelection(this.props.settings.heightGuide, this.heightGuideSelected.bind(this), 'Height', 'shape of generated terrain')
            : React.createElement(GenerationField, { name: "Height", guide: this.props.settings.heightGuide, minValue: this.props.settings.minHeight, maxValue: this.props.settings.maxHeight, guideScale: this.props.settings.heightScaleGuide, lowFreqScale: this.props.settings.heightScaleLowFreq, highFreqScale: this.props.settings.heightScaleHighFreq, showGuideSelection: this.showHeightGuideSelection.bind(this), changed: this.heightChanged.bind(this) });
        var temperature = this.state.selectingTemperatureGuide
            ? this.renderGuideSelection(this.props.settings.temperatureGuide, this.temperatureGuideSelected.bind(this), 'Temperature of generated terrain')
            : React.createElement(GenerationField, { name: "Temperature", guide: this.props.settings.temperatureGuide, minValue: this.props.settings.minTemperature, maxValue: this.props.settings.maxTemperature, guideScale: this.props.settings.temperatureScaleGuide, lowFreqScale: this.props.settings.temperatureScaleLowFreq, highFreqScale: this.props.settings.temperatureScaleHighFreq, showGuideSelection: this.showTemperatureGuideSelection.bind(this), changed: this.temperatureChanged.bind(this) });
        var precipitation = this.state.selectingPrecipitationGuide
            ? this.renderGuideSelection(this.props.settings.precipitationGuide, this.precipitationGuideSelected.bind(this), 'Precipitation', 'rainfall / humidity of generated terrain')
            : React.createElement(GenerationField, { name: "Precipitation", guide: this.props.settings.precipitationGuide, minValue: this.props.settings.minPrecipitation, maxValue: this.props.settings.maxPrecipitation, guideScale: this.props.settings.precipitationScaleGuide, lowFreqScale: this.props.settings.precipitationScaleLowFreq, highFreqScale: this.props.settings.precipitationScaleHighFreq, showGuideSelection: this.showPrecipitationGuideSelection.bind(this), changed: this.precipitationChanged.bind(this) });
        return React.createElement("div", { className: "section multiple", role: "group" },
            height,
            temperature,
            precipitation);
    };
    GenerationSettingsEditor.prototype.renderGuideSelection = function (selectedValue, onSelected, propertyName, propertyEffects) {
        if (propertyEffects === void 0) { propertyEffects = propertyName.toLowerCase() + ' of generated terrain'; }
        var intro = "Select a " + propertyName.toLowerCase() + " guide, which controls the overall " + propertyEffects + ".";
        return React.createElement("div", null,
            React.createElement("h2", null, propertyName),
            React.createElement("p", null, intro),
            React.createElement("div", { className: "palleteList" }, Guides.scalarGuides.map(function (guide, id) {
                var classes = guide == selectedValue ? 'selected' : undefined;
                return React.createElement(GuideView, { guide: guide, key: id.toString(), className: classes, onClick: onSelected });
            })));
    };
    GenerationSettingsEditor.prototype.showCoastGuideSelection = function (guide) {
        this.setState({
            selectingCoastGuide: true,
        });
    };
    GenerationSettingsEditor.prototype.coastGuideSelected = function (guide) {
        this.props.settings.coastGuide = guide;
        this.props.settingsChanged();
        this.setState({
            selectingCoastGuide: false,
        });
    };
    GenerationSettingsEditor.prototype.showHeightGuideSelection = function (guide) {
        this.setState({
            selectingHeightGuide: true,
        });
    };
    GenerationSettingsEditor.prototype.heightGuideSelected = function (guide) {
        this.props.settings.heightGuide = guide;
        this.props.settingsChanged();
        this.setState({
            selectingHeightGuide: false,
        });
    };
    GenerationSettingsEditor.prototype.showTemperatureGuideSelection = function (guide) {
        this.setState({
            selectingTemperatureGuide: true,
        });
    };
    GenerationSettingsEditor.prototype.temperatureGuideSelected = function (guide) {
        this.props.settings.temperatureGuide = guide;
        this.props.settingsChanged();
        this.setState({
            selectingTemperatureGuide: false,
        });
    };
    GenerationSettingsEditor.prototype.showPrecipitationGuideSelection = function (guide) {
        this.setState({
            selectingPrecipitationGuide: true,
        });
    };
    GenerationSettingsEditor.prototype.precipitationGuideSelected = function (guide) {
        this.props.settings.precipitationGuide = guide;
        this.props.settingsChanged();
        this.setState({
            selectingPrecipitationGuide: false,
        });
    };
    GenerationSettingsEditor.prototype.seaLevelChanged = function (e) {
        var val = parseFloat(e.target.value);
        this.props.settings.seaLevel = val;
        this.props.settingsChanged();
    };
    GenerationSettingsEditor.prototype.lowFreqCoastScaleChanged = function (e) {
        var val = parseFloat(e.target.value);
        this.props.settings.coastNoiseLowFreq = val;
        this.props.settingsChanged();
    };
    GenerationSettingsEditor.prototype.highFreqCoastScaleChanged = function (e) {
        var val = parseFloat(e.target.value);
        this.props.settings.coastNoiseHighFreq = val;
        this.props.settingsChanged();
    };
    GenerationSettingsEditor.prototype.heightChanged = function (minValue, maxValue, guideScale, lowFreqScale, highFreqScale) {
        var settings = this.props.settings;
        settings.minHeight = minValue;
        settings.maxHeight = maxValue;
        settings.heightScaleGuide = guideScale;
        settings.heightScaleLowFreq = lowFreqScale;
        settings.heightScaleHighFreq = highFreqScale;
        this.props.settingsChanged();
        this.setState({
            selectingHeightGuide: false,
        });
    };
    GenerationSettingsEditor.prototype.temperatureChanged = function (minValue, maxValue, guideScale, lowFreqScale, highFreqScale) {
        var settings = this.props.settings;
        settings.minTemperature = minValue;
        settings.maxTemperature = maxValue;
        settings.temperatureScaleGuide = guideScale;
        settings.temperatureScaleLowFreq = lowFreqScale;
        settings.temperatureScaleHighFreq = highFreqScale;
        this.props.settingsChanged();
        this.setState({
            selectingTemperatureGuide: false,
        });
    };
    GenerationSettingsEditor.prototype.precipitationChanged = function (minValue, maxValue, guideScale, lowFreqScale, highFreqScale) {
        var settings = this.props.settings;
        settings.minPrecipitation = minValue;
        settings.maxPrecipitation = maxValue;
        settings.precipitationScaleGuide = guideScale;
        settings.precipitationScaleLowFreq = lowFreqScale;
        settings.precipitationScaleHighFreq = highFreqScale;
        this.props.settingsChanged();
        this.setState({
            selectingPrecipitationGuide: false,
        });
    };
    return GenerationSettingsEditor;
}(React.Component));
var SaveLoad = (function () {
    function SaveLoad() {
    }
    SaveLoad.loadData = function (callback) {
        var identifier = SaveLoad.getQueryParam('id');
        if (identifier === undefined) {
            callback(null);
            return;
        }
        var url = SaveLoad.apiRoot + identifier;
        SaveLoad.getAjax(url, callback);
        // local storage of single map file
        //callback(window.localStorage.getItem(SaveLoad.localStorageName));
    };
    SaveLoad.saveData = function (dataJson, callback) {
        var identifier = SaveLoad.getQueryParam('id');
        var url = identifier === undefined ? SaveLoad.apiRoot + 'new' : SaveLoad.apiRoot + 'update/' + identifier;
        var dataObj = { snippet: dataJson };
        SaveLoad.postAjax(url, JSON.stringify(dataObj), function (data) {
            if (identifier === undefined) {
                identifier = JSON.parse(data).id;
                url = window.location.href.split('?')[0] + '?id=' + identifier;
                window.history.pushState(identifier, document.title, url);
            }
            callback(true);
        });
        // local storage of single map file
        //window.localStorage.setItem(SaveLoad.localStorageName, dataJson);
    };
    SaveLoad.clearSaved = function () {
        window.localStorage.removeItem(SaveLoad.localStorageName);
    };
    SaveLoad.getQueryParam = function (name) {
        if (SaveLoad.queryParams === undefined) {
            SaveLoad.queryParams = {};
            var vars = window.location.search.substring(1).split('&');
            for (var i = 0; i < vars.length; i++) {
                var pair = vars[i].split('=');
                SaveLoad.queryParams[pair[0]] = pair[1];
            }
        }
        return SaveLoad.queryParams[name];
    };
    SaveLoad.getAjax = function (url, success) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.onreadystatechange = function () {
            if (xhr.readyState > 3 && xhr.status == 200)
                success(xhr.responseText);
        };
        xhr.send();
        return xhr;
    };
    SaveLoad.postAjax = function (url, data, success) {
        var params = typeof data == 'string' ? data : Object.keys(data).map(function (k) { return encodeURIComponent(k) + '=' + encodeURIComponent(data[k]); }).join('&');
        var xhr = new XMLHttpRequest();
        xhr.open('POST', url);
        xhr.onreadystatechange = function () {
            if (xhr.readyState > 3 && xhr.status == 200) {
                success(xhr.responseText);
            }
        };
        xhr.setRequestHeader('Content-Type', 'application/json'); //'application/x-www-form-urlencoded');
        xhr.send(params);
        return xhr;
    };
    return SaveLoad;
}());
SaveLoad.localStorageName = 'savedMap';
SaveLoad.apiRoot = 'https://jsonbin.io/b/';
SaveLoad.queryParams = undefined;
// based on http://cdnjs.cloudflare.com/ajax/libs/seedrandom/2.4.3/lib/alea.js
var Random = (function () {
    function Random(seed) {
        this.seed = seed;
        var mash = Random.mash();
        this.c = 1;
        this.s0 = mash(' ');
        this.s1 = mash(' ');
        this.s2 = mash(' ');
        this.s0 -= mash(seed);
        if (this.s0 < 0)
            this.s0 += 1;
        this.s1 -= mash(seed);
        if (this.s1 < 0)
            this.s1 += 1;
        this.s2 -= mash(seed);
        if (this.s2 < 0)
            this.s2 += 1;
    }
    Random.prototype.next = function () {
        var t = 2091639 * this.s0 + this.c * 2.3283064365386963e-10; // 2^-32
        this.s0 = this.s1;
        this.s1 = this.s2;
        return this.s2 = t - (this.c = t | 0);
    };
    Random.prototype.nextInt32 = function () {
        return (this.next() * 0x100000000) | 0;
    };
    Random.prototype.nextInRange = function (min, max) {
        return min + this.next() * (max - min);
    };
    Random.randomIntRange = function (minInclusive, maxExclusive) {
        return Math.floor(Random.randomRange(minInclusive, maxExclusive));
    };
    Random.randomRange = function (minInclusive, maxExclusive) {
        return minInclusive + Math.random() * (maxExclusive - minInclusive);
    };
    Random.mash = function () {
        var n = 0xefc8249d;
        var mash = function (data) {
            data = data.toString();
            for (var i = 0; i < data.length; i++) {
                n += data.charCodeAt(i);
                var h = 0.02519603282416938 * n;
                n = h >>> 0;
                h -= n;
                h *= n;
                n = h >>> 0;
                h -= n;
                n += h * 0x100000000; // 2^32
            }
            return (n >>> 0) * 2.3283064365386963e-10; // 2^-32
        };
        return mash;
    };
    return Random;
}());
// Adapted from https://gist.github.com/banksean/304522, which was in turn
// Ported from Stefan Gustavson's java implementation
// http://staffwww.itn.liu.se/~stegu/simplexnoise/simplexnoise.pdf
var SimplexNoise = (function () {
    function SimplexNoise() {
        var p = [];
        for (var i = 0; i < 256; i++)
            p[i] = i;
        this.shuffle(p);
        // To remove the need for index wrapping, double the permutation table length
        for (var i = 0; i < 256; i++)
            p[i + 256] = p[i];
        this.perm = p;
    }
    SimplexNoise.prototype.shuffle = function (array) {
        var j = 0, temp;
        for (var i = array.length - 1; i > 0; i -= 1) {
            j = Math.floor(Math.random() * (i + 1));
            temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
    };
    SimplexNoise.prototype.dot = function (gi, x, y) {
        var g = SimplexNoise.grad3[gi];
        return g[0] * x + g[1] * y;
    };
    SimplexNoise.prototype.noise = function (xin, yin) {
        var n0, n1, n2; // Noise contributions from the three corners
        // Skew the input space to determine which simplex cell we're in
        var F2 = 0.5 * (Math.sqrt(3.0) - 1.0);
        var s = (xin + yin) * F2; // Hairy factor for 2D
        var i = Math.floor(xin + s);
        var j = Math.floor(yin + s);
        var G2 = (3.0 - Math.sqrt(3.0)) / 6.0;
        var t = (i + j) * G2;
        var X0 = i - t; // Unskew the cell origin back to (x,y) space
        var Y0 = j - t;
        var x0 = xin - X0; // The x,y distances from the cell origin
        var y0 = yin - Y0;
        // For the 2D case, the simplex shape is an equilateral triangle.
        // Determine which simplex we are in.
        var i1, j1; // Offsets for second (middle) corner of simplex in (i,j) coords
        if (x0 > y0) {
            i1 = 1;
            j1 = 0; // lower triangle, XY order: (0,0)->(1,0)->(1,1)
        }
        else {
            i1 = 0;
            j1 = 1; // upper triangle, YX order: (0,0)->(0,1)->(1,1)
        }
        // A step of (1,0) in (i,j) means a step of (1-c,-c) in (x,y), and
        // a step of (0,1) in (i,j) means a step of (-c,1-c) in (x,y), where
        // c = (3-sqrt(3))/6
        var x1 = x0 - i1 + G2; // Offsets for middle corner in (x,y) unskewed coords
        var y1 = y0 - j1 + G2;
        var x2 = x0 - 1.0 + 2.0 * G2; // Offsets for last corner in (x,y) unskewed coords
        var y2 = y0 - 1.0 + 2.0 * G2;
        // Work out the hashed gradient indices of the three simplex corners
        var ii = i & 255;
        var jj = j & 255;
        var gi0 = this.perm[ii + this.perm[jj]] % 12;
        var gi1 = this.perm[ii + i1 + this.perm[jj + j1]] % 12;
        var gi2 = this.perm[ii + 1 + this.perm[jj + 1]] % 12;
        // Calculate the contribution from the three corners
        var t0 = 0.5 - x0 * x0 - y0 * y0;
        if (t0 < 0)
            n0 = 0.0;
        else {
            t0 *= t0;
            n0 = t0 * t0 * this.dot(gi0, x0, y0); // (x,y) of grad3 used for 2D gradient
        }
        var t1 = 0.5 - x1 * x1 - y1 * y1;
        if (t1 < 0)
            n1 = 0.0;
        else {
            t1 *= t1;
            n1 = t1 * t1 * this.dot(gi1, x1, y1);
        }
        var t2 = 0.5 - x2 * x2 - y2 * y2;
        if (t2 < 0)
            n2 = 0.0;
        else {
            t2 *= t2;
            n2 = t2 * t2 * this.dot(gi2, x2, y2);
        }
        // Add contributions from each corner to get the final noise value.
        // The result is scaled to return values in the interval [0,1].
        return 35.0 * (n0 + n1 + n2) + 0.5;
    };
    return SimplexNoise;
}());
SimplexNoise.grad3 = [
    [1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0],
    [1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1],
    [0, 1, 1], [0, -1, 1], [0, 1, -1], [0, -1, -1]
];
;
var kdNode = (function () {
    function kdNode(point, dimension, parent) {
        this.point = point;
        this.dimension = dimension;
        this.parent = parent;
    }
    return kdNode;
}());
var kdTree = (function () {
    function kdTree(points, distanceMetric, dimensions) {
        this.points = points;
        this.distanceMetric = distanceMetric;
        this.dimensions = dimensions;
        this.root = this.buildTree(points, 0);
    }
    kdTree.prototype.buildTree = function (points, depth, parent) {
        if (points.length === 0)
            return undefined;
        var dim = depth % this.dimensions.length;
        if (points.length === 1)
            return new kdNode(points[0], dim, parent);
        points.sort(function (a, b) {
            return a[this.dimensions[dim]] - b[this.dimensions[dim]];
        }.bind(this));
        var median = Math.floor(points.length / 2);
        var node = new kdNode(points[median], dim, parent);
        node.left = this.buildTree(points.slice(0, median), depth + 1, node);
        node.right = this.buildTree(points.slice(median + 1), depth + 1, node);
        return node;
    };
    kdTree.prototype.nearestSearch = function (point, node, best) {
        var dimension = this.dimensions[node.dimension];
        var ownDistance = this.distanceMetric(point, node.point);
        var linearPoint = {};
        for (var i = 0; i < this.dimensions.length; i += 1) {
            if (i === node.dimension)
                linearPoint[this.dimensions[i]] = point[this.dimensions[i]];
            else
                linearPoint[this.dimensions[i]] = node.point[this.dimensions[i]];
        }
        if (node.right === undefined && node.left === undefined) {
            if (ownDistance < best[1]) {
                best[0] = node;
                best[1] = ownDistance;
            }
            return;
        }
        var bestChild;
        if (node.right === undefined)
            bestChild = node.left;
        else if (node.left === undefined)
            bestChild = node.right;
        else if (point[dimension] < node.point[dimension])
            bestChild = node.left;
        else
            bestChild = node.right;
        this.nearestSearch(point, bestChild, best);
        if (ownDistance < best[1]) {
            best[0] = node;
            best[1] = ownDistance;
        }
        var linearDistance = this.distanceMetric(linearPoint, node.point);
        if (linearDistance < best[1]) {
            var otherChild = void 0;
            if (bestChild === node.left)
                otherChild = node.right;
            else
                otherChild = node.left;
            if (otherChild !== undefined)
                this.nearestSearch(point, otherChild, best);
        }
    };
    kdTree.prototype.nearest = function (point, maxDistance) {
        var best = [undefined, Number.MAX_VALUE];
        if (this.root)
            this.nearestSearch(point, this.root, best);
        return best[0] === undefined ? undefined : best[0].point;
    };
    kdTree.prototype.balanceFactor = function () {
        function height(node) {
            if (node === undefined)
                return 0;
            return Math.max(height(node.left), height(node.right)) + 1;
        }
        function count(node) {
            if (node === undefined)
                return 0;
            return count(node.left) + count(node.right) + 1;
        }
        return height(this.root) / (Math.log(count(this.root)) / Math.log(2));
    };
    return kdTree;
}());
var MapGenerator = (function () {
    function MapGenerator() {
    }
    MapGenerator.generate = function (map, settings) {
        // clear down all lines, locations and cell data
        map.lines = [];
        map.locations = [];
        for (var _i = 0, _a = map.cells; _i < _a.length; _i++) {
            var cell = _a[_i];
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
        for (var _b = 0, _c = map.cells; _b < _c.length; _b++) {
            var cell = _c[_b];
            if (cell === null)
                continue;
            MapGenerator.updateCellType(cell);
        }
    };
    MapGenerator.updateCellType = function (cell) {
        var type = cell.height < 0
            ? CellType.empty
            : MapGenerator.cellTypeLookup.nearest(cell);
        if (type !== undefined)
            cell.cellType = type;
    };
    MapGenerator.cellTypeDistanceMetric = function (a, b) {
        var heightDif = (a.height - b.height) * 5;
        var tempDif = a.temperature - b.temperature;
        var precDif = a.precipitation - b.precipitation;
        return Math.sqrt(heightDif * heightDif +
            tempDif * tempDif +
            precDif * precDif);
    };
    MapGenerator.constructCellTypeLookup = function (cellTypes) {
        MapGenerator.cellTypeLookup = new kdTree(cellTypes.slice(1), MapGenerator.cellTypeDistanceMetric, ['height', 'temperature', 'precipitation']);
    };
    MapGenerator.removeSuperfluousLineCells = function (cells, linesToKeepJunctionsWith) {
        if (linesToKeepJunctionsWith === void 0) { linesToKeepJunctionsWith = []; }
        if (cells.length <= 3)
            return;
        var first = cells[0];
        var last = cells[cells.length - 1];
        var canRemove = false;
        for (var i = 1; i < cells.length - 1; i++) {
            canRemove = !canRemove;
            if (!canRemove)
                continue; // keep alternate cells
            // don't remove a key cell if another line ends there
            var cell = cells[i];
            for (var _i = 0, linesToKeepJunctionsWith_1 = linesToKeepJunctionsWith; _i < linesToKeepJunctionsWith_1.length; _i++) {
                var line = linesToKeepJunctionsWith_1[_i];
                if (line.keyCells === cells)
                    continue;
                else if (cell == line.getStartCell() || cell == line.getEndCell()) {
                    canRemove = false;
                    break;
                }
            }
            if (canRemove) {
                cells.splice(i, 1);
                i--;
            }
        }
    };
    MapGenerator.renderAndErodeLine = function (map, line) {
        line.updateRenderPoints();
        // erode the terrain this line passes through, if needed
        if (line.type.erosionAmount != 0) {
            var erosionAmount = line.type.erosionAmount;
            var cellsToErode = line.getErosionAffectedCells(map);
            for (var _i = 0, cellsToErode_1 = cellsToErode; _i < cellsToErode_1.length; _i++) {
                var cell = cellsToErode_1[_i];
                cell.height -= erosionAmount;
            }
        }
        return line;
    };
    MapGenerator.pickHighestCell = function (cells) {
        var returnCell = cells[0];
        for (var i = 1; i < cells.length; i++) {
            var testCell = cells[i];
            if (testCell.height > returnCell.height)
                returnCell = testCell;
        }
        return returnCell;
    };
    MapGenerator.pickLowestCell = function (cells, mustBeAboveSeaLevel) {
        if (mustBeAboveSeaLevel === void 0) { mustBeAboveSeaLevel = false; }
        var returnCell = cells[0];
        var bestHeight = Number.MAX_VALUE;
        for (var i = 0; i < cells.length; i++) {
            var testCell = cells[i];
            if (testCell.height < bestHeight && (!mustBeAboveSeaLevel || testCell.height > 0)) {
                returnCell = testCell;
                bestHeight = testCell.height;
            }
        }
        return returnCell;
    };
    return MapGenerator;
}());
var CoastlineGenerator = (function () {
    function CoastlineGenerator() {
    }
    CoastlineGenerator.generate = function (map, settings) {
        var coastGuide = settings.coastGuide;
        var lowFreqNoiseX = new SimplexNoise(), highFreqNoiseX = new SimplexNoise();
        var lowFreqNoiseY = new SimplexNoise(), highFreqNoiseY = new SimplexNoise();
        var lowFreqNoiseScale = settings.coastNoiseLowFreq, highFreqNoiseScale = settings.coastNoiseHighFreq;
        var seaLevelCutoff = settings.seaLevel;
        var maxX = map.width * MapData.packedWidthRatio;
        var maxY = map.height * MapData.packedHeightRatio;
        // allocate height to each cell, specify if it is land or sea
        for (var _i = 0, _a = map.cells; _i < _a.length; _i++) {
            var cell = _a[_i];
            if (cell === null)
                continue;
            var x = cell.xPos, y = cell.yPos;
            if (coastGuide.generation(x, y, maxX, maxY) < seaLevelCutoff)
                continue;
            var tmpX = x;
            x += (lowFreqNoiseX.noise(x / 100, y / 100) - 0.5) * lowFreqNoiseScale * 2 + (highFreqNoiseX.noise(x, y) - 0.5) * highFreqNoiseScale * 2;
            y += (lowFreqNoiseY.noise(tmpX / 100, y / 100) - 0.5) * lowFreqNoiseScale * 2 + (highFreqNoiseY.noise(tmpX, y) - 0.5) * highFreqNoiseScale * 2;
            var otherCell = map.cells[map.getCellIndexAtPoint(x, y)];
            if (otherCell == null)
                continue;
            otherCell.height = 0.1;
        }
    };
    return CoastlineGenerator;
}());
var TerrainGenerator = (function () {
    function TerrainGenerator() {
    }
    TerrainGenerator.generate = function (map, settings) {
        // to start with, generate height, temperate and precipitation values for all map cells
        TerrainGenerator.allocateCellProperties(map, settings);
        //TerrainGenerator.generateMountainRanges(map, settings);
    };
    TerrainGenerator.allocateCellProperties = function (map, settings) {
        var heightGuide = settings.heightGuide;
        var lowFreqHeightNoise = new SimplexNoise();
        var highFreqHeightNoise = new SimplexNoise();
        var heightScaleTot = settings.heightScaleGuide + settings.heightScaleLowFreq + settings.heightScaleHighFreq;
        if (heightScaleTot == 0)
            heightScaleTot = 1;
        var guideHeightScale = settings.heightScaleGuide / heightScaleTot;
        var lowFreqHeightScale = settings.heightScaleLowFreq / heightScaleTot;
        var highFreqHeightScale = settings.heightScaleHighFreq / heightScaleTot;
        var temperatureGuide = settings.temperatureGuide;
        var lowFreqTemperatureNoise = new SimplexNoise();
        var highFreqTemperatureNoise = new SimplexNoise();
        var temperatureScaleTot = settings.temperatureScaleGuide + settings.temperatureScaleLowFreq + settings.temperatureScaleHighFreq;
        if (temperatureScaleTot == 0)
            temperatureScaleTot = 1;
        var guideTemperatureScale = settings.temperatureScaleGuide / temperatureScaleTot;
        var lowFreqTemperatureScale = settings.temperatureScaleLowFreq / temperatureScaleTot;
        var highFreqTemperatureScale = settings.temperatureScaleHighFreq / temperatureScaleTot;
        var precipitationGuide = settings.precipitationGuide;
        var lowFreqPrecipitationNoise = new SimplexNoise();
        var highFreqPrecipitationNoise = new SimplexNoise();
        var precipitationScaleTot = settings.precipitationScaleGuide + settings.precipitationScaleLowFreq + settings.precipitationScaleHighFreq;
        if (precipitationScaleTot == 0)
            precipitationScaleTot = 1;
        var guidePrecipitationScale = settings.precipitationScaleGuide / precipitationScaleTot;
        var lowFreqPrecipitationScale = settings.precipitationScaleLowFreq / precipitationScaleTot;
        var highFreqPrecipitationScale = settings.precipitationScaleHighFreq / precipitationScaleTot;
        var maxX = map.width * MapData.packedWidthRatio;
        var maxY = map.height * MapData.packedHeightRatio;
        // allocate height / temperature / precipitation generation properties to each cell with a height >= 0
        for (var _i = 0, _a = map.cells; _i < _a.length; _i++) {
            var cell = _a[_i];
            if (cell === null || cell.height < 0)
                continue;
            cell.height = TerrainGenerator.determineValue(cell.xPos, cell.yPos, maxX, maxY, guideHeightScale, lowFreqHeightScale, highFreqHeightScale, heightGuide, lowFreqHeightNoise, highFreqHeightNoise, settings.minHeight, settings.maxHeight);
            cell.temperature = TerrainGenerator.determineValue(cell.xPos, cell.yPos, maxX, maxY, guideTemperatureScale, lowFreqTemperatureScale, highFreqTemperatureScale, temperatureGuide, lowFreqTemperatureNoise, highFreqTemperatureNoise, settings.minTemperature, settings.maxTemperature);
            cell.precipitation = TerrainGenerator.determineValue(cell.xPos, cell.yPos, maxX, maxY, guideTemperatureScale, lowFreqPrecipitationScale, highFreqPrecipitationScale, precipitationGuide, lowFreqPrecipitationNoise, highFreqPrecipitationNoise, settings.minPrecipitation, settings.maxPrecipitation);
            // don't allocate a cell type right away, as later steps may change these properties
        }
    };
    TerrainGenerator.determineValue = function (x, y, maxX, maxY, guideScale, lowFreqScale, highFreqScale, guide, lowFreqNoise, highFreqNoise, minValue, maxValue) {
        var value = lowFreqScale * lowFreqNoise.noise(x / 10, y / 10)
            + highFreqScale * highFreqNoise.noise(x, y)
            + guideScale * guide.generation(x, y, maxX, maxY);
        var rawRange = lowFreqScale + highFreqScale + guideScale;
        return minValue + (maxValue - minValue) * value / rawRange;
    };
    TerrainGenerator.generateMountainRanges = function (map, settings) {
        // generate mountain ranges, but don't add these to the map. Just use them for (negative) erosion.
        var lineType = new LineType('Mountains', '#000000', 1, 1, 1, 1, -0.4, 1, true, 0 /* Random */);
        var lines = [];
        var onePerNCells = 120; // TODO: Make this configurable, ideally in generation settings.
        var numLines = Math.round(map.width * map.height / onePerNCells);
        for (var iLine = 0; iLine < numLines; iLine++) {
            var cells = TerrainGenerator.pickRandomLineCells(map, lineType);
            if (cells.length <= 1)
                continue;
            var line = new MapLine(lineType);
            line.keyCells = cells;
            lines.push(line);
        }
        for (var _i = 0, lines_2 = lines; _i < lines_2.length; _i++) {
            var line = lines_2[_i];
            MapGenerator.removeSuperfluousLineCells(line.keyCells);
            MapGenerator.renderAndErodeLine(map, line);
        }
        return lines;
    };
    TerrainGenerator.pickRandomLineCells = function (map, lineType) {
        // TODO: plot a path between these two points, not just a straight line
        var cellA = map.getRandomCell(false), cellB = map.getRandomCell(false);
        if (cellA === undefined || cellB === undefined)
            return [];
        return [cellA, cellB];
    };
    return TerrainGenerator;
}());
var RiverGenerator = (function () {
    function RiverGenerator() {
    }
    RiverGenerator.generate = function (map, settings) {
        // create river lines and allow them to erode the map.
        for (var _i = 0, _a = map.lineTypes; _i < _a.length; _i++) {
            var lineType = _a[_i];
            if (lineType.positionMode !== 1 /* HighToLow */)
                continue;
            RiverGenerator.generateLines(map, lineType);
        }
    };
    RiverGenerator.generateLines = function (map, lineType) {
        var lines = [];
        var onePerNCells = 80; // TODO: Make this configurable, ideally in generation settings.
        var numLines = Math.round(map.width * map.height / onePerNCells);
        for (var iLine = 0; iLine < numLines; iLine++) {
            var cells = RiverGenerator.pickHighToLowLineCells(map, lineType, lines);
            if (cells.length <= 1)
                continue;
            var line = new MapLine(lineType);
            line.keyCells = cells;
            lines.push(line);
        }
        for (var _i = 0, lines_3 = lines; _i < lines_3.length; _i++) {
            var line = lines_3[_i];
            MapGenerator.removeSuperfluousLineCells(line.keyCells);
            MapGenerator.renderAndErodeLine(map, line);
            map.lines.push(line);
        }
    };
    RiverGenerator.pickHighToLowLineCells = function (map, lineType, otherLines) {
        // start with a random cell
        var genStartCell = map.getRandomCell(!lineType.canErodeBelowSeaLevel);
        if (genStartCell === undefined)
            return [];
        var highestCell = genStartCell;
        var lowestCell = genStartCell;
        var cells = [genStartCell];
        // "flow" downwards through adjacent cells until we reach a "lowest" point or go below sea level
        while (true) {
            var testCells = map.getCellsInRange(lowestCell, 1);
            var testCell = MapGenerator.pickLowestCell(testCells);
            if (testCell === lowestCell) {
                if (testCell.height < 0)
                    break; // if under the sea, stop rather than eroding a valley
                // erode a valley
                var dipCell = testCell;
                cells.push(dipCell);
                // if this line came in, don't go out that way
                if (cells.length > 2)
                    testCells.slice(testCells.indexOf(cells[cells.length - 2]), 1);
                // find the next lowest cell, and "erode" it down so that we can flow there
                testCells.slice(testCells.indexOf(dipCell), 1);
                testCell = MapGenerator.pickLowestCell(testCells);
                testCell.height = dipCell.height - 0.01; // this can sink to below level and form a lake. that's not really how i wanted them to form...
            }
            cells.push(testCell);
            lowestCell = testCell;
            if (!lineType.canErodeBelowSeaLevel && lowestCell.height < 0)
                break; // some line types (rivers!) don't want us to keep eroding once we reach the seabed
        }
        // also "flow" upwards until we reach a highest point
        // TODO: upward flow should stop if an existing river is reached, to prevent rivers from "branching" implausibly
        while (true) {
            var testCell = MapGenerator.pickHighestCell(map.getCellsInRange(highestCell, 1));
            if (testCell === highestCell)
                break;
            cells.unshift(testCell);
            highestCell = testCell;
        }
        // remove cells from the start until it doesn't touch any other river
        for (var _i = 0, otherLines_1 = otherLines; _i < otherLines_1.length; _i++) {
            var other = otherLines_1[_i];
            var removedOnThisPass = void 0;
            do {
                var start = cells[0];
                removedOnThisPass = false;
                for (var _a = 0, _b = other.keyCells; _a < _b.length; _a++) {
                    var cell = _b[_a];
                    if (cell == start) {
                        cells.shift();
                        removedOnThisPass = true;
                        break;
                    }
                }
            } while (removedOnThisPass);
        }
        return cells;
    };
    return RiverGenerator;
}());
var LocationGenerator = (function () {
    function LocationGenerator() {
    }
    LocationGenerator.generate = function (map, settings) {
        // create locations, which currently all prefer the lowest nearby point
        for (var _i = 0, _a = map.locationTypes; _i < _a.length; _i++) {
            var locationType = _a[_i];
            var onePerNCells = 50; // TODO: to be specified per location type. Make this only consider LAND cells?
            var numLocations = Math.round(map.width * map.height / onePerNCells);
            for (var iLoc = 0; iLoc < numLocations; iLoc++) {
                var loc = LocationGenerator.generateLocation(map, locationType);
                if (loc === undefined)
                    continue;
                map.locations.push(loc);
            }
        }
    };
    LocationGenerator.generateLocation = function (map, locationType) {
        var cell = map.getRandomCell(true);
        if (cell === undefined)
            return undefined;
        cell = MapGenerator.pickLowestCell(map.getCellsInRange(cell, 2), true);
        for (var _i = 0, _a = map.locations; _i < _a.length; _i++) {
            var other = _a[_i];
            var minDist = Math.min(locationType.minDistanceToOther, other.type.minDistanceToOther);
            if (cell.distanceTo(other.cell) < minDist)
                return undefined;
        }
        var location = new MapLocation(cell, locationType.name, locationType);
        return location;
    };
    return LocationGenerator;
}());
var RoadGenerator = (function () {
    function RoadGenerator() {
    }
    RoadGenerator.generate = function (map, settings) {
        // create roads, only once locations are in place
        for (var _i = 0, _a = map.lineTypes; _i < _a.length; _i++) {
            var lineType = _a[_i];
            if (lineType.positionMode !== 2 /* BetweenLocations */)
                continue;
            RoadGenerator.generateLinesBetweenLocations(map, lineType);
        }
    };
    RoadGenerator.generateLinesBetweenLocations = function (map, lineType) {
        var locationGroups = RoadGenerator.groupConnectableLocations(map, map.locations);
        for (var _i = 0, locationGroups_1 = locationGroups; _i < locationGroups_1.length; _i++) {
            var group = locationGroups_1[_i];
            RoadGenerator.generateLinesForLocationGroup(map, group, lineType);
        }
    };
    RoadGenerator.groupConnectableLocations = function (map, locations) {
        var groups = [];
        for (var _i = 0, _a = locations.slice(); _i < _a.length; _i++) {
            var location_4 = _a[_i];
            var foundGroup = false;
            for (var _b = 0, groups_1 = groups; _b < groups_1.length; _b++) {
                var testGroup = groups_1[_b];
                var firstInGroup = testGroup[0];
                if (RoadGenerator.getConnectionPaths(map, location_4.cell, [firstInGroup.cell]).length !== 0) {
                    testGroup.push(location_4);
                    foundGroup = true;
                    break;
                }
            }
            if (!foundGroup)
                groups.push([location_4]);
        }
        return groups;
    };
    RoadGenerator.getConnectionPaths = function (map, from, to) {
        var results = [];
        var colMul = map.height;
        var visited = {};
        visited[from.row + from.col * colMul] = true;
        var prevFringe = [[from]];
        var nextFringe = [];
        do {
            for (var _i = 0, prevFringe_1 = prevFringe; _i < prevFringe_1.length; _i++) {
                var fringePath = prevFringe_1[_i];
                var fringeCell = fringePath[fringePath.length - 1];
                for (var _a = 0, _b = map.getNeighbours(fringeCell); _a < _b.length; _a++) {
                    var testCell = _b[_a];
                    var testIndex = testCell.row + testCell.col * colMul;
                    if (visited[testIndex] === true)
                        continue;
                    var path = fringePath.slice();
                    path.push(testCell);
                    for (var i = 0; i < to.length; i++)
                        if (testCell === to[i]) {
                            results.push(path);
                            if (to.length === 1)
                                return results; // if this was the last remaining cell, return early
                            to.splice(i, 1);
                            break;
                        }
                    visited[testIndex] = true;
                    if (testCell.height > 0 && testCell.height < 0.75)
                        nextFringe.push(path);
                }
            }
            prevFringe = nextFringe;
            nextFringe = [];
        } while (prevFringe.length > 0);
        return results;
    };
    RoadGenerator.generateLinesForLocationGroup = function (map, locations, lineType) {
        // connect every pair of locations in the group for which there isn't another location closer to both of them
        var groupLines = [];
        // calculate the distance between each pair once
        var locCells = [];
        for (var i = 0; i < locations.length; i++)
            locCells[i] = locations[i].cell;
        var pathCache = {};
        for (var i = 0; i < locations.length; i++) {
            var paths = RoadGenerator.getConnectionPaths(map, locCells[i], locCells.slice(i + 1));
            var cacheEntry = {};
            for (var _i = 0, paths_1 = paths; _i < paths_1.length; _i++) {
                var path = paths_1[_i];
                var endCell = path[path.length - 1];
                var index = locCells.indexOf(endCell);
                cacheEntry[index] = path;
            }
            pathCache[i] = cacheEntry;
        }
        for (var i = 0; i < locations.length; i++)
            for (var j = 0; j < i; j++)
                pathCache[i][j] = pathCache[j][i];
        // TODO: use a better algorithm for calculating this relative neighbourhood graph ... which this is, even though we don't actually keep it
        for (var i = 0; i < locations.length; i++) {
            for (var j = i + 1; j < locations.length; j++) {
                var path = pathCache[i][j];
                if (path === null)
                    continue;
                var anyCloser = false;
                for (var k = 0; k < locations.length; k++) {
                    if (k === i || k === j)
                        continue;
                    var dist1 = pathCache[i][k];
                    var dist2 = pathCache[j][k];
                    if (dist1 === null || dist2 === null)
                        continue;
                    if (dist1.length < path.length && dist2.length < path.length) {
                        anyCloser = true;
                        break;
                    }
                }
                if (!anyCloser) {
                    var line = new MapLine(lineType);
                    line.keyCells = path;
                    groupLines.push(line);
                }
            }
        }
        // for each line, remove any overlap with another by removing "overlapping" key cells
        RoadGenerator.removeOverlap(groupLines);
        // where exactly two lines end on the same cell, combine them into one line
        RoadGenerator.combineLines(groupLines);
        for (var _a = 0, groupLines_1 = groupLines; _a < groupLines_1.length; _a++) {
            var line = groupLines_1[_a];
            RoadGenerator.removeSuperfluousLineCells(line.keyCells, groupLines);
            MapGenerator.renderAndErodeLine(map, line);
            map.lines.push(line);
        }
    };
    RoadGenerator.removeOverlap = function (lines) {
        for (var _i = 0, lines_4 = lines; _i < lines_4.length; _i++) {
            var line = lines_4[_i];
            // find all lines that share a terminus with this line.
            var startLines = [], endLines = [];
            var firstCell = line.keyCells[0], lastCell = line.keyCells[line.keyCells.length - 1];
            for (var _a = 0, lines_5 = lines; _a < lines_5.length; _a++) {
                var otherLine = lines_5[_a];
                if (otherLine === line)
                    continue;
                var otherFirst = otherLine.keyCells[0], otherLast = otherLine.keyCells[otherLine.keyCells.length - 1];
                if (otherFirst === firstCell || otherLast === firstCell)
                    startLines.push(otherLine);
                if (otherFirst === lastCell || otherLast === lastCell)
                    endLines.push(otherLine);
            }
            // remove key cells from the start of this line until only the "first" remaining key cell touches any of startLines
            while (line.keyCells.length > 1) {
                firstCell = line.keyCells[1];
                var anyTouching = false;
                for (var _b = 0, startLines_1 = startLines; _b < startLines_1.length; _b++) {
                    var otherLine = startLines_1[_b];
                    for (var _c = 0, _d = otherLine.keyCells; _c < _d.length; _c++) {
                        var cell = _d[_c];
                        if (cell === firstCell) {
                            anyTouching = true;
                            break;
                        }
                    }
                }
                if (!anyTouching)
                    break;
                line.keyCells.shift();
            }
            // remove key cells from the end of this line until only the "last" remaining key cell touches any of endLines
            while (line.keyCells.length > 1) {
                lastCell = line.keyCells[line.keyCells.length - 2];
                var anyTouching = false;
                for (var _e = 0, endLines_1 = endLines; _e < endLines_1.length; _e++) {
                    var otherLine = endLines_1[_e];
                    for (var _f = 0, _g = otherLine.keyCells; _f < _g.length; _f++) {
                        var cell = _g[_f];
                        if (cell === lastCell) {
                            anyTouching = true;
                            break;
                        }
                    }
                }
                if (!anyTouching)
                    break;
                line.keyCells.pop();
            }
        }
    };
    RoadGenerator.combineLines = function (lines) {
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            var start = line.getStartCell(), end = line.getEndCell();
            var hasMerged = false;
            var startLines = [];
            var endLines = [];
            for (var j = 0; j < lines.length; j++) {
                if (j == i)
                    continue;
                var other = lines[j];
                var otherStart = other.getStartCell();
                var otherEnd = other.getEndCell();
                if (otherStart == end)
                    endLines.push([other, false, j]);
                else if (otherEnd == end)
                    endLines.push([other, true, j]);
                if (otherStart == start)
                    startLines.push([other, false, j]);
                else if (otherEnd == start)
                    startLines.push([other, true, j]);
            }
            // if there is exactly one line with an end on this line's start point
            var removedIndex = void 0;
            if (startLines.length == 1) {
                var info = startLines[0];
                var cells = info[0].keyCells;
                if (info[1])
                    cells = cells.reverse();
                for (var _i = 0, cells_1 = cells; _i < cells_1.length; _i++) {
                    var cell = cells_1[_i];
                    line.keyCells.unshift(cell);
                }
                removedIndex = info[2];
                lines.splice(removedIndex, 1);
                hasMerged = true;
            }
            else
                removedIndex = Number.MAX_VALUE;
            // if there is exactly one line with an end on this line's end point
            if (endLines.length == 1) {
                var info = endLines[0];
                var cells = info[0].keyCells;
                if (info[1])
                    cells = cells.reverse();
                for (var _a = 0, cells_2 = cells; _a < cells_2.length; _a++) {
                    var cell = cells_2[_a];
                    line.keyCells.push(cell);
                }
                var indexToRemove = info[2];
                if (indexToRemove > removedIndex)
                    indexToRemove--; // ensure we remove the right line if another has already been removed
                lines.splice(indexToRemove, 1);
                hasMerged = true;
            }
            if (hasMerged)
                i--; // if this line has new ends, they still need tested
        }
    };
    RoadGenerator.removeSuperfluousLineCells = function (cells, linesToKeepJunctionsWith) {
        if (linesToKeepJunctionsWith === void 0) { linesToKeepJunctionsWith = []; }
        if (cells.length <= 3)
            return;
        var first = cells[0];
        var last = cells[cells.length - 1];
        var canRemove = false;
        for (var i = 1; i < cells.length - 1; i++) {
            canRemove = !canRemove;
            if (!canRemove)
                continue; // keep alternate cells
            // don't remove a key cell if another line ends there
            var cell = cells[i];
            for (var _i = 0, linesToKeepJunctionsWith_2 = linesToKeepJunctionsWith; _i < linesToKeepJunctionsWith_2.length; _i++) {
                var line = linesToKeepJunctionsWith_2[_i];
                if (line.keyCells === cells)
                    continue;
                else if (cell == line.getStartCell() || cell == line.getEndCell()) {
                    canRemove = false;
                    break;
                }
            }
            if (canRemove) {
                cells.splice(i, 1);
                i--;
            }
        }
    };
    return RoadGenerator;
}());
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var WorldMap = (function (_super) {
    __extends(WorldMap, _super);
    function WorldMap(props) {
        var _this = _super.call(this, props) || this;
        _this.state = {
            map: new MapData(0, 0, false),
            generationSettings: new GenerationSettings(),
            showGenerationSettings: false,
        };
        return _this;
    }
    WorldMap.init = function () {
        var editable = SaveLoad.getQueryParam('readonly') === undefined;
        WorldMap.instance = ReactDOM.render(React.createElement(WorldMap, { editable: editable }), document.getElementById('uiRoot'));
    };
    WorldMap.prototype.componentDidMount = function () {
        SaveLoad.loadData(this.initializeMap.bind(this));
    };
    WorldMap.prototype.initializeMap = function (dataJson) {
        var map = dataJson === null ? new MapData(25, 25) : MapData.loadFromJSON(dataJson);
        this.setState({
            map: map,
            activeEditor: this.props.editable ? 1 /* Overview */ : undefined,
        });
        if (this.changes !== undefined) {
            if (dataJson !== null)
                this.changes.recordChangeData(dataJson);
            else
                this.changes.recordMapChange(map);
        }
        MapGenerator.constructCellTypeLookup(map.cellTypes);
    };
    WorldMap.prototype.componentDidUpdate = function (prevProps, prevState) {
        if (prevState.activeEditor != this.state.activeEditor && this.mapView !== null)
            this.mapView.redraw();
    };
    WorldMap.prototype.render = function () {
        var _this = this;
        if (this.state.map === undefined)
            return React.createElement("div", { id: "worldRoot" });
        var mapOrSettings = this.state.showGenerationSettings
            ? React.createElement(GenerationSettingsEditor, { settings: this.state.generationSettings, settingsChanged: this.generationSettingsChanged.bind(this) })
            : React.createElement(MapView, { map: this.state.map, scrollUI: true, renderGrid: true, ref: function (c) { return _this.mapView = c; }, editor: this.state.activeEditor, selectedLine: this.state.selectedLine, cellMouseDown: this.cellMouseDown.bind(this), cellMouseUp: this.cellMouseUp.bind(this), cellMouseEnter: this.cellMouseEnter.bind(this), cellMouseLeave: this.cellMouseLeave.bind(this) });
        if (!this.props.editable)
            return React.createElement("div", { id: "worldRoot" }, mapOrSettings);
        var activeEditor = this.state.activeEditor === undefined ? undefined : this.renderEditor(this.state.activeEditor);
        return React.createElement("div", { id: "worldRoot" },
            mapOrSettings,
            React.createElement(EditorControls, { activeEditor: this.state.activeEditor, editorSelected: this.selectEditor.bind(this) }),
            React.createElement("div", { id: "editor" },
                React.createElement("h1", null, this.state.editorHeading),
                activeEditor,
                React.createElement(ChangeHistory, { ref: function (c) { if (c !== null)
                        _this.changes = c; }, updateMap: this.replaceMap.bind(this) })));
    };
    WorldMap.prototype.renderEditor = function (editor) {
        var _this = this;
        if (this.state.map === undefined)
            return React.createElement("div", null, "No map");
        var props = {
            ref: function (c) { return _this.activeEditor = (c === null) ? undefined : c; }
        };
        switch (editor) {
            case 0 /* Download */:
                return React.createElement(DownloadEditor, __assign({}, props, { map: this.state.map }));
            case 1 /* Overview */:
                return React.createElement(OverviewEditor, __assign({}, props, { name: this.state.map.name, description: this.state.map.description, saveChanges: this.updateDetails.bind(this) }));
            case 2 /* Size */:
                return React.createElement(SizeEditor, __assign({}, props, { width: this.state.map.width, height: this.state.map.height, changeSize: this.changeSize.bind(this) }));
            case 3 /* Terrain */:
                return React.createElement(TerrainEditor, __assign({}, props, { cellTypes: this.state.map.cellTypes, hasDrawn: this.terrainEdited.bind(this), findCellsInRange: this.state.map.getCellsInRange.bind(this.state.map), updateCellTypes: this.updateCellTypes.bind(this) }));
            case 4 /* Lines */:
                return React.createElement(LinesEditor, __assign({}, props, { lines: this.state.map.lines, lineTypes: this.state.map.lineTypes, updateLines: this.updateLines.bind(this), updateLineTypes: this.updateLineTypes.bind(this), selectedLine: this.state.selectedLine, lineSelected: this.lineSelected.bind(this) }));
            case 5 /* Locations */:
                return React.createElement(LocationsEditor, __assign({}, props, { locations: this.state.map.locations, locationTypes: this.state.map.locationTypes, locationsChanged: this.updateLocations.bind(this), typesChanged: this.updateLocationTypes.bind(this) }));
            case 6 /* Generation */:
                return React.createElement(GenerationEditor, __assign({}, props, { map: this.state.map, settings: this.state.generationSettings, mapChanged: this.mapGenerated.bind(this), settingsChanged: this.generationSettingsChanged.bind(this), showingSettings: this.state.showGenerationSettings, showSettings: this.showGenerationSettings.bind(this) }));
        }
    };
    WorldMap.prototype.cellMouseDown = function (cell) {
        if (this.activeEditor !== undefined && this.activeEditor.mouseDown !== undefined)
            this.activeEditor.mouseDown(cell);
    };
    WorldMap.prototype.cellMouseUp = function (cell) {
        if (this.activeEditor !== undefined && this.activeEditor.mouseUp !== undefined)
            this.activeEditor.mouseUp(cell);
    };
    WorldMap.prototype.cellMouseEnter = function (cell) {
        if (this.activeEditor !== undefined && this.activeEditor.mouseEnter !== undefined)
            this.activeEditor.mouseEnter(cell);
    };
    WorldMap.prototype.cellMouseLeave = function (cell) {
        if (this.activeEditor !== undefined && this.activeEditor.mouseLeave !== undefined)
            this.activeEditor.mouseLeave(cell);
    };
    WorldMap.prototype.updateDetails = function (name, desc) {
        if (this.state.map === undefined)
            return;
        this.state.map.name = name;
        this.state.map.description = desc;
        this.mapChanged();
    };
    WorldMap.prototype.changeSize = function (width, height, mode) {
        if (this.state.map === undefined)
            return;
        this.state.map.changeSize(width, height, mode);
        if (this.mapView !== null)
            this.mapView.updateSize();
        this.mapChanged();
    };
    WorldMap.prototype.updateCellTypes = function (cellTypes) {
        if (cellTypes.length == 0)
            return;
        // if a cell type is removed from the map, replace it with the "empty" type
        for (var _i = 0, _a = this.state.map.cellTypes; _i < _a.length; _i++) {
            var currentType = _a[_i];
            if (cellTypes.indexOf(currentType) == -1)
                this.state.map.replaceCellType(currentType, cellTypes[0]);
        }
        this.state.map.cellTypes = cellTypes;
        this.mapChanged();
        MapGenerator.constructCellTypeLookup(cellTypes);
    };
    WorldMap.prototype.terrainEdited = function (endOfStroke) {
        if (endOfStroke === void 0) { endOfStroke = true; }
        // batch all "drawing" in the one stroke into a single undo step
        if (endOfStroke)
            this.mapChanged();
        else if (this.mapView !== null)
            this.mapView.redraw();
    };
    WorldMap.prototype.updateLocationTypes = function (types) {
        if (types.length == 0)
            return;
        // if a location type is removed from the map, replace it with the first available type
        for (var _i = 0, _a = this.state.map.locationTypes; _i < _a.length; _i++) {
            var currentType = _a[_i];
            if (types.indexOf(currentType) == -1)
                this.state.map.replaceLocationType(currentType, types[0]);
        }
        this.state.map.locationTypes = types;
        this.mapChanged();
    };
    WorldMap.prototype.updateLocations = function (locations) {
        this.state.map.locations = locations;
        this.mapChanged();
    };
    WorldMap.prototype.updateLineTypes = function (types) {
        if (types.length == 0)
            return;
        // if a location type is removed from the map, replace it with the first available type
        for (var _i = 0, _a = this.state.map.lineTypes; _i < _a.length; _i++) {
            var currentType = _a[_i];
            if (types.indexOf(currentType) == -1)
                this.state.map.replaceLineType(currentType, types[0]);
        }
        this.state.map.lineTypes = types;
        this.mapChanged();
    };
    WorldMap.prototype.lineSelected = function (line) {
        this.setState({
            selectedLine: line,
        });
        if (this.mapView !== null)
            this.mapView.redraw();
    };
    WorldMap.prototype.updateLines = function (lines) {
        this.state.map.lines = lines;
        this.mapChanged();
    };
    WorldMap.prototype.mapGenerated = function () {
        this.mapChanged();
    };
    WorldMap.prototype.mapChanged = function () {
        this.setState({
            map: this.state.map,
        });
        if (this.mapView !== null)
            this.mapView.redraw();
        this.changes.recordMapChange(this.state.map);
    };
    WorldMap.prototype.generationSettingsChanged = function () {
        this.setState({
            generationSettings: this.state.generationSettings,
        });
    };
    WorldMap.prototype.showGenerationSettings = function (show) {
        this.setState({
            showGenerationSettings: show,
        });
    };
    WorldMap.prototype.replaceMap = function (map) {
        // don't hold onto a line from the "old" map; find the equivalent
        var selectedLine = this.state.selectedLine;
        if (selectedLine !== undefined) {
            var index = this.state.map.lines.indexOf(selectedLine);
            selectedLine = map.lines[index];
        }
        // similarly, allow editors to update their selected values to come from the new map
        if (this.activeEditor !== undefined && this.activeEditor.replacingMap !== undefined)
            this.activeEditor.replacingMap(map);
        this.setState({
            map: map,
            selectedLine: selectedLine,
        });
        if (this.mapView !== null)
            this.mapView.redraw();
    };
    WorldMap.prototype.selectEditor = function (editor, name) {
        this.setState({
            activeEditor: editor,
            editorHeading: name,
        });
    };
    return WorldMap;
}(React.Component));
WorldMap.init();
//# sourceMappingURL=maps.js.map