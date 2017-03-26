import {
    Component,
    Input,
    ChangeDetectionStrategy
} from "@angular/core";
import {
    FormControl,
    FormGroup,
    FormBuilder,
    Validators
} from "@angular/forms";
import {AdnetActions} from "../../../../adnet/AdnetActions";
import {AppStore} from "angular2-redux-util";
import {AdnetContentModel} from "../../../../adnet/AdnetContentModel";
import {Lib} from "../../../../Lib";
import * as _ from "lodash";
import {AdnetPackageModel} from "../../../../adnet/AdnetPackageModel";
import {List} from "immutable";
import {Ngmslib} from "ng-mslib";
import {Compbaser} from "../../../compbaser/Compbaser";

//todo: add volume property control of contentType == video

@Component({
    selector: 'AdnetNetworkPackageContentProps',
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {'(input-blur)': 'onFormChange($event)'},
    templateUrl: './AdnetNetworkPackageContentProps.html',
    styleUrls: ['./AdnetNetworkPackageCommonStyles.css']
})
export class AdnetNetworkPackageContentProps extends Compbaser{
    constructor(private fb: FormBuilder, private appStore: AppStore, private adnetAction: AdnetActions) {
        super();
        this.contGroup = fb.group({
            'maintainAspectRatio': [''],
            'duration': ['10'],
            'reparationsPerHour': ['60'],
            'locationLat': [''],
            'locationLng': [''],
            'locationRadios': [''],
        });
        _.forEach(this.contGroup.controls, (value, key: string) => {
            this.formInputs[key] = this.contGroup.controls[key] as FormControl;
        })
    }

    @Input()
    set setAdnetPackageModels(i_adnetPackageModels: AdnetPackageModel) {
        if (!i_adnetPackageModels)
            return;
        this.adnetPackageModels = i_adnetPackageModels;
        this.renderFormInputs();
    }

    @Input()
    set setAdnetContentModels(i_adnetContentModels: AdnetContentModel) {
        this.adnetContentModels = i_adnetContentModels;
        if (!i_adnetContentModels)
            return;
        this.renderFormInputs();
    }

    @Input() showResourceOnly: boolean = false;

    private adnetPackageModels: AdnetPackageModel;
    private adnetContentModels: AdnetContentModel;
    private contGroup: FormGroup;
    private formInputs = {};
    private resource: string = '';

    private onFormChange(event) {
        this.updateSore();
    }

    private updateSore() {
        setTimeout(() => {
            var payload = Lib.CleanCharForXml(this.contGroup.value);
            this.appStore.dispatch(this.adnetAction.updAdnetContentProps(payload, this.adnetContentModels, this.adnetPackageModels));
        }, 1)
    }

    private renderFormInputs() {
        if (!this.adnetContentModels)
            return;
        this.resource = this.adnetContentModels.getContentUrl()
        _.forEach(this.formInputs, (value, key: string) => {
            var data = this.adnetContentModels.getKey('Value')[key];
            this.formInputs[key].setValue(data)
        });
    };
}


