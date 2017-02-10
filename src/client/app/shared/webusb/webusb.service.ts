import { Injectable } from '@angular/core';
import { WebUsbPort } from './webusb.port';

/**
 * This class provides the WebUsb service.
 */
@Injectable()
export class WebUsbService {
    public usb: any;

    constructor() {
        this.usb = (navigator as any).usb;

        if(this.usb === undefined) {
            console.error('WebUSB not available');
        }
    }

    public onReceive(data: string) {
        // tslint:disable-next-line:no-empty
    }

    public onReceiveError(error: string) {
        // tslint:disable-next-line:no-empty
    }

    public requestPort(): Promise<WebUsbPort> {
        return new Promise<WebUsbPort>((resolve, reject) => {
            const filters = [{
                'vendorId': 0x8086,
                'productId': 0xF8A1
            }];

            if (this.usb === undefined) {
                reject('WebUSB not available');
            }

            this.usb.requestDevice({'filters': filters})
            .then((device: any) => {
                resolve(new WebUsbPort(device));
            })
            .catch((error: string) => {
                reject(error);
            });
        });
    }

    public connect(port: WebUsbPort) {
        return port.connect().then(() => {
            port.onReceive = (data: string) => {
                this.onReceive(data);
            };

            port.onReceiveError = (error: string) => {
                this.onReceiveError(error);
            };
        });
    }

    public send(port: WebUsbPort, data: string) {
        return port.send(data);
    }
}
