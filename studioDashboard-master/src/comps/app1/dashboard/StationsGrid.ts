import {Component, Input, Output, ViewChild, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef} from "@angular/core";
import {StationModel} from "../../../stations/StationModel";
import {SimpleGridTable} from "../../simplegridmodule/SimpleGridTable";
import {SimpleGridRecord} from "../../simplegridmodule/SimpleGridRecord";
import {List} from "immutable";
import {Subject, Observable} from "rxjs";
import "rxjs/add/operator/do";
import "rxjs/add/operator/delay";
import {Compbaser} from "../../compbaser/Compbaser";
import {Ngmslib} from "ng-mslib";


@Component({
    selector: 'stationsGrid',
    styles: [`
            .disabled {
               opacity: 0.2;
               cursor: default;
             }
            .stationProps {
               position: relative;
                top: -14px;
                color: #222222;
                left: 2px;
                font-size: 1.2em;
             }
        `],
    template: `
        <div class="row">
             <p style="padding-left: 10px">total players: {{totalPlayersSubject$ | async}}</p>
             <div class="col-xs-12">
                <div (click)="$event.preventDefault()" style="position: relative; top: 10px">
                    <div>
                      <a class="btns stationProps" href="#" 
                        (click)="!userSimpleGridTable || userSimpleGridTable.getSelected() == null ? '' : launchStationModal()" 
                        [ngClass]="{disabled: !userSimpleGridTable || userSimpleGridTable.getSelected() == null}" href="#">
                        <span class="fa fa-cogs"></span>
                      </a>
                    </div>
                </div>
                  <simpleGridTable #userSimpleGridTable>
                    <thead>
                    <tr>
                      <th sortableHeader="connection" [sort]="sort">connect</th>
                      <th sortableHeader="watchDogConnection" [sort]="sort">watchdog</th>
                      <th sortableHeader="name" [sort]="sort">name</th>
                      <th sortableHeader="businessId" [sort]="sort">business</th>
                      <th sortableHeader="os" [sort]="sort">os</th>
                      <th sortableHeader="status" [sort]="sort">status</th>                      
                      <th sortableHeader="runningTime" [sort]="sort">running</th>
                      <th sortableHeader="totalMemory" [sort]="sort">totalMem</th>
                      <th sortableHeader="peakMemory" [sort]="sort">peakMem</th>
                      <th sortableHeader="airVersion" [sort]="sort">runtime</th>
                      <th sortableHeader="appVersion" [sort]="sort">version</th>
                    </tr>
                    </thead>
                    <tbody>                    
                    <!--<tr class="simpleGridRecord" (onDoubleClicked)="onDoubleClicked($event)" simpleGridRecord *ngFor="let item of m_stations | ThrottlePipe | OrderBy:sort.field:sort.desc; let index=index" [item]="item" [index]="index">-->
                    <tr class="simpleGridRecord" (onDoubleClicked)="onDoubleClicked($event)" simpleGridRecord *ngFor="let item of m_stations | OrderBy:sort.field:sort.desc; let index=index" [item]="item" [index]="index">
                      <td style="width: 5%" simpleGridDataImage [color]="item.getConnectionIcon('color')" [field]="item.getConnectionIcon('icon')" [item]="item"></td>
                      <td style="width: 5%" simpleGridDataImage color="dodgerblue" [field]="item.getWatchDogConnection()" [item]="item"></td>
                      <td style="width: 25%" simpleGridData editable="false" field="name" [item]="item"></td>
                      <td style="width: 5%" simpleGridData editable="false" field="businessId" [item]="item"></td>
                      <td style="width: 20%" simpleGridData editable="false" field="os" [item]="item"></td>
                      <td style="width: 10%" simpleGridData editable="false" field="status" [item]="item"></td>                      
                      <td style="width: 5%" simpleGridData editable="false" field="runningTime" [item]="item"></td>
                      <td style="width: 5%" simpleGridData editable="false" field="totalMemory" [item]="item"></td>
                      <td style="width: 5%" simpleGridData editable="false" field="peakMemory" [item]="item"></td>
                      <td style="width: 10%" simpleGridData editable="false" field="airVersion" [item]="item"></td>
                      <td style="width: 5%" simpleGridData editable="false" field="appVersion" [item]="item"></td>
                    </tr>
                    </tbody>
                  </simpleGridTable>
             </div>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class StationsGrid extends Compbaser {
    constructor(private cd: ChangeDetectorRef) {
        super();
    }

    @ViewChild(SimpleGridTable) simpleGridTable: SimpleGridTable

    private totalPlayersSubject$: Subject<any> = new Subject();
    private m_stations: List<StationModel>;

    @Input()
    set stations(i_stations: List<StationModel>) {
        if (!i_stations || i_stations.size == 0) {
            this.m_stations = List<any>();
            this.totalPlayersSubject$.next('none');
            return
        }
        this.totalPlayersSubject$.next(i_stations.size);
        this.m_stations = List<StationModel>();
        var items$ = Ngmslib.Staggered(i_stations, 1);
        this.cancelOnDestroy(
            items$.takeUntil((this.totalPlayersSubject$ as any))
                .subscribe((x) => {
                        this.m_stations = List<any>(x);
                        this.cd.markForCheck();
                    }
                )
        )
    }

    @Output() onStationSelected: EventEmitter<StationModel> = new EventEmitter<StationModel>();

    private onDoubleClicked(event) {
        this.launchStationModal(event.item);
    }

    private launchStationModal(i_stationModel?: StationModel) {
        if (!i_stationModel)
            i_stationModel = this.selectedStation();
        this.onStationSelected.emit(i_stationModel)
    }

    private selectedStation(): StationModel {
        if (!this.simpleGridTable)
            return null;
        let selected: SimpleGridRecord = this.simpleGridTable.getSelected();
        return selected ? this.simpleGridTable.getSelected().item : '';
    }

    private onSelectStation(event) {
    }

    public sort: { field: string, desc: boolean } = {
        field: null,
        desc: false
    };

}

// this.m_stations = List<StationModel>();
// i_stations.forEach((i_station: StationModel, c) => {
//     ((i_t, i_station) => {
//         setTimeout(() => {
//             this.m_stations = this.m_stations.push(i_station)
//             this.cd.markForCheck();
//         }, i_t)
//     })(c * 10, i_station);
//
// })
// this.m_stations = List<any>();
// this.m_stations = List<StationModel>();
// this.observable = Observable.create(o => {
//     this.observer = o;
// });
// var this = this;
// var c = 0;
// this.observable
//     .map(i_model => i_model)
//     .delay(_.random(2000, 4000))
//     .do((i_model) => {
//         console.log(c++);
//         this.m_stations = this.m_stations.push(i_model)
//         this.cd.markForCheck();
//     })
//     .subscribe();
//