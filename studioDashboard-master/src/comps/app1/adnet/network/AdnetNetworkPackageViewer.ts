import {
    Component,
    Input,
    ViewChild,
    Output,
    EventEmitter
} from "@angular/core";
import {AdnetCustomerModel} from "../../../../adnet/AdnetCustomerModel";
import {AdnetPairModel} from "../../../../adnet/AdnetPairModel";
import {List} from "immutable";
import {AdnetPackageModel} from "../../../../adnet/AdnetPackageModel";
import {AppStore} from "angular2-redux-util";
import {AdnetTargetModel} from "../../../../adnet/AdnetTargetModel";
import {Lib} from "../../../../Lib";
import {
    IAdNetworkPropSelectedEvent,
    AdnetNetworkPropSelector
} from "./AdnetNetwork";
import {SimpleGridTable} from "../../../simplegridmodule/SimpleGridTable";
import {Ngmslib} from "ng-mslib";
import {Compbaser} from "../../../compbaser/Compbaser";

@Component({
    selector: 'AdnetNetworkPackageViewer',
    styles: [`
        .width-sm {
            width: 10px !important;
        } 
        .width-md {
            width: 40px;
        }
        .width-lr {
            min-width: 200px !important;
        }
    `],
    templateUrl: './AdnetNetworkPackageViewer.html'
})

export class AdnetNetworkPackageViewer extends Compbaser {

    constructor(private appStore: AppStore) {
        super();
    }

    ngOnInit() {
        this.packages = this.appStore.getState().adnet.getIn(['packages']) || {};
        this.unsub1 = this.appStore.sub((i_adPackages: List<AdnetPackageModel>) => {
            this.packages = i_adPackages;
            this.onFilterPackages();
        }, 'adnet.packages');

        this.targets = this.appStore.getState().adnet.getIn(['targets']) || {};
        this.unsub2 = this.appStore.sub((i_adTargets: List<AdnetTargetModel>) => {
            this.targets = i_adTargets;
            this.onFilterPackages();
        }, 'adnet.targets');

        this.onFilterPackages();
    }

    @ViewChild(SimpleGridTable) simpleGridTable: SimpleGridTable

    @Input() filterByTargetModel: boolean = false;

    @Input()
    set setPairOutgoing(i_setPairOutgoing: boolean) {
        this.pairOutgoing = i_setPairOutgoing;
        this.onFilterPackages();
    }

    @Input()
    set setAdnetCustomerModel(i_adnetCustomerModel: AdnetCustomerModel) {
        this.adnetCustomerModel = i_adnetCustomerModel;
        this.onFilterPackages();
    }

    @Input()
    set setAdnetPairModels(i_adnetPairModels: List<AdnetPairModel>) {
        this.simpleGridTable.deselect();
        this.adnetPairModels = i_adnetPairModels;
        this.onFilterPackages();
    }

    @Input()
    set setAdnetTargetModel(i_adnetTargetModel: AdnetTargetModel) {
        this.simpleGridTable.deselect();
        this.adnetTargetModel = i_adnetTargetModel;
        if (!this.adnetTargetModel)
            return;
        this.onFilterPackages();
    }

    @Output() onAdnetPackageViewSelected: EventEmitter<AdnetPackageModel> = new EventEmitter<AdnetPackageModel>();

    @Output() onAdnetTargetsSelected: EventEmitter<List<AdnetTargetModel>> = new EventEmitter<List<AdnetTargetModel>>();

    @Output() onPropSelected: EventEmitter<IAdNetworkPropSelectedEvent> = new EventEmitter<IAdNetworkPropSelectedEvent>();

    private unsub1: Function;
    private unsub2: Function;
    private adnetCustomerModel: AdnetCustomerModel;
    private adnetPairModels: List<AdnetPairModel>;
    private targets: List<AdnetTargetModel>
    private packages: List<AdnetPackageModel>
    private adnetTargetModel: AdnetTargetModel;
    private packagesFiltered: List<AdnetPackageModel>
    private pairOutgoing: boolean

    private setAccessMask(event) {
    }

    private getAccessMask(i_adnetPackageModel: AdnetPackageModel) {
        var accessMask = i_adnetPackageModel.daysMask();
        return Lib.GetADaysMask(accessMask);
    }

    private onAdd(event) {
    }

    private onRemove(event) {
    }

    private onFilterPackages() {
        if (!this.targets || !this.packages || !this.adnetCustomerModel || !this.adnetPairModels)
            return;
        if (this.filterByTargetModel && !this.adnetTargetModel)
            return;
        this.packagesFiltered = List<AdnetPackageModel>();
        var uniqueIds = [];
        if (this.pairOutgoing) {
            /** Outgoing ads, reverse engineer from targets  **/
            this.packages.forEach((i_package: AdnetPackageModel) => {
                if (i_package.deleted() == true)
                    return;
                if (i_package.enabled() != true)
                    return;
                var targetsIds = i_package.getTargetIds();
                this.targets.forEach((i_adnetTargetModel: AdnetTargetModel) => {
                    if (targetsIds.indexOf(i_adnetTargetModel.getId()) > -1) {
                        var adnetTargetCustomerId = i_adnetTargetModel.getCustomerId();
                        this.adnetPairModels.forEach((i_adnetPairModels: AdnetPairModel) => {
                            if (adnetTargetCustomerId == i_adnetPairModels.getToCustomerId()) {
                                if (uniqueIds.indexOf(i_package.getId()) == -1) {
                                    uniqueIds.push(i_package.getId())
                                    if (this.filterByTargetModel) {
                                        if (i_package.getTargetIds().indexOf(this.adnetTargetModel.getId()) > -1)
                                            this.packagesFiltered = this.packagesFiltered.push(i_package);
                                    } else {
                                        this.packagesFiltered = this.packagesFiltered.push(i_package);
                                    }
                                }
                            }
                        })
                    }
                });
            });
        } else {
            /** Incoming ads **/
            this.packages.forEach((i_package: AdnetPackageModel) => {
                if (i_package.deleted() == true)
                    return;
                if (i_package.enabled() != true)
                    return;
                var targetsIds = i_package.getTargetIds();
                this.targets.forEach((i_adnetTargetModel: AdnetTargetModel) => {
                    if (targetsIds.indexOf(i_adnetTargetModel.getId()) > -1) {
                        this.adnetPairModels.forEach((i_adnetPairModels: AdnetPairModel) => {
                            //todo: give an option for active and autoActivated on / off in UI
                            // if (i_adnetPairModels.active() == false && i_adnetPairModels.autoActivated() == false)
                            //     return;
                            var cusTotId = i_adnetPairModels.getToCustomerId();
                            var custId = i_adnetPairModels.getCustomerId();
                            var custIdSel = this.adnetCustomerModel.customerId();
                            var pkgCustId = i_package.getCustomerId();
                            if (pkgCustId == custId && cusTotId == custIdSel) {
                                if (uniqueIds.indexOf(i_package.getId()) == -1) {
                                    uniqueIds.push(i_package.getId())
                                    if (this.filterByTargetModel) {
                                        if (i_package.getTargetIds().indexOf(this.adnetTargetModel.getId()) > -1)
                                            this.packagesFiltered = this.packagesFiltered.push(i_package);
                                    } else {
                                        this.packagesFiltered = this.packagesFiltered.push(i_package);
                                    }
                                }
                            }
                        })
                    }
                });
            })
        }
    }

    public sort: {field: string, desc: boolean} = {
        field: null,
        desc: false
    };

    private get getCustomerName() {
        return (i_adnetPackageModel: AdnetPackageModel) => {
            var customerId = i_adnetPackageModel.getCustomerId();
            var customersList: List<AdnetCustomerModel> = this.appStore.getState().adnet.getIn(['customers']) || {};
            var adnetCustomerModel: AdnetCustomerModel = customersList.filter((adnetCustomerModel: AdnetCustomerModel) => {
                return customerId == adnetCustomerModel.customerId();
            }).first() as AdnetCustomerModel;
            return adnetCustomerModel.getName();
        }
    }

    private processAdnetPackageField(i_function: string) {
        return (i_adnetPackageModel: AdnetPackageModel) => {

            switch (i_function) {
                case 'startDate': {
                }
                case 'endDate': {
                    var data = i_adnetPackageModel[i_function]()
                    return Lib.ProcessDateField(data, true);
                }
                case 'hourStart': {
                }
                case 'hourEnd': {
                    var data = i_adnetPackageModel[i_function]()
                    return Lib.ProcessHourStartEnd(data, i_function);
                }
                default: {
                    return i_adnetPackageModel[i_function]();
                }
            }
        }
    }

    private onContentSelect(adnetPackageModel: AdnetPackageModel) {
        var targetsIds = adnetPackageModel.getTargetIds();
        var targets: List<AdnetTargetModel> = this.appStore.getState().adnet.getIn(['targets']) || {};
        var selectedAdnetTargetModels = targets.filter((i_adnetTargetModel: AdnetTargetModel) => {
            if (i_adnetTargetModel.getField('enabled') == false)
                return false;
            if (i_adnetTargetModel.getCustomerId() != this.adnetPairModels.first().getToCustomerId())
                return false;
            return (targetsIds.indexOf(i_adnetTargetModel.getId()) > -1)
        }) as List<AdnetTargetModel>;
        this.onAdnetTargetsSelected.emit(selectedAdnetTargetModels);
        this.onAdnetPackageViewSelected.emit(<AdnetPackageModel>adnetPackageModel)
        this.onPropSelected.emit({
            selected: AdnetNetworkPropSelector.PACKAGE_VIEW
        })
    }

    private getName(i_adnetPackageModel: AdnetPackageModel) {
        if (i_adnetPackageModel)
            return i_adnetPackageModel.getName();
    }

    destroy() {
        this.unsub1();
        this.unsub2();
    }
}