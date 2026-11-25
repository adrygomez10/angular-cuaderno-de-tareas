import { NgModule } from '@angular/core';
import { RouterModule, type Routes } from '@angular/router';
import { LoginPage } from './auth/login-page';
import { requireDemoSession } from './auth/require-demo-session';
import { SelectivePreloading } from './selective-preloading';
import { TaskDetailPage } from './tasks/task-detail-page';
import { TasksArea } from './tasks/tasks-area';
import { TasksOverview } from './tasks/tasks-overview';

// El cargador con nombre evita que el HTML del servidor anticipe este módulo en una URL directa.
function loadTaskManagement() {
  return import('./tasks/management/task-management-module').then(
    (module) => module.TaskManagementModule,
  );
}

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'tareas' },
  {
    path: 'tareas',
    component: TasksArea,
    children: [
      { path: '', pathMatch: 'full', component: TasksOverview, title: 'Mis tareas' },
      {
        path: 'nueva',
        title: 'Nueva tarea',
        data: { preload: true },
        loadComponent: () =>
          import('./tasks/task-create-page').then((module) => module.TaskCreatePage),
      },
      {
        path: 'gestion',
        canMatch: [requireDemoSession],
        loadChildren: loadTaskManagement,
      },
      {
        path: ':id/editar',
        title: 'Editar tarea',
        loadComponent: () => import('./tasks/task-edit-page').then((module) => module.TaskEditPage),
      },
      { path: ':id', component: TaskDetailPage, title: 'Detalle de la tarea' },
    ],
  },
  { path: 'acceso', component: LoginPage, title: 'Acceso a gestión' },
  { path: '**', redirectTo: 'tareas' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: SelectivePreloading })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
