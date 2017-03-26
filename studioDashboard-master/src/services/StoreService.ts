import {Injectable, Inject, forwardRef} from "@angular/core";
import {BusinessAction} from "../business/BusinessAction";
import {ResellerAction} from "../reseller/ResellerAction";
import {AppdbAction} from "../appdb/AppdbAction";
import {AppStore} from "angular2-redux-util";
import {StationsAction} from "../stations/StationsAction";
import {List, Map} from "immutable";
import {CommBroker} from "./CommBroker";
import {Consts} from "../Conts";
import {StationModel} from "../stations/StationModel";
import {Lib} from "../Lib";
import {OrdersAction} from "../comps/app1/orders/OrdersAction";

@Injectable()
export class StoreService {
    constructor(@Inject(forwardRef(() => AppStore)) private appStore: AppStore,
                @Inject(forwardRef(() => BusinessAction)) private businessActions: BusinessAction,
                @Inject(forwardRef(() => OrdersAction)) private ordersActions: OrdersAction,
                @Inject(forwardRef(() => ResellerAction)) private resellerAction: ResellerAction,
                @Inject(forwardRef(() => StationsAction)) private stationsAction: StationsAction,
                @Inject(forwardRef(() => AppdbAction)) private appDbActions: AppdbAction,
                @Inject(forwardRef(() => CommBroker)) private commBroker: CommBroker,
                @Inject('OFFLINE_ENV') private offlineEnv) {

        this.appStore.dispatch(this.appDbActions.initAppDb());
    }

    // todo: in private / hybrid mode we need to get list of business servers and logic to as when on each env
    // 0 = cloud, 1 = private 2 = hybrid
    // private knownServers:Array<string> = ['mars.signage.me', 'mercury.signage.me'];

    private knownServers: Array<string> = [];
    private running: boolean = false;
    private singleton: boolean = false;

    public loadServices() {
        if(this.singleton) return;
        this.singleton = true;
        this.listenServices();
        this.appStore.dispatch(this.resellerAction.getResellerInfo());
        this.appStore.dispatch(this.resellerAction.getAccountInfo());
        this.appStore.dispatch(this.businessActions.fetchBusinesses());
        this.appStore.dispatch(this.businessActions.getSamples());
        console.log('loaded network services...');
    }

    private initPollServices() {
        console.log('starting poll services...');
        if (this.running)
            return;
        this.running = true;
        setInterval(() => {
            this.appStore.dispatch(this.appDbActions.serverStatus());
            this.fetchStations()
        }, 15000);
    }

    private listenServices() {
        /** if we are in cloud mode, first fetch active servers before getting station
         (1) get businesses
         We also listen to samples retrieved
         **/
        this.appStore.sub(() => {
            // use 0 instead of ServerMode.CLOUD due to production bug with Enums
            if (this.commBroker.getValue(Consts.Values().SERVER_MODE) == 0) {
                this.appStore.dispatch(this.appDbActions.getCloudServers());
            } else {
                this.fetchStations();
            }
        }, 'business.businessStats');

        /** (2 optional) if we are running in cloud, get list of used servers and orders **/
        this.appStore.sub((servers: List<string>) => {
            this.knownServers = servers.toArray();
            this.fetchStations();
            this.appStore.dispatch(this.ordersActions.fetchAccountType());
        }, 'appdb.cloudServers');

        /** (3) receive each set of stations status per server **/
        this.appStore.sub((stations: Map<string, List<StationModel>>) => {
            //console.log('received station');
        }, 'stations');

        /** (4) once we have all stations, we can get their respective servers and geo info **/
        this.appStore.sub((totalStationsReceived: Map<string,any>) => {
            this.appStore.dispatch(this.appDbActions.serverStatus());
            this.appStore.dispatch(this.stationsAction.getStationsIps())
        }, 'appdb.totalStations');

        /** (5) received station status **/
        this.appStore.sub((serversStatus: Map<string,any>) => {
            if (!Lib.DevMode()) this.initPollServices();
        }, 'appdb.serversStatus', false);
    }

    private fetchStations() {
        var sources: Map<string,any> = this.appStore.getState().business.getIn(['businessSources']).getData();
        var config = {}
        sources.forEach((i_businesses: List<string>, source) => {
            let businesses = i_businesses.toArray();
            if (this.knownServers.indexOf(source) > -1)
                config[source] = businesses;

        });
        this.appStore.dispatch(this.stationsAction.getStationsInfo(config));
    }
}
