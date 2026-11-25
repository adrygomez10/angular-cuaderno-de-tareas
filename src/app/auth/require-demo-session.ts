import { inject } from '@angular/core';
import { type CanMatchFn, Router } from '@angular/router';
import { DemoSession } from './demo-session';

export const requireDemoSession: CanMatchFn = () => {
  if (inject(DemoSession).signedIn()) {
    return true;
  }

  const router = inject(Router);
  const requested = router.currentNavigation()?.initialUrl;
  const next = requested ? router.serializeUrl(requested) : '/tareas/gestion';

  return router.createUrlTree(['/acceso'], { queryParams: { volver: next } });
};
