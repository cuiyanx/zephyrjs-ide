// Modules
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { APP_BASE_HREF } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpModule } from '@angular/http';
import { AppComponent } from './app.component';
import { routes } from './app.routes';
import { Ng2BootstrapModule } from 'ng2-bootstrap/ng2-bootstrap';

// This app
import { AboutModule } from './about/about.module';
import { EditorModule } from './editor/editor.module';
import { GitHubModule } from './github/github.module';
import { HomeModule } from './home/home.module';
import { SharedModule } from './shared/shared.module';


@NgModule({
  imports: [
      BrowserModule,
      HttpModule,
      RouterModule.forRoot(routes),
      Ng2BootstrapModule,
      AboutModule,
      EditorModule,
      GitHubModule,
      HomeModule,
      SharedModule.forRoot()],
  declarations: [AppComponent],
  providers: [
      {
          provide: APP_BASE_HREF,
          useValue: '<%= APP_BASE %>'
      }
  ],
  bootstrap: [AppComponent]

})

export class AppModule { }
