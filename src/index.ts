import { DomEditor } from '../packages/dom/src/editor-dom';
import './style.css';

export type ToolbarItem = import('../packages/dom/src/core/types').ToolbarItem;

export type SimpleJsEditorOptions = {
  initialHTML?: string;
  readOnly?: boolean;
  toolbar?: 'full' | 'minimal' | { items: ToolbarItem[] };
  onChange?: (payload: { html: string; text: string; isDirty: boolean; source?: string }) => void;
  onImageUpload?: (file: File) => Promise<{ src: string; alt?: string }>;
};

export class SimpleJsEditor {
  private editor: DomEditor;

  constructor(targetEl: HTMLElement, options: SimpleJsEditorOptions = {}) {
    this.editor = new DomEditor({
      root: targetEl,
      value: options.initialHTML || '<p></p>',
      readOnly: options.readOnly,
      toolbar: options.toolbar,
      onChange: options.onChange,
      onImageUpload: options.onImageUpload
    });
  }

  getHTML(): string { return this.editor.getHtml(); }
  setHTML(html: string): void { this.editor.setHtml(html); }
  getText(): string { return this.editor.getText(); }
  destroy(): void { this.editor.destroy(); }
  undo() { return this.editor.undo(); }
  redo() { return this.editor.redo(); }
  focus() { this.editor.focus(); }
  setReadOnly(value: boolean) { this.editor.setReadOnly(value); }
  exec(commandId: string, payload?: unknown) { return this.editor.exec(commandId, payload); }
  getActiveMarks() { return this.editor.getActiveMarks(); }
  getActiveBlock() { return this.editor.getActiveBlock(); }
  on(eventName: any, handler: any) { return this.editor.on(eventName, handler); }
  off(eventName: any, handler: any) { this.editor.off(eventName, handler); }
}

// backwards compatibility
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

export function createEditor(opts: CreateEditorOptions): EditorInstance {
  const instance = new DomEditor({
    root: opts.root,
    value: opts.value || '<p></p>',
    placeholder: opts.placeholder,
    readOnly: opts.readOnly,
    toolbar: opts.toolbar,
    onChange: opts.onChange,
    onFocus: opts.onFocus,
    onBlur: opts.onBlur,
    onImageUpload: opts.onImageUpload
  });

  return {
    getHtml: () => instance.getHtml(),
    setHtml: (html) => instance.setHtml(html),
    getText: () => instance.getText(),
    focus: () => instance.focus(),
    setReadOnly: (value) => instance.setReadOnly(value),
    undo: () => { instance.undo(); },
    redo: () => { instance.redo(); },
    destroy: () => instance.destroy()
  };
}
