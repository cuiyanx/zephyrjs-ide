import { Component, Input } from '@angular/core';

import { IOcfResource } from './ocf-explorer.api.services';


export interface OcfResource extends IOcfResource {
    properties?: any;
};


@Component({
    moduleId: module.id,
    selector: 'sd-ocf-resource',
    templateUrl: 'ocf-explorer.resource.component.html',
    styleUrls: ['ocf-explorer.resource.component.css']
})
export class OcfResourceComponent {
    @Input('resource') resource: OcfResource;
}
