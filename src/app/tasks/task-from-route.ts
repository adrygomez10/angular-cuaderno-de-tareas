import { type Signal, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, map } from 'rxjs';
import { TaskStore } from '../services/task-store';
import { type Task } from '../task';

export function taskFromRoute(): Signal<Task | undefined> {
  const route = inject(ActivatedRoute);
  const store = inject(TaskStore);

  return toSignal(
    combineLatest([route.paramMap, store.tasks$]).pipe(
      map(([params, tasks]) => {
        const id = params.get('id');
        return tasks.find((task) => String(task.id) === id && !task.deleted);
      }),
    ),
    { requireSync: true },
  );
}
