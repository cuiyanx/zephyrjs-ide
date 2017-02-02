// Modules
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { APP_BASE_HREF } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpModule } from '@angular/http';
import { AppComponent } from './app.component';
import { routes } from './app.routes';

// Third party
import { ResourceModule } from 'ng2-resource-rest';

// This app
import { HomeModule } from './pages/home/home.module';
import { AboutModule } from './pages/about/about.module';
import { EditorModule } from './pages/editor/editor.module';


@NgModule({
  imports: [
      BrowserModule,
      HttpModule,
      RouterModule.forRoot(routes, {useHash: true}),

      ResourceModule.forRoot(),

      AboutModule,
      EditorModule,
      HomeModule
  ],
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
