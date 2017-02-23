import { Component, Input } from '@angular/core';

import { EditorTab, EDITOR_STATUS } from '../../editor.tab';


interface IData {
    cls: string;
    msg: string;
};


@Component({
    moduleId: module.id,
    selector: 'sd-statusbar',
    templateUrl: 'statusbar.component.html',
    styleUrls: ['statusbar.component.css']
})
export class StatusBarComponent {
    @Input('tab') tab: EditorTab;

    // tslint:disable-next-line:no-unused-locals
    public getClass(): string {
        return this.getData().cls;
    }

    // tslint:disable-next-line:no-unused-locals
    public getMessage(): string {
        return this.getData().msg;
    }

    private getData(): IData {
        if (this.tab !== null) {
            let map: {[key: number]: IData;} = {
                [EDITOR_STATUS.READY]: {
                    cls: 'info',
                    msg: 'Ready.'
                },

                [EDITOR_STATUS.CONNECTING]: {
                    cls: 'info',
                    msg: 'Connecting...'
                },

                [EDITOR_STATUS.UPLOADING]: {
                    cls: 'info',
                    msg: 'Uploading...'
                }
            };

            if (this.tab.editorStatus in map)
                return map[this.tab.editorStatus];
        }

        return {
            cls: 'error',
            msg: 'Unknown status.'
        };
    }
}
