import type { CommandContext } from './context';
import { toggleInlineTag } from './context';
export const toggleBold = (ctx: CommandContext) => toggleInlineTag(ctx, 'strong');
