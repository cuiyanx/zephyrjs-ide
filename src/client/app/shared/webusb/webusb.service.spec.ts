import { ReflectiveInjector } from '@angular/core';
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

    // TODO: tests

  });
}
