// Core modules
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';

// 3rd party modules
import { Angular2FontawesomeModule } from 'angular2-fontawesome/angular2-fontawesome';

// This module
import { OcfExplorerComponent } from './ocf-explorer.component';


@NgModule({
    imports: [CommonModule, FormsModule, Angular2FontawesomeModule],
    declarations: [OcfExplorerComponent],
    exports: [OcfExplorerComponent]
})
export class OcfExplorerModule { }
