import {Component, Input, ChangeDetectionStrategy, ViewChild, Renderer, ElementRef} from "@angular/core";
import {StationModel} from "../../../stations/StationModel";
import {AppStore} from "angular2-redux-util";
import * as _ from "lodash";
import {BusinessAction} from "../../../business/BusinessAction";
import {StationSnapshot} from "./StationSnapshot";

@Component({
    selector: 'stationDetails',
    templateUrl: './StationDetails.html',
    styleUrls: ['./StationDetails.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class StationDetails {

    constructor(private appStore: AppStore,
                private businessActions: BusinessAction,
                private elRef: ElementRef,
                private renderer: Renderer) {
    }

    private sendSnapshot() {
        this.stationSnapshot.sendSnapshot(this.m_selectedStation);
    }

    private snapshots: Array<any> = [];

    private onModalClose($event) {
    }

    private sendCommand(i_command, i_param) {
        var source = this.m_selectedStation.getSource(this.appStore);
        var customerUserName = this.m_selectedStation.getCustomerName(this.appStore);
        var stationId = this.m_selectedStation.getStationId();
        var businessId = this.m_selectedStation.getKey('businessId');
        this.businessActions.getUserPass(customerUserName, (i_pass) => {
            var url = `https://${source}/WebService/sendCommand.ashx?i_user=${customerUserName}&i_password=${i_pass}&i_stationId=${stationId}&i_command=${i_command}&i_param1=${i_param}&i_param2=''&callback=?`;
            console.log(url)
            jQuery.getJSON(url, (res) => {
                console.log(res);
            });
        });
    }

    private m_selectedStation: StationModel;

    // @Input() station:StationModel;

    @ViewChild(StationSnapshot)
    stationSnapshot: StationSnapshot;


    @Input()
    set station(i_selectedStation: StationModel) {
        if (_.isUndefined(i_selectedStation))
            return;
        this.m_selectedStation = i_selectedStation;

        // this.m_selectedStation.getPublicIp()
        // this.m_selectedStation.getLocalIp()
        // this.m_selectedStation.getLocation().lat
        // this.m_selectedStation.getLocation().lon
        // this.m_selectedStation.getLocation().city
        // this.m_selectedStation.getLocation().country
    }


}

