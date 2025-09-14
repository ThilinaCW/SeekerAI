import { APP_ID, PLATFORM_ID, Inject, NgModule, ApplicationRef } from '@angular/core';
import { ServerModule, ServerTransferStateModule } from '@angular/platform-server';
import { AppComponent } from './app/app.component';
import { isPlatformBrowser } from '@angular/common';
import { provideRouter } from '@angular/router';
import { routes } from './app/app-routing.module';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';

// This is the bootstrap function used by the Angular CLI
export function appBootstrap() {
  return bootstrapApplication(AppComponent, {
    providers: [
      provideRouter(routes),
      provideHttpClient(
        withInterceptorsFromDi()
      ),
      provideAnimations(),
      { provide: 'REQUEST_URL', useValue: '' },
      { provide: 'APP_ID', useValue: 'seeker-ai' }
    ]
  });
}

@NgModule({
  imports: [
    ServerModule,
    ServerTransferStateModule,
    AppComponent,
    BrowserModule.withServerTransition({ appId: 'seeker-ai' })
  ],
  providers: [
    { provide: 'APP_ID', useValue: 'seeker-ai' }
  ]
})
export class AppServerModule {
  ngDoBootstrap(appRef: ApplicationRef) {
    console.log('AppServerModule bootstrapped');
  }

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    @Inject(APP_ID) private appId: string
  ) {
    const platform = isPlatformBrowser(platformId) ?
      'in the browser' : 'on the server';
    console.log(`Running ${platform} with appId=${appId}`);
  }
}

export { renderModule } from '@angular/platform-server';
// Export the bootstrap function for Angular CLI
export const bootstrap = appBootstrap;
