// Core modules
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// 3rd party modules
import { Angular2FontawesomeModule } from 'angular2-fontawesome/angular2-fontawesome';

// Own modules
import { GitHubModule } from '../github/github.module';

// This module
import { MonacoComponent } from './monaco.component';


@NgModule({
    imports: [CommonModule, Angular2FontawesomeModule, GitHubModule],
    declarations: [MonacoComponent],
    exports: [MonacoComponent]
})

export class MonacoModule { }
