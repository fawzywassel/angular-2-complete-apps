import {Directive, Renderer, ElementRef} from "@angular/core";
import {AppStore} from "angular2-redux-util";
import {Observable} from "rxjs/Rx";
import "rxjs/add/operator/do";
import "rxjs/add/observable/fromEvent";
import "rxjs/add/observable/interval";
import {BusinessAction} from "../../../business/BusinessAction";
import {StationModel} from "../../../stations/StationModel";

@Directive({
    selector: 'StationSnapshot',
})

export class StationSnapshot {

    constructor(private appStore:AppStore,
                private businessActions:BusinessAction,
                private elRef:ElementRef,
                private renderer:Renderer) {
    }

    public sendSnapshot(selectedStation:StationModel) {
        var stationId = selectedStation.getStationId();
        var businessId = selectedStation.getKey('businessId');
        var fileName = Date.now();
        var source = selectedStation.getSource(this.appStore);
        var customerUserName = selectedStation.getCustomerName(this.appStore);
        this.businessActions.getUserPass(customerUserName, (i_pass)=> {
            var pass = i_pass;
            var url = `https://${source}/WebService/sendCommand.ashx?i_user=${customerUserName}&i_password=${pass}&i_stationId=${stationId}&i_command=captureScreen2&i_param1=${fileName}&i_param2=0.2&callback=?`;
            jQuery.getJSON(url, ()=> {
                var path = `https://${source}/Snapshots/business${businessId}/station${stationId}/${fileName}.jpg`;
                jQuery(this.elRef.nativeElement).find('.newImage').fadeOut(200);
                var img = this.renderer.createElement(this.elRef.nativeElement, 'img', null);
                jQuery(img).addClass('snap');
                var int$ = Observable.interval(500).do(()=> {
                    img.src = path;
                })
                var $err = Observable.fromEvent(img, 'error').do(()=>{
                    jQuery(this.elRef.nativeElement).find('.snap').remove();
                })
                var load$ = Observable.fromEvent(img, 'load')
                var subscription = Observable.merge(int$, $err).takeUntil(load$).delay(500).subscribe((res)=> {
                    subscription.unsubscribe();
                })
            });
        });
    }
}