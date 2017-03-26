import {
    Component,
    ChangeDetectionStrategy,
    Input,
    ChangeDetectorRef
} from "@angular/core";
import {Observable} from "rxjs";
import {Http} from "@angular/http";
import {Compbaser} from "../compbaser/Compbaser";

@Component({
    selector: 'ResourceViewer',
    template: `
        <small>{{me}}</small>
        <div *ngIf="!videoSource">
            <img class="img-responsive" [src]="imgSource"/>
        </div>
        <div *ngIf="videoSource">
            <h5>video</h5>
            <video class="img-responsive" autoplay>
                <source [src]="videoSource" type="video/mp4">
                Your browser does not support the video tag.
            </video>
        </div>
        `,
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class ResourceViewer extends Compbaser {
    constructor(private cd: ChangeDetectorRef, private _http: Http) {
        super();
    }

    private imgSource = '';
    private videoSource;

    @Input()
    set resource(i_loadResource: string) {
        this.onLoadResource(i_loadResource);
    }

    //todo: fix / investigate / dropbox
    private onLoadResource(i_loadResource: string) {

        // image
        var res = i_loadResource.match(/(?!.*[.](?:jpg|jpeg|png)$).*/ig);
        if (res[0].length <= 4) {
            this.videoSource = null;
            return this._http.get(i_loadResource)
                .catch((err) => {
                    return Observable.throw(err);
                })
                .finally(() => {
                }).switchMap((value: any) => {
                    var link = value.json();
                    this.cd.markForCheck();
                    this.imgSource = link.url;
                    return Observable.empty();
                }).subscribe();
        }

        // video
        var res = i_loadResource.match(/(?!.*[.](?:mp4)$).*/ig);
        if (res[0].length <= 4) {
            this.imgSource = '';
            return this._http.get(i_loadResource)
                .catch((err) => {
                    return Observable.throw(err);
                })
                .finally(() => {
                }).switchMap((value) => {
                    var link = value.json();
                    this.cd.markForCheck();
                    this.videoSource = link.url;
                    return Observable.empty();
                }).subscribe();
        }

        // dropbox / drive
        //todo: possible more testing on more file formats and test with google drive
        //this.videoSource = 'https://pluto.signage.me/Resources/business419212/resources/7.mp4';
        jQuery.get(i_loadResource, data => {
            this.imgSource = data.url;
        })
        return;
    }
}


// jQuery.get(i_loadResource, data => {
//     this.imgSource = data.url;
// })
// const url = `https://secure.digitalsignage.com/DropboxFileLink/${this.token}${i_path}`;
// f.link = `https://secure.digitalsignage.com/DropboxFileLink/${this.token}${i_path}`;