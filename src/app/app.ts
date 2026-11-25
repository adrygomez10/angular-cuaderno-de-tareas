import { Component, DestroyRef, afterNextRender, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { map } from 'rxjs';
import { DemoSession } from './auth/demo-session';
import { LifecycleTrace } from './lifecycle-trace';
import { TaskApi, type TaskApiResult } from './services/task-api';
import { type TaskChange, TaskStore } from './services/task-store';

interface ImportStatus {
  readonly state: 'idle' | 'loading' | 'success' | 'error';
  readonly message: string;
}

const TASK_CHANGE_LABELS: Record<TaskChange, string> = {
  created: 'Tarea creada',
  updated: 'Tarea actualizada',
  deleted: 'Tarea eliminada',
  restored: 'Tarea restaurada',
  imported: 'Tareas importadas',
};

@Component({
  selector: 'app-root',
  standalone: false,
  providers: [LifecycleTrace],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly taskStore = inject(TaskStore);
  private readonly taskApi = inject(TaskApi);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly session = inject(DemoSession);

  protected readonly lifecycleEvents = inject(LifecycleTrace).events;
  protected readonly title = 'Lista de tareas';
  protected readonly signedIn = this.session.signedIn;
  protected readonly lastChange = toSignal(
    this.taskStore.changes$.pipe(map((change) => TASK_CHANGE_LABELS[change])),
  );
  protected readonly storageWarning = this.taskStore.storageWarning;
  protected readonly componentsVisible = signal(true);
  protected readonly importStatus = signal<ImportStatus>({ state: 'idle', message: '' });

  constructor() {
    afterNextRender(() => this.taskStore.initialize());
  }

  protected signOut(): void {
    this.session.signOut();
    void this.router.navigateByUrl('/tareas', { replaceUrl: true });
  }

  protected importTasks(): void {
    if (this.importStatus().state === 'loading') {
      return;
    }

    this.importStatus.set({ state: 'loading', message: 'Consultando JSONPlaceholder…' });
    this.taskApi
      .fetchPendingTasks()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        this.showImportResult(result);
      });
  }

  protected toggleComponents(): void {
    this.componentsVisible.update((visible) => !visible);
  }

  private showImportResult(result: TaskApiResult): void {
    if (result.status === 'error') {
      this.importStatus.set({ state: 'error', message: result.message });
      return;
    }

    const added = this.taskStore.importTasks(result.tasks);
    if (added > 0) {
      const message = added === 1 ? 'Se importó 1 tarea.' : `Se importaron ${added} tareas.`;
      this.importStatus.set({ state: 'success', message });
      return;
    }

    const message =
      result.tasks.length > 0
        ? 'Las tareas recibidas ya están en tu lista.'
        : 'La API no devolvió tareas pendientes válidas.';
    this.importStatus.set({ state: 'success', message });
  }
}
