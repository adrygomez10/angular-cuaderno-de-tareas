import { type Task, isTaskId } from '../task';
import { normalizeTaskTitle } from '../task-title';

export const TASK_STORAGE_KEY = 'curso-angular.tasks';

export function parseStoredTasks(serialized: string): readonly Task[] {
  const value: unknown = JSON.parse(serialized);

  if (!Array.isArray(value) || !value.every(isStoredTask)) {
    throw new Error('El contenido guardado no es una lista de tareas válida.');
  }

  const ids = new Set(value.map(({ id }) => id));
  if (ids.size !== value.length) {
    throw new Error('El contenido guardado contiene identificadores repetidos.');
  }

  return value;
}

function isStoredTask(value: unknown): value is Task {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const { id, title, completed, externalId, deleted } = value as Partial<Task>;
  const validExternalId = externalId === undefined || isTaskId(externalId);

  return (
    isTaskId(id) &&
    typeof title === 'string' &&
    normalizeTaskTitle(title) !== null &&
    hasValidTaskFlags(completed, deleted) &&
    validExternalId
  );
}

function hasValidTaskFlags(completed: unknown, deleted: unknown): boolean {
  return typeof completed === 'boolean' && (deleted === undefined || typeof deleted === 'boolean');
}
