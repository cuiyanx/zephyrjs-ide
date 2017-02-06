import { Component, Input, OnInit } from '@angular/core';

import { IOcfResource } from './ocf-explorer.api.services';

import { OcfApiService } from './ocf-explorer.api.services';


export interface OcfResource extends IOcfResource {
    properties?: any;
    error?: string;
};


@Component({
    moduleId: module.id,
    selector: 'sd-ocf-resource',
    templateUrl: 'ocf-explorer.resource.component.html',
    styleUrls: ['ocf-explorer.resource.component.css']
})
export class OcfResourceComponent implements OnInit {
    @Input('resource') resource: OcfResource;

    public constructor(private ocfApiService: OcfApiService) {
    }

    public ngOnInit() {
        this.getProperties();
    }

    // tslint:disable-next-line:no-unused-variable
    public getProperties() {
        this.resource.properties = null;
        this.resource.error = null;

        let request = this.ocfApiService.getResource(this.resource);
        let timeout = setTimeout(() => {
            request.$abortRequest();
            this.resource.error = 'TIMEOUT';
        }, 5000);

        request.$observable.subscribe((response: any) => {
            clearTimeout(timeout);
            this.resource.properties = response.properties;
            this.resource.error = null;
        });
    }

    // tslint:disable-next-line:no-unused-variable
    public onRetryClicked() {
        this.getProperties();
        return false;
    }
}
