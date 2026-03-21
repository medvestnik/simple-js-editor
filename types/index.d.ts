export type ToolbarItem = {
  type?: string;
  id?: string;
  label?: string;
  title?: string;
  command?: string;
  payload?: unknown;
  onClick?: () => void;
  when?: () => boolean;
};

export type SimpleJsEditorOptions = {
  initialHTML?: string;
  readOnly?: boolean;
  toolbar?: 'full' | 'minimal' | { items: ToolbarItem[] };
  onChange?: (payload: { html: string; text: string; isDirty: boolean; source?: string }) => void;
  onImageUpload?: (file: File) => Promise<{ src: string; alt?: string }>;
};

export declare class SimpleJsEditor {
  constructor(targetEl: HTMLElement, options?: SimpleJsEditorOptions);
  getHTML(): string;
  setHTML(html: string): void;
  getText(): string;
  destroy(): void;
  undo(): void;
  redo(): void;
  focus(): void;
  setReadOnly(value: boolean): void;
  exec(commandId: string, payload?: unknown): unknown;
  getActiveMarks(): string[];
  getActiveBlock(): string;
  on(eventName: string, handler: (...args: unknown[]) => void): () => void;
  off(eventName: string, handler: (...args: unknown[]) => void): void;
}

export type CreateEditorOptions = {
  root: HTMLElement;
  value?: string;
  placeholder?: string;
  readOnly?: boolean;
  toolbar?: 'full' | 'minimal' | { items: ToolbarItem[] };
  onChange?: (payload: { html: string; text: string; isDirty: boolean }) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onImageUpload?: (file: File) => Promise<{ src: string; alt?: string }>;
};

export type EditorInstance = {
  getHtml(): string;
  setHtml(html: string): void;
  getText(): string;
  focus(): void;
  setReadOnly(isReadOnly: boolean): void;
  undo(): void;
  redo(): void;
  destroy(): void;
};

export declare function createEditor(opts: CreateEditorOptions): EditorInstance;
