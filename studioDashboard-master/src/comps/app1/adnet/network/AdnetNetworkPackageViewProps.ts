import {
    Component,
    Input
} from "@angular/core";
import {AdnetPackageModel} from "../../../../adnet/AdnetPackageModel";
import {Ngmslib} from "ng-mslib";
import {Compbaser} from "../../../compbaser/Compbaser";

@Component({
    selector: 'AdnetNetworkPackageViewProps',
    templateUrl: './AdnetNetworkPackageViewProps.html',
    styles: [``]
})

export class AdnetNetworkPackageViewProps extends Compbaser{
    constructor() {
        super();
    }

    @Input()
    set setAdnetPackageModel(i_adnetPackageModels: AdnetPackageModel) {
        this.adnetPackageModels = i_adnetPackageModels;
    }

    private adnetPackageModels: AdnetPackageModel;
}