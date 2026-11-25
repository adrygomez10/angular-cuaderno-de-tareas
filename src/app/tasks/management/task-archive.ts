import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TaskStore } from '../../services/task-store';

@Component({
  selector: 'app-task-archive',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './task-archive.html',
})
export class TaskArchive {
  private readonly store = inject(TaskStore);
  private readonly tasks = toSignal(this.store.tasks$, { requireSync: true });

  protected readonly trash = inject(ActivatedRoute).snapshot.data['mode'] === 'trash';
  protected readonly visibleTasks = computed(() =>
    this.trash
      ? this.tasks().filter((task) => task.deleted)
      : this.tasks().filter((task) => task.completed && !task.deleted),
  );

  protected reopen(id: number): void {
    this.store.update(id, { completed: false });
  }

  protected restore(id: number): void {
    this.store.restore(id);
  }
}
