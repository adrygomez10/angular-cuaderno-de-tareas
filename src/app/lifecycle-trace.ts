import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';

interface LifecycleEvent {
  readonly id: number;
  readonly component: 'add-task' | 'task-list';
  readonly hook: 'ngOnInit' | 'ngAfterViewInit' | 'ngOnChanges' | 'ngOnDestroy';
  readonly detail: string;
}

const MAX_EVENTS = 12;

@Injectable()
export class LifecycleTrace {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly eventsState = signal<readonly LifecycleEvent[]>([]);
  private nextId = 1;

  readonly events = this.eventsState.asReadonly();

  record(
    component: LifecycleEvent['component'],
    hook: LifecycleEvent['hook'],
    detail: string,
  ): void {
    if (!this.isBrowser) {
      return;
    }

    const event = { id: this.nextId++, component, hook, detail };

    // Publica fuera de la comprobación de la vista que originó el hook.
    queueMicrotask(() => {
      this.eventsState.update((events) => [event, ...events.slice(0, MAX_EVENTS - 1)]);
    });
  }
}
