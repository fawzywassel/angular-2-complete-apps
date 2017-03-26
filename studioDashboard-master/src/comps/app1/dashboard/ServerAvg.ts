import {Component, OnInit, Input, ElementRef} from '@angular/core';
import {Ng2Highcharts} from '../../ng2-highcharts/ng2-highcharts';

// window['Highcharts'] = require('highcharts');
import * as Highcharts from 'highcharts';
import {Loading} from "../../loading/Loading";
window['Highcharts'] = Highcharts;

@Component({
    selector: 'ServerAvg',
    template: `
        <div style="width: 100%; height: 150px">
           <Loading *ngIf="_data == 0" [size]="'50px'" [style]="{'margin-top': '150px'}"></Loading>            
            <div *ngIf="_data !=  0">
                <div [ng2-highcharts]="_options" (init)="onInit($event)" class="graph"></div>
            </div>
        </div>
    `
})
export class ServerAvg {

    _data;
    _options;
    _series;
    _chart

    @Input()
    set data(value) {
        this._data = value;
    }

    constructor() {
        var self = this;
        this._options = {
            chart: {
                type: 'spline',
                height: 228,
                borderColor: '#d9d9d9',
                borderWidth: 1,
                marginRight: 10,
                events: {
                    load: function () {

                        // set up the updating of the chart each second
                        var series = this.series[0];
                        setInterval(function () {
                            var x = (new Date()).getTime();
                            //y = Math.random();
                            series.addPoint([x, self._data], true, true);
                        }, 2500);
                    }
                }
            },
            title: {
                text: ''
            },

            xAxis: {
                labels: {
                    enabled: false
                },
                categories: []
            },
            credits: {
                enabled: false
            },
            yAxis: [{
                min: 0,
                title: {
                    text: 'average response time'
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
            series: [
                {
                    name: 'Random data',
                    data: (function () {
                        var data = [],
                            time = (new Date()).getTime(),
                            i;

                        for (i = -60; i <= 0; i++) {
                            data.push({
                                x: time + i * 1000,
                                y: 0
                                // y: Math.random()
                            });
                        }
                        return data;
                    })()
                }
            ]
        }
    }

    onInit(chart: HighchartsChartObject) {
        this._chart = chart;
        this._series = chart.series[0];

    }
}