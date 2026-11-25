import { NgModule } from '@angular/core';
import { RouterModule, type Routes } from '@angular/router';
import { TaskArchive } from './task-archive';
import { TaskManagement } from './task-management';

const routes: Routes = [
  {
    path: '',
    component: TaskManagement,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'completadas' },
      { path: 'completadas', component: TaskArchive, title: 'Tareas completadas' },
      {
        path: 'eliminadas',
        component: TaskArchive,
        data: { mode: 'trash' },
        title: 'Papelera de tareas',
      },
    ],
  },
];

@NgModule({ imports: [RouterModule.forChild(routes)] })
export class TaskManagementModule {}
