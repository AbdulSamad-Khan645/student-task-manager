import { createAuth, AuthError } from './auth.js';
import { createTaskStore, TaskError } from './tasks.js';
import { APP_VERSION } from './version.js';

const $ = (id) => document.getElementById(id);
const auth = createAuth(window.localStorage);

let mode = 'login';
let tasks = null;

function showError(element, message) {
  element.textContent = message;
  element.hidden = !message;
}

function setMode(nextMode) {
  mode = nextMode;
  const signup = mode === 'signup';
  $('tab-login').setAttribute('aria-selected', String(!signup));
  $('tab-signup').setAttribute('aria-selected', String(signup));
  $('name-field').hidden = !signup;
  $('auth-title').textContent = signup ? 'Create your account' : 'Welcome back';
  $('auth-subtitle').textContent = signup
    ? 'Sign up to start organising your coursework.'
    : 'Log in to see your tasks.';
  $('auth-submit').textContent = signup ? 'Create account' : 'Log in';
  $('password').autocomplete = signup ? 'new-password' : 'current-password';
  showError($('auth-error'), '');
}

function render() {
  const user = auth.currentUser();
  $('auth-view').hidden = Boolean(user);
  $('tasks-view').hidden = !user;
  $('user-area').hidden = !user;

  if (!user) {
    tasks = null;
    return;
  }
  $('user-name').textContent = user.name;
  tasks = createTaskStore(window.localStorage, user.email);
  renderTasks();
}

function renderTasks() {
  const items = tasks.list();
  const { total, completed } = tasks.stats();
  $('task-list').replaceChildren(...items.map(renderTask));
  $('task-stats').textContent = total === 0 ? 'Nothing planned yet' : `${completed} of ${total} completed`;
  $('empty-state').hidden = total > 0;
}

function renderTask(task) {
  const item = document.createElement('li');
  item.className = task.completed ? 'task is-done' : 'task';
  item.dataset.id = task.id;

  const label = document.createElement('label');
  label.className = 'task-check';

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = task.completed;
  checkbox.setAttribute('aria-label', `Mark "${task.title}" as complete`);
  checkbox.addEventListener('change', () => {
    runTaskAction(() => tasks.setCompleted(task.id, checkbox.checked));
  });

  const title = document.createElement('span');
  title.className = 'task-title';
  title.textContent = task.title;

  const remove = document.createElement('button');
  remove.type = 'button';
  remove.className = 'btn btn-danger-ghost';
  remove.textContent = 'Delete';
  remove.setAttribute('aria-label', `Delete "${task.title}"`);
  remove.addEventListener('click', () => runTaskAction(() => tasks.remove(task.id)));

  label.append(checkbox, title);
  item.append(label, remove);
  return item;
}

function runTaskAction(action) {
  try {
    action();
    showError($('task-error'), '');
  } catch (error) {
    showError($('task-error'), error instanceof TaskError ? error.message : 'Something went wrong.');
    if (!(error instanceof TaskError)) console.error(error);
  }
  renderTasks();
}

$('tab-login').addEventListener('click', () => setMode('login'));
$('tab-signup').addEventListener('click', () => setMode('signup'));

$('auth-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const submit = $('auth-submit');
  submit.disabled = true;
  try {
    const credentials = { email: $('email').value, password: $('password').value };
    if (mode === 'signup') {
      await auth.signup({ ...credentials, name: $('name').value });
    } else {
      await auth.login(credentials);
    }
    $('auth-form').reset();
    showError($('auth-error'), '');
    render();
    $('task-title').focus();
  } catch (error) {
    showError(
      $('auth-error'),
      error instanceof AuthError ? error.message : 'Something went wrong. Please try again.',
    );
    if (!(error instanceof AuthError)) console.error(error);
  } finally {
    submit.disabled = false;
  }
});

$('task-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const input = $('task-title');
  let added = false;
  runTaskAction(() => {
    tasks.add(input.value);
    added = true;
  });
  if (added) input.value = '';
  input.focus();
});

$('logout-btn').addEventListener('click', () => {
  auth.logout();
  setMode('login');
  render();
});

$('app-version').textContent = `v${APP_VERSION}`;
setMode('login');
render();
