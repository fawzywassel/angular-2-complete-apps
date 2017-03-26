import {Component, Input, Output, EventEmitter, ChangeDetectionStrategy, OnChanges, SimpleChange} from '@angular/core'
import {SampleModel} from "../../../business/SampleModel";
import {List} from 'immutable';

@Component({
    selector: 'Samplelist',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './Samplelist.html',
    styleUrls: ['./Samplelist.css']
})
export class Samplelist {

    private m_samples:List<SampleModel>;
    @Input()
    set samples(i_samples:List<SampleModel>){
        this.m_samples = i_samples;
    }

    @Output()
    selected:EventEmitter<any> = new EventEmitter<any>();

    protected  onSelectedSample(sample:SampleModel){
        this.selected.emit(sample.getBusinessId());
    }

}

