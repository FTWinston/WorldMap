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
    private touchZoomDist?: number;

    private readonly backgroundColor: string = '#ccc';
    private mouseX?: number;
    private mouseY?: number;

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

        this.resize();
    }
    componentWillUnmount() {
        window.removeEventListener('resize', this.resize.bind(this));
    }
    render() {
        return <div id="mapRoot" ref={(c) => this.root = c}>
            <canvas ref={(c) => this.canvas = c}></canvas>
            <div ref={(c) => this.scrollPane = c} className="scrollPane"
                onScroll={this.redraw.bind(this)}
                onWheel={this.mouseScroll.bind(this)}
                onTouchStart={this.touchStart.bind(this)}
                onTouchEnd={this.touchEnd.bind(this)}
                onTouchMove={this.touchMove.bind(this)}
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

    private updateSize() {
        let viewWidth = this.root.offsetWidth - this.state.scrollbarWidth;
        let viewHeight = this.root.offsetHeight - this.state.scrollbarHeight;
        
        let screenFocusX = this.mouseX !== undefined ? this.mouseX : viewWidth / 2;
        let screenFocusY = this.mouseY !== undefined ? this.mouseY : viewHeight / 2;

        let scrollBounds = this.scrollSize.getBoundingClientRect();
        let scrollFractionX = scrollBounds.width == 0 ? 0 : (this.scrollPane.scrollLeft + screenFocusX) / scrollBounds.width;
        let scrollFractionY = scrollBounds.height == 0 ? 0 : (this.scrollPane.scrollTop + screenFocusY) / scrollBounds.height;

        this.canvas.setAttribute('width', viewWidth.toString());
        this.canvas.setAttribute('height', viewHeight.toString());

        this.scrollPane.style.width = this.root.offsetWidth + 'px';
        this.scrollPane.style.height = this.root.offsetHeight + 'px';

        let overallWidth = (this.props.map.maxX - this.props.map.minX) * this.state.cellRadius;
        let overallHeight = (this.props.map.maxY - this.props.map.minY) * this.state.cellRadius;

        this.scrollSize.style.width = overallWidth + 'px';
        this.scrollSize.style.height = overallHeight + 'px';

        this.scrollPane.scrollLeft = scrollFractionX * overallWidth - screenFocusX;
        this.scrollPane.scrollTop = scrollFractionY * overallHeight - screenFocusY;

        this.redraw();
        this.resizing = false;
    }
    private mouseScroll(e: MouseWheelEvent) {
        if (!e.ctrlKey)
            return;
        e.preventDefault();

        if (e.deltaY < 0)
            this.zoomIn(0.1);
        else if (e.deltaY > 0)
            this.zoomOut(0.1);
    }
    private touchStart(e: TouchEvent) {
        if (e.touches.length != 2) {
            this.touchZoomDist = undefined;
            return;
        }

        let t1 = e.touches.item(0), t2 = e.touches.item(1);
        if (t1 !== null && t2 !== null)
            this.touchZoomDist = (t1.screenX - t2.screenX) * (t1.screenX - t2.screenX) + (t1.screenY - t2.screenY) * (t1.screenY - t2.screenY);
    }
    private touchEnd(e: TouchEvent) {
        this.touchZoomDist = undefined;
    }
    private touchMove(e: TouchEvent) {
        if (e.touches.length != 2 || this.touchZoomDist === undefined)
            return;
        e.preventDefault();

        let t1 = e.touches.item(0), t2 = e.touches.item(1);
        let distSq = t1 === null || t2 === null ? 0 :
            (t1.screenX - t2.screenX) * (t1.screenX - t2.screenX) + (t1.screenY - t2.screenY) * (t1.screenY - t2.screenY);

        let diff = (distSq - this.touchZoomDist) * 0.0000002;
        if (diff > 0)
            this.zoomIn(diff);
        else if (diff < 0)
            this.zoomOut(-diff);

        this.touchZoomDist = distSq;
    }
    zoomIn(stepScale: number) {
        this.setCellRadius(Math.min(200, Math.ceil(this.state.cellRadius * (1 + stepScale))));
        this.resize();
    }
    zoomOut(stepScale: number) {
        this.setCellRadius(Math.max(0.1, Math.floor(this.state.cellRadius * (1 - stepScale))));
        this.resize();
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
        if (this.mouseDownCell === undefined)
            return;
        
        let cellIndex = this.getCellIndexAtPoint(e.clientX, e.clientY);
        if (cellIndex >= 0 && cellIndex < this.props.map.cells.length) {
            let cell = this.props.map.cells[cellIndex];
            if (cell !== this.mouseDownCell) {
                if (this.props.cellMouseLeave !== undefined)
                    this.props.cellMouseLeave(this.mouseDownCell);
                    
                this.mouseDownCell = cell;

                if (cell !== undefined && this.props.cellMouseEnter !== undefined)
                    this.props.cellMouseEnter(cell);
            }
        }
    }
    private mouseDown(e: MouseEvent) {
        let cellIndex = this.getCellIndexAtPoint(e.clientX, e.clientY);
        if (cellIndex >= 0 && cellIndex < this.props.map.cells.length) {
            let cell = this.props.map.cells[cellIndex];
            if (cell !== undefined && this.props.cellMouseDown !== undefined)
                this.props.cellMouseDown(cell);
            this.mouseDownCell = cell;
        }
    }
    private mouseUp(e: MouseEvent) {
        let cellIndex = this.getCellIndexAtPoint(e.clientX, e.clientY);
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