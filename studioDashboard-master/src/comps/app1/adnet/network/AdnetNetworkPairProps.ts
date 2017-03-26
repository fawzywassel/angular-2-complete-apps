import {
    Component,
    Input,
    ChangeDetectionStrategy
} from "@angular/core";
import {
    FormControl,
    FormGroup,
    FormBuilder
} from "@angular/forms";
import {AdnetActions} from "../../../../adnet/AdnetActions";
import {AppStore} from "angular2-redux-util";
import * as _ from "lodash";
import {List} from "immutable";
import {AdnetPairModel} from "../../../../adnet/AdnetPairModel";
import {Compbaser} from "../../../compbaser/Compbaser";



@Component({
    selector: 'AdnetNetworkPairProps',
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        '(input-blur)': 't_onFormChange($event)'
    },
    template: `
                <div>
                <form novalidate autocomplete="off" [formGroup]="contGroup">
                    <div class="row">
                        <div class="inner userGeneral">
                            <div class="panel panel-default tallPanel">
                                <div class="panel-heading">
                                    <small class="release">target properties
                                        <i style="font-size: 1.4em" class="fa fa-cog pull-right"></i>
                                    </small>
                                <small *ngIf="inDevMode" class="debug">{{me}}</small>
                                </div>
                                <ul class="list-group">
                                   
                                    <li *ngIf="pairOutgoing==false" class="list-group-item">
                                        auto active
                                        <div class="material-switch pull-right">
                                            <input (change)="t_onFormChange(customerNetwork1.checked)"
                                                   [formControl]="contGroup.controls['autoActivate']"
                                                   id="customerNetwork1" #customerNetwork1
                                                   name="customerNetwork1" type="checkbox"/>
                                            <label for="customerNetwork1" class="label-primary"></label>
                                        </div>
                                    </li>
                                    
                                  <li *ngIf="pairOutgoing==false" class="list-group-item">
                                        activated
                                        <div class="material-switch pull-right">
                                            <input (change)="t_onFormChange(customerNetwork2.checked)"
                                                   [formControl]="contGroup.controls['activated']"
                                                   id="customerNetwork2" #customerNetwork2
                                                   name="customerNetwork2" type="checkbox"/>
                                            <label for="customerNetwork2" class="label-primary"></label>
                                        </div>
                                    </li>
                                   
                                  <li *ngIf="pairOutgoing==true" class="list-group-item">
                                        acquaintance
                                        <div class="material-switch pull-right">
                                            <input (change)="t_onFormChange(customerNetwork3.checked)"
                                                   [formControl]="contGroup.controls['friend']"
                                                   id="customerNetwork3" #customerNetwork3
                                                   name="customerNetwork3" type="checkbox"/>
                                            <label for="customerNetwork3" class="label-primary"></label>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
    `,
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
export class AdnetNetworkPairProps extends Compbaser {
    constructor(private fb: FormBuilder, private appStore: AppStore, private adnetAction: AdnetActions) {
        super();
        this.contGroup = fb.group({
            'autoActivate': [''],
            'activated': [''],
            'friend': ['']
        });
        _.forEach(this.contGroup.controls, (value, key: string) => {
            this.formInputs[key] = this.contGroup.controls[key] as FormControl;
        })
    }

    private pairOutgoing: boolean;
    private adnetPairModel: AdnetPairModel;
    private contGroup: FormGroup;
    private formInputs = {};

    @Input()
    set setAdnetPairModels(i_adnetPairModel: List<AdnetPairModel>) {
        if (!i_adnetPairModel)
            return;
        this.adnetPairModel = i_adnetPairModel.first();
        if (this.adnetPairModel)
            this.renderFormInputs();
    }

    @Input()
    set setPairOutgoing(i_setPairOutgoing: boolean) {
        this.pairOutgoing = i_setPairOutgoing;
    }

    public t_onFormChange(event) {
        this.updateSore();
    }

    private updateSore() {
        setTimeout(() => {
            if (this.pairOutgoing){
                this.appStore.dispatch(this.adnetAction.updPairOutgoing(this.adnetPairModel, this.contGroup.value))
            } else {
                this.appStore.dispatch(this.adnetAction.updPairIncoming(this.adnetPairModel, this.contGroup.value))
            }

        }, 1)
    }

    private renderFormInputs() {
        if (!this.adnetPairModel)
            return;
        _.forEach(this.formInputs, (value, key: string) => {
            var data = this.adnetPairModel.getKey('Value')[key];
            this.formInputs[key].setValue(data)
        });
    };
}
