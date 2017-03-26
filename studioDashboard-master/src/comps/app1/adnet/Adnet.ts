import {Component, trigger, state, style, transition, animate} from "@angular/core";
import {AppStore} from "angular2-redux-util";
import {AdnetCustomerModel} from "../../../adnet/AdnetCustomerModel";
import {List} from "immutable";
import {Router} from "@angular/router";
import {BusinessModel} from "../../../business/BusinessModel";
import {LocalStorage} from "../../../services/LocalStorage";
import {AdnetActions} from "../../../adnet/AdnetActions";
import {Compbaser} from "../../compbaser/Compbaser";

@Component({
    selector: 'Adnet',
    host: {
        '[@routeAnimation]': 'true',
        '[style.display]': "'block'"
    },
    animations: [
        trigger('routeAnimation', [
            state('*', style({opacity: 1})),
            transition('void => *', [
                style({opacity: 0}),
                animate(333)
            ]),
            transition('* => void', animate(333, style({opacity: 0})))
        ]),
        trigger('showState', [state('inactive', style({
            opacity: 0
        })), state('active', style({
            opacity: 1
        })), transition('* => active', animate('100ms ease-out')), transition('* => inactive', animate('100ms ease-out'))])],
    template: `
        <br/>
        <button (click)="onGoBack()" style="width: 40px; padding: 9px" type="button" class="btn btn-default">
          <span class="fa fa-chevron-left"></span>
        </button>
        <h3 style="float: right">{{adnetCustomerName}}</h3>
          <div>
            <!--<div (click)="$event.preventDefault()">-->
              <!--<div class="btn-group" dropdown (onToggle)="toggled($event)" [(isOpen)]="status.isopen">-->
                  <!--<button id="single-button" type="button" class="btn btn-primary" dropdownToggle>-->
                    <!--Select sub-account -->
                  <!--<span class="caret"></span>-->
                <!--</button>-->
                  <!--<ul dropdownMenu role="menu" aria-labelledby="single-button">-->
                    <!--<li *ngFor="let customer of businesses" (click)="onSelectedAdnetCustomer(customer)" role="menuitem"><a class="dropdown-item" href="#">{{customer.getName()}}</a></li>-->
                    <!--&lt;!&ndash;<li class="divider dropdown-divider"></li>&ndash;&gt;-->
                    <!--&lt;!&ndash;<li role="menuitem"><a class="dropdown-item" href="#">Separated link</a></li>&ndash;&gt;-->
                  <!--</ul>-->
              <!--</div>-->
            <!--</div>-->
            
            <!--<p-dropdown [options]="businesses" #dropDown (onChange)="onSelectedAdnetCustomer($event, dropDown.value)" [style]="{'width':'200px'}" [(ngModel)]="selectedBusinessId" filter="filter"></p-dropdown>-->
            
          </div>
          <br/>
          <div [@showState]="showState">
                <tabs>
                    <tab [tabtitle]="'Configuration'">
                      <AdnetConfig [setAdnetCustomerModel]="adnetCustomerModel"></AdnetConfig>
                    </tab>
                    <tab [tabtitle]="'Network'">
                      <AdnetNetwork [setAdnetCustomerModel]="adnetCustomerModel"></AdnetNetwork>
                    </tab>
                    <tab [tabtitle]="'Billing'">
                      <AdnetBilling [setAdnetCustomerModel]="adnetCustomerModel"></AdnetBilling>
                    </tab>
                </tabs>
          </div>
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
})

export class Adnet extends Compbaser {

    constructor(private appStore: AppStore, private router: Router, private adnetActions: AdnetActions, private localStorage: LocalStorage) {
        super();
        //todo: fix if data in localstore is invalid
        this.adnetCustomerId = this.localStorage.getItem('adnet_customer_id');
        this.adnetTokenId = this.localStorage.getItem('adnet_token_id');
        this.businessId = this.localStorage.getItem('business_id');
        // this.listenAdnetDataReady();

        this.buildBusinessList();
        this.showDropdownSelection();
        this.cancelOnDestroy(this.appStore.sub((i_businesses: List<BusinessModel>) => {
            this.buildBusinessList();
            this.showDropdownSelection();
        }, 'business.businesses'))

        var adnet = this.appStore.getState().adnet;
        this.adnetCustomers = adnet.getIn(['customers']);
        this.loadAdnetCustomerModel();
    }

    private onGoBack(){
        this.router.navigate(['/App1/Adnet']);
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

    // private listenAdnetDataReady() {
    //     this.cancelOnDestroy(this.adnetActions.onAdnetDataReady().subscribe((data) => {
    //         var adnet = this.appStore.getState().adnet;
    //         this.adnetCustomers = adnet.getIn(['customers']);
    //         this.loadAdnetCustomerModel();
    //     }));
    // }

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

        // setTimeout(() => {
        //     this.adnetCustomerId = businessSelected.getAdnetCustomerId();
        //     this.adnetTokenId = businessSelected.getAdnetTokenId();
        //     this.adnetCustomerName = businessSelected.getName();
        //
        //     if (_.isUndefined(this.adnetCustomerId) || _.isNull(this.adnetCustomerId) || this.adnetCustomerId < 10 || _.isEmpty(this.adnetCustomerId)) {
        //         return bootbox.alert('This must be an old account and so it does not have an adnet token. Please login to it directly at least once so we cab generate an Adnet token for it.')
        //     }
        //     this.localStorage.setItem('adnet_customer_id', this.adnetCustomerId);
        //     this.localStorage.setItem('adnet_token_id', this.adnetTokenId);
        //     this.localStorage.setItem('business_id', businessSelected.getBusinessId());
        //     this.appStore.dispatch(this.adnetActions.getAdnet(this.adnetCustomerId, this.adnetTokenId));
        //     this.showState = 'active'
        // }, 110)
    }

    public toggled(open: boolean): void {
    }

    destroy() {
    }
}

