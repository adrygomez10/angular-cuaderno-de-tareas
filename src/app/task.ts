export interface Task {
  readonly id: number;
  readonly title: string;
  readonly completed: boolean;
  readonly externalId?: number;
  readonly deleted?: boolean;
}

export interface ImportedTask {
  readonly externalId: number;
  readonly title: string;
}

export type TaskChanges = Partial<Pick<Task, 'title' | 'completed'>>;
export type TaskUpdate = Pick<Task, 'id'> & TaskChanges;

export function isTaskId(id: unknown): id is number {
  return typeof id === 'number' && Number.isSafeInteger(id) && id > 0;
}
