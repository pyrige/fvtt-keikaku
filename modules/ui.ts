import * as todo from "./todo";
import * as colors from "./colors";

import Sortable from "sortablejs/modular/sortable.core.esm.js";

/**
 * Parse handlebar templates included with keikaku.
 * @returns an array of functions used for rendering the templates
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
  private selectedPlayer: { id: string; isOwner: boolean };
  private players?: Array<{ id: string; name: string | null }>;

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
    if (!game.user || !game.users)
      throw new Error("Users have not yet been initialized");

    super();

    this.selectedPlayer = {
      id: game.user?.id,
      isOwner: true,
    };

    // only for a GM do we bother to populate the players list
    if (game.user.isGM) {
      this.players = game.users.map((user) => ({
        id: user.id,
        name: user.name,
      }));
    }
  }

  /**
   * Set up interactivity for the window.
   *
   * @param html is the rendered HTML provided by jQuery
   **/
  activateListeners(html: JQuery) {
    super.activateListeners(html);

    html.on("change", "select#player-selector", async (evt) => {
      if (!game.user) throw new Error("Users have not yet been initialized");

      // we use User.id as value, so we can safely assume we get a string here
      const id = jQuery(evt.currentTarget).val() as string;

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
      const parsed = colors.RGBColor.parse(color);
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
      if (!owner) return;

      const list = todo.TodoList.load(owner);

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
      if (!owner) return;

      new TaskForm(owner).render(true);
    });

    html.find("ol#tasks").each((_index, element) => {
      Sortable.create(element, {
        onEnd: async (evt) => {
          if (evt.oldIndex == evt.newIndex) return;

          const owner = game.user;
          if (!owner) return;

          const list = todo.TodoList.load(owner);
          await list.moveTask(evt.oldIndex, evt.newIndex);
          this.render(true);
        },
      });
    });
  }

  /** @override */
  getData() {
    const owner = game.users?.get(this.selectedPlayer.id);
    if (!owner) return {};

    const list = todo.TodoList.load(owner);
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
   * @param owner is the task's owner.
   * @param task is the (optional) task to edit
   * @param index is the (optional) index in the to-do list
   **/
  constructor(owner: User, task?: todo.Task, index?: number) {
    super({
      owner: owner,
      task: task ?? new todo.Task(),
      index: index,
    });
  }

  /**
   * Set up interactivity for the form.
   *
   * @param html is the rendered HTML provided by jQuery
   **/
  activateListeners(html: JQuery) {
    super.activateListeners(html);

    // just to avoid confusion, we disable the color input based on the checkbox
    html.on("change", "input#fieldUseColor", (evt) => {
      const checked = jQuery(evt.currentTarget).prop("checked");
      html.find("input#fieldColor").prop("disabled", !checked);
    });
  }

  /** Helper class for representing this form's data **/
  static TaskData = class {
    readonly description: string;
    readonly done: boolean;
    readonly tag: todo.TaskTag;
    readonly secret: boolean;
    readonly useColor: boolean;
    readonly color?: string;
  };

  /** @override **/
  async _updateObject(
    _event: Event,
    formData: InstanceType<typeof TaskForm.TaskData>
  ) {
    const color = formData.useColor ? formData.color : null;
    const task = new todo.Task(
      formData.description,
      formData.done,
      formData.tag,
      formData.secret,
      color
    );

    const owner = this.object["owner"] as User;
    const index = this.object["index"] as number | undefined;

    const list = todo.TodoList.load(owner);

    if (index !== undefined) await list.updateTask(index, task);
    else await list.appendTask(task);

    globalThis.todoListWindow.render(true);
  }
}

/**
 * Setup the to-do list window. Adds a button to the journal directory.
 *
 * @param html is the rendered HTML provided by jQuery
 **/
function setupTodoListWindow(html: JQuery) {
  globalThis.todoListWindow = new TodoListWindow();

  const todoListButton = jQuery(
    `<div class="action-buttons flexrow">
       <button>
         <i class="fas fa-tasks"></i>
         ${game.i18n.localize("keikaku.journalbutton")}
       </button>
     </div>`
  );
  todoListButton.on("click", () => globalThis.todoListWindow.render(true));

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
  if (!game.user) throw new Error("Users have not yet been initialized");

  const level = game.settings.get("fvtt-keikaku", "showReminder");
  const list = todo.TodoList.load(game.user);

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
        callback: () => globalThis.todoListWindow.render(true),
      },
    },
    default: "todo",
  });

  reminder.render(true);
}

/**
 * Initialize relevant UI components:
 * - preloads relevant templates
 * - adds trigger button to journal
 *
 * @param html is the rendered HTML provided by jQuery
 **/
export async function initUiComponents(html: JQuery) {
  await preloadTemplates();

  setupTodoListWindow(html);
}
