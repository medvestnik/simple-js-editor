const ALLOWED_TAGS = new Set(['p', 'div', 'h1', 'h2', 'h3', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li', 'img', 'blockquote', 'pre', 'code', 'span']);

const ALIGN_RE = /^text-align\s*:\s*(left|center|right|justify)\s*;?$/i;
const INDENT_RE = /^(margin-left|padding-left)\s*:\s*\d+px\s*;?$/i;
const INLINE_RE = /^(font-family|font-size|font-weight|font-style|text-decoration)\s*:\s*[^;]+;?$/i;

function sanitizeStyle(style: string, isInline: boolean): string {
  const chunks = style.split(';').map((s) => s.trim()).filter(Boolean);
  const filtered = chunks.filter((chunk) => {
    if (isInline) return INLINE_RE.test(chunk);
    return ALIGN_RE.test(chunk) || INDENT_RE.test(chunk);
  });
  return filtered.join('; ');
}

function isSafeHref(href: string): boolean {
  const normalized = href.trim().toLowerCase();
  return normalized.startsWith('http://') || normalized.startsWith('https://') || normalized.startsWith('mailto:') || normalized.startsWith('#') || normalized.startsWith('/');
}

export function sanitizeHtml(html: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div>${html}</div>`, 'text/html');
  const root = doc.body.firstElementChild as HTMLElement;

  const walk = (node: Node): Node | null => {
    if (node.nodeType === Node.TEXT_NODE) return node.cloneNode();
    if (node.nodeType !== Node.ELEMENT_NODE) return null;
    const el = node as HTMLElement;
    const tag = el.tagName.toLowerCase();
    if (!ALLOWED_TAGS.has(tag)) {
      const frag = doc.createDocumentFragment();
      [...el.childNodes].forEach((child) => {
        const clean = walk(child);
        if (clean) frag.appendChild(clean);
      });
      return frag;
    }

    const safe = doc.createElement(tag);
    [...el.attributes].forEach((attr) => {
      const name = attr.name.toLowerCase();
      const value = attr.value;
      if (name.startsWith('on')) return;
      if (tag === 'a' && ['href', 'target', 'rel'].includes(name)) {
        if (name === 'href' && !isSafeHref(value)) return;
        safe.setAttribute(name, value);
      }
      if (tag === 'img' && ['src', 'alt', 'title'].includes(name)) safe.setAttribute(name, value);
      if (name === 'style') {
        const clean = sanitizeStyle(value, tag === 'span');
        if (clean) safe.setAttribute('style', clean);
      }
    });

    if (tag === 'a') {
      safe.setAttribute('target', '_blank');
      safe.setAttribute('rel', 'noopener noreferrer');
    }

    [...el.childNodes].forEach((child) => {
      const clean = walk(child);
      if (clean) safe.appendChild(clean);
    });

    return safe;
  };

  const out = doc.createElement('div');
  [...root.childNodes].forEach((child) => {
    const clean = walk(child);
    if (clean) out.appendChild(clean);
  });

  return out.innerHTML || '<p></p>';
}
