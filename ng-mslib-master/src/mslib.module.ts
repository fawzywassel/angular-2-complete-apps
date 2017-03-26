import {NgModule, ModuleWithProviders} from "@angular/core";
import {CommonModule} from "@angular/common";
import {MyNgComp} from "./components/myng-component";
import {StringJSPipe} from "./pipes/stringjs.pipe";
import {NgmslibService} from "./services/ngmslib.service";

// if you were ever to add a provided Service feature, it needs to have it's own module,
// since it requires a single import only from within  app.module, contrary to
// feature modules which get imported multiple times by other modules
// to see module providing module see: https://github.com/Toxicable/angular-validators/blob/master/src/validation-messages/validation-messages.module.ts

export const MSLIB_DIRECTIVES: Array<any> = [MyNgComp, StringJSPipe];

// export const MSLIB_DIRECTIVES: Array<any> = [MyNgComp, StringJSPipe];
// @NgModule({
//     declarations: [  ],
//     exports: [  ],
// })
// export class MgmslibServiceModule {
// }

@NgModule({
    imports: [CommonModule],
    declarations: MSLIB_DIRECTIVES,
    exports: MSLIB_DIRECTIVES
})

export class MsLibModule {
    static forRoot(config:{}): ModuleWithProviders {
        return {
            ngModule: MsLibModule,
            providers: [NgmslibService]
        };
    }
}