// Core
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';

// Own
import { OcfApiService } from './ocf-explorer.api.services';
import { OcfResource } from './ocf-explorer.resource.component';


declare var $: any;


@Component({
    moduleId: module.id,
    selector: 'sd-ocf-resource-fan',
    templateUrl: 'ocf-explorer.resource.value.fan.component.html',
    styleUrls: ['ocf-explorer.resource.value.fan.component.css']
})
export class OcfResourceValueFanComponent implements OnInit {
    @Input('resource') resource: OcfResource;
    @ViewChild('toggle') toggle: ElementRef;

    public constructor(private ocfApiService: OcfApiService) {
    }

    public ngOnInit() {
        let self: OcfResourceValueFanComponent = this;

        this.toggle.nativeElement.checked = this.resource.properties.value;

        $(this.toggle.nativeElement).bootstrapToggle();
        $(this.toggle.nativeElement).change(function() {
            let value: boolean = $(this).prop('checked');
            self.resource.properties.value = value;
            self.ocfApiService.updateResource({
                path: self.resource.path,
                di: self.resource.di,
                value: self.resource.properties.value
            });
        });
    }
}
