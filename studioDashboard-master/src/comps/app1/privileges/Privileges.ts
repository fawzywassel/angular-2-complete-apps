import {
    Component,
    Input,
    Output,
    EventEmitter,
    ViewChild,
    trigger,
    transition,
    animate,
    state,
    style
} from "@angular/core";
import {simplelist} from "../../simplelist/simplelist";
import {PrivelegesModel} from "../../../reseller/PrivelegesModel";
import {List} from "immutable";
import {AppStore} from "angular2-redux-util";
import {AuthService} from "../../../services/AuthService";
import {ResellerAction} from "../../../reseller/ResellerAction";
// import * as bootbox from "bootbox";

@Component({
    selector: 'privileges',
    styles: [`
      .userView {
        /*background-color: red; */
      }      
      .btns {
          padding: 0 20px 20px 0px;
          font-size: 1.4em;
          color: #313131;
      }
      .btns:hover {
        color: red;
      }
      .enabled {
        opacity: 1
      }
       .disabled {
        opacity: 0.2;
        cursor: default;
      }
    `],
    host: {
        '[@routeAnimation]': 'true',
        '[style.display]': "'block'",
        '[style.position]': "'absolute'"
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
    template: `
        <div class="row">
             <div class="col-xs-3">
                <div style="position: relative; top: 10px">
                    <div>
                      <a class="btns" (click)="onAdd($event);$event.preventDefault()" href="#"><span class="fa fa-plus"></span></a>
                      <a class="btns" (click)="onRemove($event);$event.preventDefault()" [ngClass]="{disabled: !privelegesModelSelected}" href="#">
                       <span class="fa fa-remove"></span>
                      </a>
                    </div>
                </div>
                <simplelist *ngIf="privelegesList" #simplelist [list]="privelegesList" 
                    (selected)="onPrivilegeSelected()"
                    (iconClicked)="onDefaultPrivilegeChanged($event)"
                    (edited)="onPrivilegeRenamed($event)"                    
                    [editable]="true"
                    [iconSelectiondMode]="true"
                    [iconSelected]="getDefaultPrivilege()"
                    [contentId]="getPrivilegeId()"
                    [content]="getPrivilege">
                </simplelist> 
                <Loading *ngIf="!privelegesList" [src]="'assets/preload6.gif'" [style]="{'margin-top': '150px'}"></Loading>
             </div>
             <div class="col-xs-9" style="max-height: 100% !important; overflow-y: scroll">                
                <Loading *ngIf="!privelegesList" [src]="'assets/preload6.gif'" [style]="{'margin-top': '150px'}"></Loading>
                <!--<privilegesDetails [selected]="privelegesModelSelected" [priveleges]="privelegesList" ></privilegesDetails>-->
                <privilegesDetails [selected]="privelegesModelSelected"></privilegesDetails>
             </div>
        </div>
    `
})
export class Privileges {

    constructor(private appStore: AppStore, private resellerAction: ResellerAction, private authService: AuthService) {
        var i_reseller = this.appStore.getState().reseller;

        this.privilegeDefault = i_reseller.getIn(['privilegeDefault']);
        this.unsub = this.appStore.sub((privilegeDefault: number) => {
            this.privilegeDefault = privilegeDefault;
        }, 'reseller.privilegeDefault');

        this.privelegesList = i_reseller.getIn(['privileges']);
        this.unsub = this.appStore.sub((privelegesModel: List<PrivelegesModel>) => {
            this.privelegesList = privelegesModel;
            this.onPrivilegeSelected();
        }, 'reseller.privileges');
    }

    @ViewChild(simplelist)
    simplelist: simplelist;

    @Input()
    parts = [];
    @Input()
    partsInCart: string;

    @Output()
    addToCart: EventEmitter<any> = new EventEmitter();

    private unsub;
    private privelegesList: List<PrivelegesModel>
    private privelegesModelSelected: PrivelegesModel;
    private privilegeDefault: number;

    private onPrivilegeRenamed(event: {item: PrivelegesModel, value: string}) {
        if (event.value.trim().length == 0)
            return;
        var privilegeId = event.item.getPrivelegesId();
        this.appStore.dispatch(this.resellerAction.updateDefaultPrivilegeName(privilegeId, event.value));
        this.appStore.dispatch(this.resellerAction.savePrivileges(privilegeId, event.value));
    }

    private onDefaultPrivilegeChanged(event) {
        for (var id in event.metadata) {
            if (event.metadata[id].index == event.index)
                this.appStore.dispatch(this.resellerAction.setDefaultPrivilege(Number(id)));
        }
    }

    private onPrivilegeSelected() {
        if (!this.simplelist)
            return;
        var selected = this.simplelist.getSelected();
        var selectedList: List<PrivelegesModel> = this.privelegesList.filter((privelegesModel: PrivelegesModel) => {
            var privelegesId = privelegesModel.getPrivelegesId();
            return selected[privelegesId] && selected[privelegesId].selected;
        }) as List<PrivelegesModel>;
        this.privelegesModelSelected = selectedList.first();
    }

    private getPrivilege(privelegesModel: PrivelegesModel) {
        return privelegesModel.getName();
    }

    private getPrivilegeId() {
        return (privilegeModel: PrivelegesModel) => {
            return privilegeModel.getPrivelegesId();
        }
    }

    private getDefaultPrivilege() {
        return (index, privelegesModel: PrivelegesModel) => {
            if (privelegesModel.getPrivelegesId() == this.privilegeDefault)
                return true
            return false;
        }
    }

    private onAdd() {
        this.appStore.dispatch(this.resellerAction.createPrivilege());
    }

    private onRemove() {
        if (!this.privelegesModelSelected)
            return;
        var simplelistItems = this.simplelist.getSelected();
        var simplelistDefaultIndex = this.simplelist.selectedIconIndex;
        for (var i in simplelistItems) {
            if (simplelistItems[i].selected && simplelistItems[i].index == simplelistDefaultIndex) {
                bootbox.alert('Sorry can not delete the default privilege set. Be sure to apply the default privilege to another set and try again')
                return;
            }
        }

        var selectedPrivId = this.privelegesModelSelected.getPrivelegesId();
        var selectedPrivName = this.privelegesModelSelected.getName();
        bootbox.confirm(`Are you sure you want to remove the privilege set ${selectedPrivName} (id:${selectedPrivId})?`, (result) => {
            if (result) {
                this.appStore.dispatch(this.resellerAction.deletePrivilege(selectedPrivId));
            }
        });
    }

    private ngOnDestroy() {
        this.unsub();
    }
}

