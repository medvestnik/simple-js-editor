import type { CommandContext } from './context';
import { setAlign as setA } from './context';
export const setAlign = (ctx: CommandContext, align: string) => setA(ctx, align);
