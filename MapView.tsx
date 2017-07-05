interface IMapViewProps {
    map: MapData;
    cellMouseDown: (cell: MapCell) => void;
    cellMouseUp: (cell: MapCell) => void;
    cellMouseEnter: (cell: MapCell) => void;
    cellMouseLeave: (cell: MapCell) => void;
}

interface IMapViewState {
    cellRadius: number;
    cellDrawInterval: number;
    scrollbarWidth: number;
    scrollbarHeight: number;
}

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

        let scrollSize = this.getScrollbarSize();

        this.state = {
            cellRadius: 30,
            cellDrawInterval: 2,
            scrollbarWidth: scrollSize.width,
            scrollbarHeight: scrollSize.height,
        };
    }
    componentDidMount() {
        window.addEventListener('resize', this.resize.bind(this));
        
        let ctx = this.canvas.getContext('2d');
        if (ctx !== null)
            this.ctx = ctx;

        this.setupTouch();
        this.resize();
    }
    componentWillUnmount() {
        window.removeEventListener('resize', this.resize.bind(this));

        if (this.hammer !== undefined) {
            this.hammer.destroy();
            this.hammer = undefined;
        }
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
        this.ctx.fillRect(0, 0, this.root.offsetWidth, this.root.offsetHeight);
        this.ctx.translate(-this.scrollPane.scrollLeft, -this.scrollPane.scrollTop);

        let twoLevels = this.state.cellRadius < 40;
        let drawInterval = this.state.cellDrawInterval === undefined ? 1 : this.state.cellDrawInterval;

        this.drawCells(drawInterval, !twoLevels, true, !twoLevels, !twoLevels);

        if (twoLevels) {
            // outline of next zoom level
            this.drawCells(drawInterval * 2, true, false, true, true);
        }

        this.ctx.translate(this.scrollPane.scrollLeft, this.scrollPane.scrollTop);
        this.redrawing = false;
    }
    private drawCells(cellDrawInterval: number, outline: boolean, fillContent: boolean, showSelection: boolean, writeCoords: boolean) {
        let drawCellRadius = this.state.cellRadius * cellDrawInterval;

        if (fillContent)
            if (outline)
                drawCellRadius -= 0.4; // ensure there's always a 1px border left between cells
            else
                ;//drawCellRadius += 0.4; // overlap cells slightly so there's no gap

        let minDrawX = this.scrollPane.scrollLeft - drawCellRadius;
        let minDrawY = this.scrollPane.scrollTop - drawCellRadius;
        let maxDrawX = this.scrollPane.scrollLeft + this.root.offsetWidth + drawCellRadius;
        let maxDrawY = this.scrollPane.scrollTop + this.root.offsetHeight + drawCellRadius;

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
            if (centerX < minDrawX || centerX > maxDrawX)
                continue;

            let centerY = cell.yPos * cellRadius + cellRadius;
            if (centerY < minDrawY || centerY > maxDrawY)
                continue;

            this.drawCell(cell, centerX, centerY, drawCellRadius, outline, fillContent, showSelection, writeCoords);
        }
    }
    private drawCell(cell: MapCell, centerX: number, centerY: number, radius: number, outline: boolean, fillContent: boolean, showSelection: boolean, writeCoords: boolean) {
        let ctx = this.ctx;
        ctx.beginPath();

        let angle, x, y;
        for (let point = 0; point < 6; point++) {
            angle = 2 * Math.PI / 6 * (point + 0.5);
            x = centerX + radius * Math.cos(angle);
            y = centerY + radius * Math.sin(angle);

            if (point === 0)
                ctx.moveTo(x, y);
            else
                ctx.lineTo(x, y);
        }

        if (outline) {
            ctx.strokeStyle = this.backgroundColor;
            ctx.stroke();
        }

        if (fillContent || (cell.selected && showSelection)) {
            if (cell.selected)
                ctx.fillStyle = '#fcc';
            else if (cell.cellType == null)
                ctx.fillStyle = '#666';
            else
                ctx.fillStyle = cell.cellType.color;

            ctx.fill();
        }

        if (writeCoords) {
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            ctx.fillText(this.getCellDisplayX(cell) + ', ' + this.getCellDisplayY(cell), centerX, centerY);
        }
    }
    private getCellDisplayX(cell: MapCell) {
        return cell.col + 2 + Math.floor((cell.row - this.props.map.height) / 2);
    }
    private getCellDisplayY(cell: MapCell) {
        return cell.row + 1;
    }
    
    private resizing: boolean = false;
    resize() {
        if (this.resizing)
            return;
        requestAnimationFrame(this.updateSize.bind(this));
        this.resizing = true;
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

        let overallWidth = (this.props.map.maxX - this.props.map.minX) * this.state.cellRadius;
        let overallHeight = (this.props.map.maxY - this.props.map.minY) * this.state.cellRadius;

        this.scrollSize.style.width = overallWidth + 'px';
        this.scrollSize.style.height = overallHeight + 'px';

        this.scrollPane.scrollLeft = scrollFractionX * overallWidth - screenFocusX;
        this.scrollPane.scrollTop = scrollFractionY * overallHeight - screenFocusY;
    }
    private updateSize() {
        let viewWidth = this.root.offsetWidth - this.state.scrollbarWidth;
        let viewHeight = this.root.offsetHeight - this.state.scrollbarHeight;

        this.canvas.setAttribute('width', viewWidth.toString());
        this.canvas.setAttribute('height', viewHeight.toString());

        this.updateScrollSize();
        this.redraw();
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
        this.startCellInteract(e.clientX, e.clientY);
    }
    private mouseUp(e: MouseEvent) {
        this.endCellInteract(e.clientX, e.clientY);
    }
    private hoverCellAt(x: number, y: number) {
        if (this.mouseDownCell === undefined)
            return;
        
        let cellIndex = this.getCellIndexAtPoint(x, y);
        let cell = cellIndex >= 0 && cellIndex < this.props.map.cells.length ? this.props.map.cells[cellIndex] : undefined;

        if (cell !== this.mouseDownCell) {
            if (this.props.cellMouseLeave !== undefined)
                this.props.cellMouseLeave(this.mouseDownCell);
                
            this.mouseDownCell = cell;

            if (cell !== undefined && this.props.cellMouseEnter !== undefined)
                this.props.cellMouseEnter(cell);
        }
    }
    private startCellInteract(x: number, y: number) {
        let cellIndex = this.getCellIndexAtPoint(x, y);
        if (cellIndex >= 0 && cellIndex < this.props.map.cells.length) {
            let cell = this.props.map.cells[cellIndex];
            if (cell !== undefined && this.props.cellMouseDown !== undefined)
                this.props.cellMouseDown(cell);
            this.mouseDownCell = cell;
        }
    }
    private endCellInteract(x: number, y: number) {
        let cellIndex = this.getCellIndexAtPoint(x, y);
        if (cellIndex >= 0 && cellIndex < this.props.map.cells.length) {
            let cell = this.props.map.cells[cellIndex];
            if (cell !== undefined && this.props.cellMouseUp !== undefined)
                this.props.cellMouseUp(cell);
        }
        this.mouseDownCell = undefined;
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
    extractData() {
        let json = this.props.map.saveToJSON();
        window.open('data:text/json,' + encodeURIComponent(json));
    }
}