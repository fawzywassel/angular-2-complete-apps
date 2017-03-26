import {Component, ChangeDetectionStrategy, trigger, transition, animate, state, style} from "@angular/core";
import {WhitelabelModel} from "../../../reseller/WhitelabelModel";
import {ResellerAction} from "../../../reseller/ResellerAction";
import {AppStore} from "angular2-redux-util";
import {List} from "immutable";
import {Lib} from "../../../Lib";
import {AccountModel} from "../../../reseller/AccountModel";
import {CreditService} from "../../../services/CreditService";
import {FormBuilder, FormControl, FormGroup} from "@angular/forms";
import * as _ from "lodash";
// import * as bootbox from "bootbox";

@Component({
    selector: 'accounts',
    providers: [CreditService],
    styles: [`
        .faded {
            opacity: 0.3;
        }
    `],
    host: {
        '(input-blur)': 'onInputBlur($event)',
        '[@routeAnimation]': 'true',
        '[style.display]': "'block'"
    },
    animations: [
        trigger('routeAnimation', [
            state('*', style({opacity: 1})),
            transition('void => *', [
                style({opacity: 0}),
                animate(333)
            ]),
            transition('* => void', animate(333, style({opacity: 0})))
        ])
    ],
    changeDetection: ChangeDetectionStrategy.Default,
    templateUrl: './Account.html'
})

export class Account {
    constructor(private creditService: CreditService, private appStore: AppStore, private fb: FormBuilder, private resellerAction: ResellerAction) {
        var i_reseller = this.appStore.getState().reseller;

        /** Whitelabel **/
        this.whitelabelModel = i_reseller.getIn(['whitelabel']);
        this.unsub = this.appStore.sub((whitelabelModel: WhitelabelModel) => {
            this.whitelabelModel = whitelabelModel;
            //this.renderFormInputs();
        }, 'reseller.whitelabel');

        /** Accounts **/
        this.accountModels = i_reseller.getIn(['accounts']);
        this.renderFormInputs();
        this.unsub = this.appStore.sub((accountModels: List<AccountModel>) => {
            this.accountModels = accountModels;
            this.renderFormInputs();
        }, 'reseller.accounts');

        this.contGroup = fb.group({
            'enterprise_login': [''],
            'enterprise_pass1': [''],
            'enterprise_pass2': [''],
            'billing_cardNumber': [''],
            'billing_expirationMonth': [''],
            'billing_expirationYear': [''],
            'billing_securityCode': [''],
            'billing_firstName': [''],
            'billing_lastName': [''],
            'billing_address1': [''],
            'billing_address2': [''],
            'billing_city': [''],
            'billing_state': [''],
            'billing_country': [''],
            'billing_zipCode': [''],
            'billing_workPhone': [''],
            'billing_cellPhone': [''],
            'billing_email': [''],
            'shipping_firstName': [''],
            'shipping_lastName': [''],
            'shipping_address1': [''],
            'shipping_address2': [''],
            'shipping_city': [''],
            'shipping_state': [''],
            'shipping_country': [''],
            'shipping_zipCode': [''],
            'shipping_workPhone': [''],
            'shipping_cellPhone': [''],
            'shipping_email': [''],
            'contact_firstName': [''],
            'contact_lastName': [''],
            'contact_address1': [''],
            'contact_city': [''],
            'contact_state': [''],
            'contact_zipCode': [''],
            'contact_workPhone': [''],
            'contact_cellPhone': [''],
            'contact_email': ['']
        });
        _.forEach(this.contGroup.controls, (value, key: string) => {
            this.formInputs[key] = this.contGroup.controls[key] as FormControl;
        })
        this.renderFormInputs();
    }

    private payments = [{
        index: 1,
        icon: 'fa-credit-card-alt',
        name: 'credit card'
    }, {
        index: 2,
        icon: 'fa-cc-paypal',
        name: 'paypal'
    }, {
        index: 0,
        icon: 'fa-times-circle',
        name: 'disable'
    }]

    private cards = ['visa', 'mastercard', 'amex', 'discover', 'paypal'];

    private companyName = '';
    private userName = '';
    private businessId = '';
    private payerId = '';
    private whiteLabelEnabled: boolean = true;
    private formInputs = {};
    private contGroup: FormGroup;
    private whitelabelModel: WhitelabelModel;
    private accountModels: List<AccountModel>;
    private PAY_SUBSCRIBER: number = 4;
    private unsub;
    private stylesObj = {
        editIcon: {
            'position': 'relative',
            'top': '-8px'
        },
        input: {
            'font-size': '1.7em',
            'color': 'dodgerblue',
            'overflow': 'hidden',
            'width': '300px'
        },
        label: {
            'font-size': '1.7em',
            'color': '#333333',
            'overflow': 'hidden',
            'white-space': 'nowrap',
            'width': '300px'
        }
    }

    private onInputBlur(event) {
        setTimeout(() => this.appStore.dispatch(this.resellerAction.saveAccountInfo(Lib.CleanCharForXml(this.contGroup.value))), 1);
    }

    private onSubmit(value) {
        //setTimeout(()=>console.log(JSON.stringify(this.contGroup.value)), 1);
        setTimeout(() => this.appStore.dispatch(this.resellerAction.saveAccountInfo(Lib.CleanCharForXml(this.contGroup.value))), 1);
    }

    private renderFormInputs() {
        if (!this.accountModels)
            return;
        this.companyName = this.appStore.getsKey('reseller', 'whitelabel', 'companyName');
        this.userName = this.appStore.getState().appdb.getIn(['credentials']).get('user');
        this.businessId = this.appStore.getState().reseller.getIn(['whitelabel']).getKey('businessId');
        this.payerId = this.appStore.getState().reseller.getIn(['whitelabel']).getKey('payerId');

        this.accountModels.forEach((accountModel: AccountModel) => {
            var type: string = accountModel.getType().toLowerCase();
            switch (type) {
                case 'contact': {
                }
                case 'shipping': {
                }
                case 'billing': {
                    _.forEach(this.formInputs, (value, key: string) => {
                        if (_.isUndefined(key))
                            return;
                        var table = key.split('_')[0];
                        if (table == type) {
                            var field = key.split('_')[1];
                            var data = accountModel.getKey(field);
                            this.formInputs[key].setValue(data);
                        }
                    })
                    break;
                }
                case 'recurring': {
                    break;
                }
            }
        })
    };

    private onCompanyNameEdited(value) {
        this.appStore.dispatch(this.resellerAction.saveWhiteLabel(Lib.CleanCharForXml({companyName: value})));
    }

    private getAccountModelKey(modelType, key) {
        var result = '';
        if (!this.accountModels)
            return result;
        this.accountModels.forEach((accountModel: AccountModel) => {
            if (accountModel.getType() == modelType && result == '') {
                result = accountModel.getKey(key);
                return;
            }
        });
        return result;
    }

    private getRecurringValue(key): any {
        if (!this.accountModels)
            return '';
        var value = this.getAccountModelKey('Recurring', key);
        if (_.isUndefined(value))
            value = '';

        switch (key) {
            case 'recurringMode': {
                // annual subscriber paying
                if (value == '' && this.isAccountActive() && this.payerId == '-2')
                    return 'ANNUAL';
                // 0 = disabled | 1 = CC | 2 = PayPal
                if (value == '')
                    return value;
                var payment = _.find(this.payments, (k) => {
                    return Number(k.index) == Number(value);
                })
                return payment.index;
            }
            case 'paymentStatus': {
                // annual subscriber paying: 0 = failed | 1 = passed
                if (value == '' && this.isAccountActive())
                    return true;
                if (value == '')
                    return value;
                return (value == '1' ? true : false);
            }
            case 'lastPayment': {
                if (value == '')
                    return value;
                return value.split(' ')[0];
            }
        }
    }

    private onPaymentChanged(event) {
        var payment = event.target.value;
        payment = _.find(this.payments, (k) => {
            return k.name == payment;
        })
        var recurringMode = this.getRecurringValue('recurringMode');
        switch (payment.name) {
            case 'disable': {
                bootbox.prompt(`are you sure you want to cancel your current subscription? type [DELETE_NOW] to cancel association of all your screens`, (result) => {
                    if (result == 'DELETE_NOW') {
                        this.appStore.dispatch(this.resellerAction.updateAccountInfo({"recurring_recurringMode": 0}));
                        this.onSubmit(null);
                    } else {
                        this.appStore.dispatch(this.resellerAction.updateAccountInfo({"recurring_recurringMode": 0}));
                        setTimeout(() => {
                            this.appStore.dispatch(this.resellerAction.updateAccountInfo({"recurring_recurringMode": recurringMode}));
                            this.onSubmit(null);
                        }, 1)
                    }
                });
                break;
            }
            case 'credit card': {
                this.appStore.dispatch(this.resellerAction.updateAccountInfo({"recurring_recurringMode": payment.index}));
                this.onSubmit(null);
                break;
            }
            case 'paypal': {
                bootbox.dialog({
                    message: "for new accounts only, please allow 24 hours for your account to be activated",
                    title: "Pay with PayPal",
                    closeButton: false,
                    buttons: {
                        main: {
                            label: "Cancel",
                            callback: () => {
                                this.appStore.dispatch(this.resellerAction.updateAccountInfo({"recurring_recurringMode": 0}));
                                setTimeout(() => {
                                    this.appStore.dispatch(this.resellerAction.updateAccountInfo({"recurring_recurringMode": recurringMode}));
                                    this.onSubmit(null);
                                }, 1)
                            }
                        },
                        success: {
                            label: "Connect to Paypal now",
                            className: "btn-success",
                            callback: () => {
                                if (!this.onPaypalConnect()) {
                                    this.appStore.dispatch(this.resellerAction.updateAccountInfo({"recurring_recurringMode": 0}));
                                    setTimeout(() => {
                                        this.appStore.dispatch(this.resellerAction.updateAccountInfo({"recurring_recurringMode": recurringMode}));
                                        this.onSubmit(null);
                                    }, 1)
                                } else {
                                    this.appStore.dispatch(this.resellerAction.updateAccountInfo({"recurring_recurringMode": payment.index}));
                                    this.onSubmit(null);
                                }
                            }
                        }
                    }
                });
                break;
            }
        }
    }

    private onPaypalConnect(): boolean {
        var url = `https://galaxy.signage.me/WebService/CreateResellerRecurring.aspx?resellerId=${this.businessId }`;
        var newWin = window.open(url, '_blank');
        if (!newWin || newWin.closed || typeof newWin.closed == 'undefined') {
            bootbox.alert('Popup blocked, please allow popups from this site in your browser settings');
            return false;
        }
        return true;
    }

    private getSelectedPayment(i_recurringMode) {
        var recurringMode = this.getAccountModelKey('Recurring', 'recurringMode');
        if (i_recurringMode.index == recurringMode)
            return 'selected';
        return '';
    }

    private isAccountActive(): boolean {
        return this.resellerAction.getResellerIsActive();
    }

    private onUpdateCreditCard(event) {
        var cardNumber = this.contGroup.controls['billing_cardNumber'].value
        var cardTypeTest = this.creditService.parseCardType(cardNumber);
        var cardValidTest = this.creditService.validateCardNumber(cardNumber);
        var expirationTest = this.creditService.validateCardExpiry(this.contGroup.controls['billing_expirationMonth'].value, this.contGroup.controls['billing_expirationYear'].value);

        if (cardNumber.match('XXX')) {
            bootbox.dialog({
                message: 'The credit used is masked with XXX, to update enter full credit card details',
                title: "Cant update credit card with XXX mask",
                buttons: {
                    danger: {
                        label: "try again",
                        className: "btn-danger",
                        callback: function () {
                            return;
                        }
                    }
                }
            });
            return;
        }

        if (!expirationTest) {
            bootbox.dialog({
                message: 'The credit card expiration date is invalid, use MM / YY',
                title: "expiration problem",
                buttons: {
                    danger: {
                        label: "try again",
                        className: "btn-danger",
                        callback: function () {
                            return;
                        }
                    }
                }
            });
            return;
        }
        if (!cardValidTest) {
            bootbox.dialog({
                message: 'The credit card number entered is invalid, please try again...',
                title: "credit card number problem",
                buttons: {
                    danger: {
                        label: "try again",
                        className: "btn-danger",
                        callback: function () {
                        }
                    }
                }
            });
            return;
        }
        bootbox.dialog({
            message: 'for new accounts only, please allow 24 hours for your account to be activated',
            title: "credit card updated",
            buttons: {
                success: {
                    label: "thank you",
                    className: "btn-primary",
                    callback: () => {
                        this.onSubmit(null);
                    }
                }
            }
        });
    }

    private onWhiteLabelChange(value) {
        value = value ? 1 : 0;
        this.appStore.dispatch(this.resellerAction.updateResellerInfo({whitelabelEnabled: value}))
    }

    private isCardSelected(i_cardType) {
        var recurringMode = this.getRecurringValue('recurringMode');
        if (recurringMode == 2 && i_cardType == 'paypal')
            return true;
        if (recurringMode == 2 && i_cardType != 'paypal')
            return false;
        var cardNumber = this.contGroup.controls['billing_cardNumber'].value
        if (_.isUndefined(cardNumber))
            return false;
        if (cardNumber.charAt(0) == 'X')
            return false;
        var cardType = this.creditService.parseCardType(cardNumber);
        if (_.isNull(cardType))
            return false;
        if (cardType != i_cardType)
            return false;
        return true;
    }

    private ngOnDestroy() {
        this.unsub();
    }
}
// this.appStore.dispatch(this.resellerAction.updateResellerInfo({accountStatus: 2}));
// this.appStore.dispatch(this.resellerAction.updateAccountInfo({"recurring_recurringMode": 0}));
//this.appStore.dispatch(this.resellerAction.updateResellerInfo({accountStatus: this.PAY_SUBSCRIBER}));
