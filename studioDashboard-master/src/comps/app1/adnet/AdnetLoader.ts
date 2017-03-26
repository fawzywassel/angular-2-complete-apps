import {Component} from "@angular/core";
import {Router} from "@angular/router";
import {AppStore} from "angular2-redux-util";
import {AdnetCustomerModel} from "../../../adnet/AdnetCustomerModel";
import {List} from "immutable";
import {BusinessModel} from "../../../business/BusinessModel";
import {LocalStorage} from "../../../services/LocalStorage";
import {AdnetActions} from "../../../adnet/AdnetActions";
import {Compbaser} from "../../compbaser/Compbaser";
import {Ngmslib} from "ng-mslib";
import * as _ from "lodash";

@Component({
    template: `
            <small *ngIf="inDevMode" class="debug">{{me}}</small>
            <br/>
            <h5 *ngIf="loadingAdnetData==false" class="release">Customer selector
                <i style="font-size: 1.4em" class="fa fa-cog pull-right"></i>
            </h5>
            <Loading *ngIf="loadingAdnetData==true" [size]="'100px'" [style]="{'margin-top': '150px'}"></Loading>
            <p-dropdown *ngIf="loadingAdnetData==false" [options]="businesses" #dropDown (onChange)="onSelectedAdnetCustomer($event, dropDown.value)" [style]="{'width':'200px'}" [(ngModel)]="selectedBusinessId" filter="filter"></p-dropdown>
            <router-outlet></router-outlet>
            `,
    styles: [`
        :host >>> .fa-caret-down {
            position: relative;
            left: -5px;
        } 
        :host >>> .ui-dropdown {
          padding-right: 1.3em;
        }
    `],
    selector: 'AdnetLoader'
})

export class AdnetLoader extends Compbaser {
    constructor(private router: Router, private appStore: AppStore, private adnetActions: AdnetActions, private localStorage: LocalStorage) {
        super();
        // this.me = Ngmslib.GetCompSelector(this.constructor, this)
        this.listenAdnetDataReady();
        this.buildBusinessList();
        this.showDropdownSelection();
        this.cancelOnDestroy(this.appStore.sub((i_businesses: List<BusinessModel>) => {
            this.buildBusinessList();
            this.showDropdownSelection();
        }, 'business.businesses'))
    }

    private buildBusinessList() {
        var bus = this.appStore.getState().business.getIn(['businesses']);
        if (!bus)
            return
        this.businesses = bus.toArray().map((i_businessModel: BusinessModel) => {
            return {
                label: i_businessModel.getName(),
                value: i_businessModel.getBusinessId()
            }
        })
    }

    ngOnInit() {
        this.cancelOnDestroy(this.appStore.sub((i_adnetCustomerModels: List<AdnetCustomerModel>) => {
            if (!this.adnetCustomerModel)
                return this.adnetCustomerModel = null;
            this.adnetCustomerModel = i_adnetCustomerModels.filter((i_customerModel: AdnetCustomerModel) => {
                return i_customerModel.getId() == this.adnetCustomerModel.getId()
            }).first() as AdnetCustomerModel;
        }, 'adnet.customers'));
    }

    private loadingAdnetData: boolean = false;
    private selectedBusinessId = -1;
    private businessId: number;
    private adnetCustomerId: number = -1;
    private adnetTokenId: number = -1;
    private adnetCustomerName: string = '';
    private businesses: Array<any>;
    private adnetCustomers: List<AdnetCustomerModel>
    private adnetCustomerModel: AdnetCustomerModel;
    private showState: string = 'active';
    public disabled: boolean = false;
    public status: {isopen: boolean} = {isopen: false};

    private listenAdnetDataReady() {
        this.cancelOnDestroy(
            this.adnetActions.onAdnetDataReady().subscribe((data) => {
                var adnet = this.appStore.getState().adnet;
                this.adnetCustomers = adnet.getIn(['customers']);
                this.loadAdnetCustomerModel();
                this.router.navigate(['/App1/Adnet/Adnet2']);
            })
        );
    }

    private loadAdnetCustomerModel() {
        if (!this.adnetCustomers)
            return;
        this.adnetCustomerModel = this.adnetCustomers.filter((i_adnetCustomerModel: AdnetCustomerModel) => {
            return Number(this.adnetCustomerId) == i_adnetCustomerModel.getId();
        }).first() as AdnetCustomerModel;
    }

    private showDropdownSelection() {
        if (!this.businesses || !this.businessId)
            return;
        var selectedBusinessId = this.businesses.filter((item) => {
            return Number(item.value) == this.businessId;
        })
        this.selectedBusinessId = selectedBusinessId[0] ? selectedBusinessId[0].value : -1;
    }

    public onSelectedAdnetCustomer(event, i_businessId: number): void {
        // reset to no selection before loading new selection
        this.showState = 'inactive'
        this.loadingAdnetData = true;
        this.appStore.dispatch(this.adnetActions.resetAdnet());
        setTimeout(() => {
            this.adnetCustomerId = -1;
            this.adnetCustomerModel = null;
            this.adnetTokenId = null;
        }, 100);

        var business = this.appStore.getState().business;
        var businessSelected: BusinessModel = business.getIn(['businesses']).filter((i_business: BusinessModel) => {
            return i_business.getBusinessId() == i_businessId;
        }).first() as BusinessModel;

        setTimeout(() => {
            this.adnetCustomerId = businessSelected.getAdnetCustomerId();
            this.adnetTokenId = businessSelected.getAdnetTokenId();
            this.adnetCustomerName = businessSelected.getName();

            if (_.isUndefined(this.adnetCustomerId) || _.isNull(this.adnetCustomerId) || this.adnetCustomerId < 10 || _.isEmpty(this.adnetCustomerId)) {
                bootbox.alert('This must be an old account and so it does not have an adnet token. Please login to it directly at least once so we cab generate an Adnet token for it.')
                this.loadingAdnetData = false;
                return;
            }
            this.localStorage.setItem('adnet_customer_id', this.adnetCustomerId);
            this.localStorage.setItem('adnet_token_id', this.adnetTokenId);
            this.localStorage.setItem('business_id', businessSelected.getBusinessId());
            this.loadingAdnetData = true;
            this.router.navigate([`/App1/Adnet/Adnet2/${this.adnetCustomerId}/${this.adnetTokenId}`]);
            this.showState = 'active'
        }, 110)
    }

    public toggled(open: boolean): void {
    }

    destroy() {
    }


}