import { sanitizeHtml as sanitizeWithDom } from '../packages/dom/src/core/sanitize';

function sanitizeWithoutDom(html: string): string {
  return html.replace(/\s(href|src)\s*=\s*(["'])\s*javascript:[^"']*\2/gi, '');
}

export function sanitizeHtml(html: string): string {
  if (typeof DOMParser === 'undefined') {
    return sanitizeWithoutDom(html);
  }

  return sanitizeWithDom(html);
}
