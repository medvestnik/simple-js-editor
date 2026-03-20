import { describe, expect, it } from 'vitest';
import { applyTransaction } from '../packages/core/src/transactions';
import { sanitizeHtml } from '../src/sanitize';

describe('core transactions', () => {
  it('applies ops', () => {
    const next = applyTransaction(
      { blocks: [], html: '<p>a</p>', selection: null },
      { ops: [{ type: 'setHtml', html: '<p>b</p>' }] }
    );
    expect(next.html).toBe('<p>b</p>');
  });

  it('sanitizes javascript href', () => {
    const html = sanitizeHtml('<a href="javascript:alert(1)">x</a>');
    expect(html).not.toContain('javascript:');
  });
});
