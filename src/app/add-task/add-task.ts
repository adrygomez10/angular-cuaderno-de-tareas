import { isPlatformBrowser } from '@angular/common';
import {
  type AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  type ElementRef,
  type OnDestroy,
  type OnInit,
  PLATFORM_ID,
  inject,
  output,
  signal,
  viewChild,
} from '@angular/core';
import {
  type AbstractControl,
  FormControl,
  FormGroup,
  type FormGroupDirective,
  FormsModule,
  type NgForm,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { LifecycleTrace } from '../lifecycle-trace';
import { MAX_TASK_TITLE_LENGTH, MIN_TASK_TITLE_LENGTH } from '../task-title';
import { TrimmedTaskTitle, validateTrimmedTaskTitle } from './trimmed-task-title';

@Component({
  selector: 'app-add-task',
  imports: [FormsModule, ReactiveFormsModule, TrimmedTaskTitle],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './add-task.html',
  styleUrl: './add-task.css',
})
export class AddTask implements OnInit, AfterViewInit, OnDestroy {
  private readonly trace = inject(LifecycleTrace);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly templateInput =
    viewChild.required<ElementRef<HTMLInputElement>>('templateInput');
  private readonly reactiveInput =
    viewChild.required<ElementRef<HTMLInputElement>>('reactiveInput');

  readonly taskAdded = output<string>();

  protected readonly title = signal('');
  protected readonly minTitleLength = MIN_TASK_TITLE_LENGTH;
  protected readonly maxTitleLength = MAX_TASK_TITLE_LENGTH;

  protected readonly reactiveTitle = new FormControl('', {
    nonNullable: true,
    validators: [
      Validators.required,
      Validators.minLength(MIN_TASK_TITLE_LENGTH),
      Validators.maxLength(MAX_TASK_TITLE_LENGTH),
      validateTrimmedTaskTitle,
    ],
  });
  protected readonly reactiveForm = new FormGroup({ title: this.reactiveTitle });

  ngOnInit(): void {
    this.trace.record('add-task', 'ngOnInit', 'Formulario inicializado.');
  }

  ngAfterViewInit(): void {
    if (this.isBrowser) {
      this.templateInput().nativeElement.focus({ preventScroll: true });
    }

    this.trace.record('add-task', 'ngAfterViewInit', 'Campo de título disponible y enfocado.');
  }

  ngOnDestroy(): void {
    this.trace.record('add-task', 'ngOnDestroy', 'Formulario retirado de la vista.');
  }

  protected submitFromClick(event: MouseEvent, form: HTMLFormElement): void {
    event.preventDefault();
    form.requestSubmit();
  }

  protected submitTemplateTask(form: NgForm): void {
    if (!form.valid) {
      return;
    }

    this.taskAdded.emit(this.title().trim());
    form.resetForm({ title: '' });
    this.templateInput().nativeElement.focus({ preventScroll: true });
  }

  protected submitReactiveTask(form: FormGroupDirective): void {
    if (!this.reactiveForm.valid) {
      return;
    }

    this.taskAdded.emit(this.reactiveTitle.value.trim());
    form.resetForm();
    this.reactiveInput().nativeElement.focus({ preventScroll: true });
  }

  protected titleError(control: Pick<AbstractControl, 'hasError'>): string {
    if (control.hasError('required')) {
      return 'Escribe un título para la tarea.';
    }

    if (control.hasError('minlength')) {
      return `El título necesita al menos ${this.minTitleLength} caracteres.`;
    }

    return `El título admite hasta ${this.maxTitleLength} caracteres.`;
  }
}
