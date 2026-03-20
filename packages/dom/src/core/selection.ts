import type { ActiveBlock, ActiveMarks, AlignType, EditorSelectionState, SelectionSnapshot } from './types';

function pathFromNode(root: HTMLElement, node: Node): number[] {
  const path: number[] = [];
  let cur: Node | null = node;
  while (cur && cur !== root) {
    const parent = cur.parentNode;
    if (!parent) break;
    path.unshift(Array.prototype.indexOf.call(parent.childNodes, cur));
    cur = parent;
  }
  return path;
}

function nodeFromPath(root: HTMLElement, path: number[]): Node | null {
  let cur: Node = root;
  for (const idx of path) {
    const next = cur.childNodes.item(idx);
    if (!next) return null;
    cur = next;
  }
  return cur;
}

export function isSelectionInside(root: HTMLElement): boolean {
  const sel = document.getSelection();
  if (!sel || sel.rangeCount === 0) return false;
  const range = sel.getRangeAt(0);
  return root.contains(range.startContainer) && root.contains(range.endContainer);
}

export function captureSelection(root: HTMLElement): SelectionSnapshot | null {
  const sel = document.getSelection();
  if (!sel || sel.rangeCount === 0) return null;
  const range = sel.getRangeAt(0);
  if (!root.contains(range.startContainer) || !root.contains(range.endContainer)) return null;
  return {
    startPath: pathFromNode(root, range.startContainer),
    startOffset: range.startOffset,
    endPath: pathFromNode(root, range.endContainer),
    endOffset: range.endOffset
  };
}

export function restoreSelection(root: HTMLElement, snapshot: SelectionSnapshot | null): void {
  if (!snapshot) return;
  const start = nodeFromPath(root, snapshot.startPath);
  const end = nodeFromPath(root, snapshot.endPath);
  if (!start || !end) return;
  const range = document.createRange();
  range.setStart(start, Math.min(snapshot.startOffset, start.textContent?.length ?? start.childNodes.length));
  range.setEnd(end, Math.min(snapshot.endOffset, end.textContent?.length ?? end.childNodes.length));
  const sel = document.getSelection();
  sel?.removeAllRanges();
  sel?.addRange(range);
}

function closestTag(node: Node | null, root: HTMLElement, tags: string[]): HTMLElement | null {
  let cur: Node | null = node;
  while (cur && cur !== root) {
    if (cur instanceof HTMLElement && tags.includes(cur.tagName.toLowerCase())) return cur;
    cur = cur.parentNode;
  }
  return null;
}

function getMarks(root: HTMLElement): ActiveMarks {
  const sel = document.getSelection();
  const node = sel?.anchorNode ?? null;
  const bold = !!closestTag(node, root, ['strong', 'b']) || document.queryCommandState?.('bold') || false;
  const italic = !!closestTag(node, root, ['em', 'i']) || document.queryCommandState?.('italic') || false;
  const underline = !!closestTag(node, root, ['u']) || document.queryCommandState?.('underline') || false;
  const link = !!closestTag(node, root, ['a']);
  return { bold, italic, underline, link };
}

export function getBlockState(root: HTMLElement): ActiveBlock {
  const sel = document.getSelection();
  const node = sel?.anchorNode ?? null;
  const block = closestTag(node, root, ['p', 'div', 'h1', 'h2', 'h3', 'li', 'blockquote', 'pre']) ?? root;
  const list = closestTag(node, root, ['ul', 'ol'])?.tagName.toLowerCase() as 'ul' | 'ol' | undefined;
  const align = (block instanceof HTMLElement && block.style.textAlign ? block.style.textAlign : 'left') as AlignType;
  const indent = Number.parseInt((block as HTMLElement).style?.marginLeft || '0', 10) || 0;
  return { type: block === root ? 'p' : block.tagName.toLowerCase(), align, list: list ?? null, indent };
}

export function getSelectionState(root: HTMLElement): EditorSelectionState {
  const sel = document.getSelection();
  const hasSelection = !!sel && sel.rangeCount > 0 && !sel.getRangeAt(0).collapsed && isSelectionInside(root);
  return {
    marks: getMarks(root),
    block: getBlockState(root),
    hasSelection
  };
}
