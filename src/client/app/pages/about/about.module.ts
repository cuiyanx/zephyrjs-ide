// Core
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Third party
import { Angular2FontawesomeModule } from 'angular2-fontawesome/angular2-fontawesome';

// Own
import { AboutComponent } from './about.component';
import { SharedModule } from '../../shared/shared.module';


@NgModule({
    imports: [
        CommonModule,
        RouterModule,

        Angular2FontawesomeModule,

        SharedModule.forRoot()
    ],
    declarations: [AboutComponent],
    exports: [AboutComponent]
})
export class AboutModule { }
