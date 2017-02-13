import {
    Component,
    ElementRef,
    EventEmitter,
    Output,
    OnInit,
    QueryList,
    ViewChild,
    ViewChildren
} from '@angular/core';

import { OcfApiService } from './ocf-explorer.api.services';
import {
    OcfResource,
    OcfResourceComponent
} from './ocf-explorer.resource.component';

interface OcfServer {
    https: boolean;
    ip: string;
    port: number;
    path: string;
    resources?: OcfResource[];
    isExploring?: boolean;
};


declare var $: any;


@Component({
    moduleId: module.id,
    selector: 'sd-ocf-explorer',
    templateUrl: 'ocf-explorer.component.html',
    styleUrls: ['ocf-explorer.component.css'],
    providers: [OcfApiService]
})
export class OcfExplorerComponent implements OnInit {
    @Output() onWarning = new EventEmitter();
    @Output() onError = new EventEmitter();

    // Model for connection form
    public inputServer: OcfServer = {
        https: false,
        ip: '127.0.0.1',
        port: 8000,
        path: '/api/oic'
    };

    // Servers that are explored
    public connectedServers: OcfServer[] = [];

    @ViewChildren(OcfResourceComponent)
    private resourceComponents: QueryList<OcfResourceComponent>;

    @ViewChild('httpsToggle')
    private httpsToggle: ElementRef;


    public constructor(private ocfApiService: OcfApiService) {
    }

    public ngOnInit() {
        let httpsToggleEl = $(this.httpsToggle.nativeElement);
        httpsToggleEl.bootstrapToggle().change(() => {
            this.inputServer.https = httpsToggleEl.prop('checked');
        });
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
        let protocol = 'http://';
        if (server.https) {
            protocol = 'https://';
        }

        this.ocfApiService.setBaseUrl(
            protocol + server.ip +
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
                            'oic.r.sensor.illuminance',
                            'oic.r.led',
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
                        let resource: OcfResource = new OcfResource(
                            data.di,
                            data.links[0].href,
                            data.links[0].rt
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

    // tslint:disable-next-line:no-unused-variable
    public onRefreshResource(resource: OcfResource): boolean {
        let resourceComponent = this.resourceComponents
            .find((component: OcfResourceComponent) => {
                return component.resource.equals(resource);
            });

        if (resourceComponent !== null) {
            resourceComponent.getProperties();
        }

        return false;
    }
}
