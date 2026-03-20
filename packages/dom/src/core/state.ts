import type { EditorMode, HistoryEntry, SelectionSnapshot } from './types';

export class EditorState {
  private undoStack: HistoryEntry[] = [];
  private redoStack: HistoryEntry[] = [];
  private typingTimer: number | null = null;

  html: string;
  initialHtml: string;
  mode: EditorMode = 'design';
  readOnly = false;

  constructor(initialHtml: string, readOnly: boolean) {
    this.html = initialHtml;
    this.initialHtml = initialHtml;
    this.readOnly = readOnly;
  }

  setHtml(html: string): void {
    this.html = html;
  }

  scheduleTypingSnapshot(entry: HistoryEntry, delay = 400): void {
    if (this.typingTimer) window.clearTimeout(this.typingTimer);
    this.typingTimer = window.setTimeout(() => {
      this.pushHistory(entry);
      this.typingTimer = null;
    }, delay);
  }

  pushHistory(entry: HistoryEntry): void {
    const last = this.undoStack[this.undoStack.length - 1];
    if (last && last.html === entry.html) return;
    this.undoStack.push(entry);
    this.redoStack = [];
  }

  undo(current: HistoryEntry): HistoryEntry | null {
    const prev = this.undoStack.pop();
    if (!prev) return null;
    this.redoStack.push(current);
    return prev;
  }

  redo(current: HistoryEntry): HistoryEntry | null {
    const next = this.redoStack.pop();
    if (!next) return null;
    this.undoStack.push(current);
    return next;
  }

  isDirty(): boolean {
    return this.html !== this.initialHtml;
  }

  flushTypingSnapshot(current: { html: string; selection: SelectionSnapshot | null }): void {
    if (this.typingTimer) {
      window.clearTimeout(this.typingTimer);
      this.typingTimer = null;
      this.pushHistory(current);
    }
  }
}
