const enum ResizeAnchorMode {
    TopLeft,
    TopMiddle,
    TopRight,
    CenterLeft,
    Center,
    CenterRight,
    BottomLeft,
    BottomMiddle,
    BottomRight,
}

interface IResizeAnchorInputProps {
    oldWidth: number;
    oldHeight: number;
    newWidth: number;
    newHeight: number;
    mode: ResizeAnchorMode;
    setMode: (mode: ResizeAnchorMode) => void;
}

class ResizeAnchorInput extends React.Component<IResizeAnchorInputProps, {}> {
    constructor(props: IResizeAnchorInputProps) {
        super(props);

        this.state = {
            mode: ResizeAnchorMode.TopLeft,
        };
    }
    render() {
        let widthChange = this.props.newWidth - this.props.oldWidth;
        let heightChange = this.props.newHeight - this.props.oldHeight;

        let tlIcon = this.decideIcon(ResizeAnchorMode.TopLeft, widthChange, heightChange);
        let tmIcon = this.decideIcon(ResizeAnchorMode.TopMiddle, widthChange, heightChange);
        let trIcon = this.decideIcon(ResizeAnchorMode.TopRight, widthChange, heightChange);

        let clIcon = this.decideIcon(ResizeAnchorMode.CenterLeft, widthChange, heightChange);
        let cmIcon = this.decideIcon(ResizeAnchorMode.Center, widthChange, heightChange);
        let crIcon = this.decideIcon(ResizeAnchorMode.CenterRight, widthChange, heightChange);

        let blIcon = this.decideIcon(ResizeAnchorMode.BottomLeft, widthChange, heightChange);
        let bmIcon = this.decideIcon(ResizeAnchorMode.BottomMiddle, widthChange, heightChange);
        let brIcon = this.decideIcon(ResizeAnchorMode.BottomRight, widthChange, heightChange);

        return <div className="resizeAnchor">
            <div>
                <button type="button" onClick={this.setMode.bind(this, ResizeAnchorMode.TopLeft)} dangerouslySetInnerHTML={tlIcon}/>
                <button type="button" onClick={this.setMode.bind(this, ResizeAnchorMode.TopMiddle)} dangerouslySetInnerHTML={tmIcon}/>
                <button type="button" onClick={this.setMode.bind(this, ResizeAnchorMode.TopRight)} dangerouslySetInnerHTML={trIcon}/>
            </div>
            <div>
                <button type="button" onClick={this.setMode.bind(this, ResizeAnchorMode.CenterLeft)} dangerouslySetInnerHTML={clIcon}/>
                <button type="button" onClick={this.setMode.bind(this, ResizeAnchorMode.Center)} dangerouslySetInnerHTML={cmIcon}/>
                <button type="button" onClick={this.setMode.bind(this, ResizeAnchorMode.CenterRight)} dangerouslySetInnerHTML={crIcon}/>
            </div>
            <div>
                <button type="button" onClick={this.setMode.bind(this, ResizeAnchorMode.BottomLeft)} dangerouslySetInnerHTML={blIcon}/>
                <button type="button" onClick={this.setMode.bind(this, ResizeAnchorMode.BottomMiddle)} dangerouslySetInnerHTML={bmIcon}/>
                <button type="button" onClick={this.setMode.bind(this, ResizeAnchorMode.BottomRight)} dangerouslySetInnerHTML={brIcon}/>
            </div>
        </div>;
    }
    private setMode(mode: ResizeAnchorMode) {
        this.props.setMode(mode);
    }
    private arrows = [
        ['&#8598;', '&#8593;', '&#8599;'],
        ['&#8592;', '',        '&#8594;'],
        ['&#8601;', '&#8595;', '&#8600;'],
    ];
    private decideIcon(button: ResizeAnchorMode, widthChange: number, heightChange: number) {
        if (this.props.mode == button)
            return {__html: '&#9974;'}; // picture icon
        
        if (widthChange == 0 && heightChange == 0)
            return undefined;
        
        let buttonCoords = this.getCoords(button);
        let stateCoords = this.getCoords(this.props.mode);

        let dx = buttonCoords.x - stateCoords.x;
        let dy = buttonCoords.y - stateCoords.y;

        // only draw arrow if adjacent to selected icon
        if (Math.abs(dx) > 1 || Math.abs(dy) > 1)
            return undefined;

        if (widthChange == 0)
            dx = 0;
        if (heightChange == 0)
            dy = 0;

        // now dx and dy are both in range -1 .. 1
        let arrowX = widthChange >= 0 ? 1 + dx : 1 - dx;
        let arrowY = heightChange >= 0 ? 1 + dy : 1 - dy;
        
        return {__html: this.arrows[arrowY][arrowX]};
    }
    private getCoords(mode: ResizeAnchorMode): {x: number, y: number} {
        switch (mode) {
            case ResizeAnchorMode.TopLeft:
                return {x: -1, y: -1};
            case ResizeAnchorMode.TopMiddle:
                return {x: 0, y: -1};
            case ResizeAnchorMode.TopRight:
                return {x: 1, y: -1};
            case ResizeAnchorMode.CenterLeft:
                return {x: -1, y: 0};
            case ResizeAnchorMode.Center:
                return {x: 0, y: 0};
            case ResizeAnchorMode.CenterRight:
                return {x: 1, y: 0};
            case ResizeAnchorMode.BottomLeft:
                return {x: -1, y: 1};
            case ResizeAnchorMode.BottomMiddle:
                return {x: 0, y: 1};
            case ResizeAnchorMode.BottomRight:
                return {x: 1, y: 1};
        }
    }
}