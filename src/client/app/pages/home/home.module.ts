import { NgModule } from '@angular/core';

// 3rd party modules
import { Angular2FontawesomeModule } from 'angular2-fontawesome/angular2-fontawesome';

import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { HomeComponent } from './home.component';

@NgModule({
  imports: [CommonModule, Angular2FontawesomeModule, SharedModule],
  declarations: [HomeComponent],
  exports: [HomeComponent]
})
export class HomeModule { }
