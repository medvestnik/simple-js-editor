import type { EditorState, Transaction } from './types';

export function applyTransaction(state: EditorState, tr: Transaction): EditorState {
  return tr.ops.reduce<EditorState>((acc, op) => {
    if (op.type === 'setHtml') return { ...acc, html: op.html };
    if (op.type === 'setSelection') return { ...acc, selection: op.selection };
    if (op.type === 'setBlocks') return { ...acc, blocks: op.blocks };
    return acc;
  }, state);
}
