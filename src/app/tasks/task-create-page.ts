import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AddTask } from '../add-task/add-task';
import { TaskStore } from '../services/task-store';

@Component({
  selector: 'app-task-create-page',
  imports: [AddTask, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-add-task class="route-card" (taskAdded)="addTask($event)" />
    @if (addedTitle(); as title) {
      <p class="route-notice" role="status">
        Se añadió «{{ title }}». <a routerLink="/tareas">Ver lista</a>
      </p>
    }
  `,
})
export class TaskCreatePage {
  private readonly store = inject(TaskStore);

  protected readonly addedTitle = signal('');

  protected addTask(title: string): void {
    this.store.create(title);
    this.addedTitle.set(title);
  }
}
