import {Component, ViewChild, trigger, transition, animate, state, style} from "@angular/core";
import {AppStore} from "angular2-redux-util";
import {List} from "immutable";
import {OrdersAction} from "./OrdersAction";
import {OrderModel} from "./OrderModel";
import {AuthService} from "../../../services/AuthService";
import {simplelist, IsimplelistItem} from "../../simplelist/simplelist";
import * as _ from "lodash";

@Component({
    selector: 'Orders',
    templateUrl: './Orders.html',
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
        ])
    ]
})

export class Orders {
    constructor(private appStore: AppStore, private ordersAction: OrdersAction, private authService: AuthService) {
        var i_orders = this.appStore.getState().orders;
        this.orderList = i_orders.getIn(['customerOrders']);
        this.unsub = this.appStore.sub((i_orders: List<OrderModel>) => {
            this.orderList = i_orders
        }, 'orders.customerOrders');

        this.appStore.sub((i_order: OrderModel) => {
            this.selectedOrder = i_order
        }, 'orders.selectedOrder');
    }

    @ViewChild(simplelist)
    simplelist: simplelist;

    private selectedOrder: OrderModel;
    private unsub: Function;
    private orderList: List<OrderModel> = List<OrderModel>();

    private getContent(order: OrderModel) {
        // console.log(Math.random())
        var type = order.getOrderType();
        var paymentDate = order.getDate();
        var orderId = order.getOrderId();
        return `${type} ${orderId} ${paymentDate}`;
    }

    private onSelection() {
        if (!this.orderList)
            return;
        var orderSelected: {} = this.simplelist.getSelected();
        var accountType = this.appStore.getState().appdb.get('accountType');
        _.forEach(orderSelected, (order: IsimplelistItem) => {
            if (order.selected) {
                this.appStore.dispatch(this.ordersAction.fetchOrder(order.item.getOrderId(), accountType));
                return;
            }
        })
    }

    private ngOnDestroy() {
        this.unsub();
    }
}

