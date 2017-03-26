import {
    Component,
    Input,
    ChangeDetectionStrategy,
    EventEmitter,
    Output,
    ChangeDetectorRef,
    ViewChild
} from "@angular/core";
import {
    FormControl,
    FormGroup,
    FormBuilder
} from "@angular/forms";
import {AdnetActions} from "../../../../adnet/AdnetActions";
import {AppStore} from "angular2-redux-util";
import * as _ from "lodash";
import {
    IAdNetworkPropSelectedEvent,
    AdnetNetworkPropSelector
} from "./AdnetNetwork";
import {Compbaser} from "../../../compbaser/Compbaser";
import {AdnetCustomerModel} from "../../../../adnet/AdnetCustomerModel";
import {Lib} from "../../../../Lib";
import {AdnetTargetModel} from "../../../../adnet/AdnetTargetModel";
import {List} from "immutable";
import {
    IsimplelistItem,
    simplelist
} from "../../../simplelist/simplelist";
import {AdnetPackageModel} from "../../../../adnet/AdnetPackageModel";

@Component({
    selector: 'AdnetNetworkTargetSearch',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `<div>                
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
                                    <li *ngIf="this.globalNetworkEnabled" class="list-group-item">
                                        global Adnet search
                                        <div class="material-switch pull-right">
                                            <input (change)="onFormChange(customerNetwork2.checked)"
                                                   [formControl]="contGroup.controls['globalSearch']"
                                                   id="customerNetwork2" #customerNetwork2
                                                   name="customerNetwork2" type="checkbox"/>
                                            <label for="customerNetwork2" class="label-primary"></label>
                                        </div>
                                    </li>
                                    
                                    <li class="list-group-item">
                                        <div class="btn-group" role="group">
                                          <select  [formControl]="contGroup.controls['searchType']" style="width: 100%"  class="form-control">
                                            <option *ngFor="let item of searchTypes">{{item}}</option>
                                          </select>
                                        </div>
                                        <button (click)="onSearch($event)" class="pull-right btn btn-primary">Search</button>
                                    </li>
                                    <li class="list-group-item">
                                        <div class="input-group">
                                            <span class="input-group-addon"><i class="fa fa-circle-o-notch"></i></span>
                                            <input type="text" [formControl]="contGroup.controls['customerName']" 
                                                   class="form-control"
                                                   placeholder="customer name">
                                        </div>
                                    </li>
                                    <li class="list-group-item">
                                        <div class="input-group">
                                            <span class="input-group-addon"><i class="fa fa-circle-o-notch"></i></span>
                                            <input type="text" [formControl]="contGroup.controls['targetName']" 
                                                   class="form-control"
                                                   placeholder="target name">
                                        </div>
                                    </li>
                                    <li class="list-group-item">
                                        <div class="input-group">
                                            <span class="input-group-addon"><i class="fa fa-circle-o-notch"></i></span>
                                            <input type="text" [formControl]="contGroup.controls['targetKey']" 
                                                   class="form-control"
                                                   placeholder="target key">
                                        </div>
                                    </li>
                                    <li class="list-group-item">
                                        <div class="input-group">
                                            <span class="input-group-addon"><i class="fa fa-circle-o-notch"></i></span>
                                            <input type="number" [formControl]="contGroup.controls['lat']" 
                                                   class="form-control"
                                                   placeholder="lat">
                                        </div>
                                    </li>
                                    <li class="list-group-item">
                                        <div class="input-group">
                                            <span class="input-group-addon"><i class="fa fa-circle-o-notch"></i></span>
                                            <input type="number" [formControl]="contGroup.controls['lng']" 
                                                   class="form-control"
                                                   placeholder="lng">
                                        </div>
                                    </li>
                                    <li class="list-group-item">
                                        <div class="input-group">
                                            <span class="input-group-addon"><i class="fa fa-circle-o-notch"></i></span>
                                            <input type="number" [formControl]="contGroup.controls['radios']" 
                                                   class="form-control"
                                                   placeholder="lng">
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </form>
                <div (click)="$event.preventDefault()">
                    <a class="btns" (click)="onAdd($event)" href="#">
                        <br/>
                        <span style="font-size: 1.5em; color: black" [ngClass]="{disabled: !selectedAdnetTargetModel}" class="fa fa-plus"></span>
                    </a>                    
                </div>
                <simplelist (selected)="onTargetSelected($event)" [list]="adnetTargetModels" [content]="getContent()" [multiSelect]="false"></simplelist>
            </div>
    `,
    styles: [`
        .disabled {
            opacity: 0.5;
        }
        input.ng-invalid {
            border-right: 10px solid red;
        }
        .material-switch {
            position: relative;
            padding-top: 10px;
        }
        li {
            border: none;
        }
        i {
            width: 20px;
        }
    `]
})
export class AdnetNetworkTargetSearch extends Compbaser {
    constructor(private fb: FormBuilder, private appStore: AppStore, private adnetAction: AdnetActions, private cd: ChangeDetectorRef) {
        super();
        this.contGroup = fb.group({
            'searchType': [''],
            'globalSearch': [''],
            'customerName': [''],
            'targetName': [''],
            'targetKey': [''],
            'lat': [''],
            'lng': [''],
            'radios': ['']
        });
        _.forEach(this.contGroup.controls, (value, key: string) => {
            this.formInputs[key] = this.contGroup.controls[key] as FormControl;
        })
    }

    ngOnInit() {
        this.cancelOnDestroy(this.appStore.sub((i_adnetTargetModels: List<AdnetTargetModel>) => {
            //this.renderFormInputs();
            this.adnetTargetModels = null;
            this.adnetTargetModels = i_adnetTargetModels;
            this.cd.markForCheck();
        }, 'adnet.targets_search'));
    }

    @ViewChild(simplelist)
    simplelist: simplelist;

    @Input()
    set setAdnetCustomerModel(i_adnetCustomerModel: AdnetCustomerModel) {
        this.adnetCustomerModel = i_adnetCustomerModel;
        if (this.adnetCustomerModel)
            this.renderFormInputs();
    }

    @Input()
    set setAdnetPackageModels(i_adnetPackageModels: AdnetPackageModel) {
        this.adnetPackageModels = i_adnetPackageModels;
    }

    @Output() onPropSelected: EventEmitter<IAdNetworkPropSelectedEvent> = new EventEmitter<IAdNetworkPropSelectedEvent>();

    @Output() onAdnetTargetSelected: EventEmitter<AdnetTargetModel> = new EventEmitter<AdnetTargetModel>();

    private searchTypes: Array<any> = ['Select adnet search type:', 'Station', 'Mobile', 'Website'];
    private adnetPackageModels: AdnetPackageModel;
    private adnetCustomerModel: AdnetCustomerModel;
    private adnetTargetModels: List<AdnetTargetModel>;
    private selectedAdnetTargetModel: AdnetTargetModel;
    private contGroup: FormGroup;
    private formInputs = {};
    private globalNetworkEnabled: boolean = false;

    private getContent() {
        var self = this;
        return (i_adnetTargetModel: AdnetTargetModel) => {
            var customersList: List<AdnetCustomerModel> = self.appStore.getState().adnet.getIn(['customers']);
            var adnetTargetCustomerId = i_adnetTargetModel.getCustomerId();
            var adnetCustomerModel = customersList.filter((i_adnetCustomerModel: AdnetCustomerModel) => {
                return Number(adnetTargetCustomerId) == i_adnetCustomerModel.getId();
            }).first() as AdnetCustomerModel;
            return `${adnetCustomerModel.getName()} :: ${i_adnetTargetModel.getName()}`;
        }
    }

    private onAdd($event) {
        if (!this.adnetPackageModels)
            return bootbox.alert('first select a Package from the above accordion Packages tab, to add this file onto your selected package')
        this.selectedAdnetTargetModel = (this.simplelist.getSelected() as IsimplelistItem).item;
        this.appStore.dispatch(
            this.adnetAction.addAdnetTargetToPackage(
                this.selectedAdnetTargetModel,
                this.adnetPackageModels
            )
        );
    }

    private onSearch() {
        this.selectedAdnetTargetModel = null;
        this.simplelist.deselect();
        var searchType = this.searchTypes.indexOf(this.contGroup.value.searchType) - 1;
        searchType < 0 ? searchType = 0 : searchType;
        var globalSearch = this.contGroup.value.globalSearch == true ? 1 : 0;
        var lat = StringJS(this.contGroup.value.lat).isBlank() ? 0 : this.contGroup.value.lat;
        var lng = StringJS(this.contGroup.value.lng).isBlank() ? 0 : this.contGroup.value.lng;
        var radios = StringJS(this.contGroup.value.radios).isBlank() ? -1 : this.contGroup.value.radios;

        this.appStore.dispatch(
            this.adnetAction.searchAdnet(
                this.adnetCustomerModel.customerId(),
                searchType,
                this.contGroup.value.customerName,
                this.contGroup.value.targetName,
                this.contGroup.value.targetKey,
                globalSearch,
                lat,
                lng,
                radios
            ));
    }

    private onTargetSelected(list: Array<IsimplelistItem>) {
        this.selectedAdnetTargetModel = (this.simplelist.getSelected() as IsimplelistItem).item;
        this.onAdnetTargetSelected.emit(this.selectedAdnetTargetModel);
        this.onPropSelected.emit({selected: AdnetNetworkPropSelector.TARGET})

    }

    private onFormChange(event) {
        // this.updateSore();
    }

    // private updateSore() {
    //     // setTimeout(() => {
    //     // console.log(this.contGroup.status + ' ' + JSON.stringify(Lib.CleanCharForXml(this.contGroup.value)));
    //     // this.appStore.dispatch(this.adnetAction.saveCustomerInfo(Lib.CleanCharForXml(this.contGroup.value), this.customerModel.customerId()))
    //     // }, 1)
    // }

    private renderFormInputs() {
        this.globalNetworkEnabled = this.adnetCustomerModel.getGlobalNetwork();
        // _.forEach(this.formInputs, (value, key: string) => {
        //     var data = this.setadnetCustomerModel.getKey('Value')[key];
        //     this.formInputs[key].setValue(data)
        // });
    };
}
