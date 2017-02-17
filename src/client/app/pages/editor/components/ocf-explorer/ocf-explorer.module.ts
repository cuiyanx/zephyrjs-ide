// Core modules
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';

// 3rd party modules
import { Angular2FontawesomeModule } from 'angular2-fontawesome/angular2-fontawesome';

// This module
import { OcfExplorerComponent } from './ocf-explorer.component';
import { OcfResourceComponent } from './ocf-explorer.resource.component';
import { OcfResourceValueFanComponent } from './ocf-explorer.resource.value.fan.component';
import { OcfResourceValueIlluminanceComponent } from './ocf-explorer.resource.value.illuminance.component';
import { OcfResourceValueLedComponent } from './ocf-explorer.resource.value.led.component';
import { OcfResourceValueRgbLedComponent } from './ocf-explorer.resource.value.rgbled.component';
import { OcfResourceValueTemperatureComponent } from './ocf-explorer.resource.value.temperature.component';
import { OcfResourceValueJsonComponent } from './ocf-explorer.resource.value.json.component';


@NgModule({
    imports: [CommonModule, FormsModule, Angular2FontawesomeModule],
    declarations: [
        OcfExplorerComponent,
        OcfResourceComponent,
        OcfResourceValueFanComponent,
        OcfResourceValueIlluminanceComponent,
        OcfResourceValueLedComponent,
        OcfResourceValueRgbLedComponent,
        OcfResourceValueTemperatureComponent,
        OcfResourceValueJsonComponent
    ],
    exports: [
        OcfExplorerComponent,
        OcfResourceComponent,
        OcfResourceValueFanComponent,
        OcfResourceValueIlluminanceComponent,
        OcfResourceValueLedComponent,
        OcfResourceValueRgbLedComponent,
        OcfResourceValueTemperatureComponent,
        OcfResourceValueJsonComponent,
    ]
})
export class OcfExplorerModule { }
