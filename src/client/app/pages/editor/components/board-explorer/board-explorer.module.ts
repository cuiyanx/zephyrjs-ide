// Core modules
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// This module
import { BoardExplorerComponent } from './board-explorer.component';


@NgModule({
    imports: [CommonModule],
    declarations: [BoardExplorerComponent],
    exports: [BoardExplorerComponent]
})
export class BoardExplorerModule { }
