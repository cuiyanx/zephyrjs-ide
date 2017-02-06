import { Component, Input } from '@angular/core';

import { OcfResource } from './ocf-explorer.resource.component';


@Component({
    moduleId: module.id,
    selector: 'sd-ocf-resource-illuminance',
    templateUrl: 'ocf-explorer.resource.value.illuminance.component.html',
    styleUrls: ['ocf-explorer.resource.value.illuminance.component.css']
})
export class OcfResourceValueIlluminanceComponent {
    @Input('resource') resource: OcfResource;
}
