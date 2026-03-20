import type { CommandContext } from './context';
import { wrapStyle } from './context';
export const setFontFamily = (ctx: CommandContext, family: string) => wrapStyle(ctx, `font-family:${family}`);
