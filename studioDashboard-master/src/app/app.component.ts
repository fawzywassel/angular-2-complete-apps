import {Component, ViewContainerRef, VERSION} from "@angular/core";
import {StyleService} from "../styles/StyleService";
import {AppdbAction} from "../appdb/AppdbAction";
import "rxjs/add/operator/catch";
import {Router, ActivatedRoute, NavigationEnd} from "@angular/router";
import {CommBroker} from "../services/CommBroker";
import {Title} from "@angular/platform-browser";
import {ToastsManager} from "ng2-toastr";
import {Ngmslib} from "ng-mslib";
import {Consts} from "../Conts";
import {Observable} from "rxjs";
import {ServerMode} from "./app.module";
import * as packageJson from "../../package.json";
import {AuthService} from "../services/AuthService";
import {LocalStorage} from "../services/LocalStorage";

@Component({
    selector: 'app-root',
    providers: [StyleService, AppdbAction],
    templateUrl: './app.component.html',
})
export class AppComponent {

    constructor(private router: Router,
                private commBroker: CommBroker,
                private activatedRoute: ActivatedRoute,
                private titleService: Title,
                private vRef: ViewContainerRef,
                private toastr: ToastsManager,
                private localStorage:LocalStorage,
                private authService: AuthService) {

        this.version = packageJson.version;
        this.ngVersion = VERSION.full

        //this.checkPlatform();

        /** remove localstore **/
        // this.localStorage.removeItem('remember_me')
        // this.localStorage.removeItem('business_id')

        // todo: add logic to as when on each env
        // 0 = cloud, 1 = private 2 = hybrid
        // Ngmslib.GlobalizeStringJS();
        console.log(StringJS('app-loaded-ready').humanize().s);

        this.commBroker.setValue(Consts.Values().SERVER_MODE, ServerMode.CLOUD);
        this.commBroker.setService(Consts.Services().App, this);
        Observable.fromEvent(window, 'resize').debounceTime(250).subscribe(() => {
            this.appResized();
        });
        this.toastr.setRootViewContainerRef(vRef);
        this.listenRouterUpdateTitle();
    }

    ngOnInit() {
        let s = this.router.events.subscribe((val) => {
            if (val instanceof NavigationEnd) {
                this.authService.start();
                s.unsubscribe();
            }
        });
    }

    public version: string;
    private ngVersion: string;

    private checkPlatform() {
        switch (platform.name.toLowerCase()) {
            case 'microsoft edge': {
                alert(`${platform.name} browser not supported at this time, please use Google Chrome`);
                break;
            }
            case 'chrome': {
                break;
            }
            default: {
                alert('for best performance please use Google Chrome');
                break;
            }
        }
    }

    public appResized(): void {
        var appHeight = document.body.clientHeight;
        var appWidth = document.body.clientWidth;
        this.commBroker.setValue(Consts.Values().APP_SIZE, {
            height: appHeight,
            width: appWidth
        });
        this.commBroker.fire({
            fromInstance: self,
            event: Consts.Events().WIN_SIZED,
            context: '',
            message: {
                height: appHeight,
                width: appWidth
            }
        })
    }

    private listenRouterUpdateTitle() {
        this.router.events
            .filter(event => event instanceof NavigationEnd)
            .map(() => this.activatedRoute)
            .map(route => {
                while (route.firstChild) {
                    route = route.firstChild
                }
                return route;
            }).filter(route => route.outlet === 'primary')
            .mergeMap(route => route.data)
            .subscribe((event) => {
                this.titleService.setTitle(event['title'])
            });
    }
}

