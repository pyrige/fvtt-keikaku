export {};
import { TodoListWindow } from "./ui";

declare global {
  interface Window {
    todoListWindow: TodoListWindow;
  }

  interface LenientGlobalVariableTypes {
    game: Game;
  }
}
