class MapView {
    private canvas: HTMLCanvasElement;
    private scrollPane: HTMLElement;
    private scrollSize: HTMLElement;
    cellClicked: (MapCell) => void;
    private _cellRadius: number;
    private cellDrawInterval: number;
    private scrollbarWidth: number;
    private scrollbarHeight: number;
    private touchZoomDist: number;
    private backgroundColor: string = '#ccc';
    private mouseX?: number;
    private mouseY?: number;

    constructor(private readonly root: HTMLElement, public data: MapData) {
        this.cellClicked = null;
        this.initialize();
    }
    private initialize() {
        this.root.classList.add('mapRoot');

        this.canvas = document.createElement('canvas');
        this.root.appendChild(this.canvas);

        this.scrollPane = document.createElement('div');
        this.scrollPane.classList.add('scrollPane');
        this.root.appendChild(this.scrollPane);

        this.scrollSize = document.createElement('div');
        this.scrollSize.classList.add('scrollSize');
        this.scrollPane.appendChild(this.scrollSize);

        this.canvas.style.pointerEvents = 'none';
        this.scrollPane.style.overflow = 'scroll';
        this.canvas.style.position = 'absolute';
        this.scrollPane.style.position = 'absolute';

        this.cellRadius = 30;

        this.scrollPane.onscroll = this.draw.bind(this);
        this.scrollPane.addEventListener('wheel', this.mouseScroll.bind(this));
        this.scrollPane.ontouchstart = this.touchStart.bind(this);
        this.scrollPane.ontouchend = this.touchEnd.bind(this);
        this.scrollPane.ontouchmove = this.touchMove.bind(this);
        this.scrollPane.onmousemove = this.mouseMove.bind(this);
        this.scrollPane.onmouseenter = this.mouseMove.bind(this);
        this.scrollSize.onclick = this.clicked.bind(this);

        window.onresize = this.updateSize.bind(this);

        let scrollSize = this.getScrollbarSize();
        this.scrollbarWidth = scrollSize.width;
        this.scrollbarHeight = scrollSize.height;

        this.updateSize();
    }
    draw() {
        let ctx = this.canvas.getContext('2d');
        ctx.fillStyle = this.backgroundColor;
        ctx.fillRect(0, 0, this.root.offsetWidth, this.root.offsetHeight);
        ctx.translate(-this.scrollPane.scrollLeft, -this.scrollPane.scrollTop);

        let twoLevels = this.cellRadius < 40;

        this.drawCells(ctx, this.cellDrawInterval, !twoLevels, true, !twoLevels, !twoLevels);

        if (twoLevels) {
            // outline of next zoom level
            this.drawCells(ctx, this.cellDrawInterval * 2, true, false, true, true);
        }

        ctx.translate(this.scrollPane.scrollLeft, this.scrollPane.scrollTop);
    }
    private drawCells(ctx: CanvasRenderingContext2D, cellDrawInterval: number, outline: boolean, fillContent: boolean, showSelection: boolean, writeCoords: boolean) {
        let drawCellRadius = this.cellRadius * cellDrawInterval;

        if (fillContent)
            if (outline)
                drawCellRadius -= 0.4; // ensure there's always a 1px border left between cells
            else
                ;//drawCellRadius += 0.4; // overlap cells slightly so there's no gap

        let minDrawX = this.scrollPane.scrollLeft - drawCellRadius;
        let minDrawY = this.scrollPane.scrollTop - drawCellRadius;
        let maxDrawX = this.scrollPane.scrollLeft + this.root.offsetWidth + drawCellRadius;
        let maxDrawY = this.scrollPane.scrollTop + this.root.offsetHeight + drawCellRadius;

        let map = this.data;
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

            let centerX = cell.xPos * this.cellRadius + this.cellRadius;
            if (centerX < minDrawX || centerX > maxDrawX)
                continue;

            let centerY = cell.yPos * this.cellRadius + this.cellRadius;
            if (centerY < minDrawY || centerY > maxDrawY)
                continue;

            this.drawCell(ctx, cell, centerX, centerY, drawCellRadius, outline, fillContent, showSelection, writeCoords);
        }
    }
    private drawCell(ctx: CanvasRenderingContext2D, cell: MapCell, centerX: number, centerY: number, radius: number, outline: boolean, fillContent: boolean, showSelection: boolean, writeCoords: boolean) {
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
        return cell.col + 2 + Math.floor((cell.row - this.data.height) / 2);
    }
    private getCellDisplayY(cell: MapCell) {
        return cell.row + 1;
    }
    get cellRadius(): number { return this._cellRadius; }
    set cellRadius(radius: number) {
        this._cellRadius = radius;
        
        let displayRadius = radius;
        let cellDrawInterval = 1;
        let minRadius = 20;

        while (displayRadius < minRadius) {
            displayRadius *= 2;
            cellDrawInterval *= 2;
        }

        this.cellDrawInterval = cellDrawInterval;
    }
    updateSize() {
        let viewWidth = this.root.offsetWidth - this.scrollbarWidth;
        let viewHeight = this.root.offsetHeight - this.scrollbarHeight;
        
        let screenFocusX = this.mouseX !== null ? this.mouseX : viewWidth / 2;
        let screenFocusY = this.mouseY !== null ? this.mouseY : viewHeight / 2;

        let scrollBounds = this.scrollSize.getBoundingClientRect();
        let scrollFractionX = scrollBounds.width == 0 ? 0 : (this.scrollPane.scrollLeft + screenFocusX) / scrollBounds.width;
        let scrollFractionY = scrollBounds.height == 0 ? 0 : (this.scrollPane.scrollTop + screenFocusY) / scrollBounds.height;

        this.canvas.setAttribute('width', viewWidth.toString());
        this.canvas.setAttribute('height', viewHeight.toString());

        this.scrollPane.style.width = this.root.offsetWidth + 'px';
        this.scrollPane.style.height = this.root.offsetHeight + 'px';

        let overallWidth = (this.data.maxX - this.data.minX) * this._cellRadius;
        let overallHeight = (this.data.maxY - this.data.minY) * this._cellRadius;

        this.scrollSize.style.width = overallWidth + 'px';
        this.scrollSize.style.height = overallHeight + 'px';

        this.scrollPane.scrollLeft = scrollFractionX * overallWidth - screenFocusX;
        this.scrollPane.scrollTop = scrollFractionY * overallHeight - screenFocusY;

        this.draw();
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
        let distSq = (t1.screenX - t2.screenX) * (t1.screenX - t2.screenX) + (t1.screenY - t2.screenY) * (t1.screenY - t2.screenY);

        let diff = (distSq - this.touchZoomDist) * 0.0000002;
        if (diff > 0)
            this.zoomIn(diff);
        else if (diff < 0)
            this.zoomOut(-diff);

        this.touchZoomDist = distSq;
    }
    zoomIn(stepScale: number) {
        this.cellRadius = Math.min(200, Math.ceil(this.cellRadius * (1 + stepScale)));
        this.updateSize();
    }
    zoomOut(stepScale: number) {
        this.cellRadius = Math.max(0.1, Math.floor(this.cellRadius * (1 - stepScale)));
        this.updateSize();
    }
    private mouseMove(e: MouseEvent) {
        this.mouseX = e.clientX;
        this.mouseY = e.clientY;
    }
    private clicked(e: MouseEvent) {
        let cellIndex = this.getCellIndexAtPoint(e.clientX, e.clientY);
        if (cellIndex >= 0 && cellIndex < this.data.cells.length) {
            let cell = this.data.cells[cellIndex];
            if (cell != null) {
                if (this.cellClicked == null || !this.cellClicked(cell)) {
                    if (cell.selected === true)
                        cell.selected = undefined;
                    else
                        cell.selected = true;
                }
                this.draw();
                return;
            }
        }
    }
    private getCellIndexAtPoint(screenX: number, screenY: number) {
        let mapX = screenX - this.canvas.offsetLeft + this.scrollPane.scrollLeft + this.data.minX * this._cellRadius;
        let mapY = screenY - this.canvas.offsetTop + this.scrollPane.scrollTop + this.data.minY * this._cellRadius;
        let fCol = (mapX * Math.sqrt(3) - mapY) / 3 / this._cellRadius;
        let fRow = mapY * 2 / 3 / this._cellRadius;
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

        return rCol + rRow * this.data.width;
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
        outer.parentNode.removeChild(outer);

        return {
            width: widthNoScroll - widthWithScroll,
            height: heightNoScroll - heightWithScroll
        }
    }
    extractData() {
        let json = this.data.saveToJSON();
        window.open('data:text/json,' + encodeURIComponent(json));
    }
}