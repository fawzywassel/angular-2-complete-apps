import {List} from 'immutable';
import {Map} from 'immutable';
import * as StationsAction from "./StationsAction";
import {StationModel} from "./StationModel";
import * as _ from 'lodash'
import {Lib} from "../Lib";

export function stations(state:Map<string,any> = Map<string,any>(), action:any):Map<string, List<StationModel>> {

    function indexOfStation(businessId, stationId):any {
        var res = stations.findIndex((i:StationModel) => {
            return i.getKey('businessId') === businessId && i.getKey('id') == stationId;
        });
        return Lib.CheckFoundIndex(res);
    }

    switch (action.type) {
        case StationsAction.RECEIVE_STATIONS:
            return state.update(action.source, (value) => action.stations);

        case StationsAction.RECEIVE_STATIONS_GEO:
            for (var i in action.payload) {
                var station = action.payload[i];
                var source = station.source;
                var stations:List<StationModel> = state.get(source);
                stations = stations.update(indexOfStation(station.businessId, station.id), (i_station:StationModel) => {
                    return i_station.setKey<StationModel>(StationModel, 'geoLocation', {
                        lat: station.lat,
                        lon: station.lon,
                        city: station.city,
                        country: station.country
                    })
                });
                state = state.setIn([source], stations);
            }
            return state;
        default:
            return state;
    }
}
