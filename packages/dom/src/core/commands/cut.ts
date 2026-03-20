import { execFallback, selectedRange } from './context';
export async function cut() {
  try {
    await navigator.clipboard.writeText(document.getSelection()?.toString() ?? '');
    selectedRange()?.deleteContents();
    return { changed: true };
  } catch {
    return execFallback('cut');
  }
}
