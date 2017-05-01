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

    constructor(private readonly root: HTMLElement, public data: MapData) {
        this.cellClicked = null;
        this.initialize();
    }
    private initialize() {
        this.root.classList.add('mapRoot');
        this.root.innerHTML = '<canvas></canvas><div class="scrollPane"><div className="scrollSize" /></div>';
        this.canvas = this.root.childNodes[0] as HTMLCanvasElement;
        this.scrollPane = this.root.childNodes[1] as HTMLElement;
        this.scrollSize = this.scrollPane.childNodes[0] as HTMLElement;

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
        this.scrollSize.onclick = this.clicked.bind(this);

        window.onresize = this.updateSize.bind(this);

        let scrollSize = this.getScrollbarSize();
        this.scrollbarWidth = scrollSize.width;
        this.scrollbarHeight = scrollSize.height;

        this.updateSize();
    }
    draw() {
        let ctx = this.canvas.getContext('2d');
        ctx.fillStyle = '#ccc';
        ctx.fillRect(0, 0, this.root.offsetWidth, this.root.offsetHeight);
        ctx.translate(-this.scrollPane.scrollLeft, -this.scrollPane.scrollTop);

        this.drawCells(ctx, this.cellDrawInterval, false);

        if (this.cellRadius < 40) {
            // faint outline of next zoom level
            ctx.globalAlpha = 0.5;
            this.drawCells(ctx, this.cellDrawInterval * 2, true);
            ctx.globalAlpha = 1;
        }

        ctx.translate(this.scrollPane.scrollLeft, this.scrollPane.scrollTop);
    }
    private drawCells(ctx: CanvasRenderingContext2D, cellDrawInterval: number, outline: boolean) {
        let drawCellRadius = this.cellRadius * cellDrawInterval;
        let minDrawX = this.scrollPane.scrollLeft - drawCellRadius;
        let minDrawY = this.scrollPane.scrollTop - drawCellRadius;
        let maxDrawX = this.scrollPane.scrollLeft + this.root.offsetWidth + drawCellRadius;
        let maxDrawY = this.scrollPane.scrollTop + this.root.offsetHeight + drawCellRadius;

        let map = this.data;

        for (let cell of map.cells) {
            if (cell == null)
                continue;

            if (this.getCellDisplayY(cell) % cellDrawInterval != cellDrawInterval - 1)
                continue;

            var alternateRow = cell.row % (2 * cellDrawInterval) == 0 ? Math.floor(cellDrawInterval / 2) : 0;
            if ((this.getCellDisplayX(cell) + alternateRow) % cellDrawInterval != cellDrawInterval - 1)
                continue;

            let centerX = cell.xPos * this.cellRadius + this.cellRadius;
            if (centerX < minDrawX || centerX > maxDrawX)
                continue;

            let centerY = cell.yPos * this.cellRadius + this.cellRadius;
            if (centerY < minDrawY || centerY > maxDrawY)
                continue;

            this.drawCell(ctx, cell, centerX, centerY, drawCellRadius, outline);
        }
    }
    private drawCell(ctx: CanvasRenderingContext2D, cell: MapCell, centerX: number, centerY: number, radius: number, outline: boolean) {
        ctx.beginPath();

        radius -= 0.4; // ensure there's always a 1px border drawn between cells

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
            ctx.strokeStyle = '#0f0';
            ctx.stroke();
            return;
        }
        else if (cell.selected)
            ctx.fillStyle = '#fcc';
        else if (cell.cellType == null)
            ctx.fillStyle = '#666';
        else
            ctx.fillStyle = cell.cellType.color;

        ctx.fill();

        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        ctx.fillText(this.getCellDisplayX(cell) + ', ' + this.getCellDisplayY(cell), centerX, centerY);
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
        this.cellDrawInterval = Math.max(1, Math.round(30 / radius)); // TODO: this should always be a power of 2
    }
    updateSize() {
        this.canvas.setAttribute('width', (this.root.offsetWidth - this.scrollbarWidth).toString());
        this.canvas.setAttribute('height', (this.root.offsetHeight - this.scrollbarHeight).toString());

        this.scrollPane.style.width = this.root.offsetWidth + 'px';
        this.scrollPane.style.height = this.root.offsetHeight + 'px';

        let overallWidth = (this.data.maxX - this.data.minX) * this._cellRadius;
        let overallHeight = (this.data.maxY - this.data.minY) * this._cellRadius;

        this.scrollSize.style.width = overallWidth + 'px';
        this.scrollSize.style.height = overallHeight + 'px';

        this.draw();
    }
    private mouseScroll(e: MouseWheelEvent) {
        if (!e.ctrlKey)
            return;
        e.preventDefault();

        if (e.deltaY < 0)
            this.zoomIn(1);
        else if (e.deltaY > 0)
            this.zoomOut(1);
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
        this.cellRadius = Math.min(200, Math.ceil(this.cellRadius * (1 + 0.1 * stepScale)));
        this.updateSize();
    }
    zoomOut(stepScale: number) {
        this.cellRadius = Math.max(0.1, Math.floor(this.cellRadius * (1 - 0.1 * stepScale)));
        this.updateSize();
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