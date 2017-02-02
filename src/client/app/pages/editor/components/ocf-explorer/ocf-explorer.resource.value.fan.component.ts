import { Component, Input } from '@angular/core';

import { OcfResource } from './ocf-explorer.resource.component';


@Component({
    moduleId: module.id,
    selector: 'sd-ocf-resource-fan',
    templateUrl: 'ocf-explorer.resource.value.fan.component.html',
    styleUrls: ['ocf-explorer.resource.value.fan.component.css']
})
export class OcfResourceValueFanComponent {
    @Input('resource') resource: OcfResource;
}
