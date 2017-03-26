import {StoreModel} from "../models/StoreModel";
import * as _ from "lodash";
export class AdnetCustomerModel extends StoreModel {

    constructor(data: any = {}) {
        super(data);
    }

    public getId() {
        return this.getKey('Key');
    }

    public customerId() {
        return this.getKey('Key');
    }

    public getGlobalNetwork():boolean {
        return this.getKey('Value').globalNetwork;
    }

    public getName() {
        return this.getKey('Value').label;
    }

    public getContact() {
        return this.getKey('Value').contactPerson;
    }

    public contactPhone() {
        return this.getKey('Value').contactPhone;
    }

    public contactPerson() {
        return this.getKey('Value').contactPerson;
    }

    public contactCell() {
        return this.getKey('Value').contactCell;
    }

    public comments() {
        return this.getKey('Value').comments;
    }

    public reviewRate() {
        return this.getKey('Value').reviewRate;
    }

    public reviewRateArr(): Array<number> {
        var v = this.getKey('Value').reviewRate;
        return _.range(Math.ceil(v));
    }

    public website() {
        return this.getKey('Value').website;
    }

    public locationLat() {
        return this.getKey('Value').locationLat;
    }

    public locationLng() {
        return this.getKey('Value').locationLng;
    }
}