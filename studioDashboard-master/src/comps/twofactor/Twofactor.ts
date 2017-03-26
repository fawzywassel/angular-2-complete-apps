import {
    Component,
    ChangeDetectionStrategy,
    ElementRef,
    ViewChild,
    ChangeDetectorRef
} from "@angular/core";
import {
    FormControl,
    FormGroup,
    FormBuilder
} from "@angular/forms";
import {AppStore} from "angular2-redux-util";
import * as _ from "lodash";
import {AppdbAction} from "../../appdb/AppdbAction";
import {LocalStorage} from "../../services/LocalStorage";
import {Compbaser} from "../compbaser/Compbaser";
// import * as bootbox from 'bootbox';

@Component({
    selector: 'Twofactor',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `<div>
                <form novalidate autocomplete="off" [formGroup]="contGroup">
                    <div class="row">
                        <div class="inner userGeneral">
                            <div class="panel panel-default tallPanel">
                                <div class="panel-heading">
                                    <small class="release">target properties
                                        <i style="font-size: 1.4em" class="fa fa-cog pull-right"></i>
                                    </small>
                                <small *ngIf="inDevMode" class="debug">{{me}}</small>
                                </div>
                                <ul class="list-group">
                                    <li *ngIf="twoFactorStatus" class="list-group-item">
                                        Two factor login with Google Authenticator
                                        <div class="material-switch pull-right">
                                            <input (change)="onChangeStatus(customerNetwork2.checked)"
                                                   [formControl]="contGroup.controls['TwofactorCont']"
                                                   id="customerNetwork2" #customerNetwork2
                                                   name="customerNetwork2" type="checkbox"/>
                                            <label for="customerNetwork2" class="label-primary"></label>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
            <div>
                <div *ngIf="!twoFactorStatus">
                    <input #activate type="text" class="longInput form-control" placeholder="scan with Google Authenticator and enter token">
                    <button (click)="onActivate()" style="margin-top: 5px" class="btn btn-primary pull-right">activate</button>
                </div>
            </div>
    `,
    styles: [`.material-switch {position: relative;padding-top: 10px;}`]
})
export class Twofactor extends Compbaser {
    constructor(private fb: FormBuilder,
                private localStorage: LocalStorage,
                private el: ElementRef,
                private cd: ChangeDetectorRef,
                private appdbAction: AppdbAction,
                private appStore: AppStore) {
        super();
        this.contGroup = fb.group({
            'TwofactorCont': ['']
        });
        _.forEach(this.contGroup.controls, (value, key: string) => {
            this.formInputs[key] = this.contGroup.controls[key] as FormControl;
        })
        var twoFactorStatus = this.twoFactorStatus = this.appStore.getState().appdb.get('twoFactorStatus');
        if (_.isUndefined(twoFactorStatus)) {
            this.twoFactorStatus = false;
        } else {
            this.twoFactorStatus = twoFactorStatus.status;
        }
        this.unsub = this.appStore.sub(i_twoFactorStatus => {
            //this.twoFactorStatus = i_twoFactorStatus;
            this.changeTwoFactorStatus(i_twoFactorStatus.status);
        }, 'appdb.twoFactorStatus');

        this.renderFormInputs();
    }

    @ViewChild('activate')
    activateToken;

    private twoFactorStatus: boolean;
    private contGroup: FormGroup;
    private formInputs = {};
    private unsub;

    private changeTwoFactorStatus(enabled: boolean) {
        if (enabled) {
            bootbox.alert('Congratulations, activated');
            this.twoFactorStatus = true;
            this.removeQrCode();
            this.cd.markForCheck();
            this.localStorage.removeItem('remember_me');
            this.renderFormInputs();
        } else {
            bootbox.alert('wrong token entered');
            // this.removeQrCode();
            this.cd.markForCheck();
        }
    }

    private onActivate() {
        if (this.activateToken.nativeElement.value.length < 6)
            return bootbox.alert('token is too short');
        this.appStore.dispatch(this.appdbAction.authenticateTwoFactor(this.activateToken.nativeElement.value, true));
    }

    private addQrCode() {
        this.removeQrCode();
        this.appdbAction.getQrCodeTwoFactor((qrCode) => {
            this.removeQrCode();
            jQuery(this.el.nativeElement).append(qrCode);
            var svg = jQuery(this.el.nativeElement).find('svg').get(0);
            // var w = svg.width.baseVal.value;
            // var h = svg.height.baseVal.value;
            svg.setAttribute('viewBox', '0 0 ' + 100 + ' ' + 100);
            svg.setAttribute('width', '100%');
            // svg.setAttribute('height', '100%');
        })
    }

    private removeQrCode() {
        jQuery(this.el.nativeElement).find('svg').remove();
    }

    private onChangeStatus(i_twoFactorStatus: boolean) {
        this.twoFactorStatus = i_twoFactorStatus;
        if (this.twoFactorStatus) {
            this.removeQrCode();
        } else {
            this.addQrCode();
            bootbox.alert('Token removed, be sure to delete the entry now from Google Authenticator as it is no longer valid');
        }
    }

    private renderFormInputs() {
        this.formInputs['TwofactorCont'].setValue(this.twoFactorStatus);
        if (this.twoFactorStatus) {
            this.removeQrCode();
        } else {
            this.addQrCode();
        }
    }

    destroy() {
        this.unsub();
    }
}