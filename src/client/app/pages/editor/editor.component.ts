// Core
import {
    AfterViewInit,
    Component,
    ElementRef,
    QueryList,
    OnInit,
    ViewChild,
    ViewChildren
} from '@angular/core';

// 3rd party
import { ModalDirective } from 'ng2-bootstrap/components/modal/modal.component';

// Own
import { GitHubModalComponent } from '../github/github.modal.component';
import { WebUsbService } from '../shared/webusb/webusb.service';
import { WebUsbPort } from '../shared/webusb/webusbport';

enum STATUS {
    NOT_STARTED,
    STARTING,
    IN_PROGRESS,
    DONE,
    ERROR
};

enum EDITOR_STATUS {
    WEBUSB_UNAVAILABLE,
    READY,
    CONNECTING,
    UPLOADING
};

interface EditorTab {
    id: number;
    active: boolean;
    title: string;
    editor: any;
    port: WebUsbPort;
    term: any;
    connectionStatus?: STATUS;
    uploadStatus?: STATUS;
    editorStatus?: EDITOR_STATUS;
};

interface ErrorMessage {
    header: string;
    content: string;
};

declare const monaco: any;
declare const require: any;


@Component({
  moduleId: module.id,
  selector: 'sd-editor',
  templateUrl: 'editor.component.html',
  styleUrls: ['editor.component.css'],
  providers: [WebUsbService, ModalDirective]
})
export class EditorComponent implements OnInit, AfterViewInit {
    public lastMessage: ErrorMessage = {
        header: '',
        content: ''
    };

    private readonly MAX_TABS: number = 10;

    // Childen

    @ViewChildren('editor')
    private editorViews: QueryList<ElementRef>;

    @ViewChild('tabMenu')
    private tabMenu: ElementRef;

    @ViewChild('warningModal')
    private warningModal: ModalDirective;

    @ViewChild('errorModal')
    private errorModal: ModalDirective;

    @ViewChild('gitHubModal')
    private gitHubModal: GitHubModalComponent;

    // Variables

    private webusbService: WebUsbService = undefined;
    private hterm: any = undefined;

    private initialCode: string = [
        'var gpio = require("gpio");',
        'var pins = require("arduino101_pins");',
        '',
        'var pin = gpio.open({',
        '   pin: pins.LED2,',
        '   direction: "out"',
        '});',
        '',
        'var toggle = false;',
        'var handle = setInterval(function () {',
        '    toggle = !toggle;',
        '    pin.write(toggle);',
        '}, 1000);'].join('\n');

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

    public ngAfterViewInit() {
        var onGotAmdLoader = () => {
            // Load monaco
            (<any>window).require.config({ paths: { 'vs': 'node_modules/monaco-editor/min/vs' } });
            (<any>window).require(['vs/editor/editor.main'], () => {
                this.initMonaco(1);
            });
        };

        // Load AMD loader if necessary
        if (!(<any>window).require) {
            var loaderScript = document.createElement('script');
            loaderScript.type = 'text/javascript';
            loaderScript.src = 'node_modules/monaco-editor/min/vs/loader.js';
            loaderScript.addEventListener('load', onGotAmdLoader);
            document.body.appendChild(loaderScript);
        } else {
            onGotAmdLoader();
        }

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

    // Will be called once monaco library is available
    private initMonaco(id: number) {
        let tab = this.getTabById(id);
        if (tab !== null && tab.editor === null) {
            let elem = this.getEditorViewById(id);
            if (elem !== null) {
                let theme = 'vs-dark';

                if (monaco.editor.defineTheme !== undefined) {
                    monaco.editor.defineTheme('zephyrjs-ide', {
                        base: theme,
                        inherit: true,
                        rules: []
                    });

                    theme = 'zephyrjs-ide';
                }

                tab.editor = monaco.editor.create(elem.nativeElement, {
                    value: this.initialCode,
                    language: 'javascript',
                    automaticLayout: true,
                    theme: theme
                });
            }
        }
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

    private getEditorViewById(id: number): ElementRef {
        return this.editorViews.toArray().find((view: ElementRef) => {
            if (parseInt(view.nativeElement.id.split('-')[1]) === id) {
                return true;
            }
            return false;
        });
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

    private getActiveTab(): EditorTab {
        for (let tab of this.tabs) {
            if (tab.active) {
                return tab;
            }
        }
        return null;
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

        tab.connectionStatus = STATUS.NOT_STARTED;
        tab.uploadStatus = STATUS.NOT_STARTED;
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
            this.initMonaco(tab.id);
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
    private mayConnect(id: number): boolean {
        let tab = this.getTabById(id);

        return this.webusbService.usb !== undefined &&
               tab.connectionStatus === STATUS.NOT_STARTED ||
               tab.connectionStatus === STATUS.ERROR;
    }

    // tslint:disable-next-line:no-unused-variable
    private onConnect(id?: number) {
        let tab: EditorTab;

        if (id !== undefined) {
            tab = this.getTabById(id);
        } else {
            tab = this.getActiveTab();
        }

        tab.connectionStatus = STATUS.IN_PROGRESS;
        tab.editorStatus = EDITOR_STATUS.CONNECTING;

        let doConnect = () => {
            this.webusbService.onReceive = (data: string) => {
                tab.term.io.print(data);
            };

            this.webusbService.onReceiveError = (error: string) => {
                console.error(error);
            };

            this.webusbService.connect(tab.port)
            .then(() => {
                tab.connectionStatus = STATUS.DONE;
                tab.editorStatus = EDITOR_STATUS.READY;
            })
            .catch((error: string) => {
                tab.connectionStatus = STATUS.ERROR;
                this.lastMessage = {
                    header: 'Unable to connect to the device',
                    content: error
                };
                this.errorModal.show();
            });
        };

        if (tab.port !== null) {
            doConnect();
        } else {
            this.webusbService.requestPort()
            .then((port: WebUsbPort) => {
                tab.port = port;
                doConnect();
            })
            .catch((error: string) => {
                tab.connectionStatus = STATUS.NOT_STARTED;
                this.lastMessage = {
                    header: 'Unable to connect to the device',
                    content: error
                };
                this.errorModal.show();
            });
        }
    }

    // tslint:disable-next-line:no-unused-variable
    private mayUpload(id: number): boolean {
        let tab = this.getTabById(id);

        return this.webusbService.usb !== undefined &&
               tab.connectionStatus === STATUS.DONE &&
               tab.editor.getValue().length > 0 &&
               tab.uploadStatus !== STATUS.IN_PROGRESS &&
               tab.port !== null;
    }

    // tslint:disable-next-line:no-unused-variable
    private onUpload(id: number) {
        let tab = this.getTabById(id);

        tab.uploadStatus = STATUS.IN_PROGRESS;
        tab.editorStatus = EDITOR_STATUS.UPLOADING;

        tab.port.run(tab.editor.getValue())
        .then((warning: string) => {
            tab.uploadStatus = STATUS.DONE;
            tab.editorStatus = EDITOR_STATUS.READY;

            if (warning !== undefined) {
                this.lastMessage = {
                    header: 'There were problems uploading your file',
                    content: warning
                };
                this.warningModal.show();
            }
        })
        .catch((error: string) => {
            tab.connectionStatus = STATUS.NOT_STARTED;
            tab.uploadStatus = STATUS.NOT_STARTED;
            tab.editorStatus = EDITOR_STATUS.READY;
            this.lastMessage = {
                header: 'Unable to upload file',
                content: error
            };
            this.errorModal.show();
        });
    }

    // tslint:disable-next-line:no-unused-variable
    private onDeviceChooserHide(id: number) {
        let tab = this.getActiveTab();
        tab.connectionStatus = STATUS.NOT_STARTED;
        tab.editorStatus = EDITOR_STATUS.READY;
    }

    // tslint:disable-next-line:no-unused-variable
    private selectPort(port: WebUsbPort) {
        let tab = this.getActiveTab();
        tab.port = port;
    }

    // tslint:disable-next-line:no-unused-variable
    private onFetchFromGitHub(id: number) {
        this.gitHubModal.show();
    }

    // tslint:disable-next-line:no-unused-variable
    private onGitHubFileFetched(content: string) {
        let tab = this.getActiveTab();
        tab.editor.setValue(content);
    }
}
