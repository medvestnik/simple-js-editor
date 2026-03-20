import type { CommandContext } from './context';
export function clearFormatting(ctx: CommandContext) {
  const text = ctx.editable.textContent?.trim() || '';
  ctx.editable.innerHTML = `<p>${text}</p>`;
  return { changed: true };
}
