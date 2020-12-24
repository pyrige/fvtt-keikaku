/* global Sortable, jQuery */
/* global game, loadTemplates, mergeObject, Application, FormApplication */

import { Task, TodoList } from './todo.js';

/**
 * Parse handlebar templates included with keikaku.
 * @returns {Promise<Array<(data: object) => string>} an array of functions used for rendering the templates
 */
async function preloadTemplates() {
  const templates = [
    'modules/fvtt-keikaku/templates/todo-list.hbs',
    'modules/fvtt-keikaku/templates/todo-list-item.hbs',
    'modules/fvtt-keikaku/templates/todo-item-form.hbs',
  ];

  return loadTemplates(templates);
}

class TodoListWindow extends Application {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      id: 'keikaku-todo-list',
      template: 'modules/fvtt-keikaku/templates/todo-list.hbs',
      width: 400,
      height: 300,
      minimizable: true,
      resizable: true,
      title: game.i18n.localize('keikaku.todolistwindow.title'),
    })
  }

  activateListeners(html) {
    super.activateListeners(html);

    Sortable.create(html.get(0), {
      onEnd: async (evt) => {
        if (evt.oldIndex == evt.newIndex) return;

        const list = todoListWindow.getData();
        await list.moveTask(evt.oldIndex, evt.newIndex);
        todoListWindow.render(true);
      }
    });

    html.on('click', 'a.todo-control', async function () {
      const index = jQuery(this).data('index');
      const action = jQuery(this).data('action');

      const list = todoListWindow.getData();

      switch (action) {
        case 'todo-toggle':
          await list.toggleTask(index);
          break;
        case 'todo-delete':
          await list.deleteTask(index);
          break;
        case 'todo-edit':
          new TaskForm(list.tasks[index], index).render(true);
          break;
        default:
          return;
      }

      todoListWindow.render(true);
    });

    html.on('click', 'button.todo-new', async function () {
      new TaskForm().render(true);
    });
  }

  getData() {
    return TodoList.load();
  }
}

class TaskForm extends FormApplication {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      id: 'keikaku-todo-item-form',
      template: 'modules/fvtt-keikaku/templates/todo-item-form.hbs',
      width: 400,
      minimizable: false,
      closeOnSubmit: true,
      title: game.i18n.localize('keikaku.taskform.title'),
    })
  }

  /**
   * @param {Task?} task is the (optional) task to edit
   * @param {number?} index is the (optional) index in the to-do list
   **/
  constructor(task, index) {
    super();

    this.task = task ?? new Task();
    this.index = index;
  }

  activateListeners(html) {
    super.activateListeners(html)
  }

  getData() {
    return { index: this.index, description: this.task.description };
  }

  async _updateObject(_event, data) {
    const list = TodoList.load();
    if (data.index)
      await list.updateTask(data.index, data.description);
    else
      await list.appendTask(data.description);

    todoListWindow.render(true);
  }
}

/**
 * Initialize relevant UI components:
 * - preloads relevant templates
 * - adds trigger button to journal
 *
 * @param {JQuery} html is the rendered HTML provided by jQuery
 **/
export async function initUiComponents(html) {
  await preloadTemplates();

  window.todoListWindow = new TodoListWindow();

  const todoListButton = jQuery(`<button><i class="fas fa-tasks"></i>${game.i18n.localize('keikaku.journalbutton')}</button>`);
  todoListButton.on('click', () => todoListWindow.render(true));

  html.find('.directory-header .header-actions').append(todoListButton);
}
