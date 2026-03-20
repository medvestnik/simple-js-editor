import type { CommandResult } from '../types';
import type { CommandContext } from './context';
import { toggleBold } from './toggleBold';
import { toggleItalic } from './toggleItalic';
import { toggleUnderline } from './toggleUnderline';
import { setBlockType } from './setBlockType';
import { setAlign } from './setAlign';
import { setFontFamily } from './setFontFamily';
import { setFontSize } from './setFontSize';
import { insertLink } from './insertLink';
import { removeLink } from './removeLink';
import { insertImage } from './insertImage';
import { toggleList } from './toggleList';
import { indent } from './indent';
import { outdent } from './outdent';
import { clearFormatting } from './clearFormatting';
import { toggleCodeView } from './toggleCodeView';
import { copy } from './copy';
import { cut } from './cut';
import { paste } from './paste';

export async function executeCommand(ctx: CommandContext, commandId: string, payload?: any): Promise<CommandResult> {
  switch (commandId) {
    case 'toggleBold': return toggleBold(ctx);
    case 'toggleItalic': return toggleItalic(ctx);
    case 'toggleUnderline': return toggleUnderline(ctx);
    case 'setBlockType': return setBlockType(ctx, payload);
    case 'setAlign': return setAlign(ctx, payload);
    case 'setFontFamily': return setFontFamily(ctx, payload);
    case 'setFontSize': return setFontSize(ctx, payload);
    case 'insertLink': return insertLink(ctx, payload);
    case 'removeLink': return removeLink(ctx);
    case 'insertImage': return insertImage(ctx, payload);
    case 'toggleList': return toggleList(ctx, payload);
    case 'indent': return indent(ctx);
    case 'outdent': return outdent(ctx);
    case 'clearFormatting': return clearFormatting(ctx);
    case 'toggleCodeView': return toggleCodeView(ctx);
    case 'copy': return copy();
    case 'cut': return cut();
    case 'paste': return paste(ctx, false);
    case 'pastePlainText': return paste(ctx, true);
    default: return { changed: false };
  }
}
