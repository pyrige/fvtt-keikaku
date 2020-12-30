export {};
import { TodoListWindow } from "./ui.js";

declare global {
  interface Window {
    todoListWindow: TodoListWindow;
  }
}
