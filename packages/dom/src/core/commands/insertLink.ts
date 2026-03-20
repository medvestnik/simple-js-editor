import type { CommandContext } from './context';
import { selectedRange } from './context';
export function insertLink(ctx: CommandContext, url?: string) {
  const href = url || ctx.prompt('URL');
  const range = selectedRange();
  if (!href || !range || range.collapsed) return { changed: false };
  const a = document.createElement('a');
  a.setAttribute('href', href);
  a.setAttribute('target', '_blank');
  a.setAttribute('rel', 'noopener noreferrer');
  a.append(range.extractContents());
  range.insertNode(a);
  return { changed: true };
}
