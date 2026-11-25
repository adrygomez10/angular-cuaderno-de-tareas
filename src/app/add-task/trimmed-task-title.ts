import { Directive } from '@angular/core';
import { NG_VALIDATORS, type ValidatorFn } from '@angular/forms';
import { MIN_TASK_TITLE_LENGTH } from '../task-title';

export const validateTrimmedTaskTitle: ValidatorFn = ({ value }) => {
  if (typeof value !== 'string') {
    return null;
  }

  const title = value.trim();

  // Los validadores estándar ya comprueban los títulos que no tienen espacios en los extremos.
  if (title === value) {
    return null;
  }

  if (!title) {
    return { required: true };
  }

  if (title.length < MIN_TASK_TITLE_LENGTH) {
    return { minlength: { requiredLength: MIN_TASK_TITLE_LENGTH, actualLength: title.length } };
  }

  return null;
};

@Directive({
  selector: '[appTrimmedTaskTitle]',
  providers: [{ provide: NG_VALIDATORS, useValue: validateTrimmedTaskTitle, multi: true }],
})
export class TrimmedTaskTitle {}
