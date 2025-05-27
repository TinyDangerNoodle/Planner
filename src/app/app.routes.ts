import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { TasksComponent } from './components/tasks/tasks.component';
import { TimerComponent } from './components/timer/timer.component';
import { RewardsComponent } from './components/rewards/rewards.component';
import { TaskCategoriesComponent } from './components/task-categories/task-categories.component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'tasks', component: TasksComponent },
  { path: 'timer', component: TimerComponent },
  { path: 'rewards', component: RewardsComponent },
  { path: 'categories', component: TaskCategoriesComponent },
  { path: '**', redirectTo: 'dashboard' }
];
