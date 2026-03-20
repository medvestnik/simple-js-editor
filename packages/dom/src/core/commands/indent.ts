import type { CommandContext } from './context';
import { indentBlock } from './context';
export const indent = (ctx: CommandContext) => indentBlock(ctx, 24);
