import {StoreModel} from "../../../models/StoreModel";
import * as _ from "lodash";

/**
 * Thin wrapper of Immutable data around a single business
 * **/
export class OrderDetailModel extends StoreModel {

    constructor(data:any = {}) {
        super(data);
    }

    private fields = ['company', 'first_name', 'last_name', 'address1', 'address2', 'state', 'county', 'zip_code', 'phone1'];

    public getOrderId() {
        var subscription = this.getKey('subscription')
        if (subscription)
            return subscription.payment_id;
        return this.getKey('order').order_id;
    }

    private getCustomerInfo(type) {
        var str:string = '';
        var data = this.getKey(type);
        this.fields.forEach((field)=> {
            if (data[field] && data[field].length > 0)
                str = str + data[field] + '\n';
        })
        return str;
    }

    private toCurrency(value){
        value = parseFloat(value);
        return '$' + value.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
    }

    public getBilling() {
        return this.getCustomerInfo('billing');
    }

    public getOrderDetails():Array<any> {
        return this.getKey('orderDetails');
    }

    public getShipping() {
        return this.getCustomerInfo('shipping');
    }

    public getEmail() {
        return this.getKey('billing').email;
    }

    public getDiscount() {
        var order = this.getKey('order');
        if (_.isUndefined(order))
            return this.toCurrency(0);
        return this.toCurrency(order.discount_amount);
    }

    public getTax() {
        var order = this.getKey('order');
        if (_.isUndefined(order))
            return this.toCurrency(0);
        return this.toCurrency(order.tax_amount);
    }


    public getSubtotal() {
        var order = this.getKey('order');
        if (_.isUndefined(order))
            return this.toCurrency(99);
        return this.toCurrency(order.subtotal_amount);
    }

    public getTotal() {
        var order = this.getKey('order');
        if (_.isUndefined(order))
            return this.toCurrency(99)
        return this.toCurrency(order.amount);
    }

    public getShippingTotal() {
        var order = this.getKey('order');
        if (_.isUndefined(order))
            return this.toCurrency(0);
        return this.toCurrency(order.shipping_amount);
    }


    public getStatus() {
        var orderDetails = this.getKey('orderDetails');
        if (orderDetails.length == 0)
            return 'subscription';
        var status = this.getKey('orderDetails')[0].status;
        switch (status) {
            case -2:
                return 'in cart';
            case -1:
                return 'wait payments';
            case 0:
                return 'new order';
            case 1:
                return 'approved';
            case 2:
                return 'processing';
            case 3:
                return 'on hold';
            case 4:
                return 'quote';
            case 5:
                return 'completed';
        }
        return status;
    }

    public getTracking() {
        var subscription = this.getKey('subscription')
        if (subscription)
            return '';
        return this.getKey('orderDetails')[0].tracking;
    }

    public getDate() {
        var subscription = this.getKey('subscription')
        if (subscription)
            return new Date(subscription.payment_date).toLocaleDateString('us');
        return new Date(this.getKey('orderDetails')[0].order_date).toLocaleDateString('us');
    }
}


// if ($globs['db_mediapay']->numRows() != 0) {
//     $i = 0;
//     while ($row = $globs['db_mediapay']->fetchArray()) {
//
//         $i++;
//         $price = is_numeric($row['product_price']) ? $row['product_price'] : 0;
//         $member = array();
//         $member['type'] = 'order';
//         $member['orderID'] = $orderID;
//         $member['paymentDate'] = $row['order_date'];
//         $member['description'] = $row['description'];
//         $member['amount'] = $price;
//         $member['transaction_id'] = "undefined";
//         $member['quantity'] = !is_numeric($row['product_count']) ? 1 : $row['product_count'];
//         $member['product_id'] = $row['product_id'];
//         $member['total'] = $row['product_count'] * $price;;
//
//         $oData['subtotal'] = $oData['subtotal'] + ($member['quantity'] * $member['amount']);
//         $jData['products' . $i] = $member;
//     }
//
//     $jData['order']['subtotal'] = $oData['subtotal'];
//     echo json_encode($jData);
//     msBye();
//
// }

// while ($row = $globs['db_mediapay']->fetchArray()) {
//
//     $member['type'] = 'subscribtion';
//     $member['orderID'] = $row['payment_id'];
//     $member['paymentDate'] = $row['payment_date'];
//     $member['description'] = $row['description'];
//     $member['amount'] = $row['amount'];
//     $member['transaction_id'] = $row['transaction_id'];
//     $member['quantity'] = "1";
//     $member['product_id'] = "MS-1";
//     $member['total'] = "$99.00";
//
//     $jData['products1'] = $member;
//
//
// }
// if ($globs['db_mediapay']->numRows() != 0) {
//     echo json_encode($jData);
//     msBye();
// }