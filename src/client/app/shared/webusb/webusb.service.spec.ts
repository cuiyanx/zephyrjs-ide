import { ReflectiveInjector } from '@angular/core';
import { async } from '@angular/core/testing';
import { Observable } from 'rxjs/Observable';

import { WebUsbService } from './webusb.service';


export function main() {
  describe('WebUsb Service', () => {
    let webusbService: WebUsbService;

    beforeEach(() => {
      let injector = ReflectiveInjector.resolveAndCreate([
        WebUsbService,
      ]);
      webusbService = injector.get(WebUsbService);
    });

    it('requestPort should work', done => {
        expect(webusbService.requestPort).toBeDefined();

        // Expect requestPort to fail because obviously navigator.usb is
        // missing when testing. TODO: mock it.
        webusbService.requestPort().catch(() => {
            done();
        });
    });

    it('connect should work', () => {
        expect(webusbService.connect).toBeDefined();
    });

    it('send should work', () => {
        expect(webusbService.send).toBeDefined();
    });

    it('callbacks should be defined', () => {
        expect(webusbService.onReceive).toBeDefined();
        expect(webusbService.onReceiveError).toBeDefined();
    });
  });
}
