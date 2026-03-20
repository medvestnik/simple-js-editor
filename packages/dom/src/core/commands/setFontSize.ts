import type { CommandContext } from './context';
import { wrapStyle } from './context';
export const setFontSize = (ctx: CommandContext, px: string) => wrapStyle(ctx, `font-size:${px}`);
