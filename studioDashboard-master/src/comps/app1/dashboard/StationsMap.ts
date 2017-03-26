import {Component, Input, Output, EventEmitter, ChangeDetectorRef, ViewChild} from "@angular/core";
import {StationModel} from "../../../stations/StationModel";
import * as _ from "lodash";
import {SebmGoogleMap} from "angular2-google-maps/core";
//import {SebmGoogleMap} from "angular2-google-maps/core/core.umd.js";

interface marker {
    instance: StationModel,
    id: number;
    lat: number;
    lng: number;
    color: string;
    name: string;
    label?: string;
    draggable: boolean;
}
@Component({
    selector: 'stationsMap',
    template: `
        <sebm-google-map #googleMaps style="width: 100% ; height: 100%"
              (mapClick)="mapClicked($event)"
              [latitude]="38.2500"
              [longitude]="-96.7500"
              [zoom]="zoom"
              [disableDefaultUI]="false"
              [zoomControl]="false">
            
              <sebm-google-map-marker style="width: 300px ; height: 400px" 
                  *ngFor="let m of markers; let i = index"
                  (markerClick)="clickedMarker(m, i)"
                  [latitude]="m.lat"
                  [longitude]="m.lng"
                  [iconUrl]="getMarkerIcon(m)"
                  [label]="m.label">
                <!--<sebm-google-map-info-window>-->
                  <!--<strong>InfoWindow content</strong>-->
                <!--</sebm-google-map-info-window>-->
        
      </sebm-google-map-marker>
    </sebm-google-map>
    `
})
export class StationsMap {
    constructor(private cdr: ChangeDetectorRef) {
        setInterval(()=> {
            this.forceUpdateUi();
        }, 3000)

        // this.googleMaps.setCenter()
    }

    ngAfterViewInit() {
        console.log(this.googleMaps);
    }

    @ViewChild('googleMaps')
    googleMaps: SebmGoogleMap;

    @Output()
    onStationSelected: EventEmitter<any> = new EventEmitter();

    @Output()
    onMapClicked: EventEmitter<any> = new EventEmitter();

    markers: marker[] = [];
    zoom: number = 4;

    // initial center position for the map
    lat: number = 39.8282;
    lng: number = 98.5795;

    getMarkerIcon(m: marker) {
        this.cdr.detach();
        return `assets/screen_${m.color}.png`;
    }

    clickedMarker(marker: marker, index: number) {
        this.onStationSelected.emit(marker.instance);
    }

    mapClicked($event: MouseEvent) {
        this.onMapClicked.emit($event);
    }

    @Input()
    set stations(i_stations) {
        this.m_stations = i_stations;
        this.updateStations();
    }


    protected chartMap = {};
    private highCharts: any;
    private m_stations;

    onInit(event) {
        this.updateStations();
    }

    private getStationConnection(i_value) {
        if (i_value == 0)
            return 'red';
        if (i_value == 1)
            return 'green';
        if (i_value == 2)
            return 'yellow';
        return 'black';
    }

    public forceUpdateUi() {
        this.cdr.reattach();
        setTimeout(()=> {
            this.cdr.detach();
        }, 1000)
    }

    private updateStations() {
        if (!this.m_stations)
            return;
        var c = 0;
        this.markers = [];
        this.m_stations.forEach((i_station: StationModel)=> {
            var geoLocation = i_station.getLocation();
            if (_.isEmpty(geoLocation) || geoLocation.lat == 0 && geoLocation.lon == 0)
                return;
            this.markers.push({
                instance: i_station,
                id: i_station.getStationId(),
                name: i_station.getKey('name'),
                color: i_station.getConnectionIcon('color'),
                lat: +geoLocation.lat,
                lng: +geoLocation.lon,
                label: '',
                draggable: false
            })
        });
        this.forceUpdateUi();
    }

    public clear() {
        this.markers = [];
        this.forceUpdateUi();
    }

    public setCenter(lat, lng) {
        // this.googleMaps.latitude = lat;
        // this.googleMaps.longitude = lng;
        // for private access to all APIs do:
        this.googleMaps['_mapsWrapper'].setCenter({
            lat: lat,
            lng: lng,
        });
    }
}
