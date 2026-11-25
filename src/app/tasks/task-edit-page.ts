import { ChangeDetectionStrategy, Component, computed, inject, linkedSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TaskStore } from '../services/task-store';
import { MAX_TASK_TITLE_LENGTH, MIN_TASK_TITLE_LENGTH, normalizeTaskTitle } from '../task-title';
import { taskFromRoute } from './task-from-route';

@Component({
  selector: 'app-task-edit-page',
  imports: [FormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './task-edit-page.html',
})
export class TaskEditPage {
  private readonly store = inject(TaskStore);
  private readonly router = inject(Router);

  protected readonly task = taskFromRoute();
  protected readonly draft = linkedSignal(() => this.task()?.title ?? '');
  protected readonly validTitle = computed(() => normalizeTaskTitle(this.draft()) !== null);
  protected readonly minTitleLength = MIN_TASK_TITLE_LENGTH;
  protected readonly maxTitleLength = MAX_TASK_TITLE_LENGTH;

  protected save(): void {
    const task = this.task();
    const title = normalizeTaskTitle(this.draft());

    if (!task || title === null) {
      return;
    }

    this.store.update(task.id, { title });
    void this.router.navigate(['/tareas', task.id]);
  }
}
