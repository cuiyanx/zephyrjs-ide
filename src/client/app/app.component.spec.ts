import { APP_BASE_HREF } from '@angular/common';
import { Component } from '@angular/core';
import { async } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { Route } from '@angular/router';
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
import { BoardExplorerComponent } from './pages/editor/components/board-explorer/board-explorer.component';
import { ConsoleComponent } from './pages/editor/components/console/console.component';
import { GitHubModalComponent } from './pages/editor/components/github/github.modal.component';
import { MonacoComponent } from './pages/editor/components/monaco/monaco.component';
import { StatusBarComponent } from './pages/editor/components/statusbar/statusbar.component';

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
            NavbarComponent,
            FooterComponent
        ],
        providers: [
          { provide: APP_BASE_HREF, useValue: '/' }
        ]
      });
    });

    it('should build without a problem',
      async(() => {
        TestBed
          .compileComponents()
          .then(() => {
            let fixture = TestBed.createComponent(TestComponent);
            let compiled = fixture.nativeElement;

            expect(compiled).toBeTruthy();
          });
      }));
  });
}

@Component({
  selector: 'test-cmp',
  template: '<sd-app></sd-app>'
})
class TestComponent {}
