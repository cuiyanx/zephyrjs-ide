import { Component, Input, OnChanges, SimpleChange } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';

import { OcfResource } from './ocf-explorer.resource.component';


@Component({
    moduleId: module.id,
    selector: 'sd-ocf-resource-rgbled',
    templateUrl: 'ocf-explorer.resource.value.rgbled.component.html',
    styleUrls: ['ocf-explorer.resource.value.rgbled.component.css']
})
export class OcfResourceValueRgbLedComponent implements OnChanges {
    @Input('resource') resource: OcfResource;

    public style: SafeStyle;

    public constructor(private sanitizer: DomSanitizer) {
    }

    public ngOnChanges(changes: {[propName: string]: SimpleChange}): void {
        let val = this.resource.properties.rgbValue;
        this.style = this.sanitizer.bypassSecurityTrustStyle(
                'background:rgb(' + val[0] + ',' + val[1] + ',' + val[2] + ')');
    }
}
