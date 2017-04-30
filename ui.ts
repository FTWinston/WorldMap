class Wizard {
    private output: { [key: string]: string };
    private steps: NodeListOf<HTMLElement>;

    constructor(private root: HTMLElement, private callback: (any) => void) {
        this.initialize();
    }
    private initialize() {
        let btn = this.root.querySelector('.dialog-buttons input.ok') as HTMLButtonElement;
        btn.style.display = 'none';
        btn.addEventListener('click', this.confirmed.bind(this));

        this.output = {};

        this.steps = this.root.querySelectorAll('.step') as NodeListOf<HTMLElement>;
        for (let i = 0; i < this.steps.length; i++) {
            let step = this.steps[i];

            let items: NodeListOf<HTMLElement> = step.querySelectorAll('li');
            for (let j = 0; j < items.length; j++) {
                let item = items[j];
                item.addEventListener('click', this.stepItemPicked.bind(this, step, item));
            }

            items = step.querySelectorAll('input[type="text"]') as NodeListOf<HTMLElement>;
            for (let j = 0; j < items.length; j++) {
                let item = items[j];
                item.addEventListener('keyup', this.stepItemPicked.bind(this, step, item));
            }
        }
    }
    show() {
        this.showStep(this.steps[0]);
        this.showDialog();
    }
    private showDialog() {
        this.root.style.display = '';
    }
    private showStep(step: HTMLElement) {
        let display = step.querySelectorAll('.display') as NodeListOf<HTMLElement>;
        for (let i = 0; i < display.length; i++) {
            let prop = display[i].getAttribute('data-property');
            display[i].innerText = this.output[prop];
        }

        let items = step.querySelectorAll('li') as NodeListOf<HTMLElement>;
        for (let i = 0; i < items.length; i++) {
            let item = items[i];

            let attr = item.getAttribute('data-show-property');
            if (attr !== null) {
                if (this.output[attr] != item.getAttribute('data-show-value'))
                    item.style.display = 'none';
                else
                    item.style.display = '';
            }

            item.classList.remove('selected');
        }

        items = step.querySelectorAll('input[type="text"]') as NodeListOf<HTMLElement>;
        for (let i = 0; i < items.length; i++) {
            let item = items[i] as HTMLInputElement;
            item.classList.remove('selected');
            item.value = '';
        }

        step.classList.remove('done');
        step.style.display = '';

        // also hide all later steps, in case this was re-picked
        let passed = false;
        for (let i = 0; i < this.steps.length; i++)
            if (passed)
                this.steps[i].style.display = 'none';
            else if (this.steps[i] == step)
                passed = true;

        let okButton = this.root.querySelector('.dialog-buttons input.ok') as HTMLElement;
        okButton.style.display = 'none';
    }
    private stepItemPicked(step: HTMLElement, item, e: MouseEvent) {
        let value = item.getAttribute('data-value');
        if (value == null && item.value !== undefined)
            value = item.value;

        let items = step.querySelectorAll('li') as NodeListOf<HTMLElement>;
        for (let i = 0; i < items.length; i++)
            items[i].classList.remove('selected');

        items = step.querySelectorAll('input[type="text"]') as NodeListOf<HTMLElement>;
        for (let i = 0; i < items.length; i++)
            items[i].classList.remove('selected');


        this.output[item.getAttribute('data-property')] = value;
        item.classList.add('selected');
        step.classList.add('done');

        let isFinal = step.classList.contains('final');
        if (!isFinal) {
            // show the next step
            let stepNum = 0;
            for (let i = 0; i < this.steps.length; i++) {
                if (this.steps[i] == step)
                    break;
                stepNum++;
            }
            if (stepNum == this.steps.length - 1)
                isFinal = true;
            else
                this.showStep(this.steps[stepNum + 1]);
        }

        if (isFinal) {
            let okButton = this.root.querySelector('.dialog-buttons input.ok') as HTMLElement;
            okButton.style.display = '';
        }
    }
    private confirmed() {
        this.callback(this.output);
    }
}

let dialogs = document.querySelectorAll('.dialog');
for (let i = 0; i < dialogs.length; i++) {
    let dialog = dialogs[i]
    let btns = document.createElement('div');
    btns.classList.add('dialog-buttons');
    btns.innerHTML = '<input type="button" class="cancel" value="Cancel" /> <input type="button" class="ok" value="OK" />';
    dialog.appendChild(btns)

    let hide = function () {
        this.style.display = 'none';
    }.bind(dialog);

    dialog.querySelector('.dialog-buttons input.cancel').addEventListener('click', hide);
    dialog.querySelector('.dialog-buttons input.ok').addEventListener('click', hide);
}


let numeric = document.querySelectorAll('input.number[type="text"]');
for (let i = 0; i < numeric.length; i++) {
    numeric[i].addEventListener('keypress', function (e: KeyboardEvent) {
        if ((e.keyCode >= 48 && e.keyCode <= 57) || e.keyCode < 31)
            return;
        e.preventDefault();
    });
}