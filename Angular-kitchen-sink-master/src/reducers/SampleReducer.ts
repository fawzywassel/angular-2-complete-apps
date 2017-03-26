import {List, Map} from 'immutable';
import * as SampleActions from "../actions/SampleActions";
import {ServerModel} from "../models/ServerModel";

export default function sample_reducer(state:Map<string,any> = Map<string,any>(), action:any):Map<string, List<ServerModel>> {

  switch (action.type) {
    case SampleActions.SERVERS_STATUS: {
      var model = new ServerModel(action.payload);
      return state.setIn(['servers'], model);
    }
    case SampleActions.GENERAL_STATUS: {
      return state.setIn(['general'], action.payload);
    }
    case SampleActions.PING: {
      return state.setIn(['pings'], true);
    }
    case SampleActions.PONG: {
      return state.setIn(['pings'], false);
    }
    default:
      return state;
  }
}

