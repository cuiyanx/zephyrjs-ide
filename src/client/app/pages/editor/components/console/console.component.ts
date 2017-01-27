import {
    AfterViewInit,
    Component,
    ElementRef,
    Input,
    ViewChild
} from '@angular/core';

import { EditorTab } from '../../editor.tab';
import { WebUsbService } from '../../../../shared/webusb/webusb.service';
import { WebUsbPort } from '../../../../shared/webusb/webusb.port';


declare const require: any;


@Component({
    moduleId: module.id,
    selector: 'sd-console',
    providers: [WebUsbService],
    templateUrl: 'console.component.html',
    styleUrls: ['console.component.css']
})
export class ConsoleComponent implements AfterViewInit {
    @Input('tab') tab: EditorTab;
    @ViewChild('console') private consoleView: ElementRef;

    private webusbService: WebUsbService = undefined;
    private hterm: any = undefined;


    constructor(webusbService: WebUsbService) {
        this.webusbService = webusbService;

        let htermUMDjs = require('hterm-umdjs/dist/index');
        this.hterm = htermUMDjs.hterm;
        this.hterm.defaultStorage = new htermUMDjs.lib.Storage.Memory();
    }

    public ngAfterViewInit()  {
        this.initTerminal();
    }

    private initTerminal() {
        if (this.tab !== null && this.tab.term === null) {
            this.tab.term = new this.hterm.Terminal();

            this.tab.term.onTerminalReady = () => {
                let io = this.tab.term.io.push();

                let send = (port: WebUsbPort, str: string) => {
                    if (this.tab.port !== null) {
                        this.webusbService.send(this.tab.port, str)
                        .catch((error: string) => {
                            io.println('Send error: ' + error);
                        });
                    } else {
                        io.println('Not connected to a device yet');
                    }
                };

                io.onVTKeystroke = (str: string) => {
                    send(this.tab.port, str);
                };

                io.sendString = (str: string) => {
                    send(this.tab.port, str);
                };
            };

            // TODO: replace these colors at build time, so they are always
            // in sync with src/client/scss/colors.scss.
            this.tab.term.prefs_.set('background-color', '#22252e');
            this.tab.term.prefs_.set('foreground-color', '#d9d9d9');
            this.tab.term.prefs_.set('cursor-color', 'rgba(100, 100, 10, 0.5)');
            this.tab.term.prefs_.set('font-size', 13);
            this.tab.term.prefs_.set('cursor-blink', true);

            this.tab.term.decorate(this.consoleView.nativeElement);
            this.tab.term.installKeyboard();
        }
    }
}
