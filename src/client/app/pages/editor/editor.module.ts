// Core modules
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

// Third-party modules
import { Angular2FontawesomeModule } from 'angular2-fontawesome/angular2-fontawesome';
import { SimpleNotificationsModule } from 'angular2-notifications';
import { SplitPaneModule } from 'ng2-split-pane/lib/ng2-split-pane';

// Own modules
import { MonacoModule } from './components/monaco/monaco.module';
import { ConsoleModule } from './components/console/console.module';
import { StatusBarModule } from './components/statusbar/statusbar.module';
import { BoardExplorerModule } from './components/board-explorer/board-explorer.module';
import { SharedModule } from '../../shared/shared.module';
import { OcfExplorerModule } from './components/ocf-explorer/ocf-explorer.module';

// This module
import { EditorComponent } from './editor.component';


@NgModule({
    imports: [
        CommonModule,
        FormsModule,

        Angular2FontawesomeModule,
        SimpleNotificationsModule,
        SplitPaneModule,

        MonacoModule,
        ConsoleModule,
        StatusBarModule,
        BoardExplorerModule,
        OcfExplorerModule,

        SharedModule.forRoot()
    ],
    declarations: [EditorComponent],
    exports: [EditorComponent]
})
export class EditorModule {}
