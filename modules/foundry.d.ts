/**
 * A simple event framework used throughout Foundry Virtual Tabletop.
 * When key actions or events occur, a "hook" is defined where user-defined callback functions can execute.
 * This class manages the registration and execution of hooked callback functions.
 */
declare class Hooks {
  /**
   * Register a callback handler which should be triggered when a hook is triggered.
   *
   * @param hook The unique name of the hooked event
   * @param fn   The callback function which should be triggered when the hook event occurs
   * @return     An ID number of the hooked function which can be used to turn off the hook later
   */
  static on(hook: string, fn: Function): number;

  /**
   * Register a callback handler for an event which is only triggered once the first time the event occurs.
   * After a "once" hook is triggered the hook is automatically removed.
   *
   * @param hook The unique name of the hooked event
   * @param fn   The callback function which should be triggered when the hook event occurs
   * @returns    An ID number of the hooked function which can be used to turn off the hook later
   */
  static once(hook: string, fn: Function): number;
}

/**
 * The standard application window that is rendered for a large variety of UI elements in Foundry VTT.
 */
declare class Application {
  /**
   * Assign the default options configuration which is used by this Application class. The options and values defined
   * in this object are merged with any provided option values which are passed to the constructor upon initialization.
   * Application subclasses may include additional options which are specific to their usage.
   */
  static get defaultOptions(): Object;

  /**
   * Once the HTML for an Application has been rendered, activate event listeners which provide interactivity for
   * the application
   */
  activateListeners(html: JQuery);

  /**
   * An application should define the data object used to render its template.
   * This function may either return an Object directly, or a Promise which resolves to an Object
   * If undefined, the default implementation will return an empty object allowing only for rendering of static HTML
   */
  getData(options?: Object): Object;

  /**
   * Render the Application by evaluating it's HTML template against the object of data provided by the getData method
   * If the Application is rendered as a pop-out window, wrap the contained HTML in an outer frame with window controls
   *
   * @param force   Add the rendered application to the DOM if it is not already present. If false, the Application will only be re-rendered if it is already present.
   * @param options Additional rendering options which are applied to customize the way that the Application is rendered in the DOM.
   *
   * @param {number} options.left   The left positioning attribute
   * @param {number} options.top    The top positioning attribute
   * @param {number} options.width  The rendered width
   * @param {number} options.height The rendered height
   * @param {number} options.scale  The rendered transformation scale
   * @param {boolean} options.log   Whether to display a log message that the Application was rendered
   *
   */
  render(force: boolean, options?: Object): Application;
}

/**
 * An abstract pattern for defining an Application responsible for updating some object using an HTML form
 *
 * A few critical assumptions:
 * 1) This application is used to only edit one object at a time
 * 2) The template used contains one (and only one) HTML form as it's outer-most element
 * 3) This abstract layer has no knowledge of what is being updated, so the implementation must define _updateObject
 */
declare class FormApplication extends Application {
  /**
   * This method is called upon form submission after form data is validated
   * @param event    The initial triggering submission event
   * @param formData The object of validated form data with which to update the object
   * @returns        A Promise which resolves once the update operation has completed
   * @abstract
   */
  _updateObject(event: Event, formData: Object): Promise<void>;
}

declare class Dialog extends Application {
  /**
   * Create a dialog window displaying a title, a message, and a set of buttons which trigger callback functions.
   * @param {Object} data               An object of dialog data which configures how the modal window is rendered
   * @param {string} data.title         The window title
   * @param {string} data.content       HTML content
   * @param {Function} [data.render]    A callback function invoked when the dialog is rendered
   * @param {Function} [data.close]     Common callback operations to perform when the dialog is closed
   * @param {Object<string, DialogButton>} data.buttons The buttons which are displayed as action choices for the dialog
   *
   * @param {Object} options            Dialog rendering options, see :class:`Application`
   * @param {string} options.default    The name of the default button which should be triggered on Enter
   * @param {boolean} options.jQuery    Whether to provide jQuery objects to callback functions (if true) or plain
   *                                    HTMLElement instances (if false). This is currently true by default but in the
   *                                    future will become false by default.
   */
  constructor(data: Object, options?: Object);
}

/**
 * A helper class which assists with localization and string translation
 */
declare class Localization {
  /**
   * Localize a string by drawing a translation from the available translations dictionary, if available
   * If a translation is not available, the original string is returned
   * @param stringId The string ID to translate
   * @returns        The translated string
   */
  localize(stringId: string): string;

  /**
   * Once the HTML for an Application has been rendered, activate event listeners which provide interactivity for
   * the application
   */
  activateListeners(html: JQuery);
}

/**
 * Load and cache a set of templates by providing an Array of paths
 * @param paths An array of template file paths to load
 */
declare function loadTemplates(paths: Array<string>): Promise<Array<Function>>;

/**
 * Update a source object by replacing its keys and values with those from a target object.
 *
 * @param original The initial object which should be updated with values from the target
 * @param other    A new object whose values should replace those in the source
 * @returns        The original source object including updated, inserted, or overwritten records.
 */
declare function mergeObject(original: Object, other?: Object): Object;

/**
 * The User entity
 * Each player who connects to a Foundry Virtual Tabletop session is a User.
 * Users represent human beings (or possibly programmatic players) and are the cornerstone of identity in Foundry VTT.
 **/
declare class User {
  /** The source data for the User entity, usually retrieved from the database. **/
  data: object;

  /** A convenience accessor for the _id attribute of the Entity data object. **/
  id: string;

  /** A convenience accessor for the name attribute of the Entity data object. **/
  name: string;

  /** A flag for whether the current User has Assistant GameMaster or full GameMaster role. **/
  isGM: boolean;

  /**
   * Get the value of a "flag" for this User
   * See the setFlag method for more details on flags
   *
   * @param scope The flag scope which namespaces the key
   * @param key   The flag key
   * @return      The flag value
   */
  getFlag(scope: string, key: string): any;

  /**
   * Assign a "flag" to this User.
   * Flags represent key-value type data which can be used to store flexible or arbitrary data required by either
   * the core software, game systems, or user-created modules.
   *
   * Each flag should be set using a scope which provides a namespace for the flag to help prevent collisions.
   *
   * Flags set by the core software use the "core" scope.
   * Flags set by game systems or modules should use the canonical name attribute for the module
   * Flags set by an individual world should "world" as the scope.
   *
   * Flag values can assume almost any data type. Setting a flag value to null will delete that flag.
   *
   * @param scope The flag scope which namespaces the key
   * @param key   The flag key
   * @param value The flag value
   *
   * @return {Promise}        A Promise resolving to the updated PlaceableObject
   */
  setFlag(scope: string, key: string, value: any): Promise<User>;
}

declare class ClientSettings {
  /**
   * Register a new game setting under this setting scope
   *
   * @param module   The namespace under which the setting is registered
   * @param key      The key name for the setting under the namespace module
   * @param data     Configuration for setting data
   */
  register(module: string, key: string, data: Object): void;

  /**
   * Get the value of a game setting for a certain module and setting key
   *
   * @param module   The module namespace under which the setting is registered
   * @param key      The setting key to retrieve
   */
  get(module: string, key: string): any;
}

/**
 * A reusable storage concept which blends the functionality of an Array with the efficient key-based lookup of a Map.
 * This concept is reused throughout Foundry VTT where a collection of uniquely identified elements is required.
 * @extends {Map}
 * @type {Map}
 */
declare class Collection<T> {
  /**
   * Get an element from the Collection by its key.
   * @param key    The key of the entry to retrieve
   * @param strict Throw an Error if the requested id does not exist, otherwise return null. Default false
   *
   * @return The retrieved entry value, if the key exists, otherwise undefined
   */
  get(key: string, strict?: boolean): T | undefined;

  /**
   * Transform each element of the Collection into a new form, returning an Array of transformed values
   * @param transformer The transformation function to apply to each entry value
   *
   * @return An Array of transformed values
   */
  map<U>(transformer: (entry: T) => U): Array<U>;
}

declare class Game {
  user: User;
  users: Collection<User>;
  settings: ClientSettings;
  i18n: Localization;
}

declare var game: Game;
