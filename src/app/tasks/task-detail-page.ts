import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { taskFromRoute } from './task-from-route';

@Component({
  selector: 'app-task-detail-page',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './task-detail-page.html',
})
export class TaskDetailPage {
  protected readonly task = taskFromRoute();
}
