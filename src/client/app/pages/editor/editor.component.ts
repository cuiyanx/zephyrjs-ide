// Core
import {
    AfterViewInit,
    Component,
    ElementRef,
    OnInit,
    OnDestroy,
    ViewChild
} from '@angular/core';

// 3rd party
import { ModalDirective } from 'ng2-bootstrap/components/modal/modal.component';

// Own
import { EditorTab, OPERATION_STATUS, EDITOR_STATUS } from './editor.tab';
import { EditorModalMessage } from './editor.modal.message';
import { WebUsbService } from '../../shared/webusb/webusb.service';
import { WebUsbPort } from '../../shared/webusb/webusbport';


declare const require: any;


@Component({
  moduleId: module.id,
  selector: 'sd-editor',
  templateUrl: 'editor.component.html',
  styleUrls: ['editor.component.css'],
  providers: [WebUsbService, ModalDirective]
})
export class EditorComponent implements OnInit, AfterViewInit, OnDestroy {
    public lastMessage: EditorModalMessage = {
        header: '',
        body: ''
    };

    private readonly MAX_TABS: number = 10;

    // Childen

    @ViewChild('tabMenu')
    private tabMenu: ElementRef;

    @ViewChild('warningModal')
    private warningModal: ModalDirective;

    @ViewChild('errorModal')
    private errorModal: ModalDirective;

    // Variables

    private webusbService: WebUsbService = undefined;
    private hterm: any = undefined;

    private tabs: Array<EditorTab> = [{
        id: 1,
        active: true,
        title: 'Sketch # 1',
        editor: null,
        port: null,
        term: null
    }];

    // Methods

    constructor(webusbService: WebUsbService) {
        this.webusbService = webusbService;

        let htermUMDjs = require('hterm-umdjs/dist/index');
        this.hterm = htermUMDjs.hterm;
        this.hterm.defaultStorage = new htermUMDjs.lib.Storage.Memory();
    }

    public ngOnInit() {
        // tsling:disable-next-line:no-empty
    }

    public ngOnDestroy() {
        window.onresize = null;
    }

    public ngAfterViewInit() {
        setTimeout(() => {
            this.setDefaultTabStatuses(1);
            this.computeTabMenuWidth();
            this.initTerminal(1);
            this.initEditorResizeHandle(1);
            this.initDocsResizeHandle();
        }, 0);

        window.onresize = () => {
            let editorPane = document.getElementById('editor-pane');
            let docsPane = document.getElementById('documentation-pane');
            let editors = document.getElementsByClassName('monaco-container');
            let consoles = document.getElementsByClassName('console-container');

            editorPane.style.width = '';
            docsPane.style.width = '';

            for (let i = 0; i < editors.length; i++) {
                (editors[i] as HTMLElement).style.height = '';
            }

            for (let i = 0; i < consoles.length; i++ ) {
                (consoles[i] as HTMLElement).style.height = '';
            }

            this.computeTabMenuWidth();
        };
    }

    private computeTabMenuWidth() {
        let editorPane = document.getElementById('editor-pane');
        let newButton = document.getElementById('new-tab-button');

        let width = editorPane.clientWidth - 10;

        if (newButton !== null) {
            width -= newButton.clientWidth;
        }

        this.tabMenu.nativeElement.style.width = width + 'px';
    }

    private initTerminal(id: number) {
        let tab = this.getTabById(id);

        if (tab !== null && tab.term === null) {
            tab.term = new this.hterm.Terminal();

            tab.term.onTerminalReady = () => {
                let io = tab.term.io.push();

                let send = (port: WebUsbPort, str: string) => {
                    if (tab.port !== null) {
                        this.webusbService.send(tab.port, str)
                        .catch((error: string) => {
                            io.println('Send error: ' + error);
                        });
                    } else {
                        io.println('Not connected to a device yet');
                    }
                };

                io.onVTKeystroke = (str: string) => {
                    send(tab.port, str);
                };

                io.sendString = (str: string) => {
                    send(tab.port, str);
                };
            };

            // TODO: replace these colors at build time, so they are always
            // in sync with src/client/scss/colors.scss.
            tab.term.prefs_.set('background-color', '#22252e');
            tab.term.prefs_.set('foreground-color', '#d9d9d9');
            tab.term.prefs_.set('cursor-color', 'rgba(100, 100, 10, 0.5)');
            tab.term.prefs_.set('font-size', 13);
            tab.term.prefs_.set('cursor-blink', true);

            tab.term.decorate(document.getElementById('console-' + id));
            tab.term.installKeyboard();
        }
    }

    private initEditorResizeHandle(id: number) {
        interface IElements {
            editorContainer: HTMLElement;
            resizeHandle: HTMLElement;
            consoleContainer: HTMLElement;
            consoleHeader: HTMLElement;
            statusBar: HTMLElement;
            footer: HTMLElement;
        };

        let elems: IElements = {
            editorContainer: document.getElementById('monaco-container-' + id),
            resizeHandle: document.getElementById('editor-resize-handle-' + id),
            consoleContainer: document.getElementById('console-container-' + id),
            consoleHeader: document.getElementById('console-header-' + id),
            statusBar: document.getElementById('statusbar-' + id),
            footer: document.getElementById('footer')
        };

        if (elems.editorContainer === null ||
            elems.resizeHandle === null ||
            elems.consoleContainer === null ||
            elems.consoleHeader === null ||
            elems.statusBar === null ||
            elems.footer === null) {
            return;
        }

        let doEditorResize = (ev: any) => {
            // The resizing should not happen over this limit so that the
            // status bar is not pushed out of the way.
            let overflowLimit =
                elems.consoleHeader.clientHeight +
                elems.statusBar.clientHeight +
                elems.footer.clientHeight;

            if (window.innerHeight - ev.clientY > overflowLimit) {
                elems.editorContainer.style.height = (
                    ev.clientY -
                    elems.editorContainer.offsetTop -
                    elems.footer.clientHeight) + 'px';

                elems.consoleContainer.style.height = (
                    elems.consoleContainer.parentElement.clientHeight -
                    elems.editorContainer.clientHeight -
                    elems.resizeHandle.clientHeight -
                    elems.statusBar.clientHeight) + 'px';
            }
            ev.preventDefault();
        };

        let stopEditorResize = () => {
            window.removeEventListener('mousemove', doEditorResize, false);
            window.removeEventListener('mouseup', stopEditorResize, false);
        };

        let startEditorResize = () => {
            window.addEventListener('mousemove', doEditorResize, false);
            window.addEventListener('mouseup', stopEditorResize, false);
        };

        elems.resizeHandle.addEventListener('mousedown', startEditorResize, false);
    }

    private initDocsResizeHandle() {
        let docsHandleEl = document.getElementById('documentation-resize-handle');
        let editorEl = document.getElementById('editor-pane');
        let docsEl = document.getElementById('documentation-pane');

        let doDocsResize = (ev: any) => {
            if (window.innerWidth - ev.clientX > 30) {
                editorEl.style.width = (ev.clientX + editorEl.offsetLeft) + 'px';
                docsEl.style.width = (docsEl.parentElement.offsetWidth - editorEl.offsetWidth - 45) + 'px';
                this.computeTabMenuWidth();
            }
            ev.preventDefault();
        };

        let stopDocsResize = () => {
            window.removeEventListener('mousemove', doDocsResize, false);
            window.removeEventListener('mouseup', stopDocsResize, false);
        };

        let startDocsResize = () => {
            window.addEventListener('mousemove', doDocsResize, false);
            window.addEventListener('mouseup', stopDocsResize, false);
        };

       docsHandleEl.addEventListener('mousedown', startDocsResize, false);
    }

    private getTabById(id: number): EditorTab {
        for (let tab of this.tabs) {
            if (tab.id === id) {
                return tab;
            }
        }
        return null;
    }

    private getFirstAvailableTabId(): number {
        let max = 1;
        for (let tab of this.tabs) {
            if (tab.id > max) {
                max = tab.id;
            }
        }
        return max + 1;
    }

    // tslint:disable-next-line:no-unused-variable
    private onCloseTab(id: number) {
        let tab = this.getTabById(id);
        let index = this.tabs.indexOf(tab);
        this.tabs.splice(index, 1);
        this.tabs[this.tabs.length - 1].active = true;

        if (this.tabs.length === this.MAX_TABS - 1) {
            this.computeTabMenuWidth();
        }
    }

    private setDefaultTabStatuses(id: number) {
        let tab = this.getTabById(id);

        tab.connectionStatus = OPERATION_STATUS.NOT_STARTED;
        tab.uploadStatus = OPERATION_STATUS.NOT_STARTED;
        if (this.webusbService.usb !== undefined) {
            tab.editorStatus = EDITOR_STATUS.READY;
        } else {
            tab.editorStatus = EDITOR_STATUS.WEBUSB_UNAVAILABLE;
        }
    }

    // tslint:disable-next-line:no-unused-variable
    private mayAddTab(): boolean {
        return this.tabs.length < this.MAX_TABS;
    }

    // tslint:disable-next-line:no-unused-variable
    private newTab(): EditorTab {
        let id = this.getFirstAvailableTabId();
        let tab: EditorTab = {
            id: id,
            active: true,
            title: 'Sketch # ' + id,
            editor: null,
            port: null,
            term: null
        };

        for (let other of this.tabs) {
            other.active = false;
        }

        this.tabs.push(tab);

        if (this.tabs.length === this.MAX_TABS) {
            this.computeTabMenuWidth();
        }

        setTimeout(() => {
            this.setDefaultTabStatuses(tab.id);
            this.initTerminal(tab.id);
            this.initEditorResizeHandle(tab.id);
        }, 0);

        return tab;
    }

    // tslint:disable-next-line:no-unused-variable
    private getEditorStatus(id: number): {} {
        let tab = this.getTabById(id);

        if (tab !== null) {
            let map: {[key:number]:{};} = {
                [EDITOR_STATUS.WEBUSB_UNAVAILABLE]: {
                    cls: 'error',
                    msg: 'Your browser does not support WebUSB.'
                },

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

            if (tab.editorStatus in map)
                return map[tab.editorStatus];
        }

        return {
            cls: 'error',
            msg: 'Unknown status.'
        };
    }

    // tslint:disable-next-line:no-unused-variable
    private onWarning(message: EditorModalMessage) {
        this.lastMessage = message;
        this.warningModal.show();
    }

    // tslint:disable-next-line:no-unused-variable
    private onError(message: EditorModalMessage) {
        this.lastMessage = message;
        this.errorModal.show();
    }
}
