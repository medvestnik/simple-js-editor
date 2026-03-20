import type { CommandContext } from './context';
import { toggleInlineTag } from './context';
export const toggleItalic = (ctx: CommandContext) => toggleInlineTag(ctx, 'em');
