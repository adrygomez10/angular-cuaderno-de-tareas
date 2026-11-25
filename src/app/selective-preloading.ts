import { Injectable } from '@angular/core';
import { type PreloadingStrategy, type Route } from '@angular/router';
import { catchError, type Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SelectivePreloading implements PreloadingStrategy {
  preload(route: Route, load: () => Observable<unknown>): Observable<unknown> {
    if (route.data?.['preload'] !== true) {
      return of(null);
    }

    return load().pipe(catchError(() => of(null)));
  }
}
