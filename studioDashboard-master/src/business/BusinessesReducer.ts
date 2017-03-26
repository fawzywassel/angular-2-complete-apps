import {List} from 'immutable';
import * as BusinessAction from './BusinessAction';
import {BusinessModel} from "./BusinessModel";
import {Lib} from "../Lib";

export interface IBusinessAction {
    type: string;
    businesses: BusinessModel[];
    businessId?: string,
    key?: string,
    value: any
}

export default (state:List<BusinessModel> = List<BusinessModel>(), action:IBusinessAction):List<BusinessModel> => {

    function indexOf(businessId:string) {
        var res = state.findIndex((i:BusinessModel) => i.getBusinessId() === businessId);
        return Lib.CheckFoundIndex(res);
    }

    switch (action.type) {
        case BusinessAction.REQUEST_BUSINESSES:
            return state;
        case BusinessAction.RECEIVE_BUSINESSES:
            return List(action.businesses);
        case BusinessAction.SET_BUSINESS_DATA:
            return state.update(indexOf(action.businessId), (business:BusinessModel) => {
                return business.setKey<BusinessModel>(BusinessModel, action.key, action.value)
            });
        default:
            return state;
    }
}