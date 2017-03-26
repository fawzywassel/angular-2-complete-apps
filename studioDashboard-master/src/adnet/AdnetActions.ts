import {
    Injectable,
    Inject
} from "@angular/core";
import {
    Actions,
    AppStore
} from "angular2-redux-util";
import {List} from "immutable";
import "rxjs/add/operator/catch";
import "rxjs/add/operator/finally";
import "rxjs/add/observable/throw";
import {Http} from "@angular/http";
import * as _ from "lodash";
import {AdnetCustomerModel} from "./AdnetCustomerModel";
import {AdnetRateModel} from "./AdnetRateModel";
import {AdnetTargetModel} from "./AdnetTargetModel";
import {AdnetPairModel} from "./AdnetPairModel";
import {AdnetPackageModel} from "./AdnetPackageModel";
import {ReplaySubject} from "rxjs/ReplaySubject";
import {Subject} from "rxjs/Subject";
import {Lib} from "../Lib";
import {AdnetContentModel} from "./AdnetContentModel";
import {CommBroker} from "../services/CommBroker";
import * as xml2js from "xml2js";
import {BusinessModel} from "../business/BusinessModel";
import {ToastsManager} from "ng2-toastr";
import {AdnetReportModel} from "./AdnetReportModel";
import {AdnetPaymentModel} from "./AdnetPaymentModel";
import {AdnetTransferModel} from "./AdnetTransferModel";
import {Observable} from "rxjs";

export const RESET_ADNET = 'RESET_ADNET';
export const RECEIVE_ADNET = 'RECEIVE_ADNET';
export const RECEIVE_CUSTOMERS = 'RECEIVE_CUSTOMERS';
export const RECEIVE_PAYMENTS = 'RECEIVE_PAYMENTS';
export const RECEIVE_TRANSFERS = 'RECEIVE_TRANSFERS';
export const RECEIVE_RATES = 'RECEIVE_RATES';
export const RECEIVE_TARGETS = 'RECEIVE_TARGETS';
export const RECEIVE_TARGETS_SEARCH = 'RECEIVE_TARGETS_SEARCH';
export const ADD_ADNET_PAIR = 'ADD_ADNET_PAIR';
export const RECEIVE_PAIRS = 'RECEIVE_PAIRS';
export const RECEIVE_PACKAGES = 'RECEIVE_PACKAGES';
export const UPDATE_PAIR_OUTGOING = 'UPDATE_PAIR_OUTGOING';
export const UPDATE_PAIR_INCOMING = 'UPDATE_PAIR_INCOMING';
export const UPDATE_ADNET_CUSTOMER = 'UPDATE_ADNET_CUSTOMER';
export const UPDATE_ADNET_RATE_TABLE = 'UPDATE_ADNET_RATE_TABLE';
export const UPDATE_ADNET_PACKAGE = 'UPDATE_ADNET_PACKAGE';
export const UPDATE_ADNET_PACKAGE_CONTENT = 'UPDATE_ADNET_PACKAGE_CONTENT';
export const UPDATE_ADNET_TARGET = 'UPDATE_ADNET_TARGET';
export const ADNET_RECEIVED_REPORT = 'ADNET_RECEIVED_REPORT';
export const ADD_ADNET_TARGET_WEB = 'ADD_ADNET_TARGET_WEB';
export const ADD_ADNET_TARGET_TO_PACKAGE = 'ADD_ADNET_TARGET_TO_PACKAGE';
export const ADD_ADNET_TARGET_NEW = 'ADD_ADNET_TARGET_NEW';
export const ADD_ADNET_PACKAGE = 'ADD_ADNET_PACKAGE';
export const ADD_ADNET_PACKAGE_CONTENT = 'ADD_ADNET_PACKAGE_CONTENT';
export const ADD_ADNET_RATE_TABLE = 'ADD_ADNET_RATE_TABLE';
export const REMOVE_ADNET_RATE_TABLE = 'REMOVE_ADNET_RATE_TABLE';
export const REMOVE_ADNET_TARGET = 'REMOVE_ADNET_TARGET';
export const REMOVE_ADNET_TARGET_WEB = 'REMOVE_ADNET_TARGET_WEB';
export const REMOVE_ADNET_PACKAGE = 'REMOVE_ADNET_PACKAGE';
export const REMOVE_ADNET_PACKAGE_CONTENT = 'REMOVE_ADNET_PACKAGE_CONTENT';
export const RENAME_ADNET_RATE_TABLE = 'RENAME_ADNET_RATE_TABLE';

export enum ContentTypeEnum {
    RESOURCE,
    GOOGLE,
    DROPBOX
}

export enum ReportEnum {
    CUSTOMER,
    TARGET,
    TARGET_DETAILS,
    CONTENT,
    HOURLY,
    HOURLY_DETAILS
}


@Injectable()
export class AdnetActions extends Actions {

    constructor(@Inject('OFFLINE_ENV') private offlineEnv, private appStore: AppStore, private _http: Http, private toastr: ToastsManager) {
        super(appStore);
        this.m_parseString = xml2js.parseString;
        // this.adnetRouteReady$ = new ReplaySubject(0 /* buffer size */);
        this.adnetDataReady$ = new ReplaySubject(0 /* buffer size */);
    }

    private m_parseString;
    // private adnetRouteReady$: ReplaySubject<any>;
    private adnetDataReady$: ReplaySubject<any>;

    // public onAdnetRouteReady(): ReplaySubject<any> {
    public onAdnetRouteReady(adnetCustomerId, adnetTokenId): Observable<any> {
        return Observable.create(observer => {
            this.appStore.dispatch(this.getAdnet(adnetCustomerId, adnetTokenId, observer));
        });
    }

    public onAdnetDataReady(): ReplaySubject<any> {
        return this.adnetDataReady$;
    }

    private saveToServer(i_data, i_customerId, i_callBack?: (jData) => void) {
        var businesses: List<BusinessModel> = this.appStore.getState().business.getIn(['businesses']);
        var businessModel: BusinessModel = businesses.filter((i_businessModel: BusinessModel) => i_businessModel.getAdnetCustomerId() == i_customerId).first() as BusinessModel;
        var adnetTokenId = businessModel.getAdnetTokenId();
        const data = JSON.stringify(i_data);
        const baseUrl = this.appStore.getState().appdb.get('appBaseUrlAdnetSave').replace(':ADNET_CUSTOMER_ID:', i_customerId).replace(':ADNET_TOKEN_ID:', adnetTokenId).replace(':DATA:', data);
        this._http.get(baseUrl)
            .map(result => {
                try {
                    var jData: Object = result.json()
                    if (i_callBack)
                        i_callBack(jData);
                } catch (e) {
                    this.toastr.error('problem saving Adnet data to the server, please try again...');
                    if (Lib.DevMode())
                        throw new Error(`could not convert json data  ${e} ${e.stack}`)
                }

            }).subscribe()
    }

    public getAdnet(adnetCustomerId, adnetTokenId, observer) {
        return (dispatch) => {
            var baseUrl = this.appStore.getState().appdb.get('appBaseUrlAdnet');
            baseUrl = baseUrl.replace(/:ADNET_CUSTOMER_ID:/, adnetCustomerId);
            baseUrl = baseUrl.replace(/:ADNET_TOKEN_ID:/, adnetTokenId);

            const url = `${baseUrl}`;
            // offline not being used currently
            if (this.offlineEnv) {
                this._http.get('offline/customerRequest.json').subscribe((result) => {
                    var jData: Object = result.json();
                })
            } else {
                this._http.get(url)
                    .map(result => {
                        var jData: Object = result.json()
                        dispatch(this.receivedAdnet(jData));

                        /** Payments **/
                        var adnetPayments: List<AdnetPaymentModel> = List<AdnetPaymentModel>();
                        for (var adnetPayment of jData['payments']) {
                            const adnetPaymentModel: AdnetPaymentModel = new AdnetPaymentModel(adnetPayment);
                            adnetPayments = adnetPayments.push(adnetPaymentModel)
                        }
                        dispatch(this.receivedPayments(adnetPayments));

                        /** Customers **/
                        var adnetCustomers: List<AdnetCustomerModel> = List<AdnetCustomerModel>();
                        for (var adnetCustomer of jData['customers']) {
                            const adnetCustomerModel: AdnetCustomerModel = new AdnetCustomerModel(adnetCustomer);
                            adnetCustomers = adnetCustomers.push(adnetCustomerModel)
                        }
                        dispatch(this.receivedCustomers(adnetCustomers));

                        /** Rates **/
                        var adnetRates: List<AdnetRateModel> = List<AdnetRateModel>();
                        for (var adnetRate of jData['rates']) {
                            if (adnetRate.Value.deleted == true)
                                continue;
                            const adnetRateModel: AdnetRateModel = new AdnetRateModel(adnetRate);
                            adnetRates = adnetRates.push(adnetRateModel)
                        }
                        dispatch(this.receivedRates(adnetRates));

                        /** Targets **/
                        var adnetTargets: List<AdnetTargetModel> = List<AdnetTargetModel>();
                        for (var target of jData['targets']) {
                            if (target.Value.deleted == true)
                                continue;
                            const adnetTargetModel: AdnetTargetModel = new AdnetTargetModel(target);
                            adnetTargets = adnetTargets.push(adnetTargetModel)
                        }
                        dispatch(this.receivedTargets(adnetTargets));

                        /** Pairs **/
                        var adnetPairModels: List<AdnetPairModel> = List<AdnetPairModel>();
                        for (var pair of jData['pairs']) {
                            const adnetPairModel: AdnetPairModel = new AdnetPairModel(pair);
                            adnetPairModels = adnetPairModels.push(adnetPairModel)
                        }
                        dispatch(this.receivedPairs(adnetPairModels));

                        /** Transfers **/
                        var adnetTransfers: List<AdnetTransferModel> = List<AdnetTransferModel>();
                        adnetPairModels.forEach((i_adnetPairModel: AdnetPairModel) => {
                            var pairTransfers: Array<any> = i_adnetPairModel.getTransfers();
                            pairTransfers.forEach((adnetTransfer) => {
                                adnetTransfer['Value']['customerId'] = i_adnetPairModel.getCustomerId();
                                adnetTransfer['Value']['toCustomerId'] = i_adnetPairModel.getToCustomerId();
                                const adnetTransferModel: AdnetTransferModel = new AdnetTransferModel(adnetTransfer);
                                adnetTransfers = adnetTransfers.push(adnetTransferModel)
                            });
                        });
                        dispatch(this.receivedTransfers(adnetTransfers));

                        /** Packages **/
                        var adnetPackageModels: List<AdnetPackageModel> = List<AdnetPackageModel>();
                        for (var pkg of jData['packages']) {
                            if (pkg.Value.deleted == true)
                                continue;
                            const adnetPackageModel: AdnetPackageModel = new AdnetPackageModel(pkg);
                            adnetPackageModels = adnetPackageModels.push(adnetPackageModel)
                        }
                        dispatch(this.receivedPackages(adnetPackageModels));

                        // enable timer to checkout slow network for loading adnet data
                        // setTimeout(() => {
                        observer.next('adNetReady');
                        observer.next({
                            adnetCustomerId,
                            adnetTokenId
                        });
                        observer.complete();
                        // }, 2000)


                    }).subscribe()
            }
        };
    }

    public saveCustomerInfo(data: Object, adnetCustomerId: string) {
        return (dispatch) => {
            const payload = {
                Value: {},
                Key: adnetCustomerId
            };
            payload.Value = {"customerInfo": data};
            this.saveToServer(payload.Value, adnetCustomerId, (jData) => {
                if (_.isUndefined(!jData) || _.isUndefined(jData.fromChangelistId))
                    return this.toastr.error('problem saving customer info to server');
                payload.Value = data;
                dispatch(this.updateAdnetCustomer(payload))
            })
        };
    }

    public saveTargetCoordinates(data: Object, i_adnetTargetModel: AdnetTargetModel, i_adnetCustomer: AdnetCustomerModel) {
        return (dispatch) => {
            const payload = {
                Value: data,
                Key: i_adnetTargetModel.getId()
            };
            var payloadToServer = {
                "targets": {
                    "update": [{
                        Key: i_adnetTargetModel.getId(),
                        Value: _.extend(payload.Value, {
                            id: i_adnetTargetModel.getId(),
                            handle: 0,
                            modified: 1,
                            hRate: i_adnetTargetModel.getHandleRateId()
                        })
                    }]
                }
            }
            this.saveToServer(payloadToServer, i_adnetCustomer.getId(), (jData) => {
                if (_.isUndefined(!jData) || _.isUndefined(jData.fromChangelistId))
                    return this.toastr.error('problem updating targets table on server');
                dispatch(this.updateAdnetTarget(payload))
            })
        };
    }

    public saveTargetInfo(data: Object, i_adnetTargetModel: AdnetTargetModel, i_adnetCustomer: AdnetCustomerModel) {
        return (dispatch) => {
            var payloadToServer = {
                "targets": {
                    "update": [{
                        "Key": i_adnetTargetModel.getId(),
                        "Value": {
                            "id": i_adnetTargetModel.getId(),
                            "handle": 0,
                            "modified": 1,
                            "customerId": i_adnetCustomer.getId(),
                            "label": data['label'],
                            "targetType": data['targetType'],
                            "enabled": data['enabled'],
                            "locationLat": data['locationLat'],
                            "locationLng": data['locationLng'],
                            "targetDomain": data['targetDomain'],
                            "rateId": data['rateId'],
                            "hRate": i_adnetTargetModel.getHandleRateId(),
                            "keys": data['keys'],
                            "comments": data['comments'],
                            "url": data['url']
                        }
                    }]
                }
            }
            var payload = payloadToServer.targets.update[0];
            this.saveToServer(payloadToServer, i_adnetCustomer.getId(), (jData) => {
                if (_.isUndefined(!jData) || _.isUndefined(jData.fromChangelistId))
                    return this.toastr.error('problem updating targets table on server');
                dispatch(this.updateAdnetTarget(payload))
            })
        };
    }

    public reportsAdnet(i_customerId, i_reportName, i_reportEnum, i_direction, i_absolutMonth, i_extraArgs) {
        return (dispatch) => {
            var reportCommand = '';
            switch (i_reportEnum) {
                case ReportEnum.CUSTOMER: {
                    reportCommand = 'customerStats';
                    break;
                }
                case ReportEnum.TARGET: {
                    reportCommand = 'targetStats';
                    break;
                }
                case ReportEnum.TARGET_DETAILS: {
                    reportCommand = 'detailStats';
                    break;
                }
                case ReportEnum.HOURLY: {
                    reportCommand = 'hourlyStats';
                    break;
                }
                case ReportEnum.HOURLY_DETAILS: {
                    reportCommand = 'detailStats';
                    break;
                }
                case ReportEnum.CONTENT: {
                    reportCommand = 'contentStats';
                    break;
                }
            }
            var businesses: List<BusinessModel> = this.appStore.getState().business.getIn(['businesses']);
            var businessModel: BusinessModel = businesses.filter((i_businessModel: BusinessModel) => i_businessModel.getAdnetCustomerId() == i_customerId).first() as BusinessModel;
            var adnetTokenId = businessModel.getAdnetTokenId();
            var data = `&dir=${i_direction}&absolutMonth=${i_absolutMonth}`;
            if (i_extraArgs) data = `${data}${i_extraArgs}`;
            const baseUrl = this.appStore.getState().appdb.get('appBaseUrlAdnetReports').replace(':REPORT_TYPE:', i_reportName).replace(':ADNET_CUSTOMER_ID:', i_customerId).replace(':ADNET_TOKEN_ID:', adnetTokenId).replace(':DATA:', data).replace(/null/g, '');
            this._http.get(baseUrl)
                .map(result => {
                    var adnetReportModels: List<AdnetReportModel> = List<AdnetReportModel>();
                    var jData: Object = result.json()
                    for (var stats of jData[reportCommand]) {
                        var adnetReportModel: AdnetReportModel = new AdnetReportModel(stats);
                        adnetReportModel = adnetReportModel.setField('reportEnum', i_reportEnum);
                        adnetReportModels = adnetReportModels.push(adnetReportModel)
                    }
                    dispatch(this.receivedAdnetReport(adnetReportModels));
                }).subscribe()
        }
    }

    public billingMakePayment(i_customerId, i_payerUser, i_payerPass, i_amount, i_comment, i_callBack: (i_status) => void) {
        var businesses: List<BusinessModel> = this.appStore.getState().business.getIn(['businesses']);
        var businessModel: BusinessModel = businesses.filter((i_businessModel: BusinessModel) => i_businessModel.getAdnetCustomerId() == i_customerId).first() as BusinessModel;
        var adnetTokenId = businessModel.getAdnetTokenId();
        var data = `&payerUser=${i_payerUser}&payerPass=${i_payerPass}&amount=${i_amount}&comment=${i_comment}`;
        const baseUrl = this.appStore.getState().appdb.get('appBaseUrlAdnetBilling').replace(':BILLING_TYPE:', 'makePayment').replace(':ADNET_CUSTOMER_ID:', i_customerId).replace(':ADNET_TOKEN_ID:', adnetTokenId).replace(':DATA:', data).replace(/null/g, '');
        this._http.get(baseUrl)
            .map(result => {
                try {
                    var jData: Object = result.json();
                    i_callBack(jData);
                } catch (e) {
                    i_callBack('Problem adding payment, possibly wrong user or password entered');
                }
            }).subscribe()
    }

    public billingTransferMoney(i_customerId, i_payerUser, i_payerPass, i_amount, i_pairId, i_comment, i_callBack: (i_status) => void) {
        var businesses: List<BusinessModel> = this.appStore.getState().business.getIn(['businesses']);
        var businessModel: BusinessModel = businesses.filter((i_businessModel: BusinessModel) => i_businessModel.getAdnetCustomerId() == i_customerId).first() as BusinessModel;
        var adnetTokenId = businessModel.getAdnetTokenId();
        var data = `&payerUser=${i_payerUser}&payerPass1=${i_payerPass}&amount=${i_amount}&pairId=${i_pairId}&comment=${i_comment}`;
        const baseUrl = this.appStore.getState().appdb.get('appBaseUrlAdnetBilling').replace(':BILLING_TYPE:', 'transferMoney').replace(':ADNET_CUSTOMER_ID:', i_customerId).replace(':ADNET_TOKEN_ID:', adnetTokenId).replace(':DATA:', data).replace(/null/g, '');
        this._http.get(baseUrl)
            .map(result => {
                var jData: Object = result.json();
                i_callBack(jData);
            }).subscribe()
    }

    public billingChangePassowrd(i_customerId, i_payerUser, i_payerPass1, i_payerPass2, i_callBack: (i_status) => void) {
        var businesses: List<BusinessModel> = this.appStore.getState().business.getIn(['businesses']);
        var businessModel: BusinessModel = businesses.filter((i_businessModel: BusinessModel) => i_businessModel.getAdnetCustomerId() == i_customerId).first() as BusinessModel;
        var adnetTokenId = businessModel.getAdnetTokenId();
        var data = `&payerUser=${i_payerUser}&payerPass1=${i_payerPass1}&payerPass2=${i_payerPass2}`;
        const baseUrl = this.appStore.getState().appdb.get('appBaseUrlAdnetBilling').replace(':BILLING_TYPE:', 'changePayerPassword').replace(':ADNET_CUSTOMER_ID:', i_customerId).replace(':ADNET_TOKEN_ID:', adnetTokenId).replace(':DATA:', data).replace(/null/g, '');
        this._http.get(baseUrl)
            .map(result => {
                var jData: Object = result.json();
                i_callBack(jData);
            }).subscribe()
    }

    public getCustomerName(customerId) {
        var customersList: List<AdnetCustomerModel> = this.appStore.getState().adnet.getIn(['customers']) || {};
        var adnetCustomerModel: AdnetCustomerModel = customersList.find((adnetCustomerModel: AdnetCustomerModel) => {
            return adnetCustomerModel.getId() == customerId;
        })
        return adnetCustomerModel.getName();
    }

    public getTargetModel(targetId) {
        var customersList: List<AdnetTargetModel> = this.appStore.getState().adnet.getIn(['targets']) || {};
        var adnetTargetModel: AdnetTargetModel = customersList.find((adnetTargetModel: AdnetTargetModel) => {
            return adnetTargetModel.getId() == targetId;
        })
        return adnetTargetModel;
    }

    public getPackageModelFromContentId(i_contentId: number): AdnetPackageModel {
        var packages: List<AdnetPackageModel> = this.appStore.getState().adnet.getIn(['packages']) || {};
        var adnetPackageModel: AdnetPackageModel = packages.find((i_adnetPackageModel: AdnetPackageModel): any => {
            var contents = i_adnetPackageModel.getContents();
            for (var index in contents) {
                if (contents[index].Key == i_contentId) {
                    return i_adnetPackageModel;
                }
            }
        })
        return adnetPackageModel;
    }

    public getPackageContentFromContentId(i_contentId: number): any {
        var packages: List<AdnetPackageModel> = this.appStore.getState().adnet.getIn(['packages']) || {};
        var foundContent;
        var adnetPackageModel: AdnetPackageModel = packages.find((i_adnetPackageModel: AdnetPackageModel): any => {
            var contents = i_adnetPackageModel.getContents();
            for (var index in contents) {
                if (contents[index].Key == i_contentId) {
                    foundContent = contents[index];
                    return contents[index];
                }
            }
        })
        return foundContent;
    }


    public searchAdnet(i_customerId, type = 0, customer = '', target = '', keys = '', global = 1, lat = 0, lng = 0, radios = -1) {
        return (dispatch) => {
            var businesses: List<BusinessModel> = this.appStore.getState().business.getIn(['businesses']);
            var businessModel: BusinessModel = businesses.filter((i_businessModel: BusinessModel) => i_businessModel.getAdnetCustomerId() == i_customerId).first() as BusinessModel;
            var adnetTokenId = businessModel.getAdnetTokenId();
            var data = `&type=${type}&customer=${customer}&target=${target}&keys=${keys}&global=${global}&lat=${lat}&lng=${lng}&radios=${radios}`;
            const baseUrl = this.appStore.getState().appdb.get('appBaseUrlAdnetSearch').replace(':ADNET_CUSTOMER_ID:', i_customerId).replace(':ADNET_TOKEN_ID:', adnetTokenId).replace(':DATA:', data).replace(/null/g, '');

            this._http.get(baseUrl)
                .map(result => {
                    var jData: Object = result.json()

                    if (jData['targets'] && jData['targets'].length > 200)
                        this.toastr.error('The list returned is too large, please add additional filtering criteria');

                    /** Customers **/
                    var adnetCustomers: List<AdnetCustomerModel> = List<AdnetCustomerModel>();
                    for (var adnetCustomer of jData['customers']) {
                        const adnetCustomerModel: AdnetCustomerModel = new AdnetCustomerModel(adnetCustomer);
                        adnetCustomers = adnetCustomers.push(adnetCustomerModel)
                    }

                    /** Rates **/
                    var adnetRates: List<AdnetRateModel> = List<AdnetRateModel>();
                    for (var adnetRate of jData['rates']) {
                        if (adnetRate.Value.deleted == true)
                            continue;
                        const adnetRateModel: AdnetRateModel = new AdnetRateModel(adnetRate);
                        adnetRates = adnetRates.push(adnetRateModel)
                    }

                    /** Targets **/
                    var adnetTargets: List<AdnetTargetModel> = List<AdnetTargetModel>();
                    for (var target of jData['targets']) {
                        if (target.Value.deleted == true)
                            continue;
                        const adnetTargetModel: AdnetTargetModel = new AdnetTargetModel(target);
                        adnetTargets = adnetTargets.push(adnetTargetModel)
                    }
                    dispatch(this.adnetTargetsSearch({
                        adnetTargets,
                        adnetCustomers,
                        adnetRates
                    }));

                }).subscribe()
        }
    }

    public addAdnetPackages(customerId) {
        return (dispatch) => {
            var payload = {
                Key: -1,
                Value: {
                    "handle": 0,
                    "modified": 1,
                    "customerId": customerId,
                    "label": "My Package",
                    "enabled": true,
                    "playMode": 0,
                    "channel": 0,
                    "startDate": "/Date(1476191180439)/",
                    "endDate": "/Date(1476191180439)/",
                    "daysMask": 127,
                    "hourStart": 0,
                    "hourEnd": 23,
                    "autoAddSiblings": false,
                    "siblingsKey": "",
                    "contents": [],
                    "targets": []
                }
            }

            var payloadToServer = {
                "packages": {
                    "add": [payload.Value]
                }
            }
            this.saveToServer(payloadToServer, customerId, (jData) => {
                if (_.isUndefined(!jData) || _.isUndefined(jData.fromChangelistId))
                    return this.toastr.error('problem adding package to server');
                var packageId = jData.packages.add["0"].packageId;
                payload.Key = packageId;
                // payload.Value.id = packageId;
                var model: AdnetPackageModel = new AdnetPackageModel(payload);
                dispatch({
                    type: ADD_ADNET_PACKAGE,
                    model: model
                });
            })
        };
    }

    public removeAdnetPackage(payload: any, customerId: string) {
        return (dispatch) => {
            var payloadToServer = {
                "packages": {
                    "delete": [payload]
                }
            }
            // var model: AdnetRateModel = new AdnetRateModel(payloadToServer);
            this.saveToServer(payloadToServer, customerId, (jData) => {
                if (_.isUndefined(!jData) || _.isUndefined(jData.fromChangelistId))
                    return this.toastr.error('problem removing package from server');
                // model = model.setId(jData.rates.add["0"]) as AdnetRateModel;
                dispatch({
                    type: REMOVE_ADNET_PACKAGE,
                    id: payload
                });
            })
        };
    }

    public removeAdnetPackageContent(adnetPackageModel: AdnetPackageModel, contentId: number) {
        return (dispatch) => {
            var customerId = adnetPackageModel.getCustomerId();
            var value = {
                "id": adnetPackageModel.getId(),
                "handle": "0",
                "modified": "0",
                "customerId": customerId,
                "packageContents": {"delete": [contentId]}
            }
            var payloadToServer = {
                "packages": {
                    "update": [{
                        "Key": adnetPackageModel.getId(),
                        "Value": value
                    }]
                }
            }
            var payloadToSave = {
                Key: adnetPackageModel.getId(),
                Value: value
            }
            this.saveToServer(payloadToServer, customerId, (jData) => {
                if (_.isUndefined(!jData) || _.isUndefined(jData.fromChangelistId))
                    return this.toastr.error('problem removing package content on server');
                dispatch(this.removePackageContent(payloadToSave))
            })
        };
    }

    public addAdnetTargetWeb(customerId) {
        return (dispatch) => {
            var payload = {
                Key: -1,
                Value: {
                    "id": "-1",
                    "handle": "0",
                    "modified": "1",
                    "customerId": customerId,
                    "label": "www.yourdomain.com",
                    "targetType": "2",
                    "enabled": false,
                    "locationLat": "0",
                    "locationLng": "0",
                    "targetDomain": "www.yourdomain.com",
                    "rateId": "-1",
                    "hRate": "-1",
                    "keys": "",
                    "comments": "",
                    "url": ""
                }
            }
            var model: AdnetTargetModel = new AdnetTargetModel(payload);
            var payloadToServer = {
                "targets": {
                    "add": [payload.Value]
                }
            }
            this.saveToServer(payloadToServer, customerId, (jData) => {
                if (_.isUndefined(!jData) || _.isUndefined(jData.fromChangelistId))
                    return this.toastr.error('problem saving rate table to server');
                model = model.setId(jData.targets.add["0"]) as AdnetTargetModel;

                dispatch({
                    type: ADD_ADNET_TARGET_WEB,
                    model: model
                });
            })
        };
    }

    public addAdnetTargetToPackage(i_adnetTargetModel: AdnetTargetModel, i_adnetPackageModel: AdnetPackageModel) {
        return (dispatch) => {
            var i_customerId = i_adnetPackageModel.getCustomerId();
            var payloadToServerWithNewCustomer, payloadToServer, payloadToSave;
            var value = {
                "id": i_adnetPackageModel.getId(),
                "handle": "2",
                "modified": "0",
                "customerId": i_customerId,
                "packageTargets": {
                    "add": [{
                        "id": "-1",
                        "handle": "10",
                        "modified": "1",
                        "deleted": false,
                        "targetId": i_adnetTargetModel.getId()
                    }]
                }
            }
            payloadToServer = {
                "packages": {
                    "update": [{
                        "Key": i_adnetPackageModel.getId(),
                        "Value": value
                    }]
                }
            }


            // find out if this is a new customer that we have not worked with before, and if so, add it to the pairs
            const pairs = this.appStore.getState().adnet.getIn(['pairs']) || {};
            var pairsFound = pairs.filter((i_pair: AdnetPairModel) => {
                if (i_pair.getCustomerId() == i_customerId && i_pair.getToCustomerId() == i_adnetTargetModel.getCustomerId())
                    return true
            })
            if (pairsFound.size == 0) {
                payloadToServerWithNewCustomer = {
                    payloadToServer,
                    "toPairs": {
                        "add": [{
                            "id": "-1",
                            "handle": "3",
                            "modified": "1",
                            "customerId": i_customerId,
                            "toCustomerId": i_adnetTargetModel.getCustomerId(),
                            "friend": "true",
                            "reviewRate": "0",
                            "reviewText": ""
                        }]
                    },
                    "fromPairs": {
                        "add": [{
                            "id": "-1",
                            "handle": "4",
                            "modified": "1",
                            "customerId": i_adnetTargetModel.getCustomerId(),
                            "toCustomerId": i_customerId,
                            "autoActivate": "false",
                            "activated": "false"
                        }]
                    }
                }
            }
            this.saveToServer((payloadToServerWithNewCustomer || payloadToServer), i_customerId, (jData) => {
                if (_.isUndefined(!jData) || _.isUndefined(jData.fromChangelistId))
                    return this.toastr.error('problem adding new paired customer on server');
                //todo: not sure why I need to do two server calls as Pro just does one to add pair and add target in one shot

                this.saveToServer((payloadToServer), i_customerId, (i_jData) => {
                    if (_.isUndefined(!i_jData) || _.isUndefined(i_jData.fromChangelistId))
                        return this.toastr.error('problem adding target on server');

                    // add new target by copying it from store > target_search to store > targets
                    dispatch(this.addTargetNew(i_adnetTargetModel.getId()));

                    // save new pair to store > pairs
                    if (payloadToServerWithNewCustomer) {
                        var pairId = jData.fromPairs.add[0];
                        var pair = payloadToServerWithNewCustomer.toPairs.add[0];
                        pair.id = pairId;
                        pair.activated = true;
                        pair.autoActivate = false;
                        pair.outPackageIds = [];
                        pair.summaryReport = [];
                        pair.totalDebit = 0;
                        pair.totalTransfer = 0;
                        pair.transfers = [];
                        payloadToSave = {
                            Key: pairId,
                            Value: pair
                        }
                        const adnetPairModel: AdnetPairModel = new AdnetPairModel(payloadToSave);
                        dispatch(this.addPackagePair(adnetPairModel))
                    }

                    // add new target to store > package
                    var targetId = i_jData.packages.update[0].targetIds[0];
                    value.packageTargets.add[0].id = targetId;
                    payloadToSave = {
                        Key: targetId,
                        Value: value.packageTargets.add[0]
                    }
                    dispatch(this.addPackageTarget(i_adnetPackageModel.getId(), payloadToSave))
                });
            });
        };
    }

    public addAdnetRateTable(customerId) {
        return (dispatch) => {
            var payload = {
                Key: -1,
                Value: {
                    customerId: customerId,
                    deleted: false,
                    id: 0,
                    handle: 0,
                    modified: 1,
                    hourRate0: 1,
                    hourRate1: 2,
                    hourRate2: 3,
                    hourRate3: 4,
                    label: 'new rate',
                    rateMap: '000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000'
                }
            }
            var model: AdnetRateModel = new AdnetRateModel(payload);
            var payloadToServer = {
                "rates": {
                    "add": [payload.Value]
                }
            }
            this.saveToServer(payloadToServer, customerId, (jData) => {
                if (_.isUndefined(!jData) || _.isUndefined(jData.fromChangelistId))
                    return this.toastr.error('problem saving rate table to server');
                model = model.setId(jData.rates.add["0"]) as AdnetRateModel;
                dispatch({
                    type: ADD_ADNET_RATE_TABLE,
                    model: model
                });
            })
        };
    }

    public removeAdnetRateTable(adnetId, customerId: string) {
        return (dispatch) => {
            var payLoad = {"rates": {"delete": [adnetId]}}
            this.saveToServer(payLoad, customerId, (jData) => {
                if (_.isUndefined(!jData) || _.isUndefined(jData.fromChangelistId))
                    return this.toastr.error('problem removing rate table on server');
                dispatch({
                    type: REMOVE_ADNET_RATE_TABLE,
                    id: adnetId
                });
            })
        };
    }

    public removeAdnetTarget(i_targetId, i_adnetPackageModel: AdnetPackageModel) {
        return (dispatch) => {
            var payload = {
                "packages": {
                    "update": [{
                        "Key": i_adnetPackageModel.getId(),
                        "Value": {
                            "id": i_adnetPackageModel.getId(),
                            "handle": "1",
                            "modified": "0",
                            "customerId": i_adnetPackageModel.getCustomerId(),
                            "packageTargets": {"delete": [i_targetId]}
                        }
                    }]
                }
            }

            this.saveToServer(payload, i_adnetPackageModel.getCustomerId(), (jData) => {
                if (_.isUndefined(!jData) || _.isUndefined(jData.fromChangelistId))
                    return this.toastr.error('problem removing adnet target package from server');
                dispatch({
                    type: REMOVE_ADNET_TARGET,
                    payload: {
                        packageId: i_adnetPackageModel.getId(),
                        targetId: i_targetId,
                    }

                });
            })
        };
    }

    public removeAdnetTargetWeb(payload: any, customerId: string) {
        return (dispatch) => {
            var payloadToServer = {
                "targets": {
                    "delete": [payload]
                }
            }
            this.saveToServer(payloadToServer, customerId, (jData) => {
                if (_.isUndefined(!jData) || _.isUndefined(jData.fromChangelistId))
                    return this.toastr.error('problem updating rate table to server');

                dispatch({
                    type: REMOVE_ADNET_TARGET_WEB,
                    id: payload
                });
            })
        };
    }

    public updAdnetPackageProps(payload, adnetPackageModel: AdnetPackageModel) {
        return (dispatch) => {
            var customerId = adnetPackageModel.getCustomerId();
            var value = {
                "id": adnetPackageModel.getId(),
                "handle": 1,
                "modified": 1,
                "customerId": customerId,
                "label": payload.label,
                "enabled": payload.enabled,
                "playMode": payload.playMode,
                "channel": payload.channel,
                "startDate": `/Date(${Lib.ProcessDateFieldToUnix(payload.startDate, true)})/`,
                "endDate": `/Date(${Lib.ProcessDateFieldToUnix(payload.endDate, true)})/`,
                "daysMask": payload.daysMask,
                "hourStart": payload.hourStart,
                "hourEnd": payload.hourEnd,
                "autoAddSiblings": payload.autoAddSiblings,
                "siblingsKey": payload.siblingsKey

            }
            var payloadToServer = {
                "packages": {
                    "update": [{
                        "Key": adnetPackageModel.getId(),
                        "Value": value
                    }]
                }
            }
            var payloadToSave = {
                Key: adnetPackageModel.getId(),
                Value: value
            }

            this.saveToServer(payloadToServer, customerId, (jData) => {
                if (_.isUndefined(!jData) || _.isUndefined(jData.fromChangelistId))
                    return this.toastr.error('problem updating package on server');
                payloadToSave.Value['startDate'] = `/Date(${Lib.ProcessDateFieldToUnix(payload.startDate, false)})/`;
                payloadToSave.Value['endDate'] = `/Date(${Lib.ProcessDateFieldToUnix(payload.endDate, false)})/`;
                payloadToSave.Value['targets'] = adnetPackageModel.getTargets();
                payloadToSave.Value['contents'] = adnetPackageModel.getContents();
                dispatch(this.updatePackage(payloadToSave))
            })
        };
    }

    public updPairOutgoing(i_adnetPairModel: AdnetPairModel, values: {string: any}) {
        return (dispatch) => {
            var customerId = i_adnetPairModel.getCustomerId();
            var payload = {
                "toPairs": {
                    "update": [{
                        "Key": i_adnetPairModel.getId(),
                        "Value": {
                            "id": i_adnetPairModel.getId(),
                            "handle": "1",
                            "modified": "1",
                            "customerId": i_adnetPairModel.getCustomerId(),
                            "toCustomerId": i_adnetPairModel.getToCustomerId(),
                            "friend": values['friend'],
                            "reviewRate": "0",
                            "reviewText": ""
                        }
                    }]
                }
            }
            this.saveToServer(payload, customerId, (jData) => {
                if (_.isUndefined(!jData) || _.isUndefined(jData.fromChangelistId))
                    return this.toastr.error('problem updating rate table to server');
                dispatch({
                    type: UPDATE_PAIR_OUTGOING,
                    payload
                });
            })
        };
    }

    public updPairIncoming(i_adnetPairModel: AdnetPairModel, values: {string: any}) {
        return (dispatch) => {
            var customerId = i_adnetPairModel.getToCustomerId();
            var payload = {
                "fromPairs": {
                    "update": [{
                        "Key": i_adnetPairModel.getId(),
                        "Value": {
                            "id": i_adnetPairModel.getId(),
                            "handle": "1",
                            "modified": "1",
                            "customerId": i_adnetPairModel.getCustomerId(),
                            "toCustomerId": i_adnetPairModel.getToCustomerId(),
                            "activated": values['activated'],
                            "autoActivate": values['autoActivate'],
                            "reviewRate": "0",
                            "reviewText": ""
                        }
                    }]
                }
            }
            this.saveToServer(payload, customerId, (jData) => {
                if (_.isUndefined(!jData) || _.isUndefined(jData.fromChangelistId))
                    return this.toastr.error('problem updating rate table to server');
                dispatch({
                    type: UPDATE_PAIR_INCOMING,
                    payload
                });
            })
        };
    }

    public updAdnetRateTable(payload: any, customerId: string, renamed?: boolean) {
        return (dispatch) => {
            var value = {
                "id": payload.rateId,
                "handle": "0",
                "modified": "1",
                "customerId": customerId,
                "label": payload.label,
                "hourRate0": payload.adHourlyRate["0"],
                "hourRate1": payload.adHourlyRate["1"],
                "hourRate2": payload.adHourlyRate["2"],
                "hourRate3": payload.adHourlyRate["3"],
                "rateMap": payload.rateTable
            }
            var payloadToSave = {
                Key: payload.rateId,
                Value: value
            }
            var payloadToServer = {
                "rates": {
                    "update": [{
                        "Key": payload.rateId,
                        "Value": value
                    }]
                }
            }
            var model: AdnetRateModel = new AdnetRateModel(payloadToSave);
            this.saveToServer(payloadToServer, customerId, (jData) => {
                if (_.isUndefined(!jData) || _.isUndefined(jData.fromChangelistId))
                    return this.toastr.error('problem updating rate table to server');
                model = model.setId(jData.rates.add["0"]) as AdnetRateModel;
                dispatch(this.updateAdnetRateTable(payload))
                if (renamed) {
                    dispatch({
                        type: RENAME_ADNET_RATE_TABLE,
                        payload: {
                            rateId: payload.rateId,
                            newLabel: payload.label
                        }
                    });
                }
            })
        };
    }

    public updAdnetContentProps(i_payload: any, i_adnetContentModels: AdnetContentModel, i_adnetPackageModel: AdnetPackageModel) {
        return (dispatch) => {
            var customerId = i_adnetPackageModel.getCustomerId();
            var packageId = i_adnetPackageModel.getId();
            var contentId = i_adnetContentModels.getId();
            var payloadToServer = {
                "packages": {
                    "update": [{
                        "Key": packageId,
                        "Value": {
                            "id": packageId,
                            "handle": 0,
                            "modified": 0,
                            "customerId": customerId,
                            "packageContents": {
                                "update": [{
                                    "Key": contentId,
                                    "Value": {
                                        "id": contentId,
                                        "handle": 1,
                                        "modified": 1,
                                        "duration": i_payload.duration,
                                        "contentLabel": i_adnetContentModels.getName(),
                                        "reparationsPerHour": i_payload.reparationsPerHour,
                                        "contentUrl": i_adnetContentModels.getContentUrl(),
                                        "contentType": i_adnetContentModels.getType(),
                                        "contentExt": i_adnetContentModels.getExtension(),
                                        "maintainAspectRatio": i_payload.maintainAspectRatio,
                                        "contentVolume": i_adnetContentModels.getVolume(),
                                        "locationLat": i_payload.locationLat,
                                        "locationLng": i_payload.locationLng,
                                        "locationRadios": i_payload.locationRadios
                                    }
                                }]
                            }
                        }
                    }]
                }
            }
            var payloadToSave = payloadToServer.packages.update["0"].Value.packageContents.update["0"];

            this.saveToServer(payloadToServer, customerId, (jData) => {
                if (_.isUndefined(!jData) || _.isUndefined(jData.fromChangelistId))
                    return this.toastr.error('problem updating package content table to server');
                // model = model.setId(jData.rates.add["0"]) as AdnetRateModel;
                dispatch(this.updatePackageContentProps(packageId, payloadToSave))
            })
        };
    }

    public addAdnetPackageContent(payload, adnetPackageModel: AdnetPackageModel, contentType: ContentTypeEnum) {
        return (dispatch) => {
            var customerId = adnetPackageModel.getCustomerId();
            var value = {
                "id": adnetPackageModel.getId(),
                "handle": 0,
                "modified": 0,
                "customerId": customerId,
                "packageContents": {
                    "add": [{
                        "id": "-1",
                        "handle": "0",
                        "modified": "1",
                        "contentLabel": StringJS(payload.link).fileTailName(2).s.replace(/%20/, ' '),
                        "duration": 10,
                        "reparationsPerHour": 60,
                        "contentUrl": payload.link,
                        "contentType": contentType,
                        "contentExt": "",
                        "maintainAspectRatio": "false",
                        "contentVolume": "1",
                        "locationLat": 0,
                        "locationLng": 0,
                        "locationRadios": 0
                    }]
                }
            }
            var payloadToServer = {
                "packages": {
                    "update": [{
                        "Key": adnetPackageModel.getId(),
                        "Value": value
                    }]
                }
            }
            var payloadToSave = {
                Key: adnetPackageModel.getId(),
                Value: value.packageContents.add[0]
            }
            this.saveToServer(payloadToServer, customerId, (jData) => {
                if (_.isUndefined(!jData) || _.isUndefined(jData.fromChangelistId))
                    return this.toastr.error('problem adding package on server');
                payloadToSave.Key = jData.packages.update["0"].contentIds["0"];
                payloadToSave.Value.id = jData.packages.update["0"].contentIds["0"];
                dispatch(this.addPackageContent(adnetPackageModel.getId(), payloadToSave))
            })
        };
    }

    public receivedAdnet(payload: any) {
        return {
            type: RECEIVE_ADNET,
            payload
        }
    }

    private updateAdnetRateTable(payload) {
        return {
            type: UPDATE_ADNET_RATE_TABLE,
            payload
        }
    }

    private updatePackageContentProps(packageId, payload) {
        return {
            type: UPDATE_ADNET_PACKAGE_CONTENT,
            packageId,
            payload
        }
    }

    private addPackageContent(packageId, payload) {
        return {
            type: ADD_ADNET_PACKAGE_CONTENT,
            payload,
            packageId
        }
    }

    private addPackageTarget(packageId, payload) {
        return {
            type: ADD_ADNET_TARGET_TO_PACKAGE,
            payload,
            packageId
        }
    }

    private addPackagePair(payload) {
        return {
            type: ADD_ADNET_PAIR,
            payload
        }
    }

    private addTargetNew(payload) {
        return {
            type: ADD_ADNET_TARGET_NEW,
            payload
        }
    }

    private updatePackage(payload) {
        return {
            type: UPDATE_ADNET_PACKAGE,
            payload
        }
    }

    private adnetTargetsSearch(payload) {
        return {
            type: RECEIVE_TARGETS_SEARCH,
            payload
        }
    }

    private removePackageContent(payload) {
        return {
            type: REMOVE_ADNET_PACKAGE_CONTENT,
            payload
        }
    }

    private updateAdnetCustomer(payload) {
        return {
            type: UPDATE_ADNET_CUSTOMER,
            payload
        }
    }

    private updateAdnetTarget(payload) {
        return {
            type: UPDATE_ADNET_TARGET,
            payload
        }
    }

    private receivedRates(rates: List<AdnetRateModel>) {
        return {
            type: RECEIVE_RATES,
            rates
        }
    }

    private receivedAdnetReport(report: List<AdnetReportModel>) {
        return {
            type: ADNET_RECEIVED_REPORT,
            report
        }
    }

    private receivedTargets(targets: List<AdnetTargetModel>) {
        return {
            type: RECEIVE_TARGETS,
            targets
        }
    }

    private receivedPairs(pairs: List<AdnetPairModel>) {
        return {
            type: RECEIVE_PAIRS,
            pairs
        }
    }

    private receivedPackages(packages: List<AdnetPackageModel>) {
        return {
            type: RECEIVE_PACKAGES,
            packages
        }
    }

    private receivedCustomers(customers: List<AdnetCustomerModel>) {
        return {
            type: RECEIVE_CUSTOMERS,
            customers
        }
    }

    private receivedTransfers(transfers: List<AdnetTransferModel>) {
        return {
            type: RECEIVE_TRANSFERS,
            transfers
        }
    }

    private receivedPayments(payments: List<AdnetPaymentModel>) {
        return {
            type: RECEIVE_PAYMENTS,
            payments
        }
    }

    public resetAdnet() {
        return (dispatch) => {
            dispatch({
                type: RESET_ADNET,
                payload: {}
            });
        };
    }
}