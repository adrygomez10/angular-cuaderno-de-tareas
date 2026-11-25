import {
  ChangeDetectionStrategy,
  Component,
  type OnChanges,
  type OnDestroy,
  type OnInit,
  computed,
  inject,
  input,
  output,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { LifecycleTrace } from '../lifecycle-trace';
import { type Task, type TaskUpdate } from '../task';

@Component({
  selector: 'app-task-list',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './task-list.html',
  styleUrl: './task-list.css',
})
export class TaskList implements OnChanges, OnInit, OnDestroy {
  private readonly trace = inject(LifecycleTrace);

  readonly tasks = input.required<readonly Task[]>();
  readonly taskUpdated = output<TaskUpdate>();
  readonly taskRemoved = output<number>();

  protected readonly completedCount = computed(
    () => this.tasks().filter((task) => task.completed).length,
  );

  ngOnChanges(): void {
    const count = this.tasks().length;
    this.trace.record('task-list', 'ngOnChanges', `Tareas recibidas: ${count}.`);
  }

  ngOnInit(): void {
    this.trace.record('task-list', 'ngOnInit', 'Lista inicializada.');
  }

  ngOnDestroy(): void {
    this.trace.record('task-list', 'ngOnDestroy', 'Lista retirada de la vista.');
  }
}
