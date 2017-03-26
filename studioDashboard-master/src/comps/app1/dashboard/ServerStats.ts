import {Component, OnInit, Input, ElementRef} from '@angular/core';
import {Ng2Highcharts} from '../../ng2-highcharts/ng2-highcharts';

import * as Highcharts from 'highcharts';
import {Loading} from "../../loading/Loading";

@Component({
    selector: 'ServerStats',
    template: `
        <div style="width: 100%">
            <Loading *ngIf="_data == 0" [size]="'50px'" [style]="{'margin-top': '150px'}"></Loading>
            <div *ngIf="_data.length > 0">
                <div [ng2-highcharts]="_options" (init)="onInit($event)" class="graph"></div>
            </div>
        </div>
    `
})
export class ServerStats {

    _data;
    _options;
    _series;
    _chart;

    @Input()
    categories

    @Input()
    set data(value) {
        this._data = value;
        if (this._series) {
            this._series.setData(value);
            return;
        }

        this._options = {
            chart: {
                type: 'column',
                height: 228,
                borderColor: '#d9d9d9',
                borderWidth: 1
            },
            title: {
                text: ''
            },
            xAxis: {
                // categories: [
                //     'Server1',
                //     'Server2',
                //     'Server3',
                //     'Server4',
                //     'Server5',
                //     'Server6',
                //     'Server7',
                //     'Server8',
                //     'Server9',
                //     'Server10',
                //     'Server11',
                //     'Server12'
                // ]
                categories: this.categories
            },
            credits: {
                enabled: false
            },
            yAxis: [{
                min: 0,
                title: {
                    text: 'servers response time'
                }
            }, {
                title: {
                    text: 'measured in milliseconds'
                },
                opposite: true
            }],
            legend: {
                enabled: false,
                shadow: false
            },
            tooltip: {
                shared: true
            },
            plotOptions: {
                column: {
                    grouping: false,
                    shadow: false,
                    borderWidth: 0
                }
            },
            series: [{
                data: this._data
            }]
        }
    }

    onInit(chart:HighchartsChartObject) {
        this._chart = chart;
        this._series = chart.series && chart.series[0];

    }
}