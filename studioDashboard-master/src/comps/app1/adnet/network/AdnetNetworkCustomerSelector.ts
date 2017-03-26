import {
    Component,
    ChangeDetectionStrategy,
    Input,
    ViewChild,
    Output,
    EventEmitter,
    ChangeDetectorRef
} from "@angular/core";
import {AdnetCustomerModel} from "../../../../adnet/AdnetCustomerModel";
import {AdnetPairModel} from "../../../../adnet/AdnetPairModel";
import {List} from 'immutable';
import {AppStore} from "angular2-redux-util";
import {StoreModel} from "../../../../models/StoreModel";
import {simplelist} from "../../../simplelist/simplelist";
import {Observable} from "rxjs/Observable";
import {Observer} from "rxjs/Observer";
import {Subscription} from "rxjs/Subscription";
import * as _ from 'lodash';
import {Lib} from "../../../../Lib";
import {
    IAdNetworkPropSelectedEvent,
    AdnetNetworkPropSelector
} from "./AdnetNetwork";
import {Compbaser} from "../../../compbaser/Compbaser";

export interface IPairSelect {
    pairs: List<AdnetPairModel>,
    pairsOutgoing: boolean
}

@Component({
    selector: 'AdnetNetworkCustomerSelector',
    styles: [`
        .mn {margin-left: 4px; width: 80%; } option { font-size: 16px; }
        .faPlace {
        padding-right: 10px;
        font-size: 1.6em;
        position: relative;
        top: 2px;
        }
`],
    template: `   
            <small *ngIf="inDevMode" class="debug">{{me}}</small>
            <select style="font-family:'FontAwesome', Arial;" (change)="onChanges($event)" class="mn form-control custom longInput">
                <option>&#xf112; Outgoing</option>
                <option>&#xf064; Incoming</option>
            </select>
            <br/>
            <button (click)="onEditMode()"
                [ngClass]="{'btn-primary': packageEditMode}" class="btn-sm mn btn">
                <div *ngIf="packageEditMode && outgoing == true">
                    <span class="faPlace fa fa-edit"></span>
                    select all (edit mode)
                </div>
                <div style="opacity: 0.3" *ngIf="!packageEditMode && outgoing == true">
                    <span class="faPlace fa fa-edit"></span>
                    select all (edit mode)                        
                </div>
                <div *ngIf="packageEditMode && outgoing == false">
                    <span class="faPlace fa fa-list"></span>
                    select all
                </div>                
                <div *ngIf="!packageEditMode && outgoing == false">
                    <span class="faPlace fa fa-list"></span>
                    select all                        
                </div>
            </button>
            <div style="padding-left: 20px">
               <simplelist *ngIf="outgoing" #simplelistOutgoing
                    [list]="pairsFilteredOutgoing"
                    (itemClicked)="packageEditMode = false"
                    (selected)="onSelecting($event)"
                    [multiSelect]="true" 
                    [contentId]="getPairId" [content]="getPairName()">
                </simplelist>
                
                <simplelist *ngIf="!outgoing" #simplelistIncoming 
                    [list]="pairsFilteredIncoming"
                    (itemClicked)="packageEditMode = false"
                    (selected)="onSelecting($event)"
                    [multiSelect]="true" 
                    [contentId]="getPairId" [content]="getPairName()">
                </simplelist>
            </div>
            `,
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class AdnetNetworkCustomerSelector extends Compbaser {
    constructor(private appStore: AppStore, private cd: ChangeDetectorRef) {
        super();
    }

    ngOnInit() {
        this.pairs = this.appStore.getState().adnet.getIn(['pairs']) || {};
        this.cancelOnDestroy(
            this.appStore.sub((i_pairs: List<AdnetPairModel>) => {
                this.pairs = i_pairs;
                this.filterPairs();
            }, 'adnet.pairs')
        );
        this.filterPairs();
        this.listenOnCustomerSelected();
        this.announceChange();
        this.selectAllDelayed();
    }

    @ViewChild('simplelistOutgoing') simplelistOutgoing: simplelist;

    @ViewChild('simplelistIncoming') simplelistIncoming: simplelist;

    @Output() onPropSelected: EventEmitter<IAdNetworkPropSelectedEvent> = new EventEmitter<IAdNetworkPropSelectedEvent>();

    @Output() onPackageEditMode: EventEmitter<boolean> = new EventEmitter<boolean>();

    @Input()
    set setAdnetCustomerModel(i_adnetCustomerModel: AdnetCustomerModel) {
        this.adnetCustomerModel = i_adnetCustomerModel;
        if (this.adnetCustomerModel) {
            this.adnetCustomerId = this.adnetCustomerModel.customerId();
            this.filterPairs();
        }
    }

    @Output() onPairsSelected: EventEmitter<IPairSelect> = new EventEmitter<IPairSelect>();

    // private obs: Subscription;
    private observer: Observer<any>;
    private outgoing = true;
    private pairs: List<AdnetPairModel>
    private pairsFilteredIncoming: List<AdnetPairModel>
    private pairsFilteredOutgoing: List<AdnetPairModel>
    private pairsSelected: List<AdnetPairModel>
    // private unsub: Function;
    private adnetCustomerId: number = -1;
    private adnetCustomerModel: AdnetCustomerModel;
    private packageEditMode: boolean = true;

    private getIndex(list: List<any>, id: number) {
        return list.findIndex((i: StoreModel) => i['getId']() === id);
    }

    private listenOnCustomerSelected() {
        this.cancelOnDestroy(
            Observable.create((observer: Observer<any>) => {
                this.observer = observer;
            }).debounceTime(50).subscribe((v) => {
                this.pairsSelected = List<AdnetPairModel>();
                _.forEach(v, (value, key) => {
                    if (value.selected == true) {
                        var index = this.getIndex(this.pairs, Number(key))
                        if (index > -1)
                            this.pairsSelected = this.pairsSelected.push(this.pairs.get(index));
                    }
                })
                this.announceChange();
            })
        )
    }

    private onSelecting(event) {
        this.observer.next(event)
    }

    private onEditMode() {
        this.packageEditMode = true;
        if (this.simplelistIncoming)
            this.simplelistIncoming.itemAllSelected();
        if (this.simplelistOutgoing)
            this.simplelistOutgoing.itemAllSelected();
    }

    private getPairId(i_adnetPairModel: AdnetPairModel) {
        if (!i_adnetPairModel)
            return;
        return i_adnetPairModel.getId();
    }

    private getPairName(i_adnetPairModel: AdnetPairModel) {
        var self = this;
        return (i_adnetPairModel: AdnetPairModel) => {
            var customers: List<AdnetCustomerModel> = self.appStore.getState().adnet.getIn(['customers']);
            if (this.outgoing) {
                var index = this.getIndex(customers, i_adnetPairModel.getToCustomerId())
            } else {
                var index = this.getIndex(customers, i_adnetPairModel.getCustomerId())
            }
            var customer: AdnetCustomerModel = customers.get(index);
            return customer.getName();
        }
    }

    private filterPairs() {
        if (!this.pairs)
            return;
        this.pairsFilteredIncoming = List<AdnetPairModel>();
        this.pairsFilteredOutgoing = List<AdnetPairModel>();
        this.pairs.forEach((i_pair: AdnetPairModel) => {
            if (this.outgoing) {
                if (i_pair.getCustomerId() == this.adnetCustomerId)
                    this.pairsFilteredOutgoing = this.pairsFilteredOutgoing.push(i_pair);
            } else {
                if (i_pair.getToCustomerId() == this.adnetCustomerId)
                    this.pairsFilteredIncoming = this.pairsFilteredIncoming.push(i_pair);
            }
        })
        this.cd.markForCheck();
    }

    private onChanges(event) {
        this.outgoing = !this.outgoing;
        if (this.simplelistOutgoing) this.simplelistOutgoing.deselect();
        if (this.simplelistIncoming) this.simplelistIncoming.deselect();
        this.filterPairs();
        this.announceChange();
        this.selectAllDelayed();
    }

    private selectAllDelayed() {
        setTimeout(() => {
            this.onEditMode();
        }, 10)
    }

    private announceChange() {
        const data: IPairSelect = {
            pairs: this.pairsSelected,
            pairsOutgoing: this.outgoing
        }
        this.onPairsSelected.emit(<IPairSelect>data);
        if (this.pairsSelected && this.pairsSelected.size == 1) {
            this.onPropSelected.emit({selected: AdnetNetworkPropSelector.PAIR})

        }
        if (this.pairsSelected && this.pairsSelected.size > 1) {
            this.onPropSelected.emit({selected: AdnetNetworkPropSelector.NONE})
        }
        this.onPackageEditMode.emit(this.packageEditMode)
    }

    // private ngOnDestroy() {
    //     this.unsub();
    //     this.obs.unsubscribe();
    // }
}

