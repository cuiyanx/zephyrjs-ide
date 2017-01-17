import { Injectable } from '@angular/core';
import { WebUsbPort } from './webusbport';

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

    public requestPort(): Promise<WebUsbPort> {
        return new Promise<WebUsbPort>((resolve, reject) => {
            const filters = [{
                'vendorId': 0x8086,
                'productId': 0xF8A1
            }];

            console.log(this.usb);
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
            port.onReceive = data => {
                // tslint:disable-next-line:no-empty
            };

            port.onReceiveError = error => {
                console.error(error);
            };
        });
    }
}
