import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TaskStore } from '../services/task-store';
import { TaskList } from '../task-list/task-list';
import { type TaskUpdate } from '../task';

@Component({
  selector: 'app-tasks-overview',
  imports: [TaskList],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-task-list
      class="route-card"
      [tasks]="visibleTasks()"
      (taskUpdated)="updateTask($event)"
      (taskRemoved)="removeTask($event)"
    />
  `,
})
export class TasksOverview {
  private readonly store = inject(TaskStore);
  private readonly tasks = toSignal(this.store.tasks$, { requireSync: true });

  protected readonly visibleTasks = computed(() => this.tasks().filter((task) => !task.deleted));

  protected updateTask({ id, ...changes }: TaskUpdate): void {
    this.store.update(id, changes);
  }

  protected removeTask(id: number): void {
    this.store.remove(id);
  }
}
