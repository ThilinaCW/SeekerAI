import { APP_ID, PLATFORM_ID, Inject, NgModule } from '@angular/core';
import { ServerModule, ServerTransferStateModule } from '@angular/platform-server';
import { AppComponent } from './app/app.component';
import { isPlatformBrowser } from '@angular/common';
import { provideRouter } from '@angular/router';
import { routes } from './app/app-routing.module';
import { provideHttpClient } from '@angular/common/http';
import { bootstrapApplication } from '@angular/platform-browser';

// This is the bootstrap function used by the Angular CLI
export function appBootstrap() {
  return bootstrapApplication(AppComponent, {
    providers: [
      provideRouter(routes),
      provideHttpClient(),
      { provide: 'REQUEST_URL', useValue: '' }
    ]
  });
}

@NgModule({
  imports: [
    ServerModule,
    ServerTransferStateModule
  ]
})
export class AppServerModule {
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
