import { APP_BASE_HREF } from '@angular/common';
import { Component } from '@angular/core';
import { async } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { Route, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { Angular2FontawesomeModule } from 'angular2-fontawesome/angular2-fontawesome';
import { SimpleNotificationsModule } from 'angular2-notifications';

// Main app component
import { AppComponent } from './app.component';

// Pages
import { HomeComponent } from './pages/home/home.component';
import { AboutComponent } from './pages/about/about.component';
import { EditorComponent } from './pages/editor/editor.component';

// Editor components
import { BoardExplorerComponent } from './pages/editor/components/board-explorer/board-explorer.component';
import { ConsoleComponent } from './pages/editor/components/console/console.component';
import { GitHubModalComponent } from './pages/editor/components/github/github.modal.component';
import { MonacoComponent } from './pages/editor/components/monaco/monaco.component';
import { StatusBarComponent } from './pages/editor/components/statusbar/statusbar.component';
import { OcfExplorerComponent } from './pages/editor/components/ocf-explorer/ocf-explorer.component';
import { OcfResourceComponent } from './pages/editor/components/ocf-explorer/ocf-explorer.resource.component';

import { OcfResourceValueFanComponent }
    from './pages/editor/components/ocf-explorer/ocf-explorer.resource.value.fan.component';
import { OcfResourceValueIlluminanceComponent }
    from './pages/editor/components/ocf-explorer/ocf-explorer.resource.value.illuminance.component';
import { OcfResourceValueLedComponent }
    from './pages/editor/components/ocf-explorer/ocf-explorer.resource.value.led.component';
import { OcfResourceValueRgbLedComponent }
    from './pages/editor/components/ocf-explorer/ocf-explorer.resource.value.rgbled.component';
import { OcfResourceValueTemperatureComponent }
    from './pages/editor/components/ocf-explorer/ocf-explorer.resource.value.temperature.component';
import { OcfResourceValueJsonComponent }
    from './pages/editor/components/ocf-explorer/ocf-explorer.resource.value.json.component';


// Shared
import { NavbarComponent } from './shared/navbar/navbar.component';
import { FooterComponent } from './shared/footer/footer.component';


export function main() {
    describe('App component', () => {
        let config: Route[] = [
            { path: '', component: HomeComponent },
            { path: 'about', component: AboutComponent },
            { path: 'editor', component: EditorComponent }
        ];

        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [
                    FormsModule,
                    RouterTestingModule.withRoutes(config),
                    Angular2FontawesomeModule,
                    SimpleNotificationsModule
                ],
                declarations: [
                    TestComponent,
                    AppComponent,
                    HomeComponent,
                    AboutComponent,
                    EditorComponent,
                        BoardExplorerComponent,
                        ConsoleComponent,
                        GitHubModalComponent,
                        MonacoComponent,
                        StatusBarComponent,
                        OcfExplorerComponent,
                        OcfResourceComponent,
                            OcfResourceValueFanComponent,
                            OcfResourceValueIlluminanceComponent,
                            OcfResourceValueLedComponent,
                            OcfResourceValueRgbLedComponent,
                            OcfResourceValueTemperatureComponent,
                            OcfResourceValueJsonComponent,
                    NavbarComponent,
                    FooterComponent
                ],
                providers: [
                    { provide: APP_BASE_HREF, useValue: '/' }
                ]
            });
        });

        it('should build without a problem', async(() => {
            TestBed.compileComponents().then(() => {
                let fixture = TestBed.createComponent(TestComponent);
                let compiled = fixture.nativeElement;
                expect(compiled).toBeTruthy();
            });
        }));

        it('route id should be set on element', async(() => {
            TestBed.compileComponents().then(() => {
                let fixture = TestBed.createComponent(TestComponent);
                let el = fixture.debugElement.children[0].nativeElement;

                fixture.detectChanges();
                TestBed.get(Router).navigate(['/']).then(() => {
                    fixture.detectChanges();
                    expect(el.id).toEqual('home-route');
                });
            });
        }));
    });
}

@Component({
    selector: 'test-cmp',
    template: '<sd-app></sd-app>'
})
class TestComponent { }
