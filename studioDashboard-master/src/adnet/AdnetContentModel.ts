import {StoreModel} from "../models/StoreModel";
export class AdnetContentModel extends StoreModel {

    constructor(data: any = {}) {
        super(data);
    }

    public getId() {
        return this.getKey('Key');
    }

    public getName() {
        return this.getKey('Value').contentLabel;
    }

    public getExtension() {
        return this.getKey('Value').contentExt;
    }

    public getType() {
        return this.getKey('Value').contentType;
    }

    public getVolume() {
        return this.getKey('Value').contentVolume;
    }

    public getContentUrl() {
        return this.getKey('Value').contentUrl;
    }

    public duration() {
        return this.getKey('Value').duration;
    }

    public repetition() {
        return this.getKey('Value').reparationsPerHour;
    }

    public getDeleted() {
        return this.getKey('Value').deleted;
    }

    public percentage() {
        //todo: need to compute
        return 'TBA';
    }

    public locationLat() {
        return this.getKey('Value').locationLat;
    }

    public locationLng() {
        return this.getKey('Value').locationLng;
    }

    public locationRadios() {
        return this.getKey('Value').locationRadios;
    }
}


