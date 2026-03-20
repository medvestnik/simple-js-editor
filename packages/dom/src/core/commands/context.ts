import type { CommandResult, ListType } from '../types';

export type CommandContext = {
  editable: HTMLElement;
  codeArea: HTMLTextAreaElement;
  isCodeMode: () => boolean;
  insertHtmlAtSelection: (html: string) => void;
  toggleMode: () => CommandResult;
  prompt: (text: string) => string | null;
  onImageUpload?: (file: File) => Promise<{ src: string; alt?: string }>;
};

export function selectedRange(): Range | null {
  const sel = document.getSelection();
  if (!sel || sel.rangeCount === 0) return null;
  return sel.getRangeAt(0);
}

function unwrapTagInRange(tag: string, range: Range): boolean {
  let changed = false;
  const common = range.commonAncestorContainer;
  const scope = common instanceof HTMLElement ? common : common.parentElement;
  scope?.querySelectorAll(tag).forEach((node) => {
    if (!range.intersectsNode(node)) return;
    const parent = node.parentNode;
    if (!parent) return;
    while (node.firstChild) parent.insertBefore(node.firstChild, node);
    parent.removeChild(node);
    changed = true;
  });
  return changed;
}

export function toggleInlineTag(ctx: CommandContext, tag: string): CommandResult {
  const range = selectedRange();
  if (!range || range.collapsed) return { changed: false };
  const changed = unwrapTagInRange(tag, range);
  if (changed) return { changed: true };

  const el = document.createElement(tag);
  el.append(range.extractContents());
  range.insertNode(el);
  return { changed: true };
}

export function wrapStyle(ctx: CommandContext, style: string): CommandResult {
  const range = selectedRange();
  if (!range || range.collapsed) return { changed: false };
  const span = document.createElement('span');
  span.setAttribute('style', style);
  span.append(range.extractContents());
  range.insertNode(span);
  return { changed: true };
}

function closestBlock(node: Node | null, root: HTMLElement): HTMLElement | null {
  let cur: Node | null = node;
  while (cur && cur !== root) {
    if (cur instanceof HTMLElement && ['P', 'DIV', 'H1', 'H2', 'H3', 'BLOCKQUOTE', 'PRE', 'LI'].includes(cur.tagName)) return cur;
    cur = cur.parentNode;
  }
  return null;
}

export function setBlockType(ctx: CommandContext, tag: string): CommandResult {
  const range = selectedRange();
  if (!range) return { changed: false };
  const block = closestBlock(range.startContainer, ctx.editable);
  if (!block) return { changed: false };
  const repl = document.createElement(tag);
  repl.innerHTML = block.innerHTML;
  block.replaceWith(repl);
  return { changed: true };
}

export function setAlign(ctx: CommandContext, align: string): CommandResult {
  const range = selectedRange();
  if (!range) return { changed: false };
  const block = closestBlock(range.startContainer, ctx.editable);
  if (!block) return { changed: false };
  block.style.textAlign = align;
  return { changed: true };
}

export function toggleList(ctx: CommandContext, type: ListType): CommandResult {
  const range = selectedRange();
  if (!range) return { changed: false };
  const block = closestBlock(range.startContainer, ctx.editable);
  if (!block) return { changed: false };
  if (block.tagName.toLowerCase() === 'li') return { changed: false };
  const list = document.createElement(type);
  const li = document.createElement('li');
  li.innerHTML = block.innerHTML;
  list.appendChild(li);
  block.replaceWith(list);
  return { changed: true };
}

export function indentBlock(ctx: CommandContext, delta: number): CommandResult {
  const range = selectedRange();
  if (!range) return { changed: false };
  const block = closestBlock(range.startContainer, ctx.editable);
  if (!block) return { changed: false };
  const cur = Number.parseInt(block.style.marginLeft || '0', 10) || 0;
  block.style.marginLeft = `${Math.max(0, cur + delta)}px`;
  return { changed: true };
}

export function execFallback(command: string, value?: string): CommandResult {
  const ok = document.execCommand(command, false, value);
  return { changed: ok };
}
