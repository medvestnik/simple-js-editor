export class HistoryStack<T> {
  private undoStack: T[] = [];
  private redoStack: T[] = [];

  push(value: T): void {
    this.undoStack.push(value);
    this.redoStack = [];
  }

  undo(current: T): T | null {
    const prev = this.undoStack.pop();
    if (!prev) return null;
    this.redoStack.push(current);
    return prev;
  }

  redo(current: T): T | null {
    const next = this.redoStack.pop();
    if (!next) return null;
    this.undoStack.push(current);
    return next;
  }
}
