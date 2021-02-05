/* global jQuery, Sortable */
/* global game, loadTemplates, mergeObject, Application, FormApplication, Dialog */

import { Task, TodoList } from "./todo.js";

/**
 * Parse handlebar templates included with keikaku.
 * @returns {Promise<Array<Function>>} an array of functions used for rendering the templates
 */
async function preloadTemplates() {
  const templates = [
    "modules/fvtt-keikaku/templates/todo-list.hbs",
    "modules/fvtt-keikaku/templates/todo-list-item.hbs",
    "modules/fvtt-keikaku/templates/todo-item-form.hbs",
  ];

  return loadTemplates(templates);
}

export class TodoListWindow extends Application {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      id: "keikaku-todo-list",
      template: "modules/fvtt-keikaku/templates/todo-list.hbs",
      width: 400,
      height: 300,
      minimizable: true,
      resizable: true,
      title: game.i18n.localize("keikaku.todolistwindow.title"),
    });
  }

  activateListeners(html) {
    super.activateListeners(html);

    const listEl = html.find("#keikaku-todo-list").get(0);
    if (listEl) {
      Sortable.create(listEl, {
        onEnd: async (evt) => {
          if (evt.oldIndex == evt.newIndex) return;

          const list = window.todoListWindow.getData();
          await list.moveTask(evt.oldIndex, evt.newIndex);
          window.todoListWindow.render(true);
        },
      });
    }

    html.on("click", "a.todo-control", async function () {
      const index = jQuery(this).data("index");
      const action = jQuery(this).data("action");

      const list = window.todoListWindow.getData();

      switch (action) {
        case "todo-toggle":
          await list.toggleTask(index);
          break;
        case "todo-delete":
          await list.deleteTask(index);
          break;
        case "todo-edit":
          new TaskForm(list.tasks[index], index).render(true);
          break;
        default:
          return;
      }

      window.todoListWindow.render(true);
    });

    html.on("click", "button.todo-new", async function () {
      new TaskForm(undefined, undefined).render(true);
    });
  }

  /**
   * @returns {TodoList}
   */
  getData() {
    return TodoList.load();
  }
}

class TaskForm extends FormApplication {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      id: "keikaku-todo-item-form",
      template: "modules/fvtt-keikaku/templates/todo-item-form.hbs",
      width: 400,
      minimizable: false,
      closeOnSubmit: true,
      title: game.i18n.localize("keikaku.taskform.title"),
    });
  }

  /**
   * @param {Task} task is the (optional) task to edit
   * @param {number?} index is the (optional) index in the to-do list
   **/
  constructor(task, index) {
    super();

    this.task = task ?? new Task();
    this.index = index;
  }

  /** @override */
  getData() {
    return { index: this.index, description: this.task.description };
  }

  /** @override */
  async _updateObject(_event, data) {
    const list = TodoList.load();
    if (data.index) await list.updateTask(data.index, data.description);
    else await list.appendTask(data.description);

    window.todoListWindow.render(true);
  }
}

/**
 * Setup the to-do list window. Adds a button to the journal directory.
 *
 * @param {JQuery} html is the rendered HTML provided by jQuery
 **/
function setupTodoListWindow(html) {
  window.todoListWindow = new TodoListWindow();

  const todoListButton = jQuery(
    `<button><i class="fas fa-tasks"></i>${game.i18n.localize(
      "keikaku.journalbutton"
    )}</button>`
  );
  todoListButton.on("click", () => window.todoListWindow.render(true));

  html.find(".directory-header .header-actions").append(todoListButton);
}

/**
 * Show a dialog reminding players of their to-do list.
 * Depending on the `showReminder` setting the reminder is displayed
 * - never
 * - when players have unfinished tasks
 * - always
 */
function showReminder() {
  const list = TodoList.load();
  const level = game.settings.get("fvtt-keikaku", "showReminder");

  if (level == "never" || (level == "incomplete" && !list.incomplete)) return;

  const content = list.incomplete
    ? game.i18n.localize("keikaku.reminder.incomplete")
    : game.i18n.localize("keikaku.reminder.complete");

  const hint = game.i18n.localize("keikaku.reminder.hint");

  const reminder = new Dialog({
    title: game.i18n.localize("keikaku.reminder.title"),
    content: `<p>${content}</p><p><small>${hint}</small></p>`,
    buttons: {
      todo: {
        icon: '<i class="fas fa-tasks"></i>',
        label: game.i18n.localize("keikaku.reminder.button"),
        callback: () => window.todoListWindow.render(true),
      },
    },
  });

  reminder.render(true);
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

  setupTodoListWindow(html);

  showReminder();
}
