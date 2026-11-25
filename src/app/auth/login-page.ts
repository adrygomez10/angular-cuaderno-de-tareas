import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DEMO_PASSWORD, DEMO_USERNAME, DemoSession } from './demo-session';

const MANAGEMENT_HOME = '/tareas/gestion/completadas';
const MANAGEMENT_PATHS = new Set([
  '/tareas/gestion',
  MANAGEMENT_HOME,
  '/tareas/gestion/eliminadas',
]);

@Component({
  selector: 'app-login-page',
  imports: [FormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './login-page.html',
})
export class LoginPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly session = inject(DemoSession);

  protected readonly demoUsername = DEMO_USERNAME;
  protected readonly demoPassword = DEMO_PASSWORD;
  protected readonly username = signal('');
  protected readonly password = signal('');
  protected readonly error = signal(false);

  protected signIn(): void {
    if (!this.session.signIn(this.username(), this.password())) {
      this.error.set(true);
      return;
    }

    const requested = this.route.snapshot.queryParamMap.get('volver') ?? '';
    const path = MANAGEMENT_PATHS.has(requested) ? requested : MANAGEMENT_HOME;
    void this.router.navigateByUrl(path, { replaceUrl: true });
  }
}
