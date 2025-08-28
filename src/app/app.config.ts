import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideClientHydration } from '@angular/platform-browser';

import { routes } from './app.routes';
import { BaseUrlInterceptor } from './core/interceptors/base-url.interceptor';
import { ErrorInterceptor } from './core/interceptors/error.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(
      withFetch(),
      withInterceptors([
        (req, next) => {
          const interceptor = new BaseUrlInterceptor();
          return interceptor.intercept(req, { handle: next });
        },
        (req, next) => {
          const interceptor = new ErrorInterceptor();
          return interceptor.intercept(req, { handle: next });
        },
      ])
    ),
    provideClientHydration(),
  ]
};
