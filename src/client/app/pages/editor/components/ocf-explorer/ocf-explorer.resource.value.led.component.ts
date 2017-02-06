import { Component, Input } from '@angular/core';

import { OcfResource } from './ocf-explorer.resource.component';


@Component({
    moduleId: module.id,
    selector: 'sd-ocf-resource-led',
    templateUrl: 'ocf-explorer.resource.value.led.component.html',
    styleUrls: ['ocf-explorer.resource.value.led.component.css']
})
export class OcfResourceValueLedComponent {
    @Input('resource') resource: OcfResource;
}
