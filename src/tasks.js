import { readJSON, writeJSON } from './storage.js';

export const MAX_TITLE_LENGTH = 120;

export class TaskError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'TaskError';
    this.code = code;
  }
}

export const tasksKeyFor = (ownerEmail) => `stm.tasks.${ownerEmail}`;

// Each user's tasks are stored under their own key, so one student never
// sees or changes another student's list.
export function createTaskStore(storage, ownerEmail) {
  if (!ownerEmail) {
    throw new TaskError('NO_USER', 'You must be logged in to manage tasks.');
  }
  const key = tasksKeyFor(ownerEmail);
  const load = () => readJSON(storage, key, []);
  const save = (tasks) => writeJSON(storage, key, tasks);

  function findIndexOrThrow(tasks, id) {
    const index = tasks.findIndex((task) => task.id === id);
    if (index === -1) throw new TaskError('NOT_FOUND', 'That task no longer exists.');
    return index;
  }

  return {
    list() {
      return load();
    },

    add(title) {
      const cleanTitle = String(title ?? '').trim();
      if (!cleanTitle) {
        throw new TaskError('TITLE_REQUIRED', 'Task title cannot be empty.');
      }
      if (cleanTitle.length > MAX_TITLE_LENGTH) {
        throw new TaskError(
          'TITLE_TOO_LONG',
          `Task title must be ${MAX_TITLE_LENGTH} characters or fewer.`,
        );
      }
      const task = {
        id: String(Date.now()),
        title: cleanTitle,
        completed: false,
        createdAt: new Date().toISOString(),
        completedAt: null,
      };
      save([...load(), task]);
      return task;
    },

    remove(id) {
      const tasks = load();
      findIndexOrThrow(tasks, id);
      save(tasks.filter((task) => task.id !== id));
    },

    setCompleted(id, completed = true) {
      const tasks = load();
      const index = findIndexOrThrow(tasks, id);
      tasks[index] = {
        ...tasks[index],
        completed: Boolean(completed),
        completedAt: completed ? new Date().toISOString() : null,
      };
      save(tasks);
      return tasks[index];
    },

    stats() {
      const tasks = load();
      const completed = tasks.filter((task) => task.completed).length;
      return { total: tasks.length, completed, pending: tasks.length - completed };
    },
  };
}
