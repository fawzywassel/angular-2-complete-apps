import {Component, OnInit, Input, ElementRef} from '@angular/core';
import {Ng2Highcharts} from '../../ng2-highcharts/ng2-highcharts';

//window['Highcharts'] = require('highcharts');
import * as Highcharts from 'highcharts';

@Component({
    selector: 'UserStorage',
    template: `
        <div style="width: 100%; height: 80%">
             <div [ng2-highcharts]="chartBar" class="graph"></div>
        </div>
    `
})
export class UserStorage  {
    constructor() {
    }

    chartOptions = {

    };
    chartBar = {
        chart: {
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false,
            type: 'pie',
            height: '250'
        },
        title: {
            text: ''
        },
        credits: {
            enabled: false
        },
        series: [{
            name: 'cloud storage',
            colorByPoint: true,
            data: [{
                name: 'used',
                y: 40
            }, {
                name: 'free',
                y: 60,
                sliced: true,
                selected: true
            }]
        }]
    };
}