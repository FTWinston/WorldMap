interface IMapViewProps {
    map: MapData;
    scrollUI: boolean;
    renderGrid: boolean;
    fixedCellRadius?: number;
    editor?: EditorType;
    selectedLine?: MapLine;
    cellMouseDown?: (cell: MapCell) => void;
    cellMouseUp?: (cell: MapCell) => void;
    cellMouseEnter?: (cell: MapCell) => void;
    cellMouseLeave?: (cell: MapCell) => void;
}

interface IMapViewState {
    cellRadius: number;
    cellDrawInterval: number;
    scrollbarWidth: number;
    scrollbarHeight: number;
}

declare function saveAs(blob: Blob, name: string): void;

class MapView extends React.Component<IMapViewProps, IMapViewState> { 
    private root: HTMLElement;
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private scrollPane: HTMLElement;
    private scrollSize: HTMLElement;

    private readonly backgroundColor: string = '#ccc';
    private mouseX?: number;
    private mouseY?: number;
    private hammer?: HammerManager;

    constructor(props: IMapViewProps) {
        super(props);

        let scrollSize = props.scrollUI ? this.getScrollbarSize() : {width: 0, height: 0};

        this.state = {
            cellRadius: props.fixedCellRadius === undefined ? 30 : props.fixedCellRadius,
            cellDrawInterval: 1,
            scrollbarWidth: scrollSize.width,
            scrollbarHeight: scrollSize.height,
        };
    }
    componentDidMount() {
        if (this.props.scrollUI)
            window.addEventListener('resize', this.resize.bind(this));
        
        let ctx = this.canvas.getContext('2d');
        if (ctx !== null)
            this.ctx = ctx;

        if (this.props.scrollUI)
            this.setupTouch();
        this.resize();
    }
    componentWillUnmount() {
        if (this.props.scrollUI)
            window.removeEventListener('resize', this.resize.bind(this));

        if (this.hammer !== undefined) {
            this.hammer.destroy();
            this.hammer = undefined;
        }
    }
    componentWillReceiveProps(nextProps: IMapViewProps) {
        if (nextProps.fixedCellRadius !== undefined && nextProps.fixedCellRadius != this.props.fixedCellRadius)
            this.setState({
                cellRadius: nextProps.fixedCellRadius,
                cellDrawInterval: this.state.cellDrawInterval,
                scrollbarWidth: this.state.scrollbarWidth,
                scrollbarHeight: this.state.scrollbarHeight,
            });
    }
    private setupTouch() {
        this.hammer = new Hammer.Manager(this.scrollPane);

        let zoom = new Hammer.Pinch({ event: 'zoom', threshold: 0.1 });
        this.hammer.add(zoom);

        let prevScale = 1;
        this.hammer.on('zoom', function(ev: HammerInput) {
            let touchZoomScale = ev.scale / prevScale;
            if (touchZoomScale > 0.9 && touchZoomScale < 1.1)
                return;

            prevScale = ev.scale;
            this.zoom(touchZoomScale);
        }.bind(this));

        this.hammer.on('zoomend', function(ev: HammerInput) {
            prevScale = 1;
        });


        let pan = new Hammer.Pan({ event: 'pan', threshold: 10, pointers: 3, direction: Hammer.DIRECTION_ALL });
        this.hammer.add(pan);

        let lastX = 0, lastY = 0, panScale = 1.5;
        this.hammer.on('pan', function(ev: HammerInput) {
            let dX = ev.deltaX - lastX;
            lastX = ev.deltaX;

            let dY = ev.deltaY - lastY;
            lastY = ev.deltaY;

            this.scrollPane.scrollLeft -= dX * panScale;
            this.scrollPane.scrollTop -= dY * panScale;
            this.redraw();
        }.bind(this));
        
        this.hammer.on('panend', function(ev: HammerInput) {
            lastX = lastY = 0;
        }.bind(this));

        
        let touch = new Hammer.Pan({ event: 'touch', threshold: 10, pointers: 1, direction: Hammer.DIRECTION_ALL });
        this.hammer.add(touch);
        this.hammer.on('touchstart', function(ev: HammerInput) {
            this.startCellInteract(ev.center.x, ev.center.y);
        }.bind(this));
        this.hammer.on('touch', function(ev: HammerInput) {
            this.hoverCellAt(ev.center.x, ev.center.y);
        }.bind(this));
        this.hammer.on('touchend', function(ev: HammerInput) {
            this.endCellInteract(ev.center.x, ev.center.y);
        }.bind(this));


        pan.requireFailure(zoom);
        zoom.requireFailure(pan);
        touch.requireFailure(pan);
        touch.requireFailure(zoom);
    }
    render() {
        if (!this.props.scrollUI) {
            let size = this.getOverallSize();
            return <canvas ref={(c) => this.canvas = c} width={size.width} height={size.height}></canvas>;
        }
        
        return <div id="mapRoot" ref={(c) => this.root = c}>
            <canvas ref={(c) => this.canvas = c}></canvas>
            <div ref={(c) => this.scrollPane = c} className="scrollPane"
                onScroll={this.redraw.bind(this)}
                onWheel={this.mouseScroll.bind(this)}
                onMouseMove={this.mouseMove.bind(this)}
                onMouseEnter={this.mouseMove.bind(this)}
                onMouseDown={this.mouseDown.bind(this)}
                onMouseUp={this.mouseUp.bind(this)}>
                    <div ref={(c) => this.scrollSize = c} className="scrollSize" />
            </div>
        </div>;
    }

    private redrawing: boolean = false;
    public redraw() {
        if (this.redrawing)
            return;
        requestAnimationFrame(this.draw.bind(this));
        this.redrawing = true;
    }

    private draw() {
        this.ctx.fillStyle = this.backgroundColor;
        this.ctx.fillRect(0, 0, this.canvas.clientWidth, this.canvas.clientHeight);

        if (this.props.scrollUI)
            this.ctx.translate(-this.scrollPane.scrollLeft, -this.scrollPane.scrollTop);

        let twoLevels = this.props.renderGrid && this.state.cellRadius < 40;
        let drawInterval = this.state.cellDrawInterval === undefined ? 1 : this.state.cellDrawInterval;
        let outline = this.props.renderGrid && !twoLevels;
        let writeCoords = this.props.scrollUI && !twoLevels;

        this.drawCells(drawInterval, outline, true, writeCoords);

        this.drawLines();
        
        if (twoLevels) {
            // outline of next zoom level
            this.drawCells(drawInterval * 2, true, false, this.props.scrollUI);
        }

        this.drawLocations();

        if (this.props.scrollUI)
            this.ctx.translate(this.scrollPane.scrollLeft, this.scrollPane.scrollTop);
        this.redrawing = false;
    }
    private getDrawExtent(drawCellRadius: number) {
        if (this.props.scrollUI)
            return {
                minX: this.scrollPane.scrollLeft - drawCellRadius,
                minY: this.scrollPane.scrollTop - drawCellRadius,
                maxX: this.scrollPane.scrollLeft + this.root.offsetWidth + drawCellRadius,
                maxY: this.scrollPane.scrollTop + this.root.offsetHeight + drawCellRadius,
            }
        else
            return {
                minX: Number.MIN_VALUE,
                minY: Number.MIN_VALUE,
                maxX: Number.MAX_VALUE,
                maxY: Number.MAX_VALUE,
            }
    }
    private drawCells(cellDrawInterval: number, outline: boolean, fillContent: boolean, writeCoords: boolean) {
        this.ctx.lineWidth = 1;
        this.ctx.font = '8pt sans-serif';
        let drawCellRadius = this.state.cellRadius * cellDrawInterval;

        if (fillContent)
            if (outline)
                drawCellRadius -= 0.4; // ensure there's always a 1px border left between cells
            else
                drawCellRadius += 0.4; // overlap cells slightly so there's no gap
        
        let drawExtent = this.getDrawExtent(drawCellRadius);

        let map = this.props.map;
        let cellRadius = this.state.cellRadius;
        var halfInterval = Math.ceil(cellDrawInterval / 2);
        let xOffset = cellDrawInterval <= 2 ? 0 : Math.floor(cellDrawInterval / 2) - 1;

        for (let cell of map.cells) {
            if (cell == null)
                continue;

            if (this.getCellDisplayY(cell) % cellDrawInterval != 0)
                continue;

            var alternateRowOffset = this.getCellDisplayY(cell) % (2 * cellDrawInterval) == 0 ? halfInterval : 0;
            if ((this.getCellDisplayX(cell) + alternateRowOffset + xOffset) % cellDrawInterval != 0)
                continue;

            let centerX = cell.xPos * cellRadius + cellRadius;
            if (centerX < drawExtent.minX || centerX > drawExtent.maxX)
                continue;

            let centerY = cell.yPos * cellRadius + cellRadius;
            if (centerY < drawExtent.minY || centerY > drawExtent.maxY)
                continue;

            this.ctx.translate(centerX, centerY);
            this.drawCell(cell, drawCellRadius, outline, fillContent, writeCoords);
            this.ctx.translate(-centerX, -centerY);
        }
    }
    private drawCell(cell: MapCell, radius: number, outline: boolean, fillContent: boolean, writeCoords: boolean) {
        let ctx = this.ctx;
        ctx.beginPath();

        let angle, x, y;
        for (let point = 0; point < 6; point++) {
            angle = 2 * Math.PI / 6 * (point + 0.5);
            x = radius * Math.cos(angle);
            y = radius * Math.sin(angle);

            if (point === 0)
                ctx.moveTo(x, y);
            else
                ctx.lineTo(x, y);
        }

        if (outline) {
            ctx.strokeStyle = this.backgroundColor;
            ctx.stroke();
        }

        if (fillContent) {
            if (cell.cellType == null)
                ctx.fillStyle = '#666';
            else
                ctx.fillStyle = cell.cellType.color;

            ctx.fill();

            if (cell.cellType.pattern !== undefined && cell.cellType.patternColor !== undefined) {
                ctx.lineWidth = 1;
                ctx.strokeStyle = cell.cellType.patternColor;
                
                let scale = radius / 12;
                ctx.scale(scale, scale);

                MapCell.patterns[cell.cellType.pattern].draw(ctx, new Object());
                
                ctx.scale(1/scale, 1/scale);
            }
        }

        if (writeCoords) {
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            ctx.fillText(this.getCellDisplayX(cell) + ', ' + this.getCellDisplayY(cell), 0, 0);
        }
    }
    private getCellDisplayX(cell: MapCell) {
        return cell.col + 2 + Math.floor((cell.row - this.props.map.height) / 2);
    }
    private getCellDisplayY(cell: MapCell) {
        return cell.row + 1;
    }
    private drawLocations() {
        let cellRadius = this.state.cellRadius;
        let drawExtent = this.getDrawExtent(cellRadius);
        let map = this.props.map;
        
        for (let loc of map.locations) {
            if (loc.type.minDrawCellRadius !== undefined && cellRadius < loc.type.minDrawCellRadius)
                continue; // don't draw this location if not zoomed in enough to see it

            let centerX = loc.cell.xPos * cellRadius + cellRadius;
            if (centerX < drawExtent.minX || centerX > drawExtent.maxX)
                continue;

            let centerY = loc.cell.yPos * cellRadius + cellRadius;
            if (centerY < drawExtent.minY || centerY > drawExtent.maxY)
                continue;

            this.drawLocation(loc, centerX, centerY);
        }
    }
    private drawLocation(loc: MapLocation, markerX: number, markerY: number) {
        let ctx = this.ctx;

        ctx.translate(markerX, markerY);
        MapLocation.icons[loc.type.icon].draw(ctx);

        let labelOffset = loc.type.textSize * 1.5;
        ctx.translate(0, -labelOffset);

        ctx.fillStyle = loc.type.textColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = loc.type.textSize + 'pt serif';
        ctx.fillText(loc.name, 0, 0);

        ctx.translate(-markerX, -markerY + labelOffset);
    }
    private drawLines() {
        let cellRadius = this.state.cellRadius;
        let drawExtent = this.getDrawExtent(cellRadius);
        let map = this.props.map;
        
        for (let line of map.lines) {
            // use min / max X & Y of all keyCells to decide whether to draw or not. Possible that a line will wrap around the screen without cross it, but not worrying about that.
            let firstCell = line.keyCells[0];
            let minX = firstCell.xPos, minY = firstCell.yPos, maxX = firstCell.xPos, maxY = firstCell.yPos;
            
            for (let cell of line.keyCells) {
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

            this.drawLine(line, cellRadius);
        }
    }
    private drawLine(line: MapLine, cellRadius: number) {
        let ctx = this.ctx;
        let type = line.type;

        if (this.props.editor == EditorType.Lines) {
            ctx.strokeStyle = '#ff0000';
            
            if (this.props.selectedLine !== undefined && this.props.selectedLine !== line)
                ctx.globalAlpha = 0.3;
                
            ctx.lineWidth = 2;

            for (let cell of line.keyCells) {
                ctx.beginPath();
                ctx.arc(cell.xPos * cellRadius + cellRadius, cell.yPos * cellRadius + cellRadius, cellRadius * 0.65, 0, Math.PI * 2);
                ctx.stroke();
            }

            ctx.globalAlpha = 1;
        }

        if (line.keyCells.length == 1) {
            let cell = line.keyCells[0];
            let x = cell.xPos * cellRadius + cellRadius;
            let y = cell.yPos * cellRadius + cellRadius;

            ctx.fillStyle = type.color;
            ctx.beginPath();
            ctx.arc(x, y, type.width / 2, 0, Math.PI * 2);
            ctx.fill();
            return;
        }
        
        let points = line.renderPoints;
        ctx.strokeStyle = type.color;

        let mainWidthStart = line.isLoop || type.width == type.startWidth ? 2 : 16;
        let mainWidthEnd = line.isLoop || type.width == type.endWidth ? points.length - 1 : points.length - 16;
        let x = points[0] * cellRadius + cellRadius;
        let y = points[1] * cellRadius + cellRadius;
        
        ctx.beginPath();
        ctx.moveTo(x, y);
        
        // for the initial line segments, line width changes from startWidth to width
        for (let i=2; i<mainWidthStart; i+=2) {
            ctx.lineCap = 'round';
            let fraction = i / mainWidthStart;
            ctx.lineWidth = type.startWidth * (1-fraction) + type.width * fraction;

            x = points[i] * cellRadius + cellRadius;
            y = points[i+1] * cellRadius + cellRadius;

            ctx.lineTo(x, y);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(x, y);
        }

        ctx.lineCap = line.isLoop ? 'butt' : 'round';

        // for the main segment, its always just width, so can draw them all in a single stroke
        ctx.lineWidth = type.width;
        for (let i = mainWidthStart; i<mainWidthEnd; i+=2) {
            x = points[i] * cellRadius + cellRadius;
            y = points[i+1] * cellRadius + cellRadius;
            ctx.lineTo(x, y);
        }
        ctx.stroke();

        // for the end line segment, line width changes from width to endWidth
        for (let i=mainWidthEnd; i < points.length - 1; i+=2) {
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(x, y);

            let fraction = (points.length - i - 2)  / (points.length - mainWidthEnd);
            ctx.lineWidth = type.endWidth * (1-fraction) + type.width * fraction;
            
            x = points[i] * cellRadius + cellRadius;
            y = points[i+1] * cellRadius + cellRadius;

            ctx.lineTo(x, y);
            ctx.stroke();
        }

        ctx.lineCap = 'butt';
    }

    private resizing: boolean = false;
    private resize() {
        if (this.resizing)
            return;
        if (this.props.scrollUI)
            requestAnimationFrame(this.updateSize.bind(this));
        this.redraw();
        this.resizing = true;
    }
    private getOverallSize() {
        return {
            width: (this.props.map.maxX - this.props.map.minX) * this.state.cellRadius,
            height: (this.props.map.maxY - this.props.map.minY) * this.state.cellRadius
        };
    }
    private updateScrollSize() {
        let screenFocusX: number, screenFocusY: number;

        if (this.mouseX !== undefined && this.mouseY !== undefined) {
            screenFocusX = this.mouseX;
            screenFocusY = this.mouseY;
        }
        else {
            screenFocusX = this.canvas.width / 2;
            screenFocusY = this.canvas.height / 2;
        }

        let scrollBounds = this.scrollSize.getBoundingClientRect();
        let scrollFractionX = scrollBounds.width == 0 ? 0 : (this.scrollPane.scrollLeft + screenFocusX) / scrollBounds.width;
        let scrollFractionY = scrollBounds.height == 0 ? 0 : (this.scrollPane.scrollTop + screenFocusY) / scrollBounds.height;
        this.scrollPane.style.width = this.root.offsetWidth + 'px';
        this.scrollPane.style.height = this.root.offsetHeight + 'px';

        let overallSize = this.getOverallSize();

        this.scrollSize.style.width = overallSize.width + 'px';
        this.scrollSize.style.height = overallSize.height + 'px';

        this.scrollPane.scrollLeft = scrollFractionX * overallSize.width - screenFocusX;
        this.scrollPane.scrollTop = scrollFractionY * overallSize.height - screenFocusY;
    }
    updateSize() {
        let viewWidth = this.root.offsetWidth - this.state.scrollbarWidth;
        let viewHeight = this.root.offsetHeight - this.state.scrollbarHeight;

        this.canvas.setAttribute('width', viewWidth.toString());
        this.canvas.setAttribute('height', viewHeight.toString());

        this.updateScrollSize();
        this.resizing = false;
    }
    private mouseScroll(e: MouseWheelEvent) {
        if (!e.ctrlKey || e.deltaY == 0)
            return;
        e.preventDefault();

        this.zoom(e.deltaY < 0 ? 1.1 : 0.9);
    }
    zoom(scale: number) {
        this.setCellRadius(Math.min(200, Math.ceil(this.state.cellRadius * scale)));
        this.updateScrollSize();
        this.redraw();
    }
    private setCellRadius(radius: number) {
        let displayRadius = radius;
        let cellDrawInterval = 1;
        let minRadius = 20;

        while (displayRadius < minRadius) {
            displayRadius *= 2;
            cellDrawInterval *= 2;
        }
        
        this.setState({cellRadius: radius, cellDrawInterval: cellDrawInterval, scrollbarWidth: this.state.scrollbarWidth, scrollbarHeight: this.state.scrollbarHeight});
    }
    private mouseDownCell: PossibleMapCell;
    private mouseMove(e: MouseEvent) {
        this.mouseX = e.clientX;
        this.mouseY = e.clientY;
        
        this.hoverCellAt(e.clientX, e.clientY);
    }
    private mouseDown(e: MouseEvent) {
        if (e.button == 0)
            this.startCellInteract(e.clientX, e.clientY);
    }
    private mouseUp(e: MouseEvent) {
        if (e.button == 0)
            this.endCellInteract(e.clientX, e.clientY);
    }
    private hoverCellAt(x: number, y: number) {
        if (this.mouseDownCell === null)
            return;
        
        let cellIndex = this.getCellIndexAtPoint(x, y);
        let cell = cellIndex >= 0 && cellIndex < this.props.map.cells.length ? this.props.map.cells[cellIndex] : null;

        if (cell !== this.mouseDownCell) {
            if (this.props.cellMouseLeave !== undefined)
                this.props.cellMouseLeave(this.mouseDownCell);
                
            this.mouseDownCell = cell;

            if (cell !== null && this.props.cellMouseEnter !== undefined)
                this.props.cellMouseEnter(cell);
        }
    }
    private startCellInteract(x: number, y: number) {
        let cellIndex = this.getCellIndexAtPoint(x, y);
        if (cellIndex >= 0 && cellIndex < this.props.map.cells.length) {
            let cell = this.props.map.cells[cellIndex];
            if (cell !== null && this.props.cellMouseDown !== undefined)
                this.props.cellMouseDown(cell);
            this.mouseDownCell = cell;
        }
    }
    private endCellInteract(x: number, y: number) {
        let cellIndex = this.getCellIndexAtPoint(x, y);
        if (cellIndex >= 0 && cellIndex < this.props.map.cells.length) {
            let cell = this.props.map.cells[cellIndex];
            if (cell !== null && this.props.cellMouseUp !== undefined)
                this.props.cellMouseUp(cell);
        }
        this.mouseDownCell = null;
    }
    private getCellIndexAtPoint(screenX: number, screenY: number) {
        let mapX = screenX - this.canvas.offsetLeft + this.scrollPane.scrollLeft + this.props.map.minX * this.state.cellRadius;
        let mapY = screenY - this.canvas.offsetTop + this.scrollPane.scrollTop + this.props.map.minY * this.state.cellRadius;
        let fCol = (mapX * Math.sqrt(3) - mapY) / 3 / this.state.cellRadius;
        let fRow = mapY * 2 / 3 / this.state.cellRadius;
        let fThirdCoord = - fCol - fRow;

        let rCol = Math.round(fCol);
        let rRow = Math.round(fRow);
        let rThird = Math.round(fThirdCoord);

        let colDiff = Math.abs(rCol - fCol);
        let rowDiff = Math.abs(rRow - fRow);
        let thirdDiff = Math.abs(rThird - fThirdCoord);

        if (colDiff >= rowDiff) {
            if (colDiff >= thirdDiff)
                rCol = - rRow - rThird;
        }
        else if (rowDiff >= colDiff && rowDiff >= thirdDiff)
            rRow = - rCol - rThird;

        // TODO: account for cellCombinationScale to get the VISIBLE cell closest to this

        return this.props.map.getCellIndex(rRow, rCol);
    }
    private getScrollbarSize() {
        let outer = document.createElement('div');
        outer.style.visibility = 'hidden';
        outer.style.width = '100px';
        outer.style.height = '100px';
        outer.style.msOverflowStyle = 'scrollbar'; // needed for WinJS apps

        document.body.appendChild(outer);

        let widthNoScroll = outer.offsetWidth;
        let heightNoScroll = outer.offsetHeight;

        // force scrollbars
        outer.style.overflow = 'scroll';

        // add innerdiv
        let inner = document.createElement('div');
        inner.style.width = '100%';
        inner.style.height = '100%';
        outer.appendChild(inner);

        let widthWithScroll = inner.offsetWidth;
        let heightWithScroll = inner.offsetHeight;

        // remove divs
        if (outer.parentNode !== null)
            outer.parentNode.removeChild(outer);

        return {
            width: widthNoScroll - widthWithScroll,
            height: heightNoScroll - heightWithScroll
        }
    }
    downloadImage() {
        this.canvas.toBlob(function(blob: Blob) {
            saveAs(blob, this.props.map.name + '.png');
        }.bind(this));
    }
}