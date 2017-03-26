import {
    Subject,
    Observable
} from "rxjs";


/**

 reference: https://github.com/NetanelBasal/angular2-take-until-destroy

 Usage example

 import TakeUntilDestroy from "angular2-take-until-destroy";

 @Component({
    selector: 'app-inbox',
    templateUrl: './inbox.component.html'
})
 @TakeUntilDestroy
 export class InboxComponent {
    constructor( ) {

        // reactive version, run some core until component no longer exists
        const timer$ = Observable.interval(1000)
            .takeUntil((<any>this).componentDestroy())
            .subscribe(val => console.log(val))
    }


    // function version, unsubscribe from store on destroy
    this.cancelOnDestroy(
            this.appStore.sub((i_adTargets: List<AdnetTargetModel>) => {
                i_adTargets.forEach((i_adTarget: AdnetTargetModel) => {
                    if (this.adnetTargetModel && i_adTarget.getId() == this.adnetTargetModel.getId()) {
                        this.adnetTargetModel = i_adTarget;
                        return;
                    }
                })
            }, 'adnet.targets')
    );

    private ngOnDestroy() {
        // You can also do whatever you need here
    }
}
 */

export interface AdnetConfigTargets {
    unsubOnDestroy(i_value: Function): void;
}

export function TakeUntilDestroy(constructor) {
    var original = constructor.prototype.ngOnDestroy;
    var subject;
    var unsub;
    constructor.prototype.componentDestroy = function () {
        subject = new Subject();
        return subject.asObservable();
    };
    constructor.prototype.unsubOnDestroy = function (i_unsub) {
        unsub = i_unsub;
    };
    constructor.prototype.ngOnDestroy = function () {
        original && typeof original === 'function' && original.apply(this, arguments);
        unsub === 'function' && unsub();
        subject && subject.next('ngOnDestroy') && subject.unsubscribe();
    };
}