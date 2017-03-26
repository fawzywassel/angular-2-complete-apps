import {Injector} from '@angular/core';
let appInjectorRef: Injector;
export const appInjService = (injector?: Injector): Injector => {
    if (injector)
        appInjectorRef = injector;
    return appInjectorRef;
};