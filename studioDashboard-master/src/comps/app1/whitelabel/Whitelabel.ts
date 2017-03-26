import {
    Component,
    ViewChild,
    ChangeDetectorRef,
    ChangeDetectionStrategy,
    ElementRef,
    NgZone,
    ViewChildren,
    QueryList,
    trigger,
    transition,
    animate,
    state,
    style
} from "@angular/core";
import {Router} from "@angular/router";
import {WhitelabelModel} from "../../../reseller/WhitelabelModel";
import {ResellerAction} from "../../../reseller/ResellerAction";
import {AppStore} from "angular2-redux-util";
import {FormGroup, FormControl, FormBuilder} from "@angular/forms";
import {Lib} from "../../../Lib";
import {ImgLoader} from "../../imgloader/ImgLoader";
import * as _ from "lodash";
// import * as bootbox from "bootbox";

@Component({
    selector: 'whitelabel',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './Whitelabel.html',
    styleUrls: ['./Whitelabel.css'],
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
})
export class Whitelabel {

    constructor(private appStore: AppStore,
                private fb: FormBuilder,
                private cd: ChangeDetectorRef,
                private router: Router,
                private zone: NgZone,
                private resellerAction: ResellerAction) {
        var i_reseller = this.appStore.getState().reseller;
        this.whitelabelModel = i_reseller.getIn(['whitelabel']);
        this.unsub = this.appStore.sub((whitelabelModel: WhitelabelModel) => {
            this.whitelabelModel = whitelabelModel;
            this.renderFormInputs();
        }, 'reseller.whitelabel');

        this.contGroup = fb.group({
            'whitelabelEnabled': [''],
            'companyName': [''],
            'logoTooltip': [''],
            'logoLink': [''],
            'linksHome': [''],
            'linksDownload': [''],
            'linksContact': [''],
            'twitterLink': [''],
            'twitterShow': [''],
            'chatShow': [''],
            'chatLink': [''],
            'mainMenuLink0': [''],
            'mainMenuLink1': [''],
            'mainMenuLink2': [''],
            'mainMenuLink3': [''],
            'mainMenuLabel4': [''],
            'bannerEmbedReference': [''],
            'createAccountOption': ['']
        });
        _.forEach(this.contGroup.controls, (value, key: string) => {
            this.formInputs[key] = this.contGroup.controls[key] as FormControl;
        })
        this.renderFormInputs();
        this.stylesObj = {
            img: {
                'color': '#333333',
                'overflow': 'hidden',
                'white-space': 'nowrap',
                'height': '100px',
                'width': '175px'
            }
        }
    }

    @ViewChild('fileName') fileName: ElementRef;
    @ViewChild('imgLoaderLogo') imgLoaderLogo: ImgLoader;
    @ViewChild('imgLoaderSplash') imgLoaderSplash: ImgLoader;
    @ViewChild('#imgLoaderSplash') a: any;
    @ViewChild(ImgLoader) b: any;
    @ViewChild('ImgLoader') c: any;

    @ViewChildren('ImgLoader')
    d: QueryList<any>;

    @ViewChildren('imgLoader')
    e: QueryList<any>;

    @ViewChildren(ImgLoader)
    f: QueryList<any>;

    private formInputs = {};
    private contGroup: FormGroup;
    private whitelabelModel: WhitelabelModel;
    private unsub;
    private stylesObj;

    private onInputBlur(event) {
        setTimeout(() => this.appStore.dispatch(this.resellerAction.saveWhiteLabel(Lib.CleanCharForXml(this.contGroup.value))), 1);
    }

    private getImageUrl(i_type): Array<string> {
        if (!this.whitelabelModel)
            return [];

        switch (i_type) {
            case 'logo': {
                return ['http://galaxy.signage.me/Resources/Resellers/' + this.getBusinessInfo('businessId') + '/Logo.png', 'http://galaxy.signage.me/Resources/Resellers/' + this.getBusinessInfo('businessId') + '/Logo.jpg'];
            }
            case 'splash': {
                // console.log('http://galaxy.signage.me/Resources/Resellers/' + this.getBusinessInfo('businessId') + '/Update.swf');
                return ['http://galaxy.signage.me/Resources/Resellers/' + this.getBusinessInfo('businessId') + '/Update.swf'];
            }
        }
    }

    private getBusinessInfo(field): string {
        if (!this.whitelabelModel)
            return '';
        return this.appStore.getsKey('reseller', 'whitelabel', field);
    }

    private uploadLogos(i_type) {
        var self = this;
        var progressHandlingFunction = (e) => {
            console.log('progress ' + e);
        }
        var httpRequest = new XMLHttpRequest();
        httpRequest.onload = function (oEvent) {
            if (httpRequest.status == 200) {
                if (httpRequest.response == 'true') {
                    bootbox.alert('File uploaded successfully...');
                    self.f.map((imgLoader: ImgLoader) => {
                        imgLoader.reloadImage();
                    });

                } else {
                    bootbox.alert('There was a problem uploading your file');
                }
            }
        };
        var formData = new FormData();
        var fileName, file, fileExtension;
        if (i_type == 'logo') {
            file = document.getElementById("elementFile")['files'][0];
            fileName = document.getElementById("elementFile")['files'][0]['name'];
            fileExtension = fileName.substr((fileName.lastIndexOf('.') + 1))
            if (!(/(jpg|png)$/i).test(fileExtension)) {
                bootbox.alert('File extension must be .png or .jpg')
                return
            }
            fileName = `Logo.${fileExtension}`;
        }
        if (i_type == 'splash') {
            file = document.getElementById("elementFile2")['files'][0];
            fileName = document.getElementById("elementFile2")['files'][0]['name'];
            fileExtension = fileName.substr((fileName.lastIndexOf('.') + 1))
            // if (!(/(swf)$/i).test(fileExtension)) {
            //     bootbox.alert('File type must be Flash and extension to be .swf')
            //     return
            // }
            fileName = `Update.swf`;
        }
        formData.append("filename", fileName);

        formData.append("file", file);
        var user = this.appStore.getState().appdb.get('credentials').get('user');
        var pass = this.appStore.getState().appdb.get('credentials').get('pass');
        formData.append("userName", user);
        formData.append("password", pass);
        var appdb: Map<string,any> = this.appStore.getState().appdb;
        var url = appdb.get('appBaseUrlUser').split('ResellerService')[0];
        httpRequest.open("POST", `${url}/ResourceUpload.ashx`);
        httpRequest.send(formData);
    }

    private onBranding(value) {
        switch (value) {
            case 'video': {
                window.open('http://www.digitalsignage.com/_html/video_tutorials.html?videoNumber=msgetstarted', '_blank');
                break;
            }
            case 'git': {
                window.open('https://github.com/born2net/msgetstarted', '_blank');
                break;
            }
            case 'solution': {
                bootbox.alert('At this point you can have your customers open accounts directly on your web site, track them and up-sale them... we make it easy for you to be successful in Digital Signage!');
                break;
            }
        }
        return false;
    }

    private renderFormInputs() {
        _.forEach(this.formInputs, (i_value, key: string) => {
            var value = this.whitelabelModel.getKey(key);
            value = StringJS(value).booleanToNumber();
            this.formInputs[key].setValue(value);
        })
    };

    private isWhitelabelEnabled() {
        return StringJS(this.getBusinessInfo('whitelabelEnabled')).booleanToNumber();
    }

    private onWhiteLabelChange(value) {
        if (value && this.resellerAction.getResellerIsActive() == false) {
            value = false;
            bootbox.alert('Branding will not be set as this account is inactive, be sure to update the billing info to reactivate the account!');
        }
        setTimeout(() => {
            this.appStore.dispatch(this.resellerAction.saveWhiteLabel({whitelabelEnabled: value}))
            this.cd.markForCheck();
        }, 1)
    }

    private ngOnDestroy() {
        this.unsub();
    }
}