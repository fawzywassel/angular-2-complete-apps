import {
    Component,
    EventEmitter,
    ChangeDetectionStrategy,
    Input,
    ViewChild
} from '@angular/core';
import {BusinessUser} from "../../../business/BusinessUser";
import {Lib} from "../../../Lib";
import {FormGroup, Validators, FormControl, FormBuilder} from "@angular/forms";
import {AppStore} from "angular2-redux-util";
import {BusinessAction} from "../../../business/BusinessAction";
import {PrivelegesModel} from "../../../reseller/PrivelegesModel";
import {ModalComponent} from "ng2-bs3-modal/components/modal";
import * as _ from 'lodash'
import {ChangePass} from "./ChangePass";

@Component({
    selector: 'addUser',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './AddUser.html',
    styleUrls: ['./AddUser.css']
})

/**
 The first Note1 slider component in a series of sliders / notes.
 Demonstrates the usage of explicit form configuration.
 **/
export class AddUser {

    constructor(private appStore:AppStore, private businessActions:BusinessAction, private fb:FormBuilder, private modal:ModalComponent) {
        this.notesForm = fb.group({
            'userName': ['', Validators.required],
            'businessName': [],
            accessKeys0: [],
            accessKeys1: [],
            accessKeys2: [],
            accessKeys3: [],
            accessKeys4: [],
            accessKeys5: [],
            accessKeys6: [],
            accessKeys7: [],
            'privileges': ['', Validators.required]
        });

        this.sub = modal.onClose.subscribe(()=> {
            var userNameControl:FormControl = this.notesForm.controls['userName'] as FormControl;
            var businessNameControl:FormControl = this.notesForm.controls['businessName'] as FormControl;
            userNameControl.setValue('')
            businessNameControl.setValue('')
        })
        // this.passwordGroup = this.notesForm.controls['matchingPassword'] as FormControl;
        this.userName = this.notesForm.controls['userName'] as FormControl;
    }

    private accessKeysArr:any = _.times(8, _.uniqueId as any);
    // private accessKeys:Array<boolean> = _.times(8, ()=>false);
    // private accessKeys:FormControl[];

    @ViewChild(ChangePass)
    changePass:ChangePass;

    @Input()
    businessId:number;

    @Input()
    priveleges:Array<PrivelegesModel> = [];

    @Input()
    mode:'fromSample'|'fromClean'|'fromUser' = null;

    private privilegeName:string = '';
    private notesForm:FormGroup;
    private userName:FormControl;
    private businessName:FormControl;
    // private passwordGroup;
    private sub:EventEmitter<any>;

    private onKeyChange(event, index) {
        // console.log(event.target.checked + ' ' + index);
    }

    private areEqual(group:FormGroup) {
        let valid = true, val;
        for (var name in group.controls) {
            if (val === undefined) {
                val = group.controls[name].value
                if (val.length < 4) {
                    valid = false;
                    break;
                }
            } else {
                if (val !== group.controls[name].value) {
                    valid = false;
                    break;
                }
            }
        }
        if (valid) {
            return null;
        }
        return {
            areEqual: true
        };
    }

    private onPriveleges(event) {
        this.privilegeName = event.target.value;
    }

    private onSubmit(event) {
        var pass = this.changePass.getPassword();
        if (_.isNull(pass))
            return;
        var accessKeys = [];
        _.forEach(event,(value,key:any)=>{
            if (key.indexOf('accessKey') > -1){
                var state:boolean = (value === false || _.isNull(value)) || value == 'false' ? false : true
                accessKeys.push(state);
            }
        })
        let privilegeId = '-1';
        let computedAccessMask = Lib.ComputeMask(accessKeys);
        var privileges:Array<PrivelegesModel> = this.appStore.getState().reseller.getIn(['privileges']);
        privileges.forEach((privelegesModel:PrivelegesModel)=> {
            if (privelegesModel.getName() == this.privilegeName) {
                privilegeId = privelegesModel.getPrivelegesId();
            }
        })
        var userData = {
            accessMask: computedAccessMask,
            privilegeId: privilegeId,
            password: pass.pass1,
            name: event.userName,
            businessName: event.businessName,
            businessId: this.businessId,
        }


        switch (this.mode) {
            case 'fromSample': {
                userData['businessId'] = this.businessId;
                var businessUser:BusinessUser = new BusinessUser(userData);
                this.appStore.dispatch(this.businessActions.duplicateAccount(businessUser));
                break;
            }
            case 'fromClean': {
                userData['businessId'] = 999;
                var businessUser:BusinessUser = new BusinessUser(userData);
                this.appStore.dispatch(this.businessActions.duplicateAccount(businessUser));
                break;
            }
            case 'fromUser': {
                var businessUser:BusinessUser = new BusinessUser(userData);
                this.appStore.dispatch(this.businessActions.addNewBusinessUser(businessUser));
                break;
            }
        }
        this.modal.close();
    }

    private onChange(event) {
        if (event.target.value.length < 3)
            console.log('text too short for subject');
    }

    private ngOnDestroy() {
        this.sub.unsubscribe();
    }
}

// this.observeNameChange();
// this.observeFormChange();
// /**
//  * Listen to observable emitted events from name control
//  * use one of the many RX operators debounceTime to control
//  * the number of events emitted per milliseconds
//  **/
// private observeNameChange() {
//     this.userName.valueChanges.debounceTime(100).subscribe(
//         (value:string) => {
//             console.log('name changed, notified via observable: ', value);
//         }
//     );
// }
//
// private observeFormChange() {
//     this.notesForm.valueChanges.debounceTime(100).subscribe(
//         (value:string) => {
//             console.log('forum changed, notified via observable: ', value);
//         }
//     );
// }