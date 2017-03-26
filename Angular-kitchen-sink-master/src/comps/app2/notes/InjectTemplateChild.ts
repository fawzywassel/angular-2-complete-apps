// for reference see: http://www.bennadel.com/blog/3116-using-an-item-template-with-an-html-dropdown-menu-component-in-angular-2-rc-3.htm

import {Component, ContentChild, EventEmitter, TemplateRef} from "@angular/core";

@Component({
    selector: "InjectTemplateChild",
    inputs: ["items", "value", "placeholder"],
    outputs: ["valueChange"],
    styles: [`
        * { 
           cursor: pointer
        }
    `],
    // Query for the template being provided by the calling context.
    queries: {
        itemTemplate: new ContentChild(TemplateRef)
    },
    host: {
        "[class.is-open]": "isShowingItems"
    },
    template: `
		<div (click)="toggleItems()" class="dropdown-root" [ngSwitch]="!!value">
			<div *ngSwitchCase="true" class="dropdown-item-content">
				<template
					[ngTemplateOutlet]="itemTemplate"
					[ngOutletContext]="{ item: value, index: -1 }">
				</template>

			</div>
			<div *ngSwitchCase="false" class="placeholder">
                <button>
			    	{{ placeholder || "Nothing Selected" }}
               </button>
			</div>
		</div>

		<ul *ngIf="isShowingItems" class="dropdown-items">
			<li	*ngFor="let item of items ; let index = index" (click)="selectItem( item )" class="dropdown-item">
				<div class="dropdown-item-content">
					<template
						[ngTemplateOutlet]="itemTemplate"
						[ngOutletContext]="{ item: item, index: index }">
					</template>
				</div>
			</li>
		</ul>
	`
})
export class InjectTemplateChild {

    constructor() {
        this.isShowingItems = false;
        this.valueChange = new EventEmitter();
    }

    // I determine if the dropdown items are being shown.
    public isShowingItems: boolean;

    // INPUT: I am the collection of items used to render the dropdown items.
    public items: any[];

    // INPUT: I am the text to show when no item is selected.
    public placeholder: string;

    // INPUT: I am the currently selected value.
    public value: any;

    // OUTPUT: I am the output event stream that emits the item selected by the user.
    public valueChange: EventEmitter<any>;

    public hideItems(): void {
        this.isShowingItems = false;

    }


    // I select the given item.
    // --
    // NOTE: Since this is a one-way data flow, the selection is being emitted rather
    // than applied directly to the value.
    public selectItem(item: any): void {
        this.hideItems();
        this.valueChange.emit(item);
    }

    // I show the dropdown items.
    public showItems(): void {
        this.isShowingItems = true;
    }

    // I show or hide the dropdown items depending on their current visibility.
    public toggleItems(): void {
        this.isShowingItems
            ? this.hideItems()
            : this.showItems()
        ;

    }

}