import {StoreModel} from "../models/StoreModel";
import {Lib} from "../Lib";

export class AdnetPaymentModel extends StoreModel {

    constructor(data: any = {}) {
        super(data);
    }

    public getId() {
        return this.getKey('Key');
    }

    public date() {
       return Lib.ProcessDateField(this.getKey('Value').paymentDate);
    }

    public credit() {
        return this.getKey('Value').credit;
    }

    public prevCredit() {
        return this.getKey('Value').prevCredit;
    }

    public total() {
        return this.getKey('Value').credit + this.getKey('Value').prevCredit;
    }

    public transactionId() {
        return this.getKey('Value').transactionId;
    }

    public comment() {
        return this.getKey('Value').comment;
    }

}