import type { CommandContext } from './context';
import { toggleInlineTag } from './context';
export const toggleUnderline = (ctx: CommandContext) => toggleInlineTag(ctx, 'u');
