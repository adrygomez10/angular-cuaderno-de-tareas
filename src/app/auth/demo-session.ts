import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';

export const DEMO_USERNAME = 'demo';
export const DEMO_PASSWORD = 'angular-demo';
export const DEMO_SESSION_KEY = 'curso-angular.demo-session';

@Injectable({ providedIn: 'root' })
export class DemoSession {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly signedInState = signal(this.readSession());

  readonly signedIn = this.signedInState.asReadonly();

  signIn(username: string, password: string): boolean {
    if (!this.isBrowser || username.trim() !== DEMO_USERNAME || password !== DEMO_PASSWORD) {
      return false;
    }

    this.signedInState.set(true);
    this.persistSession(true);
    return true;
  }

  signOut(): void {
    this.signedInState.set(false);
    if (this.isBrowser) {
      this.persistSession(false);
    }
  }

  private readSession(): boolean {
    if (!this.isBrowser) {
      return false;
    }

    try {
      return sessionStorage.getItem(DEMO_SESSION_KEY) === DEMO_USERNAME;
    } catch {
      return false;
    }
  }

  private persistSession(signedIn: boolean): void {
    try {
      if (signedIn) {
        sessionStorage.setItem(DEMO_SESSION_KEY, DEMO_USERNAME);
      } else {
        sessionStorage.removeItem(DEMO_SESSION_KEY);
      }
    } catch {
      // Si el navegador bloquea el almacenamiento, la sesión dura lo que dura la página.
    }
  }
}
