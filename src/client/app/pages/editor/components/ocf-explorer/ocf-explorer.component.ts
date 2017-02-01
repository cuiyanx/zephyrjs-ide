import { Component } from '@angular/core';

import { OcfApiService } from './ocf-explorer.api.services';
import { OcfResource } from './ocf-explorer.resource.component';


interface OcfServer {
    ip: string;
    port: number;
    path: string;
};

enum EXPLORE_STATUS {
    NOT_EXPLORING,
    EXPLORING
};

@Component({
    moduleId: module.id,
    selector: 'sd-ocf-explorer',
    templateUrl: 'ocf-explorer.component.html',
    styleUrls: ['ocf-explorer.component.css']
})
export class OcfExplorerComponent {
    public server: OcfServer = {
        ip: '127.0.0.1',
        port: 1337,
        path: '/192.168.0.102:8000/api/oic'
    };

    public resources: OcfResource[] = [];

    private exploreStatus: EXPLORE_STATUS = EXPLORE_STATUS.NOT_EXPLORING;


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
    public isValidPath(): boolean {
        return this.server.path.startsWith('/');
    }

    // tslint:disable-next-line:no-unused-variable
    public explorationEnabled(): boolean {
        return this.isValidIPAddress() &&
               this.isValidPort() &&
               this.isValidPath() &&
               this.exploreStatus === EXPLORE_STATUS.NOT_EXPLORING;
    }

    // tslint:disable-next-line:no-unused-variable
    public isExploring(): boolean {
        return this.exploreStatus === EXPLORE_STATUS.EXPLORING;
    }

    // tslint:disable-next-line:no-unused-variable
    public onExploreClicked(event: any): void {
        event.preventDefault();

        this.ocfApiService.setBaseUrl(
            'http://' + this.server.ip +
                  ':' + this.server.port +
                        this.server.path);

        this.exploreStatus = EXPLORE_STATUS.EXPLORING;
        this.resources = [];
        this.ocfApiService.getResources().$observable.subscribe(
            (response: any[]) => {
                this.exploreStatus = EXPLORE_STATUS.NOT_EXPLORING;
                this.resources = response
                    .filter((data: any) => {
                        let ignoredPaths: string[] = [
                            '/oic/sec/doxm',
                            '/oic/sec/pstat',
                            '/oic/d',
                            '/oic/p'
                        ];

                        // Ignore resources with no links
                        if (data.links === undefined ||
                            data.links.length === 0) {
                            return false;
                        }

                        // Ignore control resources
                        if (ignoredPaths.indexOf(data.links[0].href) !== -1) {
                            return false;
                        }

                        // Ignore duplicates
                        if (this.resources.map((resource) => {
                            return resource.path;
                        }).indexOf(data.links[0].href) !== -1) {
                            return false;
                        }

                        return true;
                    })
                    .map((data: any) => {
                        let resource: OcfResource = {
                            di: data.di,
                            path: data.links[0].href
                        };

                        this.ocfApiService.getResource(resource)
                        .$observable.subscribe(
                            (response: any) => {
                                for (let resource_ of this.resources) {
                                    if (resource_.di === resource.di &&
                                        resource_.path === resource.path) {
                                        resource.properties = response.properties;
                                    }
                                }
                            }
                        );

                        return resource;
                    });
            }
        );
    }
}
