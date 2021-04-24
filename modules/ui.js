/* global jQuery, Handlebars, Sortable */
/* global game, loadTemplates, mergeObject, Application, FormApplication, Dialog */

import { Task, TodoList } from "./todo.js";
import { RGBColor } from "./colors.js";

/**
 * Parse handlebar templates included with keikaku.
 * @returns {Promise<Array<Function>>} an array of functions used for rendering the templates
 */
async function preloadTemplates() {
  const templates = [
    "modules/fvtt-keikaku/templates/todo-item-form.hbs",
    "modules/fvtt-keikaku/templates/todo-list-control.hbs",
    "modules/fvtt-keikaku/templates/todo-list-item.hbs",
    "modules/fvtt-keikaku/templates/todo-list.hbs",
  ];

  Handlebars.registerHelper("keikaku_disabled", (value) =>
    !value ? "disabled" : ""
  );

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

  /** Construct a new TodoList window.
   * Determine the active user and if they are a GM, populate players array.
   **/
  constructor() {
    super();

    this.selectedPlayer = {
      id: game.user.id,
      isOwner: true,
    };

    // only for a GM do we bother to populate the players list
    this.players = game.user.isGM
      ? game.users.map((u) => {
          return { name: u.name, id: u.id };
        })
      : null;
  }

  /**
   * Set up interactivity for the window.
   *
   * @param {JQuery} html is the rendered HTML provided by jQuery
   **/
  activateListeners(html) {
    super.activateListeners(html);

    html.on("change", "select#player-selector", async (evt) => {
      const id = jQuery(evt.currentTarget).val().toString();

      this.selectedPlayer = {
        id: id,
        isOwner: id === game.user.id,
      };

      this.render(true);
    });

    // tags are colored based on the task color
    html.find("ol#tasks span.tag").each((index, element) => {
      const tag = jQuery(element);

      // we use the computed color if the description
      // this lets use work with tasks that don't have a color
      const desc = tag.siblings("p.todo-description");
      const color = desc.css("color");
      const parsed = RGBColor.parse(color);
      const contrast = parsed.contrastColor();

      tag.css("background-color", parsed.toCSS());
      tag.css("color", contrast.toCSS());

      // we base the border color on the regular text color
      const control = tag.siblings(".todo-control");
      const borderColor = control.css("color");
      tag.css("border-color", borderColor);
    });

    // modification events are only relevant if the user owns the list
    if (!this.selectedPlayer.isOwner) return;

    html.on("click", "a.todo-control", async (evt) => {
      const target = jQuery(evt.currentTarget);
      const index = target.data("index");
      const action = target.data("action");

      // the list can only belong to the current user
      const owner = game.user;
      const list = TodoList.load(owner);

      switch (action) {
        case "toggle":
          await list.toggleTask(index);
          break;
        case "delete":
          await list.deleteTask(index);
          break;
        case "edit": {
          const task = list.tasks[index];
          new TaskForm(owner, task, index).render(true);
          break;
        }
        default:
          return;
      }

      this.render(true);
    });

    html.on("click", "button#todo-new", async () => {
      const owner = game.user;
      new TaskForm(owner).render(true);
    });

    html.find("ol#tasks").each((index, element) => {
      Sortable.create(element, {
        onEnd: async (evt) => {
          if (evt.oldIndex == evt.newIndex) return;

          const owner = game.user;
          const list = TodoList.load(owner);
          await list.moveTask(evt.oldIndex, evt.newIndex);
          this.render(true);
        },
      });
    });
  }

  /** @override */
  getData() {
    const owner = game.users.get(this.selectedPlayer.id);
    const list = TodoList.load(owner);
    const tasks = this.selectedPlayer.isOwner
      ? list.tasks
      : list.tasks.filter((task) => !task.secret);

    return {
      selectedPlayer: this.selectedPlayer,
      players: this.players,
      tasks: tasks,
    };
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
   * @param {User} owner is the task's owner.
   * @param {Task?} task is the (optional) task to edit
   * @param {number?} index is the (optional) index in the to-do list
   **/
  constructor(owner, task = undefined, index = undefined) {
    super();

    this.owner = owner;
    this.task = task ?? new Task();
    this.index = index;
  }

  /**
   * Set up interactivity for the form.
   *
   * @param {JQuery} html is the rendered HTML provided by jQuery
   **/
  activateListeners(html) {
    super.activateListeners(html);

    // just to avoid confusion, we disable the color input based on the checkbox
    html.on("change", "input#fieldUseColor", (evt) => {
      const checked = jQuery(evt.currentTarget).prop("checked");
      html.find("input#fieldColor").prop("disabled", !checked);
    });
  }

  /** @override */
  getData() {
    return {
      task: this.task,
      index: this.index,
    };
  }

  /** @override */
  async _updateObject(_event, data) {
    const color = data.useColor ? data.color : null;
    const task = new Task(
      data.description,
      data.done,
      data.tag,
      data.secret,
      color
    );

    const list = TodoList.load(this.owner);
    if (this.index !== undefined) await list.updateTask(this.index, task);
    else await list.appendTask(task);

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
    `<div class="action-buttons flexrow">
       <button><i class="fas fa-tasks"></i>${game.i18n.localize(
         "keikaku.journalbutton"
       )}</button>
     </div>`
  );
  todoListButton.on("click", () => window.todoListWindow.render(true));

  html.find(".directory-footer").append(todoListButton);
}

/**
 * Show a dialog reminding players of their to-do list.
 * Depending on the `showReminder` setting the reminder is displayed
 * - never
 * - when players have unfinished tasks
 * - always
 */
export function showReminder() {
  const list = TodoList.load(game.user);
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
}
