import type { CommandContext } from './context';
export function removeLink(ctx: CommandContext) {
  let changed = false;
  ctx.editable.querySelectorAll('a').forEach((node) => {
    const parent = node.parentNode;
    if (!parent) return;
    while (node.firstChild) parent.insertBefore(node.firstChild, node);
    parent.removeChild(node);
    changed = true;
  });
  return { changed };
}
