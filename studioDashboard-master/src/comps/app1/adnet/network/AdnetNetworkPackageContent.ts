import {
    Component,
    ChangeDetectionStrategy,
    Input,
    ViewChild,
    EventEmitter,
    Output,
    ChangeDetectorRef
} from "@angular/core";
import {AdnetPackageModel} from "../../../../adnet/AdnetPackageModel";
import {AdnetContentModel} from "../../../../adnet/AdnetContentModel";
import {List} from 'immutable';
import {
    AdnetNetworkPropSelector,
    IAdNetworkPropSelectedEvent,
    AdnetPackagePlayMode
} from "./AdnetNetwork";
import {Lib} from "../../../../Lib";
import * as _ from 'lodash';
import {SimpleGridTable} from "../../../simplegridmodule/SimpleGridTable";
import {AppStore} from "angular2-redux-util";
import {AdnetActions} from "../../../../adnet/AdnetActions";
import {Compbaser} from "../../../compbaser/Compbaser";

@Component({
    selector: 'AdnetNetworkPackageContent',
    styles: [`
        .disabled {
            opacity: 0.2;
            cursor: default;
        }
    `],
    template: `
            <small class="release pull-right">content</small>
            <small *ngIf="inDevMode" class="debug">{{me}}</small>
            <a class="pull-right" style="position: relative; top: 5px; right: 6px" 
                (click)="$event.preventDefault(); onRemoveContent($event)" 
                    [ngClass]="{disabled: !selectedAdnetContentModel || editMode == false}" href="#">
                <span class="remove fa fa-lg fa-times-circle"></span>
            </a>
            <div [hidden]="!adnetPackageModels">
                <simpleGridTable #simpleGridR>
                    <thead>
                    <tr>
                        <th *ngIf="
                            adnetPackagePlayMode == AdnetPackagePlayMode.TIME ||
                            adnetPackagePlayMode == AdnetPackagePlayMode.LOCATION || 
                            adnetPackagePlayMode == AdnetPackagePlayMode.ASSETS"
                         [sortableHeader]="['Value','contentLabel']" [sort]="sort">name</th>
                        <th *ngIf="
                            adnetPackagePlayMode == AdnetPackagePlayMode.TIME ||
                            adnetPackagePlayMode == AdnetPackagePlayMode.LOCATION || 
                            adnetPackagePlayMode == AdnetPackagePlayMode.ASSETS"
                             [sortableHeader]="['Value','duration']" [sort]="sort">duration</th>
                        <th *ngIf="
                            adnetPackagePlayMode == AdnetPackagePlayMode.TIME"
                             [sortableHeader]="['Value','reparationsPerHour']" [sort]="sort">repetition</th>
                        <th *ngIf="
                            adnetPackagePlayMode == AdnetPackagePlayMode.TIME"
                             [sortableHeader]="['Value','percentage']" [sort]="sort">percentage</th>
                        <th *ngIf="
                            adnetPackagePlayMode == AdnetPackagePlayMode.LOCATION" 
                             [sortableHeader]="['Value','locationLat']" [sort]="sort">lat</th>
                        <th *ngIf="
                            adnetPackagePlayMode == AdnetPackagePlayMode.LOCATION" 
                             [sortableHeader]="['Value','locationLng']" [sort]="sort">lng</th>
                        <th *ngIf="
                            adnetPackagePlayMode == AdnetPackagePlayMode.LOCATION" 
                             [sortableHeader]="['Value','locationRadios']" [sort]="sort">radius</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr class="simpleGridRecord" (onClicked)="onContentSelect(item)" simpleGridRecord *ngFor="let item of adnetContents | OrderBy:sort.field:sort.desc; let index=index" [item]="item" [index]="index">
                        <td 
                         *ngIf="
                            adnetPackagePlayMode == AdnetPackagePlayMode.TIME ||
                            adnetPackagePlayMode == AdnetPackagePlayMode.LOCATION || 
                            adnetPackagePlayMode == AdnetPackagePlayMode.ASSETS"
                            style="width: 25%" simpleGridData [processField]="processAdnetPackageField('getName')" [item]="item"></td>
                        <td *ngIf="
                            adnetPackagePlayMode == AdnetPackagePlayMode.TIME ||
                            adnetPackagePlayMode == AdnetPackagePlayMode.LOCATION || 
                            adnetPackagePlayMode == AdnetPackagePlayMode.ASSETS"
                            simpleGridData [processField]="processAdnetPackageField('duration')" [item]="item"></td>
                        <td *ngIf="
                            adnetPackagePlayMode== AdnetPackagePlayMode.TIME"
                            simpleGridData [processField]="processAdnetPackageField('repetition')" [item]="item"></td>
                        <td *ngIf="
                            adnetPackagePlayMode== AdnetPackagePlayMode.TIME"
                            simpleGridData [processField]="processAdnetPackageField('percentage')" [item]="item"></td>
                        <td *ngIf="
                            adnetPackagePlayMode== AdnetPackagePlayMode.LOCATION" 
                            simpleGridData [processField]="processAdnetPackageField('locationLat')" [item]="item"></td>
                        <td *ngIf="
                            adnetPackagePlayMode== AdnetPackagePlayMode.LOCATION" 
                            simpleGridData [processField]="processAdnetPackageField('locationLng')" [item]="item"></td>
                        <td *ngIf="
                            adnetPackagePlayMode== AdnetPackagePlayMode.LOCATION" 
                            simpleGridData [processField]="processAdnetPackageField('locationRadios')" [item]="item"></td>
                    </tr>
                    </tbody>
                </simpleGridTable>
            </div>
              `,
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class AdnetNetworkPackageContent extends Compbaser {
    constructor(private appStore: AppStore, private adnetActions: AdnetActions, private cd: ChangeDetectorRef) {
        super();
        this.cancelOnDestroy(
            this.appStore.sub((i_adnetPackageModels: List<AdnetPackageModel>) => {
                this.updateModel(false);
                this.cd.markForCheck();
            }, 'adnet.packages')
        );
    }

    @ViewChild(SimpleGridTable) simpleGridTable: SimpleGridTable;

    @Input()
    set setAdnetPackageModels(i_adnetPackageModels: AdnetPackageModel) {
        this.adnetPackageModels = i_adnetPackageModels;
        this.updateModel();
    }

    @Input() editMode:boolean = false;

    @Input()
    set setAdnetPackagePlayMode(i_setAdnetPackagePlayMode: AdnetPackagePlayMode) {
        if (_.isUndefined(i_setAdnetPackagePlayMode))
            return
        this.adnetPackagePlayMode = i_setAdnetPackagePlayMode;
    }

    @Output() onPropSelected: EventEmitter<IAdNetworkPropSelectedEvent> = new EventEmitter<IAdNetworkPropSelectedEvent>();

    @Output() onAdnetContentSelected: EventEmitter<AdnetContentModel> = new EventEmitter<AdnetContentModel>();

    private onRemoveContent(event) {
        if (!this.selectedAdnetContentModel || this.editMode == false)
            return;
        console.log('removing content ' + this.selectedAdnetContentModel.getId());
        this.appStore.dispatch(this.adnetActions.removeAdnetPackageContent(this.adnetPackageModels, this.selectedAdnetContentModel.getId()));
        this.updateModel(true);
        this.onAdnetContentSelected.emit(null);
    }

    private updateModel(deselect: boolean = true) {
        if (!this.adnetPackageModels)
            return
        var contents = this.adnetPackageModels.getContents();
        this.adnetContents = List<AdnetContentModel>()
        for (let content in contents) {
            var data = contents[content];
            if (data.Value && data.Value.deleted)
                continue;
            var adnetContentModel: AdnetContentModel = new AdnetContentModel(data);
            this.adnetContents = this.adnetContents.push(adnetContentModel);
        }
        if (deselect) {
            this.simpleGridTable.deselect();
            this.selectedAdnetContentModel = null;
        }
    }

    private onContentSelect(i_content: AdnetContentModel) {
        this.selectedAdnetContentModel = i_content;
        this.onAdnetContentSelected.emit(i_content);
        this.onPropSelected.emit({
            selected: AdnetNetworkPropSelector.CONTENT
        })
    }

    private processAdnetPackageField(i_function: string) {
        return (i_adnetContentModel: AdnetContentModel) => {
            return i_adnetContentModel[i_function]();
        }
    }

    private AdnetPackagePlayMode = AdnetPackagePlayMode;
    private adnetPackagePlayMode: AdnetPackagePlayMode;
    private adnetContents: List<AdnetContentModel>;
    private adnetPackageModels: AdnetPackageModel;
    public selectedAdnetContentModel: AdnetContentModel;
    public sort: {field: string, desc: boolean} = {
        field: null,
        desc: false
    };
}


