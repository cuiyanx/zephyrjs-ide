import { Component, Input } from '@angular/core';

import { OcfResource } from './ocf-explorer.resource.component';


@Component({
    moduleId: module.id,
    selector: 'sd-ocf-resource-temperature',
    templateUrl: 'ocf-explorer.resource.value.temperature.component.html',
    styleUrls: ['ocf-explorer.resource.value.temperature.component.css']
})
export class OcfResourceValueTemperatureComponent {
    @Input('resource') resource: OcfResource;
}
