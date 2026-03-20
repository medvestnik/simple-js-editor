import { execFallback } from './context';
export async function copy() {
  try {
    await navigator.clipboard.writeText(document.getSelection()?.toString() ?? '');
    return { changed: false };
  } catch {
    return execFallback('copy');
  }
}
