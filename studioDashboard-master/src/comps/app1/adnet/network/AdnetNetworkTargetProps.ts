import {Component, Input, ChangeDetectionStrategy, ViewChild} from "@angular/core";
import {FormControl, FormGroup, FormBuilder} from "@angular/forms";
import {AppStore} from "angular2-redux-util";
import {Lib} from "../../../../Lib";
import * as _ from "lodash";
import {AdnetTargetModel} from "../../../../adnet/AdnetTargetModel";
import {AdnetCustomerModel} from "../../../../adnet/AdnetCustomerModel";
import {List} from "immutable";
import {AdnetRateModel} from "../../../../adnet/AdnetRateModel";
import {ModalComponent} from "ng2-bs3-modal/components/modal";
import {Compbaser} from "../../../compbaser/Compbaser";


@Component({
    selector: 'AdnetNetworkTargetProps',
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        '(input-blur)': 'onFormChange($event)'
    },
    templateUrl: './AdnetNetworkTargetProps.html',
    styles: [`        
        input.ng-invalid {
            border-right: 10px solid red;
        }
        .material-switch {
            position: relative;
            padding-top: 10px;
        }
        .input-group {
            padding-top: 10px;
        }
        i {
            width: 20px;
        }
    `]
})
export class AdnetNetworkTargetProps extends Compbaser {
    constructor(private fb: FormBuilder, private appStore: AppStore) {
        super();
        this.contGroup = fb.group({
            'keys': [''],
            'comments': [''],
            'rate': ['']
        });
        _.forEach(this.contGroup.controls, (value, key: string) => {
            this.formInputs[key] = this.contGroup.controls[key] as FormControl;
        })
    }

    @ViewChild('modalRateTable')
    modalRateTable: ModalComponent;

    @Input()
    set setAdnetTargetModel(i_adnetTargetModel: AdnetTargetModel) {
        this.adnetTargetModel = i_adnetTargetModel;
        if (!this.adnetTargetModel)
            return;
        var customerId = this.adnetTargetModel.getCustomerId();
        var customersList: List<AdnetCustomerModel> = this.appStore.getState().adnet.getIn(['customers']) || {};
        this.adnetCustomerModel = customersList.filter((adnetCustomerModel: AdnetCustomerModel) => {
            return customerId == adnetCustomerModel.customerId();
        }).first() as AdnetCustomerModel;
    }

    private adnetTargetModel: AdnetTargetModel;
    private adnetCustomerModel: AdnetCustomerModel;
    private adnetRateModel: AdnetRateModel;
    private contGroup: FormGroup;
    private formInputs = {};

    private getReviewIcon(item, index): string {
        var reviewRate = this.adnetCustomerModel.reviewRate();
        reviewRate = reviewRate - index;
        if (reviewRate <= 0)
            return 'fa-star-o';
        if (reviewRate > 0 && reviewRate < 1)
            return 'fa-star-half-o';
        return 'fa-star';
    }

    private onModalClose(event) {
    }

    private onShowRates() {
        var rateId = this.adnetTargetModel.getRateId();
        if (rateId == 0)
            return
        var customersList: List<AdnetRateModel> = this.appStore.getState().adnet.getIn(['rates']) || {};
        this.adnetRateModel = customersList.filter((adnetRateTable: AdnetRateModel) => {
            return rateId == adnetRateTable.getId();
        }).first() as AdnetRateModel;
        // console.log(this.adnetRateModel.rateMap());
        this.modalRateTable.open('lg');
    }

    private updateSore() {
        setTimeout(() => {
            console.log(this.contGroup.status + ' ' + JSON.stringify(Lib.CleanCharForXml(this.contGroup.value)));
            //this.appStore.dispatch(this.adnetAction.saveCustomerInfo(Lib.CleanCharForXml(this.contGroup.value), this.customerModel.customerId()))
        }, 1)
    }

    private renderFormInputs() {
        if (!this.adnetTargetModel)
            return;
        _.forEach(this.formInputs, (value, key: string) => {
            var data = this.adnetTargetModel.getKey('Value')[key];
            this.formInputs[key].setValue(data)
        });
    };
}

