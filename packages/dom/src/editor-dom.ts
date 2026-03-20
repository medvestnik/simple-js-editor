import { executeCommand } from './core/commands';
import type { CommandResult, EditorMode, ToolbarItem } from './core/types';
import { EventBus } from './core/event-bus';
import { captureSelection, getBlockState, getSelectionState, isSelectionInside, restoreSelection } from './core/selection';
import { sanitizeHtml } from './core/sanitize';
import { EditorState } from './core/state';

export type ChangePayload = { html: string; text: string; isDirty: boolean };

export type DomEditorOptions = {
  root: HTMLElement;
  value: string;
  placeholder?: string;
  readOnly?: boolean;
  toolbar?: 'full' | 'minimal' | { items: ToolbarItem[] };
  onChange?: (payload: ChangePayload & { source?: string }) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onImageUpload?: (file: File) => Promise<{ src: string; alt?: string }>;
};

const FULL_TOOLBAR: ToolbarItem[] = [
  { type: 'select', id: 'mode', label: 'Mode', command: 'toggleCodeView', options: [{ label: 'Design', value: 'design' }, { label: 'Code', value: 'code' }] },
  { type: 'select', id: 'block', label: 'Block', command: 'setBlockType', options: ['p', 'div', 'h1', 'h2', 'h3'].map((v) => ({ label: v, value: v })) },
  { type: 'button', id: 'bold', label: 'B', command: 'toggleBold' },
  { type: 'button', id: 'italic', label: 'I', command: 'toggleItalic' },
  { type: 'button', id: 'underline', label: 'U', command: 'toggleUnderline' },
  { type: 'select', id: 'font', label: 'Font', command: 'setFontFamily', options: ['Inter', 'Arial', 'Georgia', 'Times New Roman', 'Courier New'].map((v) => ({ label: v, value: v })) },
  { type: 'select', id: 'size', label: 'Size', command: 'setFontSize', options: ['12px', '14px', '16px', '18px', '20px', '24px', '32px'].map((v) => ({ label: v, value: v })) },
  { type: 'button', id: 'link', label: 'Link', command: 'insertLink' },
  { type: 'button', id: 'unlink', label: 'Unlink', command: 'removeLink' },
  { type: 'button', id: 'image', label: 'Image', command: 'insertImage' },
  { type: 'button', id: 'left', label: 'Left', command: 'setAlign', payload: 'left' },
  { type: 'button', id: 'center', label: 'Center', command: 'setAlign', payload: 'center' },
  { type: 'button', id: 'right', label: 'Right', command: 'setAlign', payload: 'right' },
  { type: 'button', id: 'justify', label: 'Justify', command: 'setAlign', payload: 'justify' },
  { type: 'button', id: 'ol', label: 'OL', command: 'toggleList', payload: 'ol' },
  { type: 'button', id: 'ul', label: 'UL', command: 'toggleList', payload: 'ul' },
  { type: 'button', id: 'copy', label: 'Copy', command: 'copy' },
  { type: 'button', id: 'cut', label: 'Cut', command: 'cut' },
  { type: 'button', id: 'paste', label: 'Paste', command: 'paste' },
  { type: 'button', id: 'pastePlain', label: 'Paste as text', command: 'pastePlainText' },
  { type: 'button', id: 'indent', label: 'Indent', command: 'indent' },
  { type: 'button', id: 'outdent', label: 'Outdent', command: 'outdent' },
  { type: 'button', id: 'clear', label: 'Clear', command: 'clearFormatting' },
  { type: 'button', id: 'undo', label: 'Undo', command: 'undo' },
  { type: 'button', id: 'redo', label: 'Redo', command: 'redo' }
];

const MINIMAL_TOOLBAR: ToolbarItem[] = [
  { type: 'button', id: 'bold', label: 'B', command: 'toggleBold' },
  { type: 'button', id: 'italic', label: 'I', command: 'toggleItalic' },
  { type: 'button', id: 'ul', label: 'UL', command: 'toggleList', payload: 'ul' },
  { type: 'button', id: 'ol', label: 'OL', command: 'toggleList', payload: 'ol' },
  { type: 'button', id: 'link', label: 'Link', command: 'insertLink' },
  { type: 'button', id: 'clear', label: 'Clear', command: 'clearFormatting' }
];

export class DomEditor {
  private root: HTMLElement;
  private toolbar: HTMLElement;
  private editable: HTMLElement;
  private codeArea: HTMLTextAreaElement;
  private mode: EditorMode = 'design';
  private opts: DomEditorOptions;
  private state: EditorState;
  private bus = new EventBus();
  private toolbarControls = new Map<string, HTMLElement>();
  private rafSelection: number | null = null;
  private changeTimer: number | null = null;

  constructor(opts: DomEditorOptions) {
    this.opts = opts;
    this.root = opts.root;
    this.root.classList.add('sje-root');
    this.root.innerHTML = '';

    this.toolbar = document.createElement('div');
    this.toolbar.className = 'sje-toolbar';
    this.editable = document.createElement('div');
    this.editable.className = 'sje-editor';
    this.editable.contentEditable = String(!opts.readOnly);
    this.editable.dataset.placeholder = opts.placeholder || 'Введите текст…';

    this.codeArea = document.createElement('textarea');
    this.codeArea.className = 'sje-code';
    this.codeArea.hidden = true;

    this.root.append(this.toolbar, this.editable, this.codeArea);

    const clean = sanitizeHtml(opts.value || '<p></p>');
    this.state = new EditorState(clean, !!opts.readOnly);
    this.editable.innerHTML = clean;

    this.buildToolbar();
    this.bind();
  }

  private getToolbarItems(): ToolbarItem[] {
    if (!this.opts.toolbar || this.opts.toolbar === 'full') return FULL_TOOLBAR;
    if (this.opts.toolbar === 'minimal') return MINIMAL_TOOLBAR;
    return this.opts.toolbar.items;
  }

  private bind(): void {
    this.editable.addEventListener('input', () => {
      this.state.setHtml(this.getHtml());
      this.state.scheduleTypingSnapshot({ html: this.state.html, selection: captureSelection(this.editable) });
      this.emitChange('input');
    });

    this.editable.addEventListener('keydown', (e) => this.handleKeydown(e));
    this.editable.addEventListener('paste', (e) => this.handlePaste(e));
    this.editable.addEventListener('focus', () => {
      this.opts.onFocus?.();
      this.bus.emit('focus', undefined);
    });
    this.editable.addEventListener('blur', () => {
      this.opts.onBlur?.();
      this.bus.emit('blur', undefined);
    });

    this.codeArea.addEventListener('input', () => {
      this.state.setHtml(sanitizeHtml(this.codeArea.value));
    });

    document.addEventListener('selectionchange', this.onSelectionChange);
  }

  private onSelectionChange = (): void => {
    if (!isSelectionInside(this.editable)) return;
    if (this.rafSelection) cancelAnimationFrame(this.rafSelection);
    this.rafSelection = requestAnimationFrame(() => {
      this.refreshToolbarState();
      this.bus.emit('selectionChange', getSelectionState(this.editable));
    });
  };

  private handleKeydown(e: KeyboardEvent): void {
    const mod = e.metaKey || e.ctrlKey;
    if (mod && e.key.toLowerCase() === 'b') return this.shortcut(e, () => this.exec('toggleBold'));
    if (mod && e.key.toLowerCase() === 'i') return this.shortcut(e, () => this.exec('toggleItalic'));
    if (mod && e.key.toLowerCase() === 'u') return this.shortcut(e, () => this.exec('toggleUnderline'));
    if (mod && e.key.toLowerCase() === 'k') return this.shortcut(e, () => this.exec('insertLink'));
    if (mod && e.key.toLowerCase() === 'z' && !e.shiftKey) return this.shortcut(e, () => this.undo());
    if ((mod && e.key.toLowerCase() === 'z' && e.shiftKey) || (e.ctrlKey && e.key.toLowerCase() === 'y')) return this.shortcut(e, () => this.redo());
    if (e.key === 'Tab') return this.shortcut(e, () => this.exec(e.shiftKey ? 'outdent' : 'indent'));
    if (mod && e.shiftKey && e.key.toLowerCase() === 'v') return this.shortcut(e, () => this.exec('pastePlainText'));
  }

  private handlePaste(e: ClipboardEvent): void {
    e.preventDefault();
    const html = e.clipboardData?.getData('text/html');
    const text = e.clipboardData?.getData('text/plain') ?? '';
    const safe = html ? sanitizeHtml(html) : text;
    this.insertHtmlAtSelection(html ? safe : text);
    this.pushHistoryAndChange('paste');
  }

  private shortcut(e: KeyboardEvent, fn: () => void): void {
    e.preventDefault();
    fn();
  }

  private createButton(item: ToolbarItem): HTMLButtonElement {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'sje-btn';
    b.textContent = item.label || item.id;
    b.title = item.title || '';
    b.addEventListener('click', async () => {
      if (item.onClick) item.onClick();
      else if (item.command === 'undo') this.undo();
      else if (item.command === 'redo') this.redo();
      else if (item.command) await this.exec(item.command, item.payload);
    });
    this.toolbarControls.set(item.id, b);
    return b;
  }

  private createSelect(item: ToolbarItem): HTMLSelectElement {
    const s = document.createElement('select');
    s.className = 'sje-select';
    item.options?.forEach((o) => {
      const op = document.createElement('option');
      op.value = o.value;
      op.textContent = o.label;
      s.appendChild(op);
    });
    s.addEventListener('change', async () => {
      if (item.id === 'mode') {
        await this.exec('toggleCodeView', s.value);
      } else if (item.command) {
        await this.exec(item.command, s.value);
      }
    });
    this.toolbarControls.set(item.id, s);
    return s;
  }

  private buildToolbar(): void {
    this.toolbar.innerHTML = '';
    this.getToolbarItems().forEach((item) => {
      if (item.type === 'separator') {
        const sep = document.createElement('span');
        sep.className = 'sje-separator';
        this.toolbar.appendChild(sep);
      }
      if (item.type === 'button') this.toolbar.appendChild(this.createButton(item));
      if (item.type === 'select') this.toolbar.appendChild(this.createSelect(item));
    });
  }

  private refreshToolbarState(): void {
    const state = getSelectionState(this.editable);
    const isRO = this.state.readOnly;
    const setActive = (id: string, active: boolean) => this.toolbarControls.get(id)?.classList.toggle('is-active', active);

    setActive('bold', state.marks.bold);
    setActive('italic', state.marks.italic);
    setActive('underline', state.marks.underline);
    setActive('link', state.marks.link);
    setActive('ul', state.block.list === 'ul');
    setActive('ol', state.block.list === 'ol');
    setActive('left', state.block.align === 'left');
    setActive('center', state.block.align === 'center');
    setActive('right', state.block.align === 'right');
    setActive('justify', state.block.align === 'justify');

    this.toolbarControls.forEach((el, id) => {
      if (el instanceof HTMLButtonElement || el instanceof HTMLSelectElement) {
        el.disabled = isRO && !['copy'].includes(id);
      }
    });

    const block = this.toolbarControls.get('block');
    if (block instanceof HTMLSelectElement) block.value = state.block.type;
    const mode = this.toolbarControls.get('mode');
    if (mode instanceof HTMLSelectElement) mode.value = this.mode;
  }

  private async pushHistoryAndChange(source = 'command'): Promise<void> {
    const html = this.getHtml();
    this.state.setHtml(html);
    this.state.pushHistory({ html, selection: captureSelection(this.editable) });
    this.emitChange(source);
  }

  private emitChange(source = 'command'): void {
    if (this.changeTimer) window.clearTimeout(this.changeTimer);
    this.changeTimer = window.setTimeout(() => {
      const payload = { html: this.getHtml(), text: this.getText(), isDirty: this.state.isDirty(), source };
      this.opts.onChange?.(payload);
      this.bus.emit('change', payload);
    }, 100);
  }

  private toggleMode(target?: string): CommandResult {
    const next: EditorMode = target === 'code' || (target !== 'design' && this.mode === 'design') ? 'code' : 'design';
    if (next === this.mode) return { changed: false };

    if (next === 'code') {
      this.codeArea.value = this.getHtml();
      this.codeArea.hidden = false;
      this.editable.hidden = true;
    } else {
      const safe = sanitizeHtml(this.codeArea.value);
      this.editable.innerHTML = safe;
      this.codeArea.hidden = true;
      this.editable.hidden = false;
      this.state.setHtml(safe);
      this.state.pushHistory({ html: safe, selection: null });
      this.emitChange('code');
    }

    this.mode = next;
    this.state.mode = next;
    this.bus.emit('modeChange', { mode: this.mode });
    this.refreshToolbarState();
    return { changed: true };
  }

  async exec(commandId: string, payload?: unknown): Promise<CommandResult> {
    if (this.state.readOnly && !['copy'].includes(commandId)) return { changed: false };
    if (commandId === 'undo') return this.undo();
    if (commandId === 'redo') return this.redo();

    const result = await executeCommand(
      {
        editable: this.editable,
        codeArea: this.codeArea,
        isCodeMode: () => this.mode === 'code',
        insertHtmlAtSelection: (html) => this.insertHtmlAtSelection(html),
        toggleMode: () => this.toggleMode(payload as string | undefined),
        prompt: (text) => window.prompt(text),
        onImageUpload: this.opts.onImageUpload
      },
      commandId,
      payload
    );

    if (result.changed) await this.pushHistoryAndChange(commandId);
    this.refreshToolbarState();
    return result;
  }

  private insertHtmlAtSelection(html: string): void {
    const range = document.getSelection()?.rangeCount ? document.getSelection()!.getRangeAt(0) : null;
    if (!range) return;
    const frag = range.createContextualFragment(html);
    range.deleteContents();
    range.insertNode(frag);
  }

  getHtml(): string {
    return sanitizeHtml(this.mode === 'code' ? this.codeArea.value : this.editable.innerHTML || '<p></p>');
  }

  setHtml(html: string): void {
    const safe = sanitizeHtml(html);
    this.editable.innerHTML = safe;
    this.codeArea.value = safe;
    this.state.setHtml(safe);
    this.refreshToolbarState();
  }

  getText(): string {
    return this.editable.textContent?.trim() || '';
  }

  getActiveMarks() {
    return getSelectionState(this.editable).marks;
  }

  getActiveBlock() {
    return getBlockState(this.editable);
  }

  setReadOnly(readOnly: boolean): void {
    this.state.readOnly = readOnly;
    this.editable.contentEditable = String(!readOnly);
    this.codeArea.readOnly = readOnly;
    this.refreshToolbarState();
    this.bus.emit('readOnlyChange', { readOnly });
  }

  focus(): void {
    if (this.mode === 'code') this.codeArea.focus();
    else this.editable.focus();
  }

  undo(): CommandResult {
    this.state.flushTypingSnapshot({ html: this.getHtml(), selection: captureSelection(this.editable) });
    const prev = this.state.undo({ html: this.getHtml(), selection: captureSelection(this.editable) });
    if (!prev) return { changed: false };
    this.editable.innerHTML = prev.html;
    this.state.setHtml(prev.html);
    restoreSelection(this.editable, prev.selection);
    this.emitChange('undo');
    return { changed: true };
  }

  redo(): CommandResult {
    const next = this.state.redo({ html: this.getHtml(), selection: captureSelection(this.editable) });
    if (!next) return { changed: false };
    this.editable.innerHTML = next.html;
    this.state.setHtml(next.html);
    restoreSelection(this.editable, next.selection);
    this.emitChange('redo');
    return { changed: true };
  }

  on(eventName: 'change' | 'selectionChange' | 'modeChange' | 'focus' | 'blur' | 'readOnlyChange', handler: any): () => void {
    return this.bus.on(eventName as any, handler);
  }

  off(eventName: 'change' | 'selectionChange' | 'modeChange' | 'focus' | 'blur' | 'readOnlyChange', handler: any): void {
    this.bus.off(eventName as any, handler);
  }

  destroy(): void {
    document.removeEventListener('selectionchange', this.onSelectionChange);
    if (this.rafSelection) cancelAnimationFrame(this.rafSelection);
    this.root.innerHTML = '';
  }
}
