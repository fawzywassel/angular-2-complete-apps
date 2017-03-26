import {Component, Input, ChangeDetectionStrategy, ChangeDetectorRef} from "@angular/core";
import {BusinessModel} from "../../../business/BusinessModel";
import {BusinessAction} from "../../../business/BusinessAction";
import {AppStore} from "angular2-redux-util";
// import * as bootbox from "bootbox";
import * as _ from "lodash";
import {Lib} from "../../../Lib";

interface IsimplelistItem {
    item: any,
    index: number,
    selected: boolean
}

@Component({
    selector: 'UserInfo',
    templateUrl: './UserInfo.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: ['./UserInfo.css']
})
export class UserInfo {

    constructor(private appStore: AppStore, private businessAction: BusinessAction, private ref: ChangeDetectorRef) {
        var w = '150px';
        this.stylesObj = {
            input: {
                'font-size': '0.7em',
                'color': 'dodgerblue',
                'overflow': 'hidden',
                'width': w
            },
            label: {
                'font-size': '0.7em',
                'color': '#333333',
                'overflow': 'hidden',
                'white-space': 'nowrap',
                'width': w

            }
        }
        this.stylesDesc = {
            input: {
                'padding-bottom': '4px',
                'font-size': '0.9em',
                'color': 'dodgerblue',
                'width': '200px',
                'overflow': 'hidden'
            },
            label: {
                'padding-bottom': '4px',
                'font-size': '0.9em',
                'color': '#333333',
                'width': '240px',
                'overflow': 'hidden'
            }
        }

        this.samples = Lib.GetSamples();
    };

    businessId: string;
    nameEmail;
    serverStats = [];
    serverStatsCategories = [];
    stylesObj;
    stylesDesc;
    userName;
    maxMonitors;
    businessDescription;
    lastLogin;
    studioVersion;
    studioIcon;
    allowSharing: any = '';
    accountStatus;
    resellerId;
    verifiedIcon;
    fromTemplateId;
    samples;
    unsub;

    @Input()
    set user(i_simplelistItem: IsimplelistItem) {
        var businessUser: BusinessModel = i_simplelistItem.item.item;
        this.businessId = businessUser.getBusinessId();
        this.userName = businessUser.getKey('name');
        this.maxMonitors = businessUser.getKey('maxMonitors');
        this.businessDescription = businessUser.getKey('businessDescription');
        this.lastLogin = businessUser.getKey('lastLogin');
        this.allowSharing = businessUser.getKey('allowSharing') == '0' ? '' : 'checked';
        this.studioVersion = businessUser.getKey('studioLite') == 1 ? 'StudioLite' : 'StudioPro';
        this.studioIcon = this.studioVersion == 'StudioLite' ? 'fa-circle-o' : 'fa-circle';
        this.fromTemplateId = businessUser.getKey('fromTemplateId');
        this.accountStatus = businessUser.getKey('accountStatus');
        this.verifiedIcon = this.accountStatus == '2' ? 'fa-check' : 'fa-remove';
        this.resellerId = businessUser.getKey('resellerId');
    }

    // @ViewChild('modalChangePassword')
    // modalChangePassword:ModalComponent;

    updateUi() {
        try {
            this.ref.detectChanges();
        } catch (e) {
        }
    }

    private getTemplateName() {
        if (this.samples[this.fromTemplateId]) {
            return this.samples[this.fromTemplateId].replace(',', ' | ');
        } else {
            return '';
        }

    }

    private updateStore() {
        this.appStore.dispatch(this.businessAction.updateAccount(this.businessId, this.userName, this.maxMonitors, this.allowSharing));
    }

    private onChangeMonitors(event) {
        var maxMonitors: number = parseInt(event);
        if (_.isNaN(maxMonitors))
            return bootbox.alert('Not a valid number entered');
        this.maxMonitors = maxMonitors;
        this.updateStore();
    }

    private onChangeSharing(event) {
        this.allowSharing = StringJS(event).booleanToNumber();
        this.updateStore();
    }

    private onChangeUserName(event) {
        this.userName = event;
        this.updateStore();
    }

    ngAfterViewChecked() {
        // this.unsub = this.appStore.sub((businessUsers:BusinessUsers) => {
        //     this.nameEmail = businessUsers.getKey('emailName');
        //     this.updateUi();
        // }, 'business.businessUsers');
    }

    private ngOnDestroy() {
        //this.unsub();
        //this.appStore.dispatch(this.businessActions.fetchBusinessUser([]))
    }
}