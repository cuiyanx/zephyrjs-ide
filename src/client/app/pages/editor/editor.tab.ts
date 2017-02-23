import { WebUsbPort } from '../../shared/webusb/webusb.port';

export enum OPERATION_STATUS {
    NOT_STARTED,
    STARTING,
    IN_PROGRESS,
    DONE,
    ERROR
};

export enum EDITOR_STATUS {
    READY,
    CONNECTING,
    UPLOADING
};


export interface EditorTab {
    id: number;
    active: boolean;
    title: string;
    editor: any;
    port: WebUsbPort;
    term: any;
    connectionStatus?: OPERATION_STATUS;
    uploadStatus?: OPERATION_STATUS;
    editorStatus?: EDITOR_STATUS;
};
