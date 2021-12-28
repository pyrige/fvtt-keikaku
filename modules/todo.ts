/** The selection of optional tags. **/
export enum TaskTag {
  None = 0,
  Important = 1,
  Optional = 2,
}

export class Task {
  /** The task's description. **/
  readonly description: string;
  /** The task's state of completion. **/
  readonly done: boolean;
  /** The task's tag. **/
  readonly tag: TaskTag;
  /** Is the task hidden from GMs? **/
  readonly secret: boolean;
  /** The task's color. **/
  readonly color: string | null;

  /**
   * Create a new task with the given `description`.
   * @param description is the task's description.
   * @param done is the task's completion state.
   * @param tag is the task's optional tag.
   * @param secret determines if the task is hidden from GMs.
   * @param color is the task's color.
   **/
  constructor(
    description = "",
    done = false,
    tag: TaskTag = TaskTag.None,
    secret = false,
    color: string | null = null
  ) {
    this.description = description;
    this.done = done;
    this.tag = tag;
    this.secret = secret;
    this.color = color;
  }
}

export class TodoList {
  /** The to-do list's owner. **/
  readonly owner: User;
  /** The ordered list of tasks in the to-do list. **/
  readonly tasks: Array<Task>;

  /**
   * Create a to-do list from an array of tasks.
   * @param owner is the to-do list's owner.
   * @param tasks is the array of tasks in the to-do list.
   */
  constructor(owner: User, tasks: Array<Task> = []) {
    this.owner = owner;
    this.tasks = tasks;
  }

  /**
   * Load a user's to-do list (if any) from the database.
   * @param {User} owner is the to-do list's owner.
   *
   * @return {TodoList} the to-do list read from user data
   **/
  static load(owner: User): TodoList {
    const savedTasks = owner.getFlag("fvtt-keikaku", "tasks");
    if (!savedTasks || typeof savedTasks !== "string")
      return new TodoList(owner);

    const tasks = JSON.parse(savedTasks).map((task: Task) =>
      Object.assign(new Task(), task)
    );

    return new TodoList(owner, tasks);
  }

  /** Store the user's to-do list in the database. **/
  async store() {
    const tasks = JSON.stringify(this.tasks);
    await this.owner.setFlag("fvtt-keikaku", "tasks", tasks);
  }

  /**
   * Add a new task with the given `description`.
   * @param task is the task to append to the list
   * @returns the number of managed tasks.
   **/
  async appendTask(task: Task): Promise<number> {
    this.tasks.push(task);

    await this.store();

    return this.tasks.length;
  }

  /**
   * Deletes the task at the given `index`.
   * @param index is the index to be deleted
   * @returns the number of managed tasks.
   **/
  async deleteTask(index: number): Promise<number> {
    this.tasks.splice(index, 1);

    await this.store();

    return this.tasks.length;
  }

  /**
   * Updates the task description at the given `index`.
   * @param index is the index to be deleted
   * @param task is the updated task
   **/
  async updateTask(index: number, task: Task) {
    this.tasks[index] = task;

    await this.store();
  }

  /**
   * Toggle the completion state of the task at the given `index`
   * @param index is the index of the task to toggle
   **/
  async toggleTask(index: number) {
    const oldTask = this.tasks[index];
    // create a new task with the done bit flipped
    const newTask = Object.assign(new Task(), oldTask, { done: !oldTask.done });

    await this.updateTask(index, newTask);
  }

  /**
   * Re-order tasks inside the lists.
   * @param {number} oldIndex is the previous index of the task to move.
   * @param {number} newIndex is the new index of the moved task.
   **/
  async moveTask(oldIndex: number, newIndex: number) {
    this.tasks.splice(newIndex, 0, this.tasks.splice(oldIndex, 1)[0]);
    await this.store();
  }

  /** Check whether there are any incomplete tasks. **/
  get incomplete() {
    return this.tasks.some((task) => !task.done);
  }
}
