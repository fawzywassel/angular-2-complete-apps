import {
    Component,
    Input,
    QueryList,
    ViewChildren,
    ChangeDetectionStrategy,
    EventEmitter,
    Output
} from "@angular/core";
import {
    FormControl,
    FormGroup,
    FormBuilder
} from "@angular/forms";
import {AdnetActions} from "../../../../adnet/AdnetActions";
import {AppStore} from "angular2-redux-util";
import {Lib} from "../../../../Lib";
import * as _ from "lodash";
import {AdnetPackageModel} from "../../../../adnet/AdnetPackageModel";
import {List} from "immutable";
import {AdnetPackagePlayMode} from "./AdnetNetwork";
import {Ngmslib} from "ng-mslib";
import {Compbaser} from "../../../compbaser/Compbaser";

@Component({
    selector: 'AdnetNetworkPackageProps',
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {'(input-blur)': 'onFormChange($event)'},
    templateUrl: './AdnetNetworkPackageProps.html',
    styleUrls: ['./AdnetNetworkPackageCommonStyles.css']
})
export class AdnetNetworkPackageProps extends Compbaser {
    constructor(private fb: FormBuilder, private appStore: AppStore, private adnetAction: AdnetActions) {
        super();
        this.contGroup = fb.group({
            'autoAddSiblings': [''],
            'channel': [''],
            'contents': [''],
            'customerId': [''],
            'daysMask': [''],
            'deleted': [''],
            'enabled': [''],
            'endDate': [''],
            'hourEnd': [''],
            'hourStart': [''],
            'label': [''],
            'modified': [''],
            'playMode': [''],
            'siblingsKey': [''],
            'startDate': [''],
        });
        _.forEach(this.contGroup.controls, (value, key: string) => {
            this.formInputs[key] = this.contGroup.controls[key] as FormControl;
        })
    }

    @Output() playModeChanged: EventEmitter<AdnetPackagePlayMode> = new EventEmitter<AdnetPackagePlayMode>();

    @Input()
    set setAdnetPackageModels(i_adnetPackageModels: AdnetPackageModel) {
        this.adnetPackageModels = i_adnetPackageModels;
        if (!i_adnetPackageModels)
            return;
        this.adnetPackageDays = Lib.GetADaysMask(this.adnetPackageModels.daysMask());
        this.renderFormInputs();
        // this.simpleGridTable.deselect();
    }

    @ViewChildren('checkInputs') inputs: QueryList<any>

    private adnetPackageModels: AdnetPackageModel;
    private adnetPackageDays: List<any> = List<any>()
    private contGroup: FormGroup;
    private formInputs = {};
    private packageName = '';
    private hours = ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23'];

    private onFormChange(event) {
        this.updateSore();
    }

    private onModelChanged(event) {
        this.playModeChanged.emit(event.target.value);
        //AdnetPackagePlayMode
    }

    private numToDay(num) {
        var days = ['sun','mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
        return days[num];
    }

    private updateSore() {
        setTimeout(() => {
            var payload = Lib.CleanCharForXml(this.contGroup.value);
            payload.daysMask = this.getUpdatedDays();
            this.appStore.dispatch(this.adnetAction.updAdnetPackageProps(payload, this.adnetPackageModels));
        }, 1)
    }

    private getUpdatedDays() {
        // this.cdr.detach();
        let values = []
        this.inputs.map(v => {
            values.push(v.nativeElement.checked);
        });
        //this.changed.emit({item: this.m_storeModel, value: values});
        var updateDaysMask = Lib.ComputeMask(values);
        return updateDaysMask;
    }

    private getOptionField(key, index) {
        if (!this.adnetPackageModels)
            return;
        var value = this.adnetPackageModels.getKey('Value')[key];
        if (value == index) {
            // this.cd.detectChanges();
            return 'selected'
        }
        return '';
    }

    private renderFormInputs() {
        if (!this.adnetPackageModels)
            return;
        _.forEach(this.formInputs, (value, key: string) => {
            var data;
            switch (key) {
                case 'startDate': {
                }
                case 'endDate': {
                    var data = this.adnetPackageModels.getKey('Value')[key];
                    data = Lib.ProcessDateField(data, true);
                    break;
                }
                default: {
                    data = this.adnetPackageModels.getKey('Value')[key];
                }
            }
            this.formInputs[key].setValue(data)
            // var enabled = this.formInputs['enabled'].value;
            // if (enabled){
            //     this.formInputs[key].enable();
            // } else {
            //     this.formInputs[key].disable();
            // }
        });
    };
}