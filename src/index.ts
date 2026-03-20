import { DomEditor } from '../packages/dom/src/editor-dom';
import './style.css';

export type CreateEditorOptions = {
  root: HTMLElement;
  value?: string;
  placeholder?: string;
  readOnly?: boolean;
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
  destroy(): void;
};

export function createEditor(opts: CreateEditorOptions): EditorInstance {
  const instance = new DomEditor({
    root: opts.root,
    value: opts.value || '<p></p>',
    placeholder: opts.placeholder,
    readOnly: opts.readOnly,
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
    destroy: () => instance.destroy()
  };
}
