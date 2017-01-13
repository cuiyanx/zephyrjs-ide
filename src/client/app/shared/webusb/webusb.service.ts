import { Injectable } from '@angular/core';
import { WebUsbPort } from './webusbport';

/**
 * This class provides the WebUsb service.
 */
@Injectable()
export class WebUsbService {
    usb: any;
    ports: WebUsbPort[] = [];

    constructor() {
        this.usb = (navigator as any).usb;

        if(this.usb === undefined) {
            console.error('WebUSB not available');
        }
    }

    getPorts(): Promise<WebUsbPort[]> {
        return new Promise<WebUsbPort[]>(resolve => {
            this.usb.getDevices().then((devices: any[]) => {
                this.ports = devices.map((device: any) => new WebUsbPort(device));
                resolve(this.ports);
            });
        });
    }

    connect(port: WebUsbPort) {
        return port.connect().then(() => {
            port.onReceive = data => {
                // tslint:disable-next-line:no-empty
            };

            port.onReceiveError = error => {
                console.error(error);
            };
        });
    }
}
