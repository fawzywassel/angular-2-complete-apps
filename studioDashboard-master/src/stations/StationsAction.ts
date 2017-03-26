import {Injectable} from "@angular/core";
import {Actions, AppStore} from "angular2-redux-util";
import {Observable} from "rxjs/Observable";
import {List, Map} from 'immutable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/finally';
import 'rxjs/add/observable/throw';
import {
    Headers,
    Http,
    Response,
    Request,
    RequestOptions,
    RequestMethod,
    RequestOptionsArgs
} from '@angular/http'
import {StationModel} from "./StationModel";
import {CommBroker} from "../services/CommBroker";
import {Consts} from "../Conts";
import * as _ from 'lodash'
import * as xml2js from 'xml2js'
import {Lib} from "../Lib";
import {ToastsManager} from "ng2-toastr";

export const RECEIVE_STATIONS = 'RECEIVE_STATIONS';
export const RECEIVE_STATIONS_GEO = 'RECEIVE_STATIONS_GEO';
export const RECEIVE_TOTAL_STATIONS = 'RECEIVE_TOTAL_STATIONS';

@Injectable()
export class StationsAction extends Actions {

    constructor(private appStore: AppStore, private _http: Http, private commBroker: CommBroker, private toastr: ToastsManager) {
        super(appStore);
        //this.m_parseString = require('xml2js').parseString;
        this.m_parseString = xml2js.parseString;
        // this.listenFetchBusinessUser();
    }

    private m_parseString;

    private getStationGeoLocation(i_source: string, i_businessId: string, i_stationId: string): string {
        var stations: List<StationModel> = this.appStore.getState().stations.get(i_source);
        if (_.isUndefined(stations))
            return '';
        var stationIndex = stations.findIndex((stationModel: StationModel) => {
            return stationModel.getKey('businessId') === i_businessId && stationModel.getKey('id') == i_stationId;
        });
        Lib.CheckFoundIndex(stationIndex);
        var station: StationModel = stations.get(stationIndex);
        return station.getLocation();
    }

    public getStationsInfo(config) {
        var self = this;
        return (dispatch) => {
            var totalStations = 0;
            var observables: Array<Observable<any>> = [];
            for (let i_source in config) {
                var i_businesses = config[i_source];
                var businesses = i_businesses.join(',');
                var url: string = `https://${i_source}/WebService/StationService.asmx/getSocketStatusList?i_businessList=${businesses}`;
                // console.log('http: ' + url);
                observables.push(this._http.get(url).retry(2) .catch((err) => {
                    console.log('problem loading station ' + err);
                    return Observable.throw(err);
                }).finally(() => {
                    console.log('done loading http');
                }).map((res) => {
                    return {xml: res.text(), source: i_source};
                }));
            }
            Observable.forkJoin(observables).subscribe(
                (data: Array<any>) => {
                    data.forEach((i_data) => {
                        var source = i_data.source;
                        var xmlData: string = i_data.xml;
                        xmlData = xmlData.replace(/&lt;/ig, '<').replace(/&gt;/ig, '>');
                        this.m_parseString(xmlData, {attrkey: '_attr'}, (err, result) => {
                            if (err) {
                                return this.toastr.error('problem loading station info');
                            }
                            /**
                             * redux inject stations sources
                             **/
                            var stations: List<StationModel> = List<StationModel>();
                            if (result.string.SocketStatus["0"].Business) {
                                result.string.SocketStatus["0"].Business.forEach((business) => {
                                    var businessId = business._attr.businessId;
                                    if (business.Stations["0"].Station) {
                                        business.Stations["0"].Station.forEach((station) => {
                                            var stationId = station._attr.id;
                                            var geoLocation = self.getStationGeoLocation(source, businessId, stationId)
                                            var stationData = {
                                                businessId: businessId,
                                                id: stationId,
                                                geoLocation: geoLocation,
                                                source: source,
                                                airVersion: station._attr.airVersion,
                                                appVersion: station._attr.appVersion,
                                                caching: station._attr.caching,
                                                localIp: station._attr.localAddress,
                                                publicIp: station._attr.publicIp,
                                                cameraStatus: station._attr.cameraStatus,
                                                connection: station._attr.connection,
                                                lastCameraTest: station._attr.lastCameraTest,
                                                lastUpdate: station._attr.lastUpdate,
                                                name: station._attr.name,
                                                os: station._attr.os,
                                                peakMemory: station._attr.peakMemory,
                                                runningTime: station._attr.runningTime,
                                                socket: station._attr.socket,
                                                startTime: station._attr.startTime,
                                                status: station._attr.status,
                                                totalMemory: station._attr.totalMemory,
                                                watchDogConnection: station._attr.watchDogConnection
                                            };
                                            var stationModel: StationModel = new StationModel(stationData)
                                            stations = stations.push(stationModel);
                                        })
                                    }
                                })
                            }
                            totalStations = totalStations + stations.size;
                            dispatch(self.receiveStations(stations, source));
                        });
                    })
                },
                (err: Response) => {
                    err = err.json();
                    var status = err['currentTarget'].status;
                    var statusText = err['currentTarget'].statusText;
                    this.commBroker.fire({
                        fromInstance: this,
                        event: Consts.Events().STATIONS_NETWORK_ERROR,
                        context: this,
                        message: ''
                    });
                },
                () => {
                    dispatch(self.receiveTotalStations(totalStations));
                }
            );
        }
    }

    public getStationsIps() {
        return (dispatch) => {
            var stationsIps = [];
            var stations: Map<string, List<StationModel>> = this.appStore.getState().stations;
            stations.forEach((stationList: List<StationModel>, source) => {
                stationList.forEach((i_station: StationModel) => {
                    var ip = i_station.getKey('publicIp');
                    var geoLocation = i_station.getLocation();
                    var id = i_station.getKey('id');
                    var businessId = i_station.getKey('businessId');
                    var source = i_station.getKey('source');
                    // only get stations with public ip and no location info
                    if (!_.isUndefined(ip) && _.isEmpty(geoLocation))
                        stationsIps.push({id, businessId, ip, source})
                })
            });
            var body = JSON.stringify(stationsIps);
            var basicOptions: RequestOptionsArgs = {
                url: 'https://secure.digitalsignage.com/getGeoByIp',
                headers: new Headers({'Content-Type': 'application/json'}),
                method: RequestMethod.Post,
                body: body
            };
            var reqOptions = new RequestOptions(basicOptions);
            var req = new Request(reqOptions);
            this._http.request(req)
                .catch((err) => {
                    this.toastr.error('Error loading station IPs 1');
                    // return Observable.of(true);
                    return Observable.throw(err);
                })
                .finally(() => {
                    // console.log('done');
                })
                .map((result: any) => {
                    var stations = result.json();
                    for (var station in stations) {
                        var i_station = stations[station];
                        var rand = _.random(0, 30) / 100;
                        i_station.lat = (i_station.lat + rand).toFixed(4);
                        i_station.lon = (i_station.lon + rand).toFixed(4);
                        i_station['city'] = i_station.city;
                        i_station['country'] = i_station.country;
                    }
                    dispatch(this.receiveStationsGeo(stations));
                }).subscribe();
        }
    }

    public receiveStations(stations: List<StationModel>, source) {
        return {
            type: RECEIVE_STATIONS,
            stations,
            source
        }
    }

    public receiveStationsGeo(payload: Array<any>) {
        return {
            type: RECEIVE_STATIONS_GEO,
            payload
        }
    }

    public receiveTotalStations(totalStations: number) {
        return {
            type: RECEIVE_TOTAL_STATIONS,
            totalStations
        }
    }
}