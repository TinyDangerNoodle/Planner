import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TaskService } from '../../services/task.service';
import { Task, TaskPriority } from '../../models/task.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  today = new Date();
  todaysTasks: Task[] = [];
  overdueTasks: Task[] = [];
  nextFocusTask?: Task;
  optimizedTasks: Task[] = [];

  // Performance Statistiken
  tasksCompletedToday = 0;
  tasksCompletedThisWeek = 0;
  currentStreak = 0;

  constructor(private taskService: TaskService) {}

  ngOnInit(): void {
    // Abonniere Änderungen an der Task-Liste
    this.taskService.getTasks().subscribe(() => {
      this.loadDashboardData();
    });

    this.loadDashboardData();
  }

  loadDashboardData(): void {
    // Heutige Aufgaben laden
    this.todaysTasks = this.taskService.getTodaysTasks();

    // Überfällige Aufgaben laden
    this.overdueTasks = this.taskService.getOverdueTasks();

    // Fokusaufgabe bestimmen
    this.nextFocusTask = this.taskService.getNextFocusTask();

    // Optimierte Task-Sequenz laden
    this.optimizedTasks = this.taskService.getOptimizedTaskSequence().slice(0, 5); // Zeige nur die ersten 5 an

    // Statistiken berechnen
    this.calculateStatistics();
  }

  toggleTaskCompletion(taskId: string): void {
    this.taskService.toggleTaskCompletion(taskId);
  }

  getPriorityClass(priority: TaskPriority): string {
    switch (priority) {
      case TaskPriority.LOW:
        return 'priority-low';
      case TaskPriority.MEDIUM:
        return 'priority-medium';
      case TaskPriority.HIGH:
        return 'priority-high';
      case TaskPriority.URGENT:
        return 'priority-urgent';
      default:
        return '';
    }
  }

  private calculateStatistics(): void {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Setzt auf Sonntag der aktuellen Woche

    // Hole alle Tasks
    this.taskService.getTasks().subscribe(allTasks => {
      // Heute abgeschlossene Tasks
      this.tasksCompletedToday = allTasks.filter(task =>
        task.completed &&
        new Date(task.updatedAt) >= startOfToday
      ).length;

      // Diese Woche abgeschlossene Tasks
      this.tasksCompletedThisWeek = allTasks.filter(task =>
        task.completed &&
        new Date(task.updatedAt) >= startOfWeek
      ).length;

      // Berechne den aktuellen Streak
      this.calculateStreak(allTasks);
    });
  }

  private calculateStreak(tasks: Task[]): void {
    // Gruppiere Tasks nach Abschlussdatum (Tag)
    const completedDates = tasks
      .filter(task => task.completed)
      .map(task => {
        const date = new Date(task.updatedAt);
        return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
      });

    const uniqueDates = [...new Set(completedDates)].sort();

    // Berechne den aktuellen Streak
    let streak = 0;
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;

    // Wenn heute bereits Tasks erledigt wurden
    if (uniqueDates.includes(todayStr)) {
      streak = 1;

      // Prüfe die vorherigen Tage
      let currentDate = new Date(today);
      currentDate.setDate(currentDate.getDate() - 1);

      while (true) {
        const dateStr = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()}`;
        if (uniqueDates.includes(dateStr)) {
          streak++;
          currentDate.setDate(currentDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    this.currentStreak = streak;
  }
}
