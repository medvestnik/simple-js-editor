import type { CommandContext } from './context';
import { indentBlock } from './context';
export const outdent = (ctx: CommandContext) => indentBlock(ctx, -24);
