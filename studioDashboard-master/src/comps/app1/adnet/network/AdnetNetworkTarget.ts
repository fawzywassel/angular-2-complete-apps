import {
    Component,
    ChangeDetectionStrategy,
    Input,
    ViewChild,
    Output,
    EventEmitter,
    ChangeDetectorRef
} from "@angular/core";
import {Lib} from "../../../../Lib";
import {AdnetTargetModel} from "../../../../adnet/AdnetTargetModel";
import {List} from "immutable";
import {
    IAdNetworkPropSelectedEvent,
    AdnetNetworkPropSelector
} from "./AdnetNetwork";
import {AdnetPackageModel} from "../../../../adnet/AdnetPackageModel";
import {SimpleGridTable} from "../../../simplegridmodule/SimpleGridTable";
import {ISimpleGridEdit} from "../../../simplegridmodule/SimpleGridModule";
import {AdnetPairModel} from "../../../../adnet/AdnetPairModel";
import {AppStore} from "angular2-redux-util";
import {AdnetCustomerModel} from "../../../../adnet/AdnetCustomerModel";
import {Compbaser} from "../../../compbaser/Compbaser";
import {AdnetActions} from "../../../../adnet/AdnetActions";

@Component({
    selector: 'AdnetNetworkTarget',
    styles: [`
        .disabled {
            opacity: 0.2;
            cursor: default;
        }
    `],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <small *ngIf="inDevMode" class="debug">{{me}}</small>
        <small *ngIf="!inDevMode" class="release">targets</small>
        <a class="pull-right" style="position: relative; top: 5px; right: 6px" 
                (click)="$event.preventDefault(); onRemoveTarget($event)" 
                    [ngClass]="{disabled: !selectedTargetModel || editMode == false}" href="#">
                <span class="remove fa fa-lg fa-times-circle"></span>
            </a>
            
        <div [hidden]="!adnetPackageModel && !adnetPairModels">
            <simpleGridTable>
                <thead>
                <tr>
                    <th [sortableHeader]="['Value','customerId']" [sort]="sort">customer</th>
                    <th [sortableHeader]="['Value','type']" [sort]="sort">type</th>
                    <th [sortableHeader]="['Value','label']" [sort]="sort">name</th>
                    <th [sortableHeader]="['Value','keys']" [sort]="sort">keys</th>
                </tr>
                </thead>
                <tbody>
                <tr class="simpleGridRecord" simpleGridRecord (onClicked)="onGridSelected($event)"
                    *ngFor="let item of adnetTargetModels | OrderBy:sort.field:sort.desc; let index=index" [item]="item"
                    [index]="index">
                    <td style="width: 14%" simpleGridData [processField]="processAdnetPackageField('getName')"
                        [item]="item"></td>
                    <td style="width: 14%" simpleGridData [processField]="processAdnetPackageField('getTargetTypeName')"
                        [item]="item"></td>
                    <td style="width: 14%" simpleGridData [processField]="processAdnetPackageField('getName')"
                        [item]="item"></td>
                    <td style="width: 14%" simpleGridData [processField]="processAdnetPackageField('getKeys')"
                        [item]="item"></td>
                </tr>
                </tbody>
            </simpleGridTable>
        </div>
    `
})

export class AdnetNetworkTarget extends Compbaser {
    constructor(private appStore: AppStore, private adnetActions: AdnetActions, private cd: ChangeDetectorRef) {
        super();
        this.cancelOnDestroy(
            this.appStore.sub((i_adnetPackageModels: List<AdnetPackageModel>) => {
                // this.updateModel(false);
                this.cd.markForCheck();
            }, 'adnet.packages')
        );
    }

    @Input()
    set setAdnetTargetModels(i_adnetTargetModels: List<AdnetTargetModel>) {
        this.deSelect();
        this.adnetTargetModels = i_adnetTargetModels;
    }

    @Input()
    set setAdnetPackageModels(i_adnetPackageModels: AdnetPackageModel) {
        this.simpleGridTable.deselect();
        this.adnetPackageModel = i_adnetPackageModels;
        // if (!this.adnetPackageModels)
        //     return;
    }

    @Input()
    set setPairOutgoing(i_setPairOutgoing: boolean) {
        this.pairOutgoing = i_setPairOutgoing;
        if (!this.adnetPairModels)
            return;
        this.filterTargets();
    }

    @Input() editMode:boolean = false;

    @Input()
    set setAdnetPairModels(i_adnetPairModels: List<AdnetPairModel>) {
        this.simpleGridTable.deselect();
        this.adnetPairModels = i_adnetPairModels;
        if (!this.adnetPairModels)
            return;
        this.filterTargets();
    }

    @Input()
    set setAdnetCustomerModel(i_adnetCustomerModel: AdnetCustomerModel) {
        this.adnetCustomerModel = i_adnetCustomerModel;
    }

    @Output() onAdnetTargetSelected: EventEmitter<AdnetTargetModel> = new EventEmitter<AdnetTargetModel>();

    @Output() onPropSelected: EventEmitter<IAdNetworkPropSelectedEvent> = new EventEmitter<IAdNetworkPropSelectedEvent>();

    @ViewChild(SimpleGridTable) simpleGridTable: SimpleGridTable;

    private selectedTargetModel: AdnetTargetModel;
    private adnetCustomerModel: AdnetCustomerModel;
    private adnetTargetModels: List<AdnetTargetModel>
    private adnetPairModels: List<AdnetPairModel>;
    private adnetPackageModel: AdnetPackageModel;
    private pairOutgoing: boolean;

    public sort: {field: string, desc: boolean} = {
        field: null,
        desc: false
    };

    private deSelect() {
        this.selectedTargetModel = null;
        this.simpleGridTable.deselect();
    }

    private onRemoveTarget(event) {
        if (!this.selectedTargetModel || this.editMode == false)
            return;
        var targetId = -1;
        this.adnetPackageModel.getTargets().map((i_target) => {
            if (i_target['Value']['targetId'] == this.selectedTargetModel.getId())
                targetId = i_target['Key'];
        })
        this.appStore.dispatch(this.adnetActions.removeAdnetTarget(targetId, this.adnetPackageModel));
    }

    private filterTargets() {
        this.adnetTargetModels = List<AdnetTargetModel>();
        var packages: List<AdnetPackageModel> = this.appStore.getState().adnet.getIn(['packages']) || {};
        var targets: List<AdnetTargetModel> = this.appStore.getState().adnet.getIn(['targets']) || {};
        var uniqueIds = [];

        /** Outgoing ads  **/
        if (this.pairOutgoing) {
            packages.forEach((i_package: AdnetPackageModel) => {
                if (i_package.deleted() == true)
                    return;
                var targetsIds = i_package.getTargetIds();
                targets.forEach((i_adnetTargetModel: AdnetTargetModel) => {
                    if (targetsIds.indexOf(i_adnetTargetModel.getId()) > -1) {
                        var adnetTargetCustomerId = i_adnetTargetModel.getCustomerId();
                        this.adnetPairModels.forEach((i_adnetPairModels: AdnetPairModel) => {
                            if (adnetTargetCustomerId == i_adnetPairModels.getToCustomerId()) {
                                this.adnetTargetModels = this.adnetTargetModels.push(i_adnetTargetModel);
                                // if (uniqueIds.indexOf(i_package.getId()) == -1) {
                                //     uniqueIds.push(i_package.getId())
                                //     this.adnetTargetModels = this.adnetTargetModels.push(i_adnetTargetModel);
                                // }
                            }
                        })
                    }
                });
            });
        } else {
            /** incoming ads  **/
            packages.forEach((i_package: AdnetPackageModel) => {
                if (i_package.deleted() == true)
                    return;
                var targetsIds = i_package.getTargetIds();
                targets.forEach((i_adnetTargetModel: AdnetTargetModel) => {
                    if (targetsIds.indexOf(i_adnetTargetModel.getId()) > -1) {
                        this.adnetPairModels.forEach((i_adnetPairModels: AdnetPairModel) => {
                            //todo: give an option for active and autoActivated on / off in UI
                            // if (i_adnetPairModels.active() == false && i_adnetPairModels.autoActivated() == false)
                            //     return;
                            //todo: give an enabled on / off in UI
                            if (i_adnetTargetModel.getEnabled() == false)
                                return;
                            var cusTotId = i_adnetPairModels.getToCustomerId();
                            var custId = i_adnetPairModels.getCustomerId();
                            var custIdSel = this.adnetCustomerModel.customerId();
                            var pkgCustId = i_package.getCustomerId();
                            if (pkgCustId == custId && cusTotId == custIdSel) {
                                if (uniqueIds.indexOf(i_adnetTargetModel.getId()) == -1) {
                                    uniqueIds.push(i_adnetTargetModel.getId())
                                    this.adnetTargetModels = this.adnetTargetModels.push(i_adnetTargetModel)
                                }
                            }
                        })
                    }
                });
            })
        }
    }

    private processAdnetPackageField(i_function: string) {
        return (i_adnetTargetModel: AdnetTargetModel) => {
            return i_adnetTargetModel[i_function]();
        }
    }

    private onGridSelected(simpleGridEdit: ISimpleGridEdit) {
        this.selectedTargetModel = simpleGridEdit.item as AdnetTargetModel;
        this.onAdnetTargetSelected.emit(simpleGridEdit.item as AdnetTargetModel);
        this.onPropSelected.emit({selected: AdnetNetworkPropSelector.TARGET})
    }
}



