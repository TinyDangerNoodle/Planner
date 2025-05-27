import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Task, TaskPriority } from '../models/task.model';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private tasks: Task[] = [];
  private tasksSubject = new BehaviorSubject<Task[]>([]);

  constructor() {
    // Lade gespeicherte Tasks aus dem localStorage beim Start
    this.loadTasks();
  }

  // Gibt alle Tasks als Observable zurück
  getTasks(): Observable<Task[]> {
    return this.tasksSubject.asObservable();
  }

  // Holt einen einzelnen Task anhand seiner ID
  getTaskById(id: string): Task | undefined {
    return this.tasks.find(task => task.id === id);
  }

  // Fügt einen neuen Task hinzu
  addTask(task: Partial<Task>): Task {
    const now = new Date();
    const newTask: Task = {
      id: uuidv4(),
      title: task.title || 'Neue Aufgabe',
      description: task.description,
      completed: false,
      priority: task.priority || TaskPriority.MEDIUM,
      dueDate: task.dueDate,
      estimatedTime: task.estimatedTime,
      category: task.category,
      tags: task.tags || [],
      steps: task.steps || [],
      createdAt: now,
      updatedAt: now,
      visualReminder: task.visualReminder,
      isRecurring: task.isRecurring || false,
      recurringPattern: task.recurringPattern
    };

    this.tasks.push(newTask);
    this.updateTasks();
    return newTask;
  }

  // Aktualisiert einen vorhandenen Task
  updateTask(updatedTask: Task): void {
    const index = this.tasks.findIndex(task => task.id === updatedTask.id);
    if (index !== -1) {
      this.tasks[index] = {
        ...updatedTask,
        updatedAt: new Date()
      };
      this.updateTasks();
    }
  }

  // Setzt den Status eines Tasks auf "erledigt" oder "nicht erledigt"
  toggleTaskCompletion(id: string): void {
    const task = this.getTaskById(id);
    if (task) {
      task.completed = !task.completed;
      task.updatedAt = new Date();
      this.updateTasks();
    }
  }

  // Löscht einen Task
  deleteTask(id: string): void {
    this.tasks = this.tasks.filter(task => task.id !== id);
    this.updateTasks();
  }

  // Filtert Tasks nach Priorität
  getTasksByPriority(priority: TaskPriority): Task[] {
    return this.tasks.filter(task => task.priority === priority);
  }

  // Filtert Tasks nach Kategorie
  getTasksByCategory(category: string): Task[] {
    return this.tasks.filter(task => task.category === category);
  }

  // Filtert überfällige Tasks
  getOverdueTasks(): Task[] {
    const now = new Date();
    return this.tasks.filter(
      task => task.dueDate && new Date(task.dueDate) < now && !task.completed
    );
  }

  // Filtert heutige Tasks
  getTodaysTasks(): Task[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.tasks.filter(task =>
      task.dueDate &&
      new Date(task.dueDate) >= today &&
      new Date(task.dueDate) < tomorrow
    );
  }

  // ADHS-spezifische Funktionen

  // Gibt die nächste priorisierte Task zurück, die erledigt werden sollte
  getNextFocusTask(): Task | undefined {
    // Suche nach unerledigten Tasks, sortiert nach Priorität und Fälligkeit
    const uncompletedTasks = this.tasks
      .filter(task => !task.completed)
      .sort((a, b) => {
        // Priorisiere nach Dringlichkeit
        if (a.priority !== b.priority) {
          const priorityOrder = {
            [TaskPriority.URGENT]: 0,
            [TaskPriority.HIGH]: 1,
            [TaskPriority.MEDIUM]: 2,
            [TaskPriority.LOW]: 3
          };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }

        // Wenn gleiche Priorität, dann nach Fälligkeit
        if (a.dueDate && b.dueDate) {
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        }

        // Wenn einer kein Datum hat, priorisiere den mit Datum
        if (a.dueDate) return -1;
        if (b.dueDate) return 1;

        return 0;
      });

    return uncompletedTasks[0];
  }

  // Sortiert Tasks in eine optimale Reihenfolge für ADHS-Benutzer
  getOptimizedTaskSequence(): Task[] {
    // Eine Mischung aus dringenden und weniger dringenden Aufgaben
    // Diese Strategie hilft, Dopamin-Belohnungssystem zu aktivieren
    const urgentTasks = this.tasks.filter(t => !t.completed && t.priority === TaskPriority.URGENT);
    const highTasks = this.tasks.filter(t => !t.completed && t.priority === TaskPriority.HIGH);
    const mediumTasks = this.tasks.filter(t => !t.completed && t.priority === TaskPriority.MEDIUM);
    const lowTasks = this.tasks.filter(t => !t.completed && t.priority === TaskPriority.LOW);

    const result: Task[] = [];

    // Algorithmus für optimale Task-Sequenzierung basierend auf ADHS-Prinzipien:
    // 1. Beginne mit einer dringenden Aufgabe für Fokus
    // 2. Füge eine niedrigere Prioritätsaufgabe als "Belohnung" hinzu
    // 3. Wiederhole dieses Muster

    while (urgentTasks.length || highTasks.length || mediumTasks.length || lowTasks.length) {
      if (urgentTasks.length) {
        result.push(urgentTasks.shift()!);
      } else if (highTasks.length) {
        result.push(highTasks.shift()!);
      }

      // Füge eine niedrigere Prioritätsaufgabe als "Belohnung" nach einer schweren Aufgabe ein
      if (lowTasks.length) {
        result.push(lowTasks.shift()!);
      } else if (mediumTasks.length) {
        result.push(mediumTasks.shift()!);
      } else if (highTasks.length) {
        result.push(highTasks.shift()!);
      }
    }

    return result;
  }

  // Hilfsmethoden
  private updateTasks(): void {
    // Aktualisiere den Observable und speichere die Tasks im localStorage
    this.tasksSubject.next([...this.tasks]);
    this.saveTasks();
  }

  private saveTasks(): void {
    localStorage.setItem('adhs-planner-tasks', JSON.stringify(this.tasks));
  }

  private loadTasks(): void {
    const savedTasks = localStorage.getItem('adhs-planner-tasks');
    if (savedTasks) {
      try {
        this.tasks = JSON.parse(savedTasks);

        // Stellen Sie sicher, dass Datum-Objekte korrekt geparst werden
        this.tasks = this.tasks.map(task => ({
          ...task,
          createdAt: new Date(task.createdAt),
          updatedAt: new Date(task.updatedAt),
          dueDate: task.dueDate ? new Date(task.dueDate) : undefined
        }));

        this.tasksSubject.next([...this.tasks]);
      } catch (error) {
        console.error('Fehler beim Laden der Tasks:', error);
        this.tasks = [];
      }
    }
  }
}
