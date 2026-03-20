import type { CommandContext } from './context';
import { setBlockType as setType } from './context';
export const setBlockType = (ctx: CommandContext, type: string) => setType(ctx, type);
