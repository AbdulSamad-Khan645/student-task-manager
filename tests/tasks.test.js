import { describe, test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { createMemoryStorage } from '../src/storage.js';
import { createTaskStore } from '../src/tasks.js';

const AYESHA = 'ayesha@uni.edu.pk';
const BILAL = 'bilal@uni.edu.pk';

describe('Add, Delete and Complete Task', () => {
  let storage;
  let tasks;

  beforeEach(() => {
    storage = createMemoryStorage();
    tasks = createTaskStore(storage, AYESHA);
  });

  test('TC-10 [Critical] Add a task with a valid title', () => {
    const task = tasks.add('  Submit SCD lab report  ');
    assert.equal(task.title, 'Submit SCD lab report');
    assert.equal(task.completed, false);
    assert.deepEqual(tasks.list().map((t) => t.title), ['Submit SCD lab report']);
  });

  test('TC-11 Add a task with an empty, blank or too-long title is rejected', () => {
    for (const blank of ['', '   ', '\t\n']) {
      assert.throws(() => tasks.add(blank), { code: 'TITLE_REQUIRED' }, `accepted ${JSON.stringify(blank)}`);
    }
    assert.throws(() => tasks.add('x'.repeat(121)), { code: 'TITLE_TOO_LONG' });
    assert.equal(tasks.list().length, 0);
  });

  test('TC-12 [Critical] Tasks persist after a reload and are private to each user', () => {
    tasks.add('Read chapter 4');
    tasks.add('Revise for quiz');

    const reloaded = createTaskStore(storage, AYESHA);
    assert.deepEqual(reloaded.list().map((t) => t.title), ['Read chapter 4', 'Revise for quiz']);

    const otherStudent = createTaskStore(storage, BILAL);
    assert.deepEqual(otherStudent.list(), []);
  });

  test('TC-13 [Critical] Delete removes only the selected task', () => {
    const first = tasks.add('Buy lab notebook');
    const second = tasks.add('Email course instructor');
    const third = tasks.add('Prepare presentation');

    tasks.remove(second.id);

    assert.deepEqual(
      tasks.list().map((t) => t.title),
      [first.title, third.title],
      'other tasks must not be deleted',
    );
  });

  test('TC-14 Delete a task that does not exist shows an error and changes nothing', () => {
    tasks.add('Pay hostel fee');
    assert.throws(() => tasks.remove('no-such-id'), { code: 'NOT_FOUND' });
    assert.equal(tasks.list().length, 1);
  });

  test('TC-15 [Critical] Mark a task as complete, then reopen it', () => {
    const task = tasks.add('Finish SRS document');

    const done = tasks.setCompleted(task.id, true);
    assert.equal(done.completed, true);
    assert.ok(!Number.isNaN(Date.parse(done.completedAt)));
    assert.deepEqual(tasks.stats(), { total: 1, completed: 1, pending: 0 });

    const reopened = tasks.setCompleted(task.id, false);
    assert.equal(reopened.completed, false);
    assert.equal(reopened.completedAt, null);
    assert.deepEqual(tasks.stats(), { total: 1, completed: 0, pending: 1 });
  });
});
