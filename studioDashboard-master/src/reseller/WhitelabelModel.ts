import {StoreModel} from "../models/StoreModel";
import {List} from 'immutable';
export class WhitelabelModel extends StoreModel {

    constructor(data:any = {}) {
        super(data);
    }

    public getAccountStatus() {
        return this.getKey('accountStatus');
    }
}