import {Http} from "@angular/http";
import {Injectable} from "@angular/core";
import {Actions, AppStore} from "angular2-redux-util";
import {OrderModel} from "./OrderModel";
import {Map, List} from 'immutable';
import {Subject} from "rxjs/Subject";
import {Observable} from "rxjs/Observable";
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/finally';
import 'rxjs/add/observable/throw';
import {SampleModel} from "../../../business/SampleModel";
import {Lib} from "../../../Lib";
import * as _ from 'lodash'
import * as xml2js from 'xml2js'
// import * as bootbox from 'bootbox';
import {OrderDetailModel} from "./OrderDetailModel";

export const REQUEST_ORDERS = 'REQUEST_ORDERS';
export const REQUEST_ORDER = 'REQUEST_ORDER';
export const RECEIVED_ORDER = 'RECEIVED_ORDER';
export const RECEIVED_ORDERS = 'RECEIVED_ORDERS';
export const RECEIVE_ACCOUNT_TYPE = 'RECEIVE_ACCOUNT_TYPE';

@Injectable()
export class OrdersAction extends Actions {
    parseString;

    constructor(private _http:Http, private appStore:AppStore) {
        super();
        this.parseString = xml2js.parseString;
    }

    public fetchOrder(orderId:string, accountType:string) {
        return (dispatch)=> {
            dispatch(this.requestOrder());
            var appdb:Map<string,any> = this.appStore.getState().appdb;
            var url;
            url = appdb.get('appBaseUrlCloud').replace('END_POINT', 'order') + `/${orderId}/${accountType}`
            this._http.get(url)
                .catch((err) => {
                    bootbox.alert('Error getting order details');
                    return Observable.throw(err);
                })
                .finally(() => {
                })
                .map((result:any) => {
                    var order:any = result.json();
                    var orderDetailModel:OrderDetailModel = new OrderDetailModel(order);
                    dispatch(this.receivedOrder(orderDetailModel));
                }).subscribe();
        }
    }

    public fetchOrders(dispatch, accountType:string) {
        dispatch(this.requestOrders());
        var appdb:Map<string,any> = this.appStore.getState().appdb;
        var url;
        url = appdb.get('appBaseUrlCloud').replace('END_POINT', 'orders') + `/${accountType}`
        this._http.get(url)
            .catch((err) => {
                bootbox.alert('Error updating account');
                return Observable.throw(err);
            })
            .finally(() => {
            })
            .map((result:any) => {
                var orders:any = result.json();
                var orderModels:List<OrderModel> = List<OrderModel>();
                orders.forEach((i_order) => {
                    var orderModel:OrderModel = new OrderModel(i_order);
                    orderModels = orderModels.push(orderModel);
                })
                dispatch(this.receivedOrders(orderModels));
            }).subscribe();
    }

    public fetchAccountType() {
        return (dispatch)=> {
            var appdb:Map<string,any> = this.appStore.getState().appdb;
            var url;
            url = appdb.get('appBaseUrlCloud').replace('END_POINT', 'getAccountType');
            this._http.get(url)
                .catch((err) => {
                    bootbox.alert('Error updating account');
                    return Observable.throw(err);
                })
                .finally(() => {
                })
                .map((result:any) => {
                    var accountType = result.json().accountType
                    dispatch(this.receiveAccountType(accountType))
                    if (accountType == 'UNKNOWN') {
                        bootbox.alert('Problem getting account type');
                        return;
                    }
                    this.fetchOrders(dispatch, accountType);
                }).subscribe();
        }
    }

    public requestOrders() {
        return {
            type: REQUEST_ORDERS
        }
    }

    public requestOrder() {
        return {
            type: REQUEST_ORDER
        }
    }

    public receiveAccountType(accountType:string) {
        return {
            type: RECEIVE_ACCOUNT_TYPE,
            accountType
        }
    }

    private receivedOrder(order:OrderDetailModel) {
        return {
            type: RECEIVED_ORDER,
            order
        }
    }

    private receivedOrders(orders:List<OrderModel>) {
        return {
            type: RECEIVED_ORDERS,
            orders
        }
    }

    private ngOnDestroy() {
    }

}
