// Core modules
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// This module
import { StatusBarComponent } from './statusbar.component';


@NgModule({
    imports: [CommonModule],
    declarations: [StatusBarComponent],
    exports: [StatusBarComponent]
})
export class StatusBarModule { }
