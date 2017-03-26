import {Component, Input, Output, EventEmitter, HostBinding, HostListener} from "@angular/core";
import TodoStatsModel from "./TodoStatsModel";
import {StyleDecorator} from "../../../comps/styledecorator/StyleDecorator";

var backgroundColor = "#FFFFFF",
    lightGray = "#EDEDED",
    padding = "10px";

/**
 * A really cool example of using a custom decorator for a component, see  StyleDecorator source
 * reference: https://github.com/cstefanache/ng2-styler
 * reference: http://www.thatguyjackguy.com/tech/web-component-styling/
 **/
@StyleDecorator({
    "div": {
        padding: '1em'
    }
})

@Component({
    selector: 'Todo2',
    styleUrls: ['./TodoStatsModel.css'],
    host: {
        '[style.background-color]': 'colorInput(color)',
        '[class.show_border]': 'input(show_border)',
        '[class.large]': 'input(large)',
        'style': 'font-size: 1.1em',
        'class': 'some_class_to_add',
    },
    template: ` <div>
                    <small>I am todo2 component</small>                     
                    <h5>1. component decorated using a custom @StyleDecorator (padding)</h5>
                    <h5>2. component is passed in style via inputs and evaluates (light class)</h5>
                    <h5>3. component is styled using deep css selector from parent component (border)</h5>
                    <h5>4. component height is styled externally via [style.height.px]="boxWidth"</h5>
                    <h2 *ngIf="onMyEvent.observers.length">Someone is bound to my onMyEvent... yay...</h2>                    
                    <ng-content></ng-content>
                    <div class="update-text">Total To-Do updates from server: {{todoStatModel.updates}}</div>
                    <div class="update-text">Total To-Do reads from server: {{todoStatModel.reads}}</div>
                    <div class="update-text">Total To-Do creates from server: {{todoStatModel.creates}}</div>
                    <div class="update-text">Total To-Do deletes from server: {{todoStatModel.deletes}}</div>
                    <p>Width is {{boxWidth}} percent </p><pre>@HostBinding('style.width.%')</pre>
                    <p>Windows width size is (resize window width to see @HostBinding take effect): {{winSize}}</p>
                </div>
                    `
})

export class Todo2 {

    constructor(private todoStatModel: TodoStatsModel) {
    }

    ngOnInit() {
    }

    @Input() show_border;
    @Input() large;
    @Output() onMyEvent = new EventEmitter<any>();

    // automatically bind the style width of the parent hosting element to our default input boxWidth member
    // if you set a value to boxWidth, that will be the width of your containing host element
    // @HostBinding('style.width.px')
    // @HostBinding('style.width.em')
    @HostBinding('style.width.%')
    @Input()
    boxWidth: number = 50;

    @HostListener('window:resize', ['$event.target.innerWidth'])
    onResize(val) {
        this.winSize = val + 'px';
    }

    public okIsVisible = false;
    public winSize;

    private input(attr) {
        return attr !== undefined;
    }

    @Input() color;
    private myColorValue;


    colorInput(color: string) {
        switch (this.color) {
            case 'blue':
                return '#00ffe1';
            case 'gray':
                return '#efefef';
            default:
                return '#6482d6';
        }
    }
}


