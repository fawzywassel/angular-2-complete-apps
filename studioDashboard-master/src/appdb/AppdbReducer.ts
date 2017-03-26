import {Map} from "immutable";
import * as AppdbAction from "../appdb/AppdbAction";
import * as StationsAction from "../stations/StationsAction";
import * as OrdersAction from "../comps/app1/orders/OrdersAction";

// todo: add logic to as when on each env
// 0 = cloud, 1 = private 2 = hybrid

const baseUrl = 'https://galaxy.signage.me/WebService/ResellerService.ashx';
const adnetCustomerId = ':ADNET_CUSTOMER_ID:';
const adnetCustomerToken = ':ADNET_TOKEN_ID:';
const appBaseUrlAdnet = `https://adnet.signage.me/adNetService.ashx?command=customerRequest&customerId=${adnetCustomerId}&customerToken=${adnetCustomerToken}&fromChangelistId=0`;
const appBaseUrlAdnetSearch = `https://adnet.signage.me/adNetService.ashx?command=search&customerId=${adnetCustomerId}&customerToken=${adnetCustomerToken}:DATA:`;
const appBaseUrlAdnetSave = `https://adnet.signage.me/adNetService.ashx?command=customerSubmit&customerId=${adnetCustomerId}&customerToken=${adnetCustomerToken}&data=:DATA:`;
const appBaseUrlAdnetReports = `https://adnet.signage.me/adNetService.ashx?command=:REPORT_TYPE:&customerId=${adnetCustomerId}&customerToken=${adnetCustomerToken}&data=:DATA:`;
const appBaseUrlAdnetBilling = `https://adnet.signage.me/adNetService.ashx?command=:BILLING_TYPE:&customerId=${adnetCustomerId}&customerToken=${adnetCustomerToken}:DATA:`;
export const appBaseUrlCloud = 'https://secure.digitalsignage.com';

export default function appdb(state: Map<string, any> = Map<string, any>({}), action: any): Map<string, any> {
    switch (action.type) {

        case StationsAction.RECEIVE_TOTAL_STATIONS:
            return state.merge({
                totalStations: {
                    time: Date.now(),
                    totalStations: action.totalStations
                }
            });

        case AppdbAction.APP_INIT:
            return state.merge({
                appStartTime: Date.now(),
                appBaseUrl: `${baseUrl}`
            });

        case AppdbAction.AUTH_FAIL:
        case AppdbAction.AUTH_PASS_WAIT_TWO_FACTOR:
        case AppdbAction.AUTH_PASS:
            return state.merge({
                credentials: {
                    authenticated: action.authenticated,
                    user: action.user,
                    pass: action.pass,
                    remember: action.remember,
                    reason: action.reason,
                    businessId: action.businessId
                },
                appBaseUrlUser: `${baseUrl}?resellerUserName=${action.user}&resellerPassword=${action.pass}`,
                appBaseUrlCloud: `${appBaseUrlCloud}/END_POINT/${action.user}/${action.pass}`,
                appBaseUrlAdnet: `${appBaseUrlAdnet}`,
                appBaseUrlAdnetSave: `${appBaseUrlAdnetSave}`,
                appBaseUrlAdnetSearch: `${appBaseUrlAdnetSearch}`,
                appBaseUrlAdnetReports: `${appBaseUrlAdnetReports}`,
                appBaseUrlAdnetBilling: `${appBaseUrlAdnetBilling}`
            });

        case AppdbAction.TWO_FACTOR_SERVER_RESULT:
            return state.set('twoFactorStatus', {
                'status': action.status,
                'twoFactorStatusReceived': Date.now()
            });

        case AppdbAction.APP_INIT:
            return state.merge({
                appStartTime: Date.now(),
                appBaseUrl: `${baseUrl}`
            });

        case OrdersAction.RECEIVE_ACCOUNT_TYPE:
            return state.merge({
                accountType: action.accountType
            });

        case AppdbAction.CLOUD_SERVERS:
            return state.merge({
                cloudServers: action.payload
            });

        case AppdbAction.SERVERS_STATUS:
            return state.merge({serversStatus: action.payload});

        default:
            return state;
    }
}


