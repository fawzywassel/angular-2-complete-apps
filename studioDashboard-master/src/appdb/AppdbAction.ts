import {
    Injectable,
    Inject
} from "@angular/core";
import {
    Actions,
    AppStore
} from "angular2-redux-util";
import {Http} from "@angular/http";
import {FlagsAuth} from "../services/AuthService";
import "rxjs/add/operator/map";
import "rxjs/add/operator/mergeMap";
import "rxjs/add/operator/merge";
import "rxjs/add/operator/debounceTime";
import * as xml2js from "xml2js";
import {Observable} from "rxjs/Observable";

export const APP_INIT = 'APP_INIT';
export const SERVERS_STATUS = 'SERVERS_STATUS';
export const CLOUD_SERVERS = 'CLOUD_SERVERS';
export const AUTH_PASS = 'AUTH_PASS';
export const AUTH_PASS_WAIT_TWO_FACTOR = 'AUTH_PASS_WAIT_TWO_FACTOR';
export const AUTH_FAIL = 'AUTH_FAIL';
export const TWO_FACTOR_SERVER_RESULT = 'TWO_FACTOR_SERVER_RESULT';
import {appBaseUrlCloud} from '../appdb/AppdbReducer';

export enum AuthState {
    FAIL,
    PASS,
    TWO_FACTOR
}

@Injectable()
export class AppdbAction extends Actions {
    parseString;

    constructor(@Inject('OFFLINE_ENV') private offlineEnv,
                private appStore: AppStore,
                private _http: Http) {
        super(appStore);
        this.parseString = xml2js.parseString;
    }

    public initAppDb() {
        return {
            type: APP_INIT,
            value: Date.now()
        };
    }

    public serverStatus() {
        return (dispatch) => {
            this._http.get(`https://secure.digitalsignage.com/msPingServersGuest`)
                .map(result => {
                    result = result.json();
                    dispatch({
                        type: SERVERS_STATUS,
                        payload: result
                    });
                }).subscribe();
            return;
        };
    }

    public getCloudServers() {
        return (dispatch) => {
            this._http.get('https://secure.digitalsignage.com/getActiveCloudServers')
                .map(result => {
                    result = result.json();
                    dispatch({
                        type: CLOUD_SERVERS,
                        payload: result
                    });
                }).subscribe();
            return;
        };
    }

    public authenticateTwoFactor(i_token: string, i_enable: boolean) {
        return (dispatch) => {
            var appdb: Map<string,any> = this.appStore.getState().appdb;
            var url = appdb.get('appBaseUrlCloud').replace('END_POINT', 'twoFactor') + `/${i_token}/${i_enable}`
            this._http.get(url)
                .map(result => {
                    dispatch({
                        type: TWO_FACTOR_SERVER_RESULT,
                        status: result.json().result
                    })
                }).subscribe()
        };
    }

    public getQrCodeTwoFactor(i_cb) {
        var appdb: Map<string,any> = this.appStore.getState().appdb;
        var url = appdb.get('appBaseUrlCloud').replace('END_POINT', 'twoFactorGenQr');
        this._http.get(url)
            .map(result => {
                var qr = result.text();
                i_cb(qr);
            }).subscribe()
    }

    public authenticateUser(i_user, i_pass, i_remember) {
        var self = this;
        return (dispatch) => {
            var processXml = (xmlData) => {
                this.parseString(xmlData, {attrkey: 'attr'}, function (err, result) {
                    if (!result) {
                        dispatch({
                            type: AUTH_FAIL,
                            authenticated: AuthState.FAIL,
                            user: i_user,
                            pass: i_pass,
                            remember: i_remember,
                            reason: FlagsAuth.WrongPass
                        });
                    } else if (result && !result.Businesses) {
                        dispatch({
                            type: AUTH_FAIL,
                            authenticated: AuthState.FAIL,
                            user: i_user,
                            pass: i_pass,
                            remember: i_remember,
                            reason: FlagsAuth.NotEnterprise
                        });
                    } else {
                        // Auth passed, next check if two factor enabled
                        self.twoFactorCheck(i_user, i_pass).subscribe((twoFactorResult) => {
                            if (twoFactorResult.enabled == false) {
                                var eventType = AUTH_PASS;
                                var authState = AuthState.PASS;
                            } else {
                                var eventType = AUTH_PASS_WAIT_TWO_FACTOR;
                                var authState = AuthState.TWO_FACTOR;
                            }
                            dispatch({
                                type: eventType,
                                authenticated: authState,
                                user: i_user,
                                pass: i_pass,
                                businessId: twoFactorResult.businessId,
                                remember: i_remember,
                                reason: FlagsAuth.Enterprise
                            });
                        })
                    }
                });
            }

            const baseUrl = this.appStore.getState().appdb.get('appBaseUrl');
            const url = `${baseUrl}?command=GetCustomers&resellerUserName=${i_user}&resellerPassword=${i_pass}`;
            if (this.offlineEnv) {
                this._http.get('offline/getCustomers.xml').subscribe((result) => {
                    var xmlData: string = result.text()
                    processXml(xmlData);
                })
                this._http.get('offline/customerRequest.json').subscribe((result) => {
                    var jData: string = result.json();
                })
            } else {
                this._http.get(url)
                    .map(result => {
                        var xmlData: string = result.text()
                        processXml(xmlData);
                    }).subscribe()
            }
        };
    }

    private twoFactorCheck(i_user, i_pass): Observable<any> {
        var url = `${appBaseUrlCloud}/twoFactorCheck/${i_user}/${i_pass}`;
        return this._http.get(url)
            .map(result => {
                return result.json()
            });
    }
}
