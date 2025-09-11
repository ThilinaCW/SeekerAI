import { NgModule } from '@angular/core';
import { ServerModule, ServerTransferStateModule } from '@angular/platform-server';
import { AppComponent } from './app.component';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { routes } from './app-routing.module';
import { provideHttpClient } from '@angular/common/http';

// Bootstrap the application with standalone components
export function bootstrap() {
  return bootstrapApplication(AppComponent, {
    providers: [
      provideRouter(routes),
      provideHttpClient()
    ]
  });
}

@NgModule({
  imports: [
    ServerModule,
    ServerTransferStateModule
  ]
})
export class AppServerModule {}
