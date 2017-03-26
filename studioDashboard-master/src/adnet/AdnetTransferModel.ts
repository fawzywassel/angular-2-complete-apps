import {StoreModel} from "../models/StoreModel";
import {Lib} from "../Lib";
import {AdnetActions} from "./AdnetActions";

export class AdnetTransferModel extends StoreModel {

    constructor(data: any = {}) {
        super(data);
    }

    public getId() {
        return this.getKey('Key');
    }

    public getCustomerId() {
        return this.getKey('Value').customerId;
    }

    public getToCustomerId() {
        return this.getKey('Value').toCustomerId;
    }

    public date() {
        return Lib.ProcessDateField(this.getKey('Value').transferDate);
    }

    public getTransferAmount() {
        return this.getKey('Value').transferAmount;
    }

    public send(i_customerId) {
        if (this.getCustomerId() == i_customerId){
            return StringJS(this.getTransferAmount()).toCurrency();
        } else {
            return StringJS(0).toCurrency();
        }
    }

    public receive(i_customerId) {
        if (this.getCustomerId() == i_customerId){
            return StringJS(0).toCurrency();
        } else {
            return StringJS(this.getTransferAmount()).toCurrency();
        }
    }

    public getCustomerName(i_customerId, i_adnetAction:AdnetActions) {
        if (this.getCustomerId() == i_customerId){
            return `to: ${i_adnetAction.getCustomerName(this.getToCustomerId())}`;
        } else {
            return `from: ${i_adnetAction.getCustomerName(this.getCustomerId())}`;
        }
    }

    public prevAmount() {
        return this.getKey('Value').prevAmount;
    }

    public getComment() {
        return this.getKey('Value').comment;
    }


}