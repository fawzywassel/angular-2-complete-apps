import {StoreModel} from "../models/StoreModel";
export class AdnetTargetModel extends StoreModel {

    constructor(data: any = {}) {
        super(data);
    }

    public setId(value): AdnetTargetModel {
        var targetData = this.getData().toJS();
        targetData['Key'] = value;
        targetData['Value'].id = value;
        return this.setData<AdnetTargetModel>(AdnetTargetModel, targetData);
    }

    public getId() {
        return this.getKey('Key');
    }

    public getName() {
        return this.getKey('Value').label;
    }

    public getEnabled() {
        return this.getKey('Value').enabled;
    }

    public getDeleted() {
        return this.getKey('Value').deleted;
    }

    public getCoordinates() {
        var lat = this.getKey('Value').locationLat;
        var lng = this.getKey('Value').locationLng;
        if (!lat)
            lat = 0;
        if (!lng)
            lng = 0;
        return {
            lat,
            lng
        };
    }

    public getRateId() {
        return this.getKey('Value').rateId || ''
    }

    public getHandleRateId() {
        return -1;
        // return this.getKey('Value').hRate;
    }

    public getField(i_field) {
        return this.getKey('Value')[i_field];
    }

    public setField(i_field, i_value) {
        var value = this.getKey('Value');
        value[i_field] = i_value;
        return this.setKey<AdnetTargetModel>(AdnetTargetModel, 'Value', value);
    }

    public getCustomerId() {
        return this.getKey('Value').customerId;
    }

    public getKeys() {
        return this.getKey('Value').keys;
    }

    public getComments() {
        return this.getKey('Value').comments;
    }

    public getTargetType() {
        return this.getKey('Value').targetType;
    }

    public getTargetTypeName() {
        var v = this.getKey('Value').targetType;
        switch (v){
            case 0: {
                return 'Station';
            }
            case 1: {
              return 'Station';
            }
            case 2: {
                return 'Web';

            }
        }
    }
}