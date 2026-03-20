import type { CommandContext } from './context';
import { toggleList as tList } from './context';
export const toggleList = (ctx: CommandContext, type: 'ul' | 'ol') => tList(ctx, type);
