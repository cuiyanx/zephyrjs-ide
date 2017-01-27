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


@Component({
  moduleId: module.id,
  selector: 'sd-editor',
  templateUrl: 'editor.component.html',
  styleUrls: ['editor.component.css'],
  providers: [ModalDirective]
})
export class EditorComponent implements OnInit, AfterViewInit, OnDestroy {
    public lastMessage: EditorModalMessage = {
        header: '',
        body: ''
    };

    private readonly MAX_TABS: number = 10;

    private webusbService: WebUsbService = undefined;

    // Childen

    @ViewChild('tabMenu')
    private tabMenu: ElementRef;

    @ViewChild('warningModal')
    private warningModal: ModalDirective;

    @ViewChild('errorModal')
    private errorModal: ModalDirective;

    // Variables

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

    private initEditorResizeHandle(id: number) {
        interface IElements {
            tab: HTMLElement;
            editorContainer: HTMLElement;
            resizeHandle: HTMLElement;
            console: HTMLElement;
            consoleHeader: HTMLElement;
            statusBar: HTMLElement;
            footer: HTMLElement;
        };

        // TODO: use ViewChild where possible
        let elems: IElements = {
            tab: document.getElementById('tab-' + id),
            editorContainer: document.getElementById('monaco-container-' + id).parentElement,
            resizeHandle: document.getElementById('editor-resize-handle-' + id),
            console: document.getElementById('console-container-' + id).parentElement,
            consoleHeader: document.getElementById('console-header-' + id),
            statusBar: document.getElementById('statusbar-' + id),
            footer: document.getElementById('footer')
        };

        if (elems.tab === null ||
            elems.editorContainer === null ||
            elems.resizeHandle === null ||
            elems.console=== null ||
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

                elems.console.style.height = (
                    elems.tab.clientHeight -
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
            this.initEditorResizeHandle(tab.id);
        }, 0);

        return tab;
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
