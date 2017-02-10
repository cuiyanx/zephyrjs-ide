import { Component, HostBinding, OnInit } from '@angular/core';
import { Event, NavigationEnd, Router } from '@angular/router';


/**
 * This class represents the main application component. Within the @Routes annotation is the configuration of the
 * applications routes, configuring the paths for the lazy loaded components (HomeComponent, AboutComponent).
 */
@Component({
    moduleId: module.id,
    selector: 'sd-app',
    templateUrl: 'app.component.html',
    styleUrls: ['app.component.css']
})
export class AppComponent implements OnInit {
    @HostBinding('attr.id') public route: string;

    public constructor(private router: Router) {
    }

    public ngOnInit() {
        this.router.events.subscribe((ev: Event) => {
            if (ev instanceof NavigationEnd) {
                this.route = ev.url
                    // Remove leading and trailing slash
                    .replace(/^\/|\/$/g, '')
                    // Replace other slashes with dashes
                    .replace(/\//g, '-');

                if (this.route.length === 0) {
                    this.route= 'home';
                }

                this.route = this.route + '-route';
            }
        });
    }
}
