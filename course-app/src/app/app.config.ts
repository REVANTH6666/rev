import { ApplicationConfig, provideBrowserGlobalErrorListeners, importProvidersFrom } from '@angular/core';
import { provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { FormsModule } from '@angular/forms'; // ✅ ADD THIS

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [

    provideBrowserGlobalErrorListeners(),

    provideRouter(
      routes,
      withPreloading(PreloadAllModules)
    ),

    provideClientHydration(withEventReplay()),

    provideHttpClient(
      withInterceptorsFromDi()
    ),

    // ✅ VERY IMPORTANT
    importProvidersFrom(FormsModule)

  ]
};