import {StoreModel} from "../models/StoreModel";
import {AdnetActions} from "./AdnetActions";

export class AdnetPairModel extends StoreModel {

    constructor(data: any = {}) {
        super(data);
    }

    public getId() {
        return this.getKey('Key');
    }

    public getCustomerId() {
        return this.getKey('Value').customerId;
    }

    public get customerId() {
        return this.getKey('Value').customerId;
    }

    public getToCustomerId() {
        return this.getKey('Value').toCustomerId;
    }

    public get toCustomerId() {
        return this.getKey('Value').toCustomerId;
    }

    public customerToName(i_adnetAction:AdnetActions) {
        var customerId = this.getKey('Value').customerId;
        return i_adnetAction.getCustomerName(customerId);
    }

    public customerIdToName(i_adnetAction:AdnetActions) {
        var customerId = this.getKey('Value').toCustomerId;
        return i_adnetAction.getCustomerName(customerId);
    }

    public active() {
        return this.getKey('Value').activated;
    }

    public autoActivated() {
        return this.getKey('Value').autoActivate;
    }

    public getTotalDebit() {
        return this.getKey('Value').totalDebit;
    }

    public getTotalTransfer() {
        return this.getKey('Value').totalTransfer;
    }

    public getTransfers():Array<any> {
        return this.getKey('Value').transfers;
    }

    public getReports() {
        return this.getKey('Value').summaryReport;
    }

    public setField(i_field, i_value) {
        var value = this.getKey('Value');
        value[i_field] = i_value;
        return this.setKey<AdnetPairModel>(AdnetPairModel, 'Value', value);
    }
}