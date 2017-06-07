/*
class MapEditor {
    terrainBrush?: CellType;
    brushList: HTMLElement;

    constructor(public readonly view: MapView) {
        this.initialize();
    }
    private initialize() {
        this.view.cellClicked = this.cellClicked.bind(this);
        this.terrainBrush = undefined;

        (document.getElementById('addBrushLink') as HTMLElement).addEventListener('click', this.addBrushClicked.bind(this));

        this.brushList = document.getElementById('brushList') as HTMLElement;
        //(document.querySelector('#brushEdit .dialog-buttons .ok') as HTMLElement).addEventListener('click', this.brushEditConfirmed.bind(this));

        this.drawCellTypes();

        let resizeWizard = new Wizard(document.getElementById('resize-wizard') as HTMLElement, this.performResize.bind(this));
        (document.getElementById('resizeLink') as HTMLElement).addEventListener('click', this.resizeClicked.bind(this, resizeWizard));
    }
    private resizeClicked(wizard: Wizard) {
        wizard.show();
        return false;
    }
    private addBrushClicked() {
        this.terrainBrush = undefined;
        let brush = this.brushList.querySelector('.selected');
        if (brush != null)
            brush.classList.remove('selected');

        (document.getElementById('brushName') as HTMLInputElement).value = '';
        (document.getElementById('brushColor') as HTMLInputElement).value = '';
        (document.getElementById('brushEdit') as HTMLElement).style.display = '';
        return false;
    }
    private brushEditConfirmed() {
        let name = (document.getElementById('brushName') as HTMLInputElement).value;
        let color = (document.getElementById('brushColor') as HTMLInputElement).value;

        if (this.terrainBrush === undefined) {
            let type = new CellType(name, color);
            this.view.data.cellTypes.push(type);
        }
        else {
            this.terrainBrush.name = name;
            this.terrainBrush.color = color;
        }

        this.terrainBrush = undefined;
        this.drawCellTypes();
        return false;
    }
    private performResize(resize: any) {
        let number = parseInt(resize.number);
        if (resize.change != 'add')
            number = -number;

        switch (resize.edge) {
            case 'top':
                this.view.data.changeHeight(number, false);
                break;
            case 'bottom':
                this.view.data.changeHeight(number, true);
                break;
            case 'left':
                this.view.data.changeWidth(number, false);
                break;
            case 'right':
                this.view.data.changeWidth(number, true);
                break;
        }
        this.view.updateSize();
    }
    private cellClicked(cell: MapCell) {
        if (this.terrainBrush === undefined)
            return false;

        cell.cellType = this.terrainBrush;
        return true;
    }
    drawCellTypes() {
        let output = '';

        for (let i = 0; i < this.view.data.cellTypes.length; i++) {
            let type = this.view.data.cellTypes[i];
            output += '<div class="brush" style="background-color: ' + type.color + '" data-number="' + i + '">' + type.name + '</div>';
        }

        this.brushList.innerHTML = output;
        this.brushList.onclick = this.brushListClicked.bind(this);
        this.brushList.ondblclick = this.brushListDoubleClicked.bind(this);
    }
    private brushListClicked(e: MouseEvent) {
        let brush = e.target as HTMLElement;
        let number = brush.getAttribute('data-number');
        if (number == null)
            return false;

        brush = this.brushList.querySelector('.selected') as HTMLElement;
        if (brush != null)
            brush.classList.remove('selected');
        brush = e.target as HTMLElement;

        brush.classList.add('selected');
        this.terrainBrush = this.view.data.cellTypes[parseInt(number)];
    }
    private brushListDoubleClicked(e: MouseEvent) {
        if (this.brushList.onclick(e) === false || this.terrainBrush === undefined)
            return;

        (document.getElementById('brushName') as HTMLInputElement).value = this.terrainBrush.name;
        (document.getElementById('brushColor') as HTMLInputElement).value = this.terrainBrush.color;
        (document.getElementById('brushEdit') as HTMLElement).style.display = '';
    }
}
*/