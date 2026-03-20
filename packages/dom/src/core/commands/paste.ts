import type { CommandContext } from './context';
import { execFallback } from './context';

export async function paste(ctx: CommandContext, plainText = false) {
  try {
    const text = await navigator.clipboard.readText();
    const payload = plainText ? text : `<span>${text}</span>`;
    ctx.insertHtmlAtSelection(payload);
    return { changed: true };
  } catch {
    return execFallback('paste');
  }
}
