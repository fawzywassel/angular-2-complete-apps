import {Component, ChangeDetectionStrategy, Input} from "@angular/core";
import {AdnetCustomerModel} from "../../../../adnet/AdnetCustomerModel";
import {AdnetPairModel} from "../../../../adnet/AdnetPairModel";
import {List} from "immutable";
import {IPairSelect} from "./AdnetNetworkCustomerSelector";
import {AdnetTargetModel} from "../../../../adnet/AdnetTargetModel";
import {AdnetPackageModel} from "../../../../adnet/AdnetPackageModel";
import {AdnetContentModel} from "../../../../adnet/AdnetContentModel";
// import AdnetNetworkTemplate from "./AdnetNetwork.html!text"; /*prod*/

export enum AdnetNetworkPropSelector {
    CONTENT, PACKAGE, RESOURCE, TARGET, PAIR, NONE, PACKAGE_VIEW
}

export enum AdnetPackagePlayMode {
    TIME, LOCATION, ASSETS
}

export interface IAdNetworkPropSelectedEvent {
    selected: AdnetNetworkPropSelector
}

export type TabType = "packagesTab" | "targetsTab"

@Component({
    selector: 'AdnetNetwork',
    templateUrl: './AdnetNetwork.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class AdnetNetwork {

    // constructor(@Inject(forwardRef(() => AdnetActions)) private adnetAction: AdnetActions){
    //     console.log(adnetAction);
    // }

    @Input()
    set setAdnetCustomerModel(i_adnetCustomerModel: AdnetCustomerModel) {
        this.adnetCustomerModel = i_adnetCustomerModel;
        if (this.adnetCustomerModel)
            this.adnetCustomerId = this.adnetCustomerModel.customerId();
    }

    private adnetNetworkPropSelector = AdnetNetworkPropSelector;
    private propSelectorPackageTab: AdnetNetworkPropSelector = AdnetNetworkPropSelector.CONTENT;
    private propSelectorTargetsTab: AdnetNetworkPropSelector = AdnetNetworkPropSelector.NONE;
    private adnetCustomerId: number = -1;
    private adnetCustomerModel: AdnetCustomerModel;
    private pairsSelected: List<AdnetPairModel>;
    private pairsOutgoing: boolean;
    private packageEditMode: boolean = false;

    /** packages tabs specific members **/
    private selectedAdnetTargetModels: List<AdnetTargetModel>;
    private selectedAdnetPackagePlayMode_tab_packages: AdnetPackagePlayMode;
    private selectedAdnetPackageModel_tab_packages: AdnetPackageModel;
    private selectedAdnetTargetModel_tab_packages: AdnetTargetModel;
    private selectedAdnetContentModel_tab_packages: AdnetContentModel;

    /**  target tabs specific members **/
    private selectedAdnetPackagePlayMode_tab_targets: AdnetPackagePlayMode;
    private selectedAdnetPackageModel_tab_targets: AdnetPackageModel;
    private selectedAdnetTargetModel_tab_targets: AdnetTargetModel;
    private selectedAdnetContentModel_tab_targets: AdnetContentModel;

    private onAdnetContentSelected(tab: TabType, event: AdnetContentModel) {
        switch (tab) {
            case 'packagesTab': {
                this.selectedAdnetContentModel_tab_packages = event;
                break;
            }
            case 'targetsTab': {
                this.selectedAdnetContentModel_tab_targets = event;
                break;
            }
        }
    }

    private onPropSelected(tab: TabType, event: IAdNetworkPropSelectedEvent) {
        switch (tab) {
            case 'packagesTab': {
                this.propSelectorPackageTab = event.selected;
                break;
            }
            case 'targetsTab': {
                this.propSelectorTargetsTab = event.selected;
                break;
            }
        }
    }

    private onPackageEditMode(event: boolean) {
        this.packageEditMode = event;
    }

    private onTabActive(tabName: TabType, event: boolean) {
    }

    private onPairSelected(event: IPairSelect) {
        this.selectedAdnetPackageModel_tab_packages = null;
        this.pairsSelected = event.pairs;
        this.pairsOutgoing = event.pairsOutgoing;
        this.selectedAdnetTargetModel_tab_packages = null;
        this.selectedAdnetTargetModel_tab_targets = null;
        this.selectedAdnetContentModel_tab_targets = null;
        this.selectedAdnetPackageModel_tab_targets = null;
    }

    private onAdnetTargetsSelected(i_adnetTargetModels: List<AdnetTargetModel>) {
        this.selectedAdnetTargetModels = i_adnetTargetModels;
    }

    private onAdnetTargetSelected(tab: TabType, i_adnetTargetModel: AdnetTargetModel) {

        switch (tab) {
            case 'packagesTab': {
                this.selectedAdnetTargetModel_tab_packages = i_adnetTargetModel;
                this.selectedAdnetPackageModel_tab_targets = null;
                break;
            }
            case 'targetsTab': {
                this.selectedAdnetTargetModel_tab_targets = i_adnetTargetModel;
                this.selectedAdnetPackageModel_tab_packages = null;
                this.selectedAdnetPackageModel_tab_targets = null;
                break;
            }
        }
    }

    private onSetPlayMode(tab: TabType, event: AdnetPackagePlayMode) {
        switch (tab) {
            case 'packagesTab': {
                this.selectedAdnetPackagePlayMode_tab_packages = event;
                break;
            }
            case 'targetsTab': {
                this.selectedAdnetPackagePlayMode_tab_targets = event;
                break;
            }
        }
    }

    private onAdnetPackageSelected(event: AdnetPackageModel) {
        this.selectedAdnetPackageModel_tab_packages = event;
        if (!event) {
            this.selectedAdnetPackageModel_tab_packages = null;
            this.selectedAdnetContentModel_tab_packages = null;
            return;
        }
        this.onSetPlayMode('packagesTab', event.playMode());
    }

    private onAdnetPackageSelectedTarget(event: AdnetPackageModel) {
        this.selectedAdnetPackageModel_tab_targets = event;
        this.onSetPlayMode('targetsTab', event.playMode());
    }
}