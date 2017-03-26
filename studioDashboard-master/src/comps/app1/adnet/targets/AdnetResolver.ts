import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import {AdnetActions} from "../../../../adnet/AdnetActions";
import {Observable} from "rxjs/Observable";

@Injectable()
export class AdnetResolver implements Resolve<any> {
    constructor(private adnetActions: AdnetActions) {}

    resolve(route: ActivatedRouteSnapshot):Observable<any> {
        return this.adnetActions.onAdnetRouteReady(route.params['adnetCustomerId'], route.params['adnetTokenId']);
    }
}