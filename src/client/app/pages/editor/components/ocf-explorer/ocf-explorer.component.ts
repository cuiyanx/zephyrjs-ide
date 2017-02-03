import { Component, EventEmitter, Output } from '@angular/core';

import { OcfApiService } from './ocf-explorer.api.services';
import { OcfResource } from './ocf-explorer.resource.component';


interface OcfServer {
    ip: string;
    port: number;
    path: string;
    resources?: OcfResource[];
    isExploring?: boolean;
};


@Component({
    moduleId: module.id,
    selector: 'sd-ocf-explorer',
    templateUrl: 'ocf-explorer.component.html',
    styleUrls: ['ocf-explorer.component.css']
})
export class OcfExplorerComponent {
    @Output() onWarning = new EventEmitter();
    @Output() onError = new EventEmitter();

    // Model for connection form
    public inputServer: OcfServer = {
        ip: '127.0.0.1',
        port: 1337,
        path: '/192.168.0.102:8000/api/oic'
    };

    // Servers that are explored
    public connectedServers: OcfServer[] = [];


    public constructor(private ocfApiService: OcfApiService) {
    }

    // tslint:disable-next-line:no-unused-variable
    public isValidIPAddress(): boolean {
        let ip = this.inputServer.ip;
        return /^(?!0)(?!.*\.$)((1?\d?\d|25[0-5]|2[0-4]\d)(\.|$)){4}$/.test(ip);
    }

    // tslint:disable-next-line:no-unused-variable
    public isValidPort(): boolean {
        return this.inputServer.port > 0 && this.inputServer.port < 65536;
    }

    // tslint:disable-next-line:no-unused-variable
    public isValidPath(): boolean {
        return this.inputServer.path[0] === '/';
    }

    // tslint:disable-next-line:no-unused-variable
    public explorationEnabled(): boolean {
        return this.isValidIPAddress() &&
               this.isValidPort() &&
               this.isValidPath() &&
               !this.isExploring();
    }

    // tslint:disable-next-line:no-unused-variable
    public isExploring(): boolean {
        for(let server of this.connectedServers) {
            if (server.isExploring) {
                return true;
            }
        }

        return false;
    }

    public explore(server: OcfServer): void {
        this.ocfApiService.setBaseUrl(
            'http://' + server.ip +
                  ':' + server.port +
                        server.path);

        server.isExploring = true;
        server.resources = [];
        this.ocfApiService.getResources().$observable.subscribe(
            (response: any[]) => {
                server.isExploring = false;
                server.resources = response
                    .filter((data: any) => {
                        let supportedTypes: string[] = [
                            'oic.r.fan',
                            'oic.r.colour.rgb',
                            'oic.r.temperature'
                        ];

                        // Ignore resources with no links
                        if (data.links === undefined ||
                            data.links.length === 0) {
                            return false;
                        }

                        // Filter only supported resource types
                        if (supportedTypes.indexOf(data.links[0].rt) === -1) {
                            return false;
                        }

                        // Ignore duplicates
                        if (server.resources.map((resource) => {
                            return resource.path;
                        }).indexOf(data.links[0].href) !== -1) {
                            return false;
                        }

                        return true;
                    })
                    .map((data: any) => {
                        let resource: OcfResource = {
                            di: data.di,
                            path: data.links[0].href,
                            rt: data.links[0].rt
                        };

                        this.ocfApiService.getResource(resource)
                        .$observable.subscribe(
                            (response: any) => {
                                for (let resource_ of server.resources) {
                                    if (resource_.di === resource.di &&
                                        resource_.path === resource.path) {
                                        resource.properties = response.properties;
                                    }
                                }
                            }
                        );

                        return resource;
                    });
            },
            (error: any) => {
                this.onError.emit({
                    header: 'Connection failed',
                    body: 'There was an error connecting to the OCF server'
                });
                server.isExploring = false;
            }
        );
    }

    // tslint:disable-next-line:no-unused-variable
    public onExploreClicked(event: any): void {
        event.preventDefault();

        let connectToServer: OcfServer = null;
        let existingServers: OcfServer[] = this.connectedServers.filter(
            (s: OcfServer) => {
                return (
                    this.inputServer.ip === s.ip &&
                    this.inputServer.port === s.port &&
                    this.inputServer.path === s.path);
            }
        );

        if (existingServers.length > 0) {
            connectToServer = existingServers[0];
        } else {
            connectToServer = Object.assign({}, this.inputServer);
            this.connectedServers.push(connectToServer);
        }

        this.explore(connectToServer);
    }

    // tslint:disable-next-line:no-unused-variable
    public onRefreshServer(server: OcfServer): boolean {
        this.explore(server);
        return false;
    }

    // tslint:disable-next-line:no-unused-variable
    public onCloseServer(server: OcfServer): boolean {
        this.connectedServers = this.connectedServers.filter(
            (s: OcfServer) => {
                return (
                    server.ip !== s.ip ||
                    server.port !== s.port ||
                    server.path !== s.path
                );
            }
        );

        return false;
    }
}
