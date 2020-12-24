/**
 * The User entity
 * Each player who connects to a Foundry Virtual Tabletop session is a User.
 * Users represent human beings (or possibly programmatic players) and are the cornerstone of identity in Foundry VTT.
 **/
declare class User {
  /** The source data for the User entity, usually retrieved from the database. **/
  data: object;

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

declare class Game {
  user: User;
}

declare var game: Game;
