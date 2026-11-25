export const MIN_TASK_TITLE_LENGTH = 3;
export const MAX_TASK_TITLE_LENGTH = 120;

export function normalizeTaskTitle(value: string): string | null {
  const title = value.trim();

  if (title.length < MIN_TASK_TITLE_LENGTH || value.length > MAX_TASK_TITLE_LENGTH) {
    return null;
  }

  return title;
}
