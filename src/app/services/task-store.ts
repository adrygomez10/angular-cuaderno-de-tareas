import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { type ImportedTask, type Task, type TaskChanges } from '../task';
import { normalizeTaskTitle } from '../task-title';
import { TASK_STORAGE_KEY, parseStoredTasks } from './task-storage';

export type TaskChange = 'created' | 'updated' | 'deleted' | 'restored' | 'imported';

@Injectable({
  providedIn: 'root',
})
export class TaskStore {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly taskState = new BehaviorSubject<readonly Task[]>([]);
  private readonly taskChanges = new Subject<TaskChange>();
  private readonly storageWarningState = signal('');
  private storage: Storage | null = null;
  private initialized = false;
  private nextId = 1;

  readonly tasks$ = this.taskState.asObservable();
  readonly changes$ = this.taskChanges.asObservable();
  readonly storageWarning = this.storageWarningState.asReadonly();

  initialize(): void {
    if (this.initialized || !this.isBrowser) {
      return;
    }

    this.initialized = true;

    try {
      const storage = globalThis.localStorage;
      const serialized = storage.getItem(TASK_STORAGE_KEY);
      const tasks = serialized === null ? [] : parseStoredTasks(serialized);

      this.storage = storage;
      this.nextId = tasks.reduce((maxId, task) => Math.max(maxId, task.id), 0) + 1;
      this.taskState.next(tasks);
    } catch {
      this.storageWarningState.set(
        'El almacenamiento local no se pudo leer. Los cambios solo se conservan en esta página.',
      );
    }
  }

  create(title: string): void {
    const normalizedTitle = normalizeTaskTitle(title);
    if (normalizedTitle === null) {
      return;
    }

    const tasks = this.currentTasks;
    const task = { id: this.nextId++, title: normalizedTitle, completed: false };

    this.save([...tasks, task], 'created');
  }

  update(id: number, changes: TaskChanges): void {
    const tasks = this.currentTasks;
    const task = tasks.find((candidate) => candidate.id === id);
    if (!task || task.deleted) {
      return;
    }

    const title = normalizeTaskTitle(changes.title ?? task.title);
    const completed = changes.completed ?? task.completed;
    if (title === null || (title === task.title && completed === task.completed)) {
      return;
    }

    const updated = { ...task, title, completed };
    this.save(
      tasks.map((candidate) => (candidate.id === id ? updated : candidate)),
      'updated',
    );
  }

  remove(id: number): void {
    const tasks = this.currentTasks;
    const task = tasks.find((candidate) => candidate.id === id);
    if (!task || task.deleted) {
      return;
    }

    this.save(
      tasks.map((candidate) => (candidate.id === id ? { ...task, deleted: true } : candidate)),
      'deleted',
    );
  }

  restore(id: number): void {
    const tasks = this.currentTasks;
    const task = tasks.find((candidate) => candidate.id === id);
    if (!task?.deleted) {
      return;
    }

    const restored = { ...task, deleted: false };
    this.save(
      tasks.map((candidate) => (candidate.id === id ? restored : candidate)),
      'restored',
    );
  }

  importTasks(imported: readonly ImportedTask[]): number {
    const tasks = this.currentTasks;
    const knownIds = new Set(tasks.map((task) => task.externalId));
    const added: Task[] = [];

    for (const task of imported) {
      if (knownIds.has(task.externalId)) {
        continue;
      }

      knownIds.add(task.externalId);
      added.push({ ...task, id: this.nextId++, completed: false });
    }

    if (added.length > 0) {
      this.save([...tasks, ...added], 'imported');
    }

    return added.length;
  }

  private get currentTasks(): readonly Task[] {
    this.initialize();
    return this.taskState.value;
  }

  private save(tasks: readonly Task[], action: TaskChange): void {
    if (this.storage) {
      try {
        this.storage.setItem(TASK_STORAGE_KEY, JSON.stringify(tasks));
        this.storageWarningState.set('');
      } catch {
        this.storageWarningState.set(
          'No se pudo guardar el último cambio en el almacenamiento local.',
        );
      }
    }

    this.taskState.next(tasks);
    this.taskChanges.next(action);
  }
}
