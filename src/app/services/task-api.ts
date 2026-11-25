import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { catchError, filter, from, map, mergeMap, type Observable, of, take, toArray } from 'rxjs';
import { type ImportedTask, isTaskId } from '../task';
import { normalizeTaskTitle } from '../task-title';

export const TASK_API_URL = 'https://jsonplaceholder.typicode.com/todos';

export type TaskApiResult =
  | { readonly status: 'success'; readonly tasks: readonly ImportedTask[] }
  | { readonly status: 'error'; readonly message: string };

@Injectable({
  providedIn: 'root',
})
export class TaskApi {
  private readonly http = inject(HttpClient);

  fetchPendingTasks(): Observable<TaskApiResult> {
    return this.http.get<unknown>(TASK_API_URL, { params: { _limit: 12 }, timeout: 10_000 }).pipe(
      mergeMap((response) => from(readTodos(response))),
      map(toImportedTask),
      filter((task): task is ImportedTask => task !== null),
      take(5),
      toArray(),
      map((tasks): TaskApiResult => ({ status: 'success', tasks })),
      catchError(() =>
        of({
          status: 'error' as const,
          message: 'No se pudieron consultar las tareas de ejemplo. Puedes volver a intentarlo.',
        }),
      ),
    );
  }
}

function readTodos(response: unknown): readonly unknown[] {
  if (!Array.isArray(response)) {
    throw new Error('La API no devolvió una lista de tareas.');
  }

  return response;
}

function toImportedTask(value: unknown): ImportedTask | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const { id, title, completed } = value as Record<string, unknown>;
  if (completed !== false || !isTaskId(id) || typeof title !== 'string') {
    return null;
  }

  const normalizedTitle = normalizeTaskTitle(title);
  return normalizedTitle === null ? null : { externalId: id, title: normalizedTitle };
}
