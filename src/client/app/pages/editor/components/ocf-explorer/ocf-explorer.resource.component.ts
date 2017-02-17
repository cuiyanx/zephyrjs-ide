import { Component, Input, OnInit } from '@angular/core';

import { OcfApiService, IOcfResourceApi } from './ocf-explorer.api.services';


export interface IOcfResource extends IOcfResourceApi {
    properties?: any;
    error?: string;
    isGettingProperties?: boolean;
}

export class OcfResource implements IOcfResource {
    public di: string = null;
    public path:  string = null;
    public rt: string = null;
    public properties: any = null;
    public error: string = null;
    public isGettingProperties: boolean = false;

    public constructor(di: string, path: string, rt: string) {
        this.di = di;
        this.path = path;
        this.rt = rt;
    }

    public equals(other: OcfResource): boolean {
        return (
            this.di === other.di &&
            this.path === other.path &&
            this.rt === other.rt
        );
    }
}


@Component({
    moduleId: module.id,
    selector: 'sd-ocf-resource',
    templateUrl: 'ocf-explorer.resource.component.html',
    styleUrls: ['ocf-explorer.resource.component.css']
})
export class OcfResourceComponent implements OnInit {
    @Input('resource') public resource: OcfResource;

    public resourcesWithNativeComponent: string[] = [
        'oic.r.fan',
        'oic.r.illuminance',
        'oic.r.led',
        'oic.r.colour.rgb',
        'oic.r.temperature'
    ];

    public constructor(private ocfApiService: OcfApiService) {
    }

    public ngOnInit() {
        this.resource.properties = null;
        this.resource.error = null;
        this.resource.isGettingProperties = false;

        this.getProperties();
    }

    // tslint:disable-next-line:no-unused-variable
    public hasNativeComponent(resource: OcfResource): boolean {
        return this.resourcesWithNativeComponent.indexOf(resource.rt) !== -1;
    }

    // tslint:disable-next-line:no-unused-variable
    public getProperties() {
        this.resource.properties = null;
        this.resource.error = null;
        this.resource.isGettingProperties = true;

        let request = this.ocfApiService.getResource(this.resource);
        let timeout = setTimeout(() => {
            request.$abortRequest();
            this.resource.error = 'TIMEOUT';
            this.resource.isGettingProperties = false;
        }, 5000);

        request.$observable.subscribe((response: any) => {
            clearTimeout(timeout);
            this.resource.properties = response;
            this.resource.error = null;
            this.resource.isGettingProperties = false;
        });
    }

    // tslint:disable-next-line:no-unused-variable
    public onRetryClicked() {
        this.getProperties();
        return false;
    }
}
