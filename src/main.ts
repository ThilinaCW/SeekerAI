import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app/app-routing.module';
import { importProvidersFrom } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';

const providers = [
  provideHttpClient(withInterceptorsFromDi()),
  provideRouter(routes),
  importProvidersFrom(
    BrowserModule.withServerTransition({ appId: 'seeker-ai' }),
    BrowserAnimationsModule
  )
];

bootstrapApplication(AppComponent, { providers })
  .catch(err => console.error(err));
