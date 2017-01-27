// Core modules
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// This module
import { ConsoleComponent } from './console.component';


@NgModule({
    imports: [CommonModule],
    declarations: [ConsoleComponent],
    exports: [ConsoleComponent]
})
export class ConsoleModule { }
