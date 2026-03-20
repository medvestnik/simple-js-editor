import { HistoryStack } from '../../core/src/history';
import { sanitizeHtml } from '../../../src/sanitize';

export type ChangePayload = { html: string; text: string; isDirty: boolean };

export type DomEditorOptions = {
  root: HTMLElement;
  value: string;
  placeholder?: string;
  readOnly?: boolean;
  onChange?: (payload: ChangePayload) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onImageUpload?: (file: File) => Promise<{ src: string; alt?: string }>;
};

const BLOCKS = new Set(['P', 'DIV', 'H1', 'H2', 'H3', 'BLOCKQUOTE', 'PRE', 'LI']);

export class DomEditor {
  private root: HTMLElement;
  private toolbar: HTMLElement;
  private editable: HTMLElement;
  private codeArea: HTMLTextAreaElement;
  private output: HTMLElement;
  private mode: 'design' | 'code' = 'design';
  private initialHtml: string;
  private history = new HistoryStack<string>();
  private composing = false;
  private opts: DomEditorOptions;

  constructor(opts: DomEditorOptions) {
    this.opts = opts;
    this.root = opts.root;
    this.root.classList.add('jse-root');
    this.root.innerHTML = '';

    this.toolbar = document.createElement('div');
    this.toolbar.className = 'jse-toolbar';
    this.editable = document.createElement('div');
    this.editable.className = 'jse-editor';
    this.editable.contentEditable = String(!opts.readOnly);
    this.editable.dataset.placeholder = opts.placeholder || 'Введите текст…';

    this.codeArea = document.createElement('textarea');
    this.codeArea.className = 'jse-code';
    this.codeArea.hidden = true;

    this.output = document.createElement('pre');
    this.output.className = 'jse-output';

    this.root.append(this.toolbar, this.editable, this.codeArea, this.output);
    this.initialHtml = sanitizeHtml(opts.value || '<p></p>');
    this.setHtml(this.initialHtml);
    this.buildToolbar();
    this.bind();
  }

  private bind(): void {
    this.editable.addEventListener('compositionstart', () => (this.composing = true));
    this.editable.addEventListener('compositionend', () => {
      this.composing = false;
      this.emitChange();
    });

    this.editable.addEventListener('input', () => {
      if (this.composing) return;
      this.history.push(this.getHtml());
      this.emitChange();
    });

    this.editable.addEventListener('focus', () => this.opts.onFocus?.());
    this.editable.addEventListener('blur', () => this.opts.onBlur?.());

    this.editable.addEventListener('keydown', (e) => this.handleKeydown(e));

    this.editable.addEventListener('paste', (e) => {
      e.preventDefault();
      const html = e.clipboardData?.getData('text/html');
      const text = e.clipboardData?.getData('text/plain') ?? '';
      const safe = sanitizeHtml(html || `<p>${text}</p>`);
      this.insertHtmlAtSelection(safe);
      this.emitChange();
    });

    this.codeArea.addEventListener('input', () => {
      this.output.textContent = sanitizeHtml(this.codeArea.value);
    });
  }

  private handleKeydown(e: KeyboardEvent): void {
    const mod = e.metaKey || e.ctrlKey;
    if (mod && e.key.toLowerCase() === 'b') return this.shortcut(e, () => this.toggleInline('strong'));
    if (mod && e.key.toLowerCase() === 'i') return this.shortcut(e, () => this.toggleInline('em'));
    if (mod && e.key.toLowerCase() === 'u') return this.shortcut(e, () => this.toggleInline('u'));
    if (mod && e.key.toLowerCase() === 'k') return this.shortcut(e, () => this.openLinkPrompt());
    if (mod && e.key.toLowerCase() === 'z' && !e.shiftKey) return this.shortcut(e, () => this.undo());
    if (mod && e.key.toLowerCase() === 'z' && e.shiftKey) return this.shortcut(e, () => this.redo());
    if (e.key === 'Tab') {
      e.preventDefault();
      this.indent(e.shiftKey ? -24 : 24);
    }
  }

  private shortcut(e: KeyboardEvent, fn: () => void): void {
    e.preventDefault();
    fn();
  }

  private button(label: string, onClick: () => void): HTMLButtonElement {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'jse-btn';
    b.textContent = label;
    b.addEventListener('click', onClick);
    return b;
  }

  private select(options: string[], onChange: (v: string) => void): HTMLSelectElement {
    const s = document.createElement('select');
    s.className = 'jse-select';
    options.forEach((o) => {
      const op = document.createElement('option');
      op.value = o;
      op.textContent = o;
      s.appendChild(op);
    });
    s.addEventListener('change', () => onChange(s.value));
    return s;
  }

  private buildToolbar(): void {
    const mode = this.select(['design', 'code'], (v) => this.toggleMode(v as 'design' | 'code'));
    const block = this.select(['p', 'div', 'h1', 'h2', 'h3'], (v) => this.formatBlock(v));
    const ff = this.select(['Inter', 'Arial', 'Georgia', 'Times New Roman', 'Courier New'], (v) => this.applySpanStyle(`font-family:${v}`));
    const fs = this.select(['12px', '14px', '16px', '18px', '20px', '24px', '32px'], (v) => this.applySpanStyle(`font-size:${v}`));

    this.toolbar.append(
      mode,
      block,
      this.button('B', () => this.toggleInline('strong')),
      this.button('I', () => this.toggleInline('em')),
      this.button('U', () => this.toggleInline('u')),
      ff,
      fs,
      this.button('Link', () => this.openLinkPrompt()),
      this.button('Unlink', () => this.unwrapTag('a')),
      this.button('Image', () => this.addImage()),
      this.button('Left', () => this.align('left')),
      this.button('Center', () => this.align('center')),
      this.button('Right', () => this.align('right')),
      this.button('Justify', () => this.align('justify')),
      this.button('UL', () => this.toggleList('ul')),
      this.button('OL', () => this.toggleList('ol')),
      this.button('Indent', () => this.indent(24)),
      this.button('Outdent', () => this.indent(-24)),
      this.button('Clear', () => this.clearFormatting()),
      this.button('Copy', () => this.clipboard('copy')),
      this.button('Cut', () => this.clipboard('cut')),
      this.button('Paste', () => this.clipboard('paste')),
      this.button('Undo', () => this.undo()),
      this.button('Redo', () => this.redo())
    );
  }

  private toggleMode(mode: 'design' | 'code'): void {
    if (mode === this.mode) return;
    this.mode = mode;
    if (mode === 'code') {
      this.codeArea.value = this.getHtml();
      this.codeArea.hidden = false;
      this.editable.hidden = true;
    } else {
      this.setHtml(this.codeArea.value);
      this.codeArea.hidden = true;
      this.editable.hidden = false;
    }
  }

  private selectedRange(): Range | null {
    const sel = document.getSelection();
    if (!sel || sel.rangeCount === 0) return null;
    return sel.getRangeAt(0);
  }

  private wrapRange(tag: string, attrs?: Record<string, string>): void {
    const range = this.selectedRange();
    if (!range || range.collapsed) return;
    const el = document.createElement(tag);
    Object.entries(attrs || {}).forEach(([k, v]) => el.setAttribute(k, v));
    el.append(range.extractContents());
    range.insertNode(el);
    this.emitChange();
  }

  private toggleInline(tag: string): void { this.wrapRange(tag); }

  private applySpanStyle(style: string): void { this.wrapRange('span', { style }); }

  private unwrapTag(tag: string): void {
    this.editable.querySelectorAll(tag).forEach((node) => {
      const parent = node.parentNode;
      if (!parent) return;
      while (node.firstChild) parent.insertBefore(node.firstChild, node);
      parent.removeChild(node);
    });
    this.emitChange();
  }

  private openLinkPrompt(): void {
    const href = window.prompt('URL');
    if (!href) return;
    this.wrapRange('a', { href, target: '_blank', rel: 'noopener noreferrer' });
  }

  private async addImage(): Promise<void> {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.click();
    input.addEventListener('change', async () => {
      const file = input.files?.[0];
      if (!file) return;
      try {
        let src = '';
        let alt = '';
        if (this.opts.onImageUpload) {
          const res = await this.opts.onImageUpload(file);
          src = res.src;
          alt = res.alt || '';
        } else {
          src = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result || ''));
            reader.onerror = () => reject(new Error('Failed to read image'));
            reader.readAsDataURL(file);
          });
        }
        this.insertHtmlAtSelection(`<img src="${src}" alt="${alt}"/>`);
        this.emitChange();
      } catch (err) {
        window.alert((err as Error).message || 'Image upload failed');
      }
    });
  }

  private closestBlock(node: Node | null): HTMLElement | null {
    let cur: Node | null = node;
    while (cur && cur !== this.editable) {
      if (cur instanceof HTMLElement && BLOCKS.has(cur.tagName)) return cur;
      cur = cur.parentNode;
    }
    return null;
  }

  private formatBlock(tag: string): void {
    const range = this.selectedRange();
    if (!range) return;
    const block = this.closestBlock(range.startContainer);
    if (!block) return;
    const repl = document.createElement(tag);
    repl.innerHTML = block.innerHTML;
    block.replaceWith(repl);
    this.emitChange();
  }

  private align(value: 'left' | 'center' | 'right' | 'justify'): void {
    const range = this.selectedRange();
    const block = range ? this.closestBlock(range.startContainer) : null;
    if (!block) return;
    block.style.textAlign = value;
    this.emitChange();
  }

  private toggleList(tag: 'ul' | 'ol'): void {
    const range = this.selectedRange();
    const block = range ? this.closestBlock(range.startContainer) : null;
    if (!block) return;
    if (block.tagName.toLowerCase() === 'li') return;
    const list = document.createElement(tag);
    const li = document.createElement('li');
    li.innerHTML = block.innerHTML;
    list.appendChild(li);
    block.replaceWith(list);
    this.emitChange();
  }

  private indent(delta: number): void {
    const range = this.selectedRange();
    const block = range ? this.closestBlock(range.startContainer) : null;
    if (!block) return;
    const cur = Number.parseInt(block.style.marginLeft || '0', 10) || 0;
    block.style.marginLeft = `${Math.max(0, cur + delta)}px`;
    this.emitChange();
  }

  private clearFormatting(): void {
    const text = this.getText();
    this.setHtml(`<p>${text}</p>`);
    this.emitChange();
  }

  private async clipboard(action: 'copy' | 'cut' | 'paste'): Promise<void> {
    try {
      const selection = document.getSelection()?.toString() ?? '';
      if (action === 'copy') await navigator.clipboard.writeText(selection);
      if (action === 'cut') {
        await navigator.clipboard.writeText(selection);
        this.selectedRange()?.deleteContents();
      }
      if (action === 'paste') {
        const text = await navigator.clipboard.readText();
        this.insertHtmlAtSelection(`<span>${text}</span>`);
      }
      this.emitChange();
    } catch {
      document.execCommand(action);
    }
  }

  private insertHtmlAtSelection(html: string): void {
    const range = this.selectedRange();
    if (!range) return;
    const frag = range.createContextualFragment(html);
    range.deleteContents();
    range.insertNode(frag);
  }

  private emitChange(): void {
    const html = this.getHtml();
    this.output.textContent = html;
    this.opts.onChange?.({ html, text: this.getText(), isDirty: html !== this.initialHtml });
  }

  getHtml(): string {
    return sanitizeHtml(this.editable.innerHTML || '<p></p>');
  }

  setHtml(html: string): void {
    this.editable.innerHTML = sanitizeHtml(html);
    this.output.textContent = this.getHtml();
  }

  getText(): string {
    return this.editable.textContent?.trim() || '';
  }

  setReadOnly(readOnly: boolean): void {
    this.editable.contentEditable = String(!readOnly);
  }

  focus(): void {
    this.editable.focus();
  }

  undo(): void {
    const prev = this.history.undo(this.getHtml());
    if (prev) this.setHtml(prev);
  }

  redo(): void {
    const next = this.history.redo(this.getHtml());
    if (next) this.setHtml(next);
  }

  destroy(): void {
    this.root.innerHTML = '';
  }
}
