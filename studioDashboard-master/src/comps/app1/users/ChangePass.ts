import {Component, EventEmitter, ChangeDetectionStrategy, Input, Output} from "@angular/core";
import {FormGroup, Validators, FormControl, FormBuilder} from "@angular/forms";
import {AppStore} from "angular2-redux-util";
import {BusinessAction} from "../../../business/BusinessAction";
import {BusinessUser} from "../../../business/BusinessUser";
import {ModalComponent} from "ng2-bs3-modal/components/modal";

export interface IChangePass {
    matchingPassword: {
        confirmPassword: string,
        password: string
    }
    userName: string;
    userPass: string;
}

@Component({
    selector: 'changePass',
    templateUrl: './ChangePass.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styles: ['./ChangePass.css']
})

/**
 The first Note1 slider component in a series of sliders / notes.
 Demonstrates the usage of explicit form configuration.
 **/ export class ChangePass {

    constructor(private appStore: AppStore, private businessActions: BusinessAction, private fb: FormBuilder, private modal: ModalComponent) {
        this.notesForm = fb.group({
            userName: [''],
            userPass: [''],
            matchingPassword: fb.group({
                password: ['', Validators.required],
                confirmPassword: ['', Validators.required]
            }, {validator: this.areEqual})
        });
        this.passwordGroup = this.notesForm.controls['matchingPassword'] as FormControl;
        this.sub = modal.onClose.subscribe(() => {
            setTimeout(() => {
                this.passwordGroup.controls['password'].setValue('')
                this.passwordGroup.controls['confirmPassword'].setValue('')
            }, 1500)

        })
    }

    @Input() businessUser: BusinessUser;

    @Input() withUserInput: boolean = false;

    @Input()
    set showSubmit(i_showSubmit) {
        this._showSubmit = i_showSubmit;
    }

    @Output()
    onSubmit: EventEmitter<IChangePass> = new EventEmitter<IChangePass>();

    private sub: EventEmitter<any>;
    private notesForm: FormGroup;
    private passwordGroup;
    private _showSubmit: boolean = true;


    private areEqual(group: FormGroup) {
        let valid = true, val;
        for (var name in group.controls) {
            if (val === undefined) {
                val = group.controls[name].value;
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

    private onSubmitted(event) {
        if (this.onSubmit.observers.length >= 1)
            return this.onSubmit.emit(this.notesForm.value);
        this.appStore.dispatch(this.businessActions.updateBusinessPassword(this.businessUser.getName(), event.matchingPassword.password));
        this.modal.close();
    }

    private onChange(event) {
        if (event.target.value.length < 3) console.log('text too short for subject');
    }

    private ngOnDestroy() {
        this.sub.unsubscribe();
    }

    public getPassword() {
        var pass1 = this.passwordGroup.controls['password'].value;
        var pass2 = this.passwordGroup.controls['confirmPassword'].value;
        if (pass1 == pass2 && pass1.length > 3) {
            return {
                pass1,
                pass2
            }
        }
        return null;
    }
}

