import { Component } from '@angular/core';

import { OcfApiService } from './ocf.api.services';


export interface OcfServer {
    ip: string;
    port: number;
};


@Component({
    moduleId: module.id,
    selector: 'sd-ocf-explorer',
    templateUrl: 'ocf-explorer.component.html',
    styleUrls: ['ocf-explorer.component.css']
})
export class OcfExplorerComponent {
    public server: OcfServer = {
        ip: '192.168.0.102',
        port: 8000
    };

    public constructor(private ocfApiService: OcfApiService) {
    }

    // tslint:disable-next-line:no-unused-variable
    public isValidIPAddress(): boolean {
        let ip = this.server.ip;
        return /^(?!0)(?!.*\.$)((1?\d?\d|25[0-5]|2[0-4]\d)(\.|$)){4}$/.test(ip);
    }

    // tslint:disable-next-line:no-unused-variable
    public isValidPort(): boolean {
        return this.server.port > 0 && this.server.port < 65536;
    }

    // tslint:disable-next-line:no-unused-variable
    public mayConnect(): boolean {
        return this.isValidIPAddress() && this.isValidPort();
    }

    // tslint:disable-next-line:no-unused-variable
    public onConnectClicked(event: any): void {
        event.preventDefault();

        this.ocfApiService.setBaseUrl(
            'http://' + this.server.ip +
                  ':' + this.server.port);
        this.ocfApiService.getResources().$observable.subscribe(
            (resources: any[]) => {
                console.log(resources);
            }
        );
    }
}
