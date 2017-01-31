// Core modules
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// This module
import { OcfExplorerComponent } from './ocf-explorer.component';


@NgModule({
    imports: [CommonModule],
    declarations: [OcfExplorerComponent],
    exports: [OcfExplorerComponent]
})
export class OcfExplorerModule { }
